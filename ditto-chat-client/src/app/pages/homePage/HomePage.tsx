import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { getChatThreadsWithSelectedChatThread, setChatThreadList, setIsChatThreadsFilterCurrentlyChanging, setIsInitialLoadFinished, setIsLastChatThreadListPage, setIsLoadingChatThreads } from "../../store/HomeSlice";
import { setIsLoadingChatThread } from "../../store/ChatSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatThreadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import SliceHelper from "../../helpers/SliceHelper";
import UrlHelper from "../../helpers/UrlHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import CONSTANTS from "../../../Constants";
import "./HomePage.css";

export default function HomePage() {
    const { isActiveChatThreadPanelExpanded, isInitialLoadFinished, isFilterCurrentlyChanging } = useAppSelector(state => state.homeSlice);
    const { chatThread } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
    const chatThreadId = useChatThreadIdParam();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addUrlToHistory } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    const isTabletScreen = DeviceScreenHelper.isTabletScreen();
    const isPcScreen = DeviceScreenHelper.isPcScreen();
    const isChatWindowOnHomePage = isTabletScreen || isPcScreen;
    const isChatterDisplayedOnHomePage = isPcScreen;

    async function retrieveInitialChatThreadsPage(queryParams: URLSearchParams, isLoadingReducer: Function): Promise<void> {
        const chatThreadSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);
        const isInitialRetrieval = true;

        let currentlySelectedChatThread = null;
        if (isChatWindowOnHomePage === true && chatThread !== null) {
            currentlySelectedChatThread = chatThread.getOverview();
        }

        const chatThreadOverviews = await SliceHelper.tryGetChatThreads(
            chatThreadSearchFilter, currentPageNumber, currentlySelectedChatThread,
            isInitialRetrieval, isLoadingReducer, dispatch
        );

        if (isInitialRetrieval === true) {
            dispatch(setIsInitialLoadFinished(true));
        }

        if (isChatWindowOnHomePage === true && chatThreadId === null) {
            navigate(`${CONSTANTS.HOME_URL}/${chatThreadOverviews[0].getId()}?${queryParams.toString()}`);
        }
    }

    async function retrieveInitialChatThreadsPageWithSelectedChatThread(queryParams: URLSearchParams): Promise<void> {
        dispatch(setIsLoadingChatThreads(true));
        dispatch(setIsLoadingChatThread(true));

        try {
            await dispatch(getChatThreadsWithSelectedChatThread({
                chatThreadSearchFilter: queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER),
                currentPageNumber: queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER),
                currentlySelectedChatThreadId: chatThreadId
            }));
        } catch(err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsInitialLoadFinished(true));
            dispatch(setIsLoadingChatThreads(false));
            dispatch(setIsLoadingChatThread(false));
        }
    }
    
    useEffect(() => {
        if (isInitialLoadFinished === true) {
            return;
        }

        const queryParams = UrlHelper.constructInitialHomePageQueryParams(searchParams);
        setSearchParams(queryParams);
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory(queryParams.toString());

        if (chatThreadId !== null) {
            // Function used to retrieve both chatThreadsPage and pre-selected chatThread when Page is initially visited
            retrieveInitialChatThreadsPageWithSelectedChatThread(queryParams);
        } else {
            retrieveInitialChatThreadsPage(queryParams, setIsLoadingChatThreads);
        }
    }, []);

    // when chatThreadId Changes, and if on nonMobile Device, Retrieve the chatThread
    useEffect(() => {
        if (isChatWindowOnHomePage === false || isInitialLoadFinished === false) {
            // Function is called only on non Mobile Devices and if InitialLoadFinished
            return;
        }

        if (isChatWindowOnHomePage && chatThreadId !== null
            && ((chatThread === null) || (chatThread.getOverview().getId() !== chatThreadId))) {
                // chatThread === null means that chatThreadId is set in the URL, but chatThread has not yet been retrieved for the ID
                // second condition mean that new chatThreadId is set in the URL, and it does not match the id of the currently displayed chatThread
            addUrlToHistory(searchParams.toString());
            SliceHelper.tryGetChatThread(chatThreadId, dispatch);
        }
    }, [chatThreadId]);

    // when chatThread is Retrieved, and if on PC, Retrieve the Chatter
    useEffect(() => {
        if (isChatterDisplayedOnHomePage === false || isInitialLoadFinished === false) {
            // Function is called only on PC Devices and if InitialLoadFinished
            return;
        }

        if (chatThread !== null) {
            SliceHelper.tryGetChatter(chatThread.getOverview().getChatterOverview().getId(), dispatch);
        }
    }, [chatThread]);

    // NOTE: Retrieve Initial ChatThreads Page whenever searchFilter queryParam value is changed in URL
    useEffect(() => {
        if (isInitialLoadFinished === false || isFilterCurrentlyChanging === false) {
            return;
        }

        if (isChatWindowOnHomePage === true) {
            dispatch(setChatThreadList({ newChatThreadList: [], currentlySelectedChatThread: chatThread.getOverview() }));
        } else {
            dispatch(setChatThreadList({ newChatThreadList: [], currentlySelectedChatThread: null }));
        }        
        dispatch(setIsLastChatThreadListPage(false));

        const timeoutId = setTimeout(() => {
            retrieveInitialChatThreadsPage(searchParams, setIsChatThreadsFilterCurrentlyChanging);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER)]);

    const activeChatThreadPanelExpandedStyle = isActiveChatThreadPanelExpanded === true ? "expanded" : "";
    const chatWindowExpendedStyle = isActiveChatThreadPanelExpanded === true ? "active-chat-thread-panel-expanded" : "";
    return <PageWithSideMenu
        mainPage={
            <div className="home-page">
                <div className="chat-thread-panel-container">
                    <ChatThreadsPanel />
                </div>
                { (isChatWindowOnHomePage) && 
                    <div className={`chat-window-container ${chatWindowExpendedStyle}`}>
                        <ChatWindow />
                    </div>
                }
                { isPcScreen &&
                    <div className={`active-chat-thread-panel-container ${activeChatThreadPanelExpandedStyle}`}>
                        <ActiveChatThreadPanel />
                    </div>
                }
            </div>
        }
    />
}
