import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { getChatThreadsOnHomePage, setChatThreadList, setIsChatThreadsFilterCurrentlyChanging, setIsLastChatThreadListPage, setIsLoadingChatThreads } from "../../store/HomeSlice";
import { setIsLoadingChatThread } from "../../store/ChatSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatThreadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import SliceHelper from "../../helpers/SliceHelper";
import UrlHelper from "../../helpers/UrlHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import ChatThread from "../../classes/ChatThread";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import CONSTANTS from "../../../Constants";
import "./HomePage.css";

export default function HomePage() {
    const { isActiveChatThreadPanelExpanded, isInitialLoadFinished, isFilterCurrentlyChanging } = useAppSelector(state => state.homeSlice);
    const { chatThread } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
    const { chatThreadId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sendTryToRetrieveInitialChatThreadsPage, didUnhandledServerErrorOnInitialRetrieval1] = useTryToSendRequest<ChatThreadOverview[]>();
    const [sendTryToRetrieveInitialChatThreadsPageWithSelectedChatThread, didUnhandledServerErrorOnInitialRetrieval2] = useTryToSendRequest<null>();
    const [sendTryToGetChatThread, didUnhandledServerErrorOnGetChatThread] = useTryToSendRequest<null>();
    const [sendTryToGetChatter, didUnhandledServerErrorOnGetChatter] = useTryToSendRequest<null>();
    const [sendTryToPollChatThreads, ___] = useTryToSendRequest<null>();
    const { addUrlToHistory } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    const isTabletScreen = DeviceScreenHelper.isTabletScreen();
    const isPcScreen = DeviceScreenHelper.isPcScreen();
    const isChatWindowOnHomePage = isTabletScreen || isPcScreen;
    const isChatterDisplayedOnHomePage = isPcScreen;

    async function tryToRetrieveInitialChatThreadsPage(queryParams: URLSearchParams, isLoadingReducer: Function): Promise<void> {
        let currentlySelectedChatThread = isChatWindowOnHomePage === true && chatThread !== null
            ? chatThread.getOverview() : null;
        
        const chatThreadOverviews = await SliceHelper.tryToGetChatThreads(
            queryParams, currentlySelectedChatThread, true, sendTryToRetrieveInitialChatThreadsPage, isLoadingReducer, dispatch
        );

        if (isChatWindowOnHomePage === true && chatThreadId === undefined) {
            if (chatThreadOverviews !== null) {
                navigate(`${CONSTANTS.HOME_URL}/${chatThreadOverviews[0].getId()}?${queryParams.toString()}`);
            }
        }
    }

    async function tryToRetrieveInitialChatThreadsPageWithSelectedChatThread(queryParams: URLSearchParams): Promise<void> {
        const chatThreadSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);
        if (chatThreadSearchFilter === null || currentPageNumber === null || chatThreadId === undefined) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToRetrieveInitialChatThreadsPageWithSelectedChatThread(async () => {
            dispatch(setIsLoadingChatThreads(true));
            dispatch(setIsLoadingChatThread(true));

            // TODO-result-caching: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache
            await dispatch(getChatThreadsOnHomePage({
                chatThreadSearchFilter: chatThreadSearchFilter,
                currentPageNumber: currentPageNumber,
                currentlySelectedChatThreadId: chatThreadId,
                isInitialRetrieval: true,
                isPolling: false
            }));
            // TODO-result-caching: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache

            return null;
        }, () => {
            dispatch(setIsLoadingChatThreads(false));
            dispatch(setIsLoadingChatThread(false));
        });
    }

    async function tryToPollChatThreads(currentlySelectedChatThread: ChatThread | null): Promise<void> {
        const chatThreadSearchFilter = searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);
        if (chatThreadSearchFilter === null || currentPageNumber === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToPollChatThreads(async () => {
            await dispatch(getChatThreadsOnHomePage({
                chatThreadSearchFilter: chatThreadSearchFilter,
                currentPageNumber: currentPageNumber,
                currentlySelectedChatThreadId: currentlySelectedChatThread !== null
                    ? currentlySelectedChatThread.getOverview().getId() : null,
                isInitialRetrieval: false,
                isPolling: true
            })).unwrap();

            return null;
        }, () => {});
    }
    
    useEffect(() => {
        if (isInitialLoadFinished === true) {
            return;
        }

        SliceHelper.clearPageStates(dispatch);
        const queryParams = UrlHelper.constructInitialHomePageQueryParams(searchParams);
        setSearchParams(queryParams);
        addUrlToHistory(queryParams.toString());

        if (chatThreadId !== undefined) {
            // Function used to retrieve both chatThreadsPage and pre-selected chatThread when Page is initially visited
            tryToRetrieveInitialChatThreadsPageWithSelectedChatThread(queryParams);
        } else {
            tryToRetrieveInitialChatThreadsPage(queryParams, setIsLoadingChatThreads);
        }

        // TODO-polling: uncomment Polling
        // if (DeviceScreenHelper.isMobileScreen() === true) {
        //     const interval = setInterval(() => tryPollChatThreads(null), CONSTANTS.CHAT_POLLING_INTERVAL_IN_MS);
        //     return () => {
        //         clearInterval(interval);
        //     }
        // }
    }, []);

    // when chatThreadId Changes, and if on nonMobile Device, Retrieve the chatThread
    useEffect(() => {
        if (isChatWindowOnHomePage === false || isInitialLoadFinished === false) {
            // Function is called only on non Mobile Devices and if InitialLoadFinished
            return;
        }

        if (isChatWindowOnHomePage && chatThreadId !== undefined
            && ((chatThread === null) || (chatThread.getOverview().getId() !== chatThreadId))) {
                // chatThread === null means that chatThreadId is set in the URL, but chatThread has not yet been retrieved for the ID
                // second condition mean that new chatThreadId is set in the URL, and it does not match the id of the currently displayed chatThread
            addUrlToHistory(searchParams.toString());
            SliceHelper.tryToGetChatThread(chatThreadId, sendTryToGetChatThread, dispatch);
        }
    }, [chatThreadId]);

    // when chatThread is Retrieved, and if on PC, Retrieve the Chatter
    useEffect(() => {
        if (isChatterDisplayedOnHomePage === false || isInitialLoadFinished === false) {
            // Function is called only on PC Devices and if InitialLoadFinished
            return;
        }

        if (chatThread !== null) {
            SliceHelper.tryToGetChatter(chatThread.getOverview().getChatterOverview().getId(), sendTryToGetChatter, dispatch);
            // TODO-polling: uncomment Polling
            // const interval = setInterval(() => tryPollChatThreads(chatThread), CONSTANTS.CHAT_POLLING_INTERVAL_IN_MS);
            // return () => {
            //     clearInterval(interval);
            // }
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
            tryToRetrieveInitialChatThreadsPage(searchParams, setIsChatThreadsFilterCurrentlyChanging);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER)]);

    const activeChatThreadPanelExpandedStyle = isActiveChatThreadPanelExpanded === true ? "expanded" : "";
    const chatWindowExpendedStyle = isActiveChatThreadPanelExpanded === true ? "active-chat-thread-panel-expanded" : "";
    const didUnhandledServerErrorOccurOnInitialRetrieval = didUnhandledServerErrorOnInitialRetrieval1 || didUnhandledServerErrorOnInitialRetrieval2;
    return <PageWithSideMenu
        mainPage={
            <div className="home-page">
                <div className="chat-thread-panel-container">
                    <ChatThreadsPanel
                        isInitialChatThreadLoadFinished={isInitialLoadFinished}
                        didUnhandledServerErrorOccur={didUnhandledServerErrorOccurOnInitialRetrieval}
                    />
                </div>
                { (isChatWindowOnHomePage) && 
                    <div className={`chat-window-container ${chatWindowExpendedStyle}`}>
                        <ChatWindow didUnhandledServerErrorOccur={didUnhandledServerErrorOnGetChatThread} />
                    </div>
                }
                { isPcScreen &&
                    <div className={`active-chat-thread-panel-container ${activeChatThreadPanelExpandedStyle}`}>
                        <ActiveChatThreadPanel didUnhandledServerErrorOccur={didUnhandledServerErrorOnGetChatter} />
                    </div>
                }
            </div>
        }
    />
}
