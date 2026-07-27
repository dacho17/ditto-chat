import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChattersState, getChatters, setChatterSearchFilter, setCurrentChatterOverviewListPage, setIsLoadingChatterOverviews, setIsLoadingOlderChatterOverviews } from "../../store/ChattersSlice";
import { postChatThread } from "../../store/ChatSlice";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import SearchBar from "../../components/searchBar/SearchBar";
import ChatterButton from "../../components/chatterButton/ChatterButton";
import ChatThread from "../../classes/ChatThread";
import ChatterOverview from "../../classes/ChatterOverview";
import ShowMoreButton from "../../components/showMoreButton/ShowMoreButton";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import CONSTANTS from "../../../Constants";
import "./ChattersPage.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chatters";

export default function ChattersPage() {
    const { chatterOverviewList, currentChatterOverviewListPage, isLastChatterOverviewListPage, chatterSearchFilter, isLoadingChatterOverviews } = useAppSelector(state => state.chattersSlice);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    
    const tryGetChatters = useCallback(async (isLoadingReducer: Function): Promise<ChatterOverview[]> => {
        dispatch(isLoadingReducer(true));

        // TODO: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

        try {
            const retrievedChatterOverviews = await dispatch(getChatters()).unwrap();

            // TODO: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            return retrievedChatterOverviews;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(isLoadingReducer(false));
        }
    }, []);
 
    async function tryGetMoreChatters(): Promise<void> {
        dispatch(setCurrentChatterOverviewListPage(currentChatterOverviewListPage + 1));
        tryGetChatters(setIsLoadingOlderChatterOverviews);
    }

    async function tryPostChatThread(selectedChatterId: string): Promise<ChatThread> {
        try {
            const createdChatThread = await dispatch(postChatThread({ chatterId: selectedChatterId})).unwrap();
            return createdChatThread;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {}
    }
 
    // NOTE: Retrieve ChatterOverviews whenever chatterSearchFilter changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            tryGetChatters(setIsLoadingChatterOverviews);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [chatterSearchFilter]);

    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backOnClickFunction={() => {
                    dispatch(clearChattersState());
                    navigate(CONSTANTS.HOME_URL);   // TODO: in actuallity, user can land on /chatters from any page, not only from /home
                }}
                backHeaderContent={
                    <div className="chatters-page-header-search-bar-container">
                        <SearchBar
                            inputVariable={chatterSearchFilter}
                            setInputVariable={(newSearchInput: string) => {
                                dispatch(setChatterSearchFilter(newSearchInput));
                                dispatch(setCurrentChatterOverviewListPage(0));
                            }}
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
                                            openChatFunction={ async () => {
                                                let redirectChatThreadId = chatterOverview.getChatThreadId();

                                                if (redirectChatThreadId === null) {
                                                    const newChatThread = await tryPostChatThread(chatterOverview.getId());
                                                    redirectChatThreadId = newChatThread.getOverview().getId();
                                                }

                                                dispatch(clearChattersState());
                                                navigate(`${CONSTANTS.CHAT_URL}/${redirectChatThreadId}`);
                                            }}
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
