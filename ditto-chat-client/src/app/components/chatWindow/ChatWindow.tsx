import { useAppSelector } from "../../store/ReduxStore";
import PageContent from "../pageContent/PageContent";
import ChatterOverviewInfo from "../chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../chatFeatureList/ChatFeatureList";
import ChatWindowMessagesList from "../chatWindowMessagesList/ChatWindowMessagesList";
import ChatWindowMessageInput from "../chatWindowMessageInput/ChatWindowMessageInput";
import SharedFileOverlay from "../sharedFileOverlay/SharedFileOverlay";
import { ListType } from "../../enums/ListType";
import { DeviceType } from "../../enums/DeviceType";
import "./ChatWindow.css";

interface Props {
    didUnhandledServerErrorOccur: boolean;
}

export default function ChatWindow(props: Props) {
	const { chatThread, isLoadingChatThread } = useAppSelector(state => state.chatSlice);
	const { chatSharedFileInOverlay } = useAppSelector(state => state.chatSlice);
	const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);

	function getChatWindowContent(): React.JSX.Element {
		if (chatThread === null) {
			return <></>
		}

		return <>
			<div className="chat-window-header panel-header">
				<div className="chat-window-header-chatter-overview-info-container">
					<ChatterOverviewInfo
						chatterOverview={chatThread.getOverview().getChatterOverview()}
					/>
				</div>
				<div className="chat-window-header-feature-list-container">
					<ChatFeatureList
					activeChatThread={chatThread}
					listType={ListType.ROW}
				/>
				</div>
			</div>
			<div className="chat-window-messages-list-container">
				<ChatWindowMessagesList activeChatThread={chatThread} />
			</div>
			<div className="chat-window-message-input-container">
				<ChatWindowMessageInput activeChatThread={chatThread} />
			</div>
			{ chatSharedFileInOverlay !== null && <SharedFileOverlay /> }
		</>
	}

    return <div className="chat-window">
		<PageContent
			regularPageContent={getChatWindowContent()}
			isLoadingPage={isLoadingChatThread === true}
			didUnhandledServerErrorOccur={props.didUnhandledServerErrorOccur}
			showResponseErrorCard={currentDeviceType === DeviceType.MOBILE_PHONE}
		/>
	</div>
}
