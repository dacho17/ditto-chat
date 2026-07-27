import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearHomeState, getChatThreads, setChatThreadSearchFilter, setCurrentChatThreadListPage, setIsLoadingChatThreads, setIsLoadingOlderChatThreads } from "../../store/HomeSlice";
import { logout } from "../../store/AuthSlice";
import SearchBar from "../searchBar/SearchBar";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import NewChatButton from "../newChatButton/NewChatButton";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import DropdownItem from "../../classes/DropdownItem";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";

export default function ChatThreadsPanel() {
	const { chatThreadList, chatThreadSearchFilter, currentChatThreadListPage, isLastChatThreadListPage, isLoadingChatThreads }
		= useAppSelector(state => state.homeSlice);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const tryGetChatThreads = useCallback(async (isLoadingReducer: Function): Promise<ChatThreadOverview[]> => {
		dispatch(isLoadingReducer(true));

		// TODO: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

		try {
			const retrievedChatThreadOverviews = await dispatch(getChatThreads()).unwrap();

			// TODO: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
			return retrievedChatThreadOverviews;
		} catch (err: any) {
			console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
		} finally {
			dispatch(isLoadingReducer(false));
		}
	}, []);

	async function tryGetOlderChatThreads(): Promise<void> {
		dispatch(setCurrentChatThreadListPage(currentChatThreadListPage + 1));
		tryGetChatThreads(setIsLoadingOlderChatThreads);
	}

	// NOTE: Retrieve ChatThreads whenever chatThreadSearchFilter changes
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			tryGetChatThreads(setIsLoadingChatThreads);
        }, CONSTANTS.SEARCH_FILTER_CHANGE_HTTP_REQUEST_DELAY_IN_MS);

        return () => {
            clearTimeout(timeoutId);
        }
	}, [chatThreadSearchFilter]);

	const ACCOUNT_FEATURES: DropdownItem[] = [
		new DropdownItem(
			"Account",
			() => {
				dispatch(clearHomeState());
				navigate(CONSTANTS.ACCOUNT_URL);
			}
		),
		new DropdownItem(
			"Logout",
			async () => {
				await dispatch(logout());
				dispatch(clearHomeState());
				navigate(CONSTANTS.LOGIN_URL);
			}
		)
    ];

    return <div className="chat-threads-panel">
		<div className="panel-header">
			<div className="chat-threads-panel-header-ditto-chat-title-container">
				<div className="ditto-logo-container">
					<img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
				</div>
				<div className="margin-right-2" />
				<div className="ditto-chat-title">
					{CONSTANTS.APPLICATION_NAME}
				</div>
				<div className="account-feature-list-container">
					<IconButtonDropdown
						icon={<IoMdMore size={CONSTANTS.ICON_SIZE} />}
						dropdownItems={ACCOUNT_FEATURES}
					/>
				</div>
			</div>
			<div className="search-bar-container">
				<SearchBar
					inputVariable={chatThreadSearchFilter}
					setInputVariable={(newSearchInput: string) => {
						dispatch(setChatThreadSearchFilter(newSearchInput));
						dispatch(setCurrentChatThreadListPage(0));
					}}
					inputPlaceholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
				/>
			</div>
		</div>
		<div className="chat-threads-container">
			{ isLoadingChatThreads === true
				? <LoadingSpinner />
				: <div className="chat-thread-buttons-container">
					{ chatThreadList.map(chatThreadOverview => {
						return <ChatThreadButton
							key={chatThreadOverview.getId()}
							chatThreadOverview={chatThreadOverview as ChatThreadOverview}
							openChatFunction={() => {
								dispatch(clearHomeState())
								navigate(`${CONSTANTS.CHAT_URL}/${chatThreadOverview.getId()}`)}
							}
						/>
					})}
					{ isLastChatThreadListPage === false && 
						<ShowMoreButton
							isDirectionUpwards={false}
							showMoreFunc={tryGetOlderChatThreads}
						/>
					}
				</div>
			}
		</div>
		<NewChatButton />
	</div>
}
