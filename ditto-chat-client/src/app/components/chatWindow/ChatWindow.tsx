import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../chatFeatureList/ChatFeatureList";
import ChatWindowMessagesList from "../chatWindowMessagesList/ChatWindowMessagesList";
import ChatWindowMessageInput from "../chatWindowMessageInput/ChatWindowMessageInput";
import ChatterOverview from "../../classes/ChatterOverview";
import { ListType } from "../../enums/ListType";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./ChatWindow.css";

// TODO: Chatter needs to be retrieved!
const DUMMY_CHATTER = new ChatterOverview(
	"David", "Dosenovic", "david.dosenovic", ChatterIconImage, true
);

export default function ChatWindow() {
    return <div className="chat-window">
		<div className="chat-window-header panel-header">
			<div className="chat-window-header-chatter-overview-info-container">
				<ChatterOverviewInfo
					chatterOverview={DUMMY_CHATTER}
				/>
			</div>
			<div className="chat-window-header-feature-list-container">
				<ChatFeatureList listType={ListType.ROW} />
			</div>
		</div>
		<div className="chat-window-messages-list-container">
			<ChatWindowMessagesList />
		</div>
		<div className="chat-window-message-input-container">
			<ChatWindowMessageInput />
		</div>
	</div>
}
