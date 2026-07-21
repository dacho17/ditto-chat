import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import SearchBar from "../searchBar/SearchBar";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import NewChatButton from "../newChatButton/NewChatButton";
import DropdownItem from "../../interfaces/DropdownItem";
import ChatThreadOverview from "../../interfaces/ChatThreadOverview";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";


// TODO: lastChatThreads must be retrieved from Server, using AsyncThunk Function
const CHAT_THREAD_DUMMIES: ChatThreadOverview[] = [
	{
		chatterName: "David Dosenovic",
		chatterImageUrl: ChatterIconImage,
		isChatterOnline: true,

		lastMessage: "Let's meet",
		lastMessageTime: "18/06/2026 11:35",
		numberOfUnreadMessages: 1,

	},
	{
		chatterName: "Keyser Soze",
		chatterImageUrl: ChatterIconImage,
		isChatterOnline: false,
		lastMessage: null,
		lastMessageTime: null,
		numberOfUnreadMessages: 0
	},
	{
		chatterName: "Mr. X",
		chatterImageUrl: ChatterIconImage,
		isChatterOnline: true,
		lastMessage: "We are watching you",
		lastMessageTime: "17/05/2026 10:00",
		numberOfUnreadMessages: 0
	},
	{
		chatterName: "Jehova Witness",
		chatterImageUrl: ChatterIconImage,
		isChatterOnline: true,
		lastMessage: "Stranka te prati",
		lastMessageTime: "15/03/2026 10:00",
		numberOfUnreadMessages: 0
	}
];

const ICON_SIZE = 26;
const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";

export default function ChatTheadsPanel() {
	const navigate = useNavigate();

	const ACCOUNT_FEATURES: DropdownItem[] = [
        {
            itemName: "Account",
            onClickFunction: () => navigate(CONSTANTS.ACCOUNT_URL)
        },
        {
            itemName: "Logout",
            onClickFunction: () => navigate(CONSTANTS.LOGOUT_URL)
        }
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
						icon={<IoMdMore size={ICON_SIZE} />}
						dropdownItems={ACCOUNT_FEATURES}
					/>
				</div>
			</div>
			<div className="search-bar-container">
				<SearchBar
					inputPlaceholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
				/>
			</div>
		</div>
		<div className="chat-thread-buttons-container">
			{ CHAT_THREAD_DUMMIES.map(chatThreadOverview => {
				return <ChatThreadButton
					chatterName={chatThreadOverview.chatterName}
					chatterImageUrl={chatThreadOverview.chatterImageUrl}
					isChatterOnline={chatThreadOverview.isChatterOnline}
					lastMessage={chatThreadOverview.lastMessage}
					lastMessageTime={chatThreadOverview.lastMessageTime}
					numberOfUnreadMessages={chatThreadOverview.numberOfUnreadMessages}
					onClickFunction={() => navigate(`${CONSTANTS.CHAT_URL}`)} // TODO: add ChatId to url. Stay on /home and open a newChatThread for non-mobile devices
				/>
			})}
		</div>
		<NewChatButton />
	</div>
}
