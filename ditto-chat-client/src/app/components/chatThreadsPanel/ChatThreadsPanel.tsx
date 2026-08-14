import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { setIsChatThreadsFilterCurrentlyChanging, setIsLoadingOlderChatThreads } from "../../store/HomeSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import PageContent from "../pageContent/PageContent";
import SearchBar from "../searchBar/SearchBar";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import NewChatButton from "../newChatButton/NewChatButton";
import DittoLogoAndTitle from "../dittoLogoAndTitle/DittoLogoAndTitle";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import NavigationHelper from "../../helpers/NavigationHelper";
import TypeFormatter from "../../helpers/TypeFormatter";
import DropdownItem from "../../classes/DropdownItem";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import { DeviceType } from "../../enums/DeviceType";
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";

interface Props {
	isInitialChatThreadLoadFinished: boolean;
	didUnhandledServerErrorOccur: boolean;
}

export default function ChatThreadsPanel(props: Props) {
	const { chatThread } = useAppSelector(state => state.chatSlice);
	const { chatThreadList, isLastChatThreadListPage, isFilterCurrentlyChanging }
		= useAppSelector(state => state.homeSlice);
	const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);
	const dispatch = useAppDispatch();
	const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
	const [sendTryToGetOlderChatThreads, _] = useTryToSendRequest<null>();
	const [sendTryToLogout, __] = useTryToSendRequest<null>();
	const { addUrlToHistory } = useUrlHistoryNavigate();
	const navigate = useNavigate();

	async function tryToGetOlderChatThreads(): Promise<void> {
		const newPage = TypeFormatter.stringToInt(searchParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER)) + 1;
		searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, newPage.toString());
		setSearchParams(searchParams);
		addUrlToHistory(searchParams.toString());

		const isChatWindowOnHomePage = currentDeviceType !== DeviceType.MOBILE_PHONE;
		const currentlySelectedChatThread =
			isChatWindowOnHomePage === true && chatThread !== null ? chatThread.getOverview() : null;
		await SliceHelper.tryToGetChatThreads(searchParams, currentlySelectedChatThread, false, sendTryToGetOlderChatThreads, setIsLoadingOlderChatThreads, dispatch);
	}

	function onSearchInputChange(newSearchInput: string): void {
		dispatch(setIsChatThreadsFilterCurrentlyChanging(true));
		searchParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, newSearchInput);
		searchParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, "0");
		setSearchParams(searchParams);
		addUrlToHistory(searchParams.toString());
	}

	function getAccountFeatures(): DropdownItem[] {
		return [
			new DropdownItem(
				"Account",
				() => {
					NavigationHelper.navigateToAccount(navigate, location.pathname);
				}
			),
			new DropdownItem(
				"Logout",
				async () => {
					await SliceHelper.tryToLogout(sendTryToLogout, dispatch);
				}
			)
		];
	}

	function getChatThreadButtonList(): React.JSX.Element {
		const activeChatThreadId = chatThread !== null
			? chatThread.getOverview().getId() : null;

		// ChatThreadButtonList differs based on whether the Filter is currently changing or not
		const chatThreadButtonList = isFilterCurrentlyChanging === true
			? <> 
				{/* If chatThread is Selected, show it above loading spinner while the Filter is Changing */}
				{chatThread !== null && <ChatThreadButton
					chatThreadOverview={chatThread.getOverview()}
					openChatFunction={() => NavigationHelper.navigateToChat(navigate, activeChatThreadId, activeChatThreadId, searchParams, currentDeviceType)}
					isSelected={true}
				/>}
				<LoadingSpinner />
			</>
			: <>
				{ chatThreadList.map(chatThreadOverview => {
					return <ChatThreadButton
						key={chatThreadOverview.getId()}
						chatThreadOverview={chatThreadOverview as ChatThreadOverview}
						openChatFunction={() => NavigationHelper.navigateToChat(navigate, chatThreadOverview.getId(), activeChatThreadId, searchParams, currentDeviceType)}
						isSelected={
							(currentDeviceType !== DeviceType.MOBILE_PHONE)
							&& (chatThreadOverview.getId() === activeChatThreadId)
						}
					/>
				})}
				{ isLastChatThreadListPage === false && 
					<ShowMoreButton
						isDirectionUpwards={false}
						showMoreFunc={tryToGetOlderChatThreads}
					/>
				}
			</>

		return <div className="chat-thread-buttons-container">
			{chatThreadButtonList};
		</div>
	}

    return <div className="chat-threads-panel">
		<div className="panel-header">
			<div className="chat-threads-panel-header-ditto-chat-title-container">
				<div className="chat-threads-panel-header-ditto-chat-container">
					<DittoLogoAndTitle />
				</div>
				<div className="account-feature-list-container">
					<IconButtonDropdown
						icon={<IoMdMore size={CONSTANTS.ICON_SIZE} />}
						dropdownItems={getAccountFeatures()}
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
			<PageContent
				regularPageContent={getChatThreadButtonList()}
				isLoadingPage={props.isInitialChatThreadLoadFinished === false}
				didUnhandledServerErrorOccur={props.didUnhandledServerErrorOccur}
				showResponseErrorCard={false}
			/>
		</div>
		<NewChatButton />
	</div>
}
