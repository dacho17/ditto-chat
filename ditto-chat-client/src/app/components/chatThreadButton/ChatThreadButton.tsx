import ChatThreadOverview from "../../classes/ChatThreadOverview";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./ChatThreadButton.css";

const UNREAD_MESSAGES_MESSAGE = "Unread Messages";
const START_CONVERSATION_MESSAGE = "Start Conversation";

// NOTE: ChatterButton is ChatThreadButton without ThreadDetails
interface Props {
    chatThreadOverview: ChatThreadOverview
    openChatFunction: Function
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

    function getLastMessageTime(lastMessageTime: string): string {
        const isLastMessageSentToday = false;        // TODO: this needs to be calculated!
        if (isLastMessageSentToday === true) {
            return "12:00";    // TODO: return time of the day!
        } else {
            return "31/12/2000";    // TODO: return date!
        }
    }

    return <button
        className="chat-thread-button"
        onClick={() => props.openChatFunction()}
    >
        <div className="chat-thread-button-user-image-container">
            <ChatterIcon
                chatterFullName={props.chatThreadOverview.getChatter().getChatterFullName()}
                chatterImageUrl={props.chatThreadOverview.getChatter().getChatterImageUrl()}
                isOnline={props.chatThreadOverview.getChatter().getIsChatterOnline()}
            />
        </div>
        <div className="chat-thread-button-summary">
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="bold-text handle-overflow">{props.chatThreadOverview.getChatter().getChatterFullName()}</span>
                { props.chatThreadOverview.getLastMessageTime() !== null
                    ? <span className="regular-faded-text margin-left-1">{getLastMessageTime(props.chatThreadOverview.getLastMessageTime())}</span>
                    : null
                }
            </div>
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="regular-faded-text">{getLastMessageText()}</span>
                { props.chatThreadOverview.getNumberOfUnseenMessages() > 0
                    ? <span className="chat-thread-button-summary-unread-messages">{props.chatThreadOverview.getNumberOfUnseenMessages()}</span>
                    : null
                }
            </div>
        </div>
    </button>
}
