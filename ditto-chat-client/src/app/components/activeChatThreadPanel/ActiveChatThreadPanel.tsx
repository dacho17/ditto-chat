import { useAppSelector } from "../../store/ReduxStore";
import PageContent from "../pageContent/PageContent";
import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import AccountDetails from "../accountDetails/AccountDetails";
import SharedFilesList from "../sharedFilesList/SharedFilesList";
import "./ActiveChatThreadPanel.css";

interface Props {
    didUnhandledServerErrorOccur: boolean;
}

export default function ActiveChatThreadPanel(props: Props) {
    const { chatter } = useAppSelector(state => state.chatterSlice);

    function getActiveChatThreadPanelContent(): React.JSX.Element {
        if (chatter === null) {
            return <></>
        }

        return <>
            <div className="active-chat-thread-panel-header panel-header">
                <div className="active-chat-thread-panel-chatter-overview-info-container">
                    <ChatterOverviewInfo
                        chatterOverview={chatter.getChatterOverview()}
                    />
                </div>
            </div>
            <div className="active-chat-thread-panel-feature-list-container">
                <AccountDetails
                    accountOverview={chatter.getChatterOverview()}
                    isDisplayedInPanel={true}
                />
            </div>
            <div className="active-chat-thread-panel-shared-files-list-container">
                <div className="margin-bottom-2" />
                <SharedFilesList selectedChatter={chatter} />
            </div>            
        </>
    }

    return <div className="active-chat-thread-panel">
        <PageContent
            regularPageContent={getActiveChatThreadPanelContent()}
            isLoadingPage={ chatter === null }
            didUnhandledServerErrorOccur={props.didUnhandledServerErrorOccur}
            showResponseErrorCard={false}
        />
	</div>
}
