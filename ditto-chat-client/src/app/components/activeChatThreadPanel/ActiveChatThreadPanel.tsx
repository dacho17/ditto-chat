import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import AccountDetails from "../accountDetails/AccountDetails";
import SharedFilesList from "../sharedFilesList/SharedFilesList";
import "./ActiveChatThreadPanel.css";

export default function ActiveChatThreadPanel() {
    return <div className="active-chat-thread-panel">
		<div className="active-chat-thread-panel-header panel-header">
            <div className="active-chat-thread-panel-chatter-overview-info-container">
                <ChatterOverviewInfo />
            </div>
		</div>
        <div className="active-chat-thread-panel-feature-list-container">
            <AccountDetails isDisplayedInPanel={true} />
        </div>
		<div className="active-chat-thread-panel-shared-files-list-container">
            <div className="margin-bottom-2" />
			<SharedFilesList />
		</div>
	</div>
}
