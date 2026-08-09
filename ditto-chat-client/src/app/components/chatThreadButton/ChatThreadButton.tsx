import ChatThreadOverview from "../../classes/ChatThreadOverview";
import TimeHelper from "../../helpers/TimeHelper";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./ChatThreadButton.css";

const UNREAD_MESSAGES_MESSAGE = "Unread Messages";
const START_CONVERSATION_MESSAGE = "Start Conversation";

// NOTE: ChatterButton is ChatThreadButton without ThreadDetails
interface Props {
    chatThreadOverview: ChatThreadOverview
    openChatFunction: Function,
    isSelected: boolean
}

export default function ChatThreadButton(props: Props) {
    function getLastMessageText(): string {
        if (props.chatThreadOverview.getNumberOfUnseenMessages() > 0) {
            return UNREAD_MESSAGES_MESSAGE;
        } else if (props.chatThreadOverview.getLastMessage() !== null) {
            return props.chatThreadOverview.getLastMessage();
        } else {
            return START_CONVERSATION_MESSAGE;
        }
    }

    function getLastMessageTime(lastMessageTimestamp: number): string {
        if (TimeHelper.isTimestampToday(lastMessageTimestamp)) {
            return TimeHelper.timestampToLocalTimeOfDay(lastMessageTimestamp);
        } else {
            return TimeHelper.timestampToLocalCalendarDay(lastMessageTimestamp);
        }
    }

    const isSelectedStyle = props.isSelected ? "selected" : "";
    return <button
        className={`chat-thread-button ${isSelectedStyle}`}
        onClick={() => props.openChatFunction()}
    >
        <div className="chat-thread-button-chatter-image-container">
            <ChatterIcon
                chatterFullName={props.chatThreadOverview.getChatterOverview().getChatterFullName()}
                chatterImageUrl={props.chatThreadOverview.getChatterOverview().getChatterImageUrl()}
                isOnline={props.chatThreadOverview.getChatterOverview().getIsChatterOnline()}
            />
        </div>
        <div className="chat-thread-button-summary">
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="bold-text handle-overflow">{props.chatThreadOverview.getChatterOverview().getChatterFullName()}</span>
                { props.chatThreadOverview.getLastMessageTimestamp() !== null
                    ? <span className="regular-faded-text margin-left-1">{getLastMessageTime(props.chatThreadOverview.getLastMessageTimestamp())}</span>
                    : null
                }
            </div>
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="regular-faded-text handle-overflow">{getLastMessageText()}</span>
                { props.chatThreadOverview.getNumberOfUnseenMessages() > 0
                    ? <span className="chat-thread-button-summary-unread-messages">{props.chatThreadOverview.getNumberOfUnseenMessages()}</span>
                    : null
                }
            </div>
        </div>
    </button>
}
