import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./ChatThreadButton.css";

const UNREAD_MESSAGES_MESSAGE = "Unread Messages";
const START_CONVERSATION_MESSAGE = "Start Conversation";

// NOTE: ChatterButton is ChatThreadButton without ThreadDetails
interface Props {
    chatterName: string;
    chatterImageUrl: string;
    isChatterOnline: boolean;
    // TODO: this can be a ChatterObject

    lastMessage: string | null;
    lastMessageTime: string | null;
    numberOfUnreadMessages: number;
    // TODO: this can be ChatterThreadOverview, or sth similar. It can be either that type or null

    onClickFunction: Function
}

export default function ChatThreadButton(props: Props) {
    function getLastMessageText(): string {
        if (props.numberOfUnreadMessages > 0) {
            return UNREAD_MESSAGES_MESSAGE;
        } else if (props.lastMessage !== null) {
            return props.lastMessage;
        } else {
            return START_CONVERSATION_MESSAGE;
        }
    }

    function getLastMessageTime(): string {
        const isLastMessageSentToday = false;        // TODO: this needs to be calculated!
        if (isLastMessageSentToday === true) {
            return "12:00";    // TODO: return time of the day!
        } else {
            return "31/12/2000";    // TODO: return date!
        }
    }

    return <button
        className="chat-thread-button"
        onClick={() => props.onClickFunction()}
    >
        <div className="chat-thread-button-user-image-container">
            <ChatterIcon
                chatterName={props.chatterName}
                chatterImageUrl={props.chatterImageUrl}
                isOnline={props.isChatterOnline}
            />
        </div>
        <div className="chat-thread-button-summary">
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="bold-text handle-overflow">{props.chatterName}</span>
                { props.lastMessageTime !== null
                    ? <span className="regular-faded-text margin-left-1">{getLastMessageTime()}</span>
                    : null
                }
            </div>
            <div className="chat-thread-button-summary-row line-height-2">
                <span className="regular-faded-text">{getLastMessageText()}</span>
                { props.numberOfUnreadMessages > 0
                    ? <span className="chat-thread-button-summary-unread-messages">{props.numberOfUnreadMessages}</span>
                    : null
                }
            </div>
        </div>
    </button>
}
