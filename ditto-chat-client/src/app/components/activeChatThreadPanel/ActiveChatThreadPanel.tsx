import { useAppSelector } from "../../store/ReduxStore";
import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import AccountDetails from "../accountDetails/AccountDetails";
import SharedFilesList from "../sharedFilesList/SharedFilesList";
import "./ActiveChatThreadPanel.css";

export default function ActiveChatThreadPanel() {
    const { chatter } = useAppSelector(state => state.chatterSlice);

    const selectedChatter = chatter.getChatterOverview();
    return <div className="active-chat-thread-panel">
		<div className="active-chat-thread-panel-header panel-header">
            <div className="active-chat-thread-panel-chatter-overview-info-container">
                <ChatterOverviewInfo
                    chatterOverview={selectedChatter}
                />
            </div>
		</div>
        <div className="active-chat-thread-panel-feature-list-container">
            <AccountDetails
                accountOverview={selectedChatter}
                isDisplayedInPanel={true}
            />
        </div>
		<div className="active-chat-thread-panel-shared-files-list-container">
            <div className="margin-bottom-2" />
			<SharedFilesList />
		</div>
	</div>
}
