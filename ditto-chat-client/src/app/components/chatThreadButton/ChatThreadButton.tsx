import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./ChatThreadButton.css";

const UNREAD_MESSAGES_MESSAGE = "Unread Messages";
const START_CONVERSATION_MESSAGE = "Start Conversation";

interface Props {
    chatterName: string;
    chatterImageUrl: string;
    isChatterOnline: boolean;

    lastMessage: string | null;
    lastMessageTime: string | null;
    numberOfUnreadMessages: number;
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

    return <div className="chat-thread-button">
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
                    ? <span className="regular-faded-text">{props.lastMessageTime}</span>
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
    </div>
}
