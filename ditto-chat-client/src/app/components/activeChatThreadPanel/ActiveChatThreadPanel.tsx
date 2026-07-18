import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../chatFeatureList/ChatFeatureList";
import SharedFilesList from "../sharedFilesList/SharedFilesList";
import { ListType } from "../../enums/ListType";
import "./ActiveChatThreadPanel.css";

export default function ActiveChatThreadPanel() {
    return <div className="active-chat-thread-panel">
		<div className="active-chat-thread-panel-header panel-header">
            <div className="active-chat-thread-panel-chatter-overview-info-container">
                <ChatterOverviewInfo />
            </div>
		</div>
        <div className="active-chat-thread-panel-feature-list-container">
            <div className="margin-bottom-2" />
            <ChatFeatureList listType={ListType.COLUMN} />
        </div>
		<div className="active-chat-thread-panel-shared-files-list-container">
            <div className="margin-bottom-2" />
			<SharedFilesList />
		</div>
	</div>
}
