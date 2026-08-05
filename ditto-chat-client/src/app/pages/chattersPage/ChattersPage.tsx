import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { setChatterOverviewsList, setIsChattersFilterCurrentlyChanging, setIsLastChatterOverviewListPage, setIsLoadingChatterOverviews, setIsLoadingOlderChatterOverviews } from "../../store/ChattersSlice";
import { postChatThread } from "../../store/ChatSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
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
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();
    
    async function retrieveChattersPage(isInitialRetrieval: boolean, queryParams: URLSearchParams, isLoadingReducer: Function): Promise<void> {
        const chattersSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);

        const chatterOverviews = await SliceHelper.tryGetChatters(
            chattersSearchFilter, currentPageNumber, isInitialRetrieval, isLoadingReducer, dispatch
        );
    }

    async function tryGetMoreChatters(): Promise<void> {
        const newPage = TypeFormatter.stringToInt(searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER)) + 1;
        searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, newPage.toString());
        setSearchParams(searchParams);
        addUrlToHistory(searchParams.toString());

        await retrieveChattersPage(false, searchParams, setIsLoadingOlderChatterOverviews);
    }

    async function tryPostChatThread(selectedChatterId: string): Promise<ChatThread> {
        try {
            const createdChatThread = await dispatch(postChatThread({ chatterId: selectedChatterId})).unwrap();
            return createdChatThread;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {}
    }

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
            const newChatThread = await tryPostChatThread(chatterOverview.getId());
            redirectChatThreadId = newChatThread.getOverview().getId();
        }

        NavigationHelper.navigateToChat(navigate, redirectChatThreadId, null, new URLSearchParams());
    }
 
    useEffect(() => {
        const queryParams = UrlHelper.constructInitialChattersPageQueryParams(searchParams);
        setSearchParams(queryParams);
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory(queryParams.toString());

        retrieveChattersPage(true, queryParams, setIsLoadingChatterOverviews);
        navigate(`${CONSTANTS.CHATTERS_URL}?${queryParams.toString()}`);
    }, []);

    // NOTE: Retrieve Initial ChatterOverviews Page whenever searchFilter queryParam value is changed in URL
    useEffect(() => {
        if (isFilterCurrentlyChanging === false) {
            return;
        }

        dispatch(setChatterOverviewsList([]));
        dispatch(setIsLastChatterOverviewListPage(false));

        const timeoutId = setTimeout(() => {
            retrieveChattersPage(true, searchParams, setIsChattersFilterCurrentlyChanging);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER)]);

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
                        <div className="chatters-page-chatters-list-container">
                            { isLoadingChatterOverviews === true
                                ? <LoadingSpinner />
                                : <div className="chatter-buttons-container">
                                    {chatterOverviewList.map(chatterOverview => {
                                        return <ChatterButton
                                            key={`${chatterOverview.getId()}`}
                                            chatterOverview={chatterOverview as ChatterOverview}
                                            openChatFunction={() => onClickingChatter(chatterOverview)}
                                        />
                                    })}
                                    { isLastChatterOverviewListPage === false && 
                                        <ShowMoreButton
                                            isDirectionUpwards={false}
                                            showMoreFunc={tryGetMoreChatters}
                                        />
                                    }
                                </div>
                            }
                        </div>
                    </div>
                }
            />
        }
    />
}
