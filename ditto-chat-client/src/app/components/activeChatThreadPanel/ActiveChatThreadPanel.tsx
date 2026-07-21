import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import AccountDetails from "../accountDetails/AccountDetails";
import SharedFilesList from "../sharedFilesList/SharedFilesList";
import ChatterOverview from "../../classes/ChatterOverview";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./ActiveChatThreadPanel.css";

// TODO
const DUMMY_CHATTER_ACCOUNT = new ChatterOverview(
    "Name",
    "Surname",
    "name.surname",
    ChatterIconImage,
    true
);

export default function ActiveChatThreadPanel() {
    return <div className="active-chat-thread-panel">
		<div className="active-chat-thread-panel-header panel-header">
            <div className="active-chat-thread-panel-chatter-overview-info-container">
                <ChatterOverviewInfo
                    chatterOverview={DUMMY_CHATTER_ACCOUNT}
                />
            </div>
		</div>
        <div className="active-chat-thread-panel-feature-list-container">
            <AccountDetails
                accountOverview={DUMMY_CHATTER_ACCOUNT}
                isDisplayedInPanel={true}
            />
        </div>
		<div className="active-chat-thread-panel-shared-files-list-container">
            <div className="margin-bottom-2" />
			<SharedFilesList />
		</div>
	</div>
}
