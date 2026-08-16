import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { getChatThreadsOnHomePage, setChatThreadList, setIsChatThreadsFilterCurrentlyChanging, setIsInitialLoadFinished, setIsLastChatThreadListPage, setIsLoadingChatThreads } from "../../store/HomeSlice";
import { setIsLoadingChatThread } from "../../store/ChatSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatThreadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import SliceHelper from "../../helpers/SliceHelper";
import UrlHelper from "../../helpers/UrlHelper";
import ChatThread from "../../classes/ChatThread";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import { DeviceType } from "../../enums/DeviceType";
import CONSTANTS from "../../../Constants";
import "./HomePage.css";

export default function HomePage() {
    const { isActiveChatThreadPanelExpanded, isInitialLoadFinished, isFilterCurrentlyChanging } = useAppSelector(state => state.homeSlice);
    const { chatThread } = useAppSelector(state => state.chatSlice);
    const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);
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

    async function tryToRetrieveInitialChatThreadsPage(queryParams: URLSearchParams, isLoadingReducer: Function): Promise<void> {
        const isChatWindowOnHomePage = currentDeviceType !== DeviceType.MOBILE_PHONE;
        // console.log(`currentDeviceType=${currentDeviceType}`);
        let currentlySelectedChatThread = isChatWindowOnHomePage === true && chatThread !== null
            ? chatThread.getOverview() : null;
        
        const chatThreadOverviews = await SliceHelper.tryToGetChatThreads(
            queryParams, currentlySelectedChatThread, true, sendTryToRetrieveInitialChatThreadsPage, isLoadingReducer, dispatch
        );

        if (isChatWindowOnHomePage === true && chatThreadId === undefined) {
            if (chatThreadOverviews !== null) {
                // console.log(`NAVIGATING WHEN IT SHOULNT`)
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

            await dispatch(getChatThreadsOnHomePage({
                chatThreadSearchFilter: chatThreadSearchFilter,
                currentPageNumber: currentPageNumber,
                currentlySelectedChatThreadId: chatThreadId,
                isInitialRetrieval: true,
                isPolling: false
            }));

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
        // if (isInitialLoadFinished === true) {    // NOTE: not sure when this case occurs
        //     return;
        // }

        SliceHelper.clearPageStates(dispatch);
        setIsInitialLoadFinished(false);
        const queryParams = UrlHelper.constructInitialHomePageQueryParams(searchParams);
        setSearchParams(queryParams);
        addUrlToHistory(queryParams.toString());
        
        const isOpenedOnMobileDeviceWithChatThreadIdPathParameter = currentDeviceType === DeviceType.MOBILE_PHONE && chatThreadId !== undefined;
        if (isOpenedOnMobileDeviceWithChatThreadIdPathParameter === true) {
            navigate(`${CONSTANTS.HOME_URL}?${queryParams.toString()}`);
            tryToRetrieveInitialChatThreadsPage(queryParams, setIsLoadingChatThreads);
        } else if (chatThreadId !== undefined) {
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
    }, [currentDeviceType]);

    // when chatThreadId Changes, and if on nonMobile Device, Retrieve the chatThread
    useEffect(() => {
        const isChatWindowOnHomePage = currentDeviceType !== DeviceType.MOBILE_PHONE;
        if (isChatWindowOnHomePage === false || isInitialLoadFinished === false) {
            return;
        }

        if (isChatWindowOnHomePage && chatThreadId !== undefined
            && ((chatThread === null) || (chatThread.getOverview().getId() !== chatThreadId))) {
                // chatThread === null means that chatThreadId is set in the URL, but chatThread has not yet been retrieved for the ID
                // second condition mean that new chatThreadId is set in the URL, and it does not match the id of the currently displayed chatThread
            addUrlToHistory(searchParams.toString());
            SliceHelper.tryToGetChatThread(chatThreadId, sendTryToGetChatThread, dispatch);
        }
    }, [chatThreadId, currentDeviceType]);

    // when chatThread is Retrieved, and if on PC, Retrieve the Chatter
    useEffect(() => {
        if (currentDeviceType !== DeviceType.PC || isInitialLoadFinished === false) {
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
    }, [chatThread, currentDeviceType]);

    // NOTE: Retrieve Initial ChatThreads Page whenever searchFilter queryParam value is changed in URL
    useEffect(() => {
        if (isInitialLoadFinished === false || isFilterCurrentlyChanging === false) {
            return;
        }

        if (currentDeviceType !== DeviceType.MOBILE_PHONE) {
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
                { (currentDeviceType !== DeviceType.MOBILE_PHONE) && 
                    <div className={`chat-window-container ${chatWindowExpendedStyle}`}>
                        <ChatWindow didUnhandledServerErrorOccur={didUnhandledServerErrorOnGetChatThread} />
                    </div>
                }
                { currentDeviceType === DeviceType.PC &&
                    <div className={`active-chat-thread-panel-container ${activeChatThreadPanelExpandedStyle}`}>
                        <ActiveChatThreadPanel didUnhandledServerErrorOccur={didUnhandledServerErrorOnGetChatter} />
                    </div>
                }
            </div>
        }
    />
}
