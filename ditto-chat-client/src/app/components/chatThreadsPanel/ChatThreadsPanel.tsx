import ChatThreadsSearch from "../chatThreadsSearch/ChatThreadsSearch";
import ChatThreadButton from "../chatThreadButton/ChatThreadButton";
import ChatThreadOverview from "../../interfaces/ChatThreadOverview";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import CONSTANTS from "../../../Constants";
import "./ChatThreadsPanel.css";

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

export default function ChatTheadsPanel() {
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
			</div>
			<div className="chat-threads-search-container">
				<ChatThreadsSearch />
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
				/>
			})}
		</div>
	</div>
}
