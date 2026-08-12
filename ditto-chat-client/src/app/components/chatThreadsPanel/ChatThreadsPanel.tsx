import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { setIsChatThreadsFilterCurrentlyChanging, setIsLoadingOlderChatThreads } from "../../store/HomeSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import SearchBar from "../searchBar/SearchBar";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import NewChatButton from "../newChatButton/NewChatButton";
import DittoLogoAndTitle from "../dittoLogoAndTitle/DittoLogoAndTitle";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import NavigationHelper from "../../helpers/NavigationHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import TypeFormatter from "../../helpers/TypeFormatter";
import DropdownItem from "../../classes/DropdownItem";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";

export default function ChatThreadsPanel() {
	const { chatThread } = useAppSelector(state => state.chatSlice);
	const { chatThreadList, isLastChatThreadListPage, isLoadingChatThreads, isFilterCurrentlyChanging }
		= useAppSelector(state => state.homeSlice);
	const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();
	const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
	const { addUrlToHistory } = useUrlHistoryNavigate();
	const navigate = useNavigate();

	const isTabletScreen = DeviceScreenHelper.isTabletScreen();
	const isPcScreen = DeviceScreenHelper.isPcScreen();
	const isChatWindowOnHomePage = isTabletScreen || isPcScreen;

	async function tryGetOlderChatThreads(): Promise<void> {
		const newPage = TypeFormatter.stringToInt(searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER)) + 1;
		searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, newPage.toString());
		setSearchParams(searchParams);

		const chatThreadSearchFilter = searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);
		const currentlySelectedChatThread =
			isChatWindowOnHomePage === true && chatThread !== null ? chatThread.getOverview() : null;
        const isInitialRetrieval = false;

		addUrlToHistory(searchParams.toString());
		dispatch(setIsLoadingOlderChatThreads(true));
		await SliceHelper.tryGetChatThreads(
			chatThreadSearchFilter, currentPageNumber, currentlySelectedChatThread,
			isInitialRetrieval, setIsLoadingOlderChatThreads, dispatch
		);
	}

	function onSearchInputChange(newSearchInput: string): void {
		dispatch(setIsChatThreadsFilterCurrentlyChanging(true));
		searchParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, newSearchInput);
		searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, "0");
		setSearchParams(searchParams);
		addUrlToHistory(searchParams.toString());
	}

	const isChatThreadsPanelIndependentPage = DeviceScreenHelper.isMobileScreen();
	const ACCOUNT_FEATURES: DropdownItem[] = [
		new DropdownItem(
			"Account",
			() => {
				NavigationHelper.navigateToAccount(navigate, location.pathname);
			}
		),
		new DropdownItem(
			"Logout",
			async () => {
				const redirectUrl = await SliceHelper.tryLogout(dispatch);
				navigate(redirectUrl);
			}
		)
    ];

    return <div className="chat-threads-panel">
		<div className="panel-header">
			<div className="chat-threads-panel-header-ditto-chat-title-container">
				<div className="chat-threads-panel-header-ditto-chat-container">
					<DittoLogoAndTitle />
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
					inputVariable={searchParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER) || ""}
					setInputVariable={(newSearchInput: string) => onSearchInputChange(newSearchInput)}
					inputPlaceholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
				/>
			</div>
		</div>
		<div className="chat-threads-container">
			{ isLoadingChatThreads === true
				? <LoadingSpinner />
				: isFilterCurrentlyChanging === true
					? <div className="chat-thread-buttons-container">
						{chatThread !== null && <ChatThreadButton
							chatThreadOverview={chatThread.getOverview()}
							openChatFunction={() => NavigationHelper.navigateToChat(navigate, chatThread.getOverview().getId(), chatThreadId, searchParams)}
							isSelected={true}
						/>}
						<LoadingSpinner />
					</div>
					: <div className="chat-thread-buttons-container">
						{ chatThreadList.map(chatThreadOverview => {
							return <ChatThreadButton
								key={chatThreadOverview.getId()}
								chatThreadOverview={chatThreadOverview as ChatThreadOverview}
								openChatFunction={() => NavigationHelper.navigateToChat(navigate, chatThreadOverview.getId(), chatThreadId, searchParams)}
								isSelected={
									(isChatThreadsPanelIndependentPage === false)
									&& (chatThreadOverview.getId() === chatThreadId)
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
