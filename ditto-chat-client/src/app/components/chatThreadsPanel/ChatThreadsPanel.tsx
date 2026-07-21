import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import SearchBar from "../searchBar/SearchBar";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import NewChatButton from "../newChatButton/NewChatButton";
import DropdownItem from "../../interfaces/DropdownItem";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import ChatterOverview from "../../classes/ChatterOverview";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";

// TODO: lastChatThreads must be retrieved from Server, using AsyncThunk Function
const CHAT_THREAD_DUMMIES: ChatThreadOverview[] = [
	new ChatThreadOverview(
		"id-1", new ChatterOverview(
			"David", "Dosenovic", "david.dosenovic", ChatterIconImage, true
		),
		1, "18/06/2026 11:35", "Let's meet"
	),
	new ChatThreadOverview(
		"id-2", new ChatterOverview(
			"Keyser", "Soze", "keyser.soze", ChatterIconImage, false
		),
		0, null, null
	),
	new ChatThreadOverview(
		"id-3", new ChatterOverview(
			"Mr", "X", "mr.x", ChatterIconImage, true
		),
		0, "17/05/2026 10:00", "We are watching yout"
	),
	new ChatThreadOverview(
		"id-4", new ChatterOverview(
			"Jehova", "Witness", "jehova.witness", ChatterIconImage, true
		),
		0, "15/03/2026 10:00", "Stranka te prati"
	)
];

export default function ChatThreadsPanel() {
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
						icon={<IoMdMore size={CONSTANTS.ICON_SIZE} />}
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
					chatThreadOverview={chatThreadOverview}
					openChatFunction={() => navigate(`${CONSTANTS.CHAT_URL}`)}	// TODO: add ChatId to url. Stay on /home and open a newChatThread for non-mobile devices
				/>
			})}
		</div>
		<NewChatButton />
	</div>
}
