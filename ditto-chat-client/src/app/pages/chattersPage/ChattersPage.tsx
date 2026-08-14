import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { setChatterOverviewsList, setIsChattersFilterCurrentlyChanging, setIsCreatingNewChatThread, setIsLastChatterOverviewListPage, setIsLoadingChatterOverviews, setIsLoadingOlderChatterOverviews } from "../../store/ChattersSlice";
import { postChatThread } from "../../store/ChatSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import PageContent from "../../components/pageContent/PageContent";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import SearchBar from "../../components/searchBar/SearchBar";
import ChatterButton from "../../components/chatterButton/ChatterButton";
import ShowMoreButton from "../../components/showMoreButton/ShowMoreButton";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import NavigationHelper from "../../helpers/NavigationHelper";
import UrlHelper from "../../helpers/UrlHelper";
import TypeFormatter from "../../helpers/TypeFormatter";
import ChatThread from "../../classes/ChatThread";
import ChatterOverview from "../../classes/ChatterOverview";
import CONSTANTS from "../../../Constants";
import "./ChattersPage.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chatters";

export default function ChattersPage() {
    const { chatterOverviewList, isLastChatterOverviewListPage, isLoadingChatterOverviews, isFilterCurrentlyChanging } = useAppSelector(state => state.chattersSlice);
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sendTryToGetChatters, didUnhandledServerErrorOccur] = useTryToSendRequest<null>();
    const [sendTryToGetMoreChatters, _] = useTryToSendRequest<null>();
    const [sendTryToPostChatThread, __] = useTryToSendRequest<ChatThread>();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();
    
    async function tryToGetInitialChatters(queryParams: URLSearchParams, isLoadingReducer: Function): Promise<void> {
        await SliceHelper.tryToGetChatters(queryParams, true, sendTryToGetChatters, isLoadingReducer, dispatch);
        navigate(`${CONSTANTS.CHATTERS_URL}?${queryParams.toString()}`);
    }

    async function tryToGetMoreChatters(): Promise<void> {
        const newPage = TypeFormatter.stringToInt(searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER)) + 1;
        searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, newPage.toString());
        setSearchParams(searchParams);
        addUrlToHistory(searchParams.toString());

        await SliceHelper.tryToGetChatters(searchParams, false, sendTryToGetMoreChatters, setIsLoadingOlderChatterOverviews, dispatch);
    }

    async function tryToPostChatThread(selectedChatterId: string): Promise<ChatThread | null> {
        if (selectedChatterId === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return null;
        }

        const newlyCreatedChatThread = await sendTryToPostChatThread(async () => {
            dispatch(setIsCreatingNewChatThread(true));
            
            const createdChatThread = await dispatch(postChatThread({ chatterId: selectedChatterId})).unwrap();
            return createdChatThread;
        }, () => dispatch(setIsCreatingNewChatThread(false)));

        return newlyCreatedChatThread;
    }

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        const queryParams = UrlHelper.constructInitialChattersPageQueryParams(searchParams);
        setSearchParams(queryParams);
        addUrlToHistory(queryParams.toString());

        tryToGetInitialChatters(queryParams, setIsLoadingChatterOverviews);
    }, []);

    // NOTE: Retrieve Initial ChatterOverviews Page whenever searchFilter queryParam value is changed in URL
    useEffect(() => {
        if (isFilterCurrentlyChanging === false) {
            return;
        }

        dispatch(setChatterOverviewsList([]));
        dispatch(setIsLastChatterOverviewListPage(false));

        const timeoutId = setTimeout(() => {
            tryToGetInitialChatters(searchParams, setIsChattersFilterCurrentlyChanging);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER)]);

    function onSearchInputChange(newSearchInput: string): void {
		dispatch(setIsChattersFilterCurrentlyChanging(true));
		searchParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, newSearchInput);
		searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, "0");
		setSearchParams(searchParams);
        addUrlToHistory(searchParams.toString());
	}

    async function onClickingChatter(chatterOverview: ChatterOverview): Promise<void> {
        let redirectChatThreadId = chatterOverview.getChatThreadId();
        if (redirectChatThreadId === null) {
            const newChatThread = await tryToPostChatThread(chatterOverview.getId());
            if (newChatThread !== null) {
                redirectChatThreadId = newChatThread.getOverview().getId();
            }
        }

        if (redirectChatThreadId !== null) {
            NavigationHelper.navigateToChat(navigate, redirectChatThreadId, null, new URLSearchParams());
        }
    }

    function getChattersPageContent(): React.JSX.Element {
        if (isFilterCurrentlyChanging === true) {
            return <div className="chatters-page-content-loading-spinner-container">
                <LoadingSpinner />
            </div>
        }

        return <div className="chatters-page-chatters-list-container">
            <div className="chatter-buttons-container">
                { chatterOverviewList.map(chatterOverview => {
                    return <ChatterButton
                        key={`${chatterOverview.getId()}`}
                        chatterOverview={chatterOverview as ChatterOverview}
                        openChatFunction={() => onClickingChatter(chatterOverview)}
                    />
                })}
                { isLastChatterOverviewListPage === false && 
                    <ShowMoreButton
                        isDirectionUpwards={false}
                        showMoreFunc={tryToGetMoreChatters}
                    />
                }
            </div>
        </div>
    }

    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backOnClickFunction={() => {
                    navigateBack();
                }}
                backHeaderContent={
                    <div className="chatters-page-header-search-bar-container">
                        <SearchBar
                            inputVariable={searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER) || ""}
                            setInputVariable={(newSearchInput: string) => onSearchInputChange(newSearchInput)}
                            inputPlaceholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
                        />
                    </div>
                }
                mainPage={
                    <div className="chatters-page">
                        <PageContent
                            regularPageContent={getChattersPageContent()}
                            isLoadingPage={isLoadingChatterOverviews}
                            didUnhandledServerErrorOccur={didUnhandledServerErrorOccur}
                            showResponseErrorCard={true}
                        />
                    </div>
                }
            />
        }
    />
}
