import { LuMessageCircleWarning } from "react-icons/lu";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import { ChatMessageStatus } from "../../enums/ChatMessageStatus";
import "./ChatMessageRow.css";

const DUMMY_ACCOUNT = "David Dosenovic";
const RESEND_CHAT_MESSAGE_TEXT = "Re-send";
const SENDING_CHAT_MESSAGE_TEXT = "Sending";
const FAILED_TO_SEND_CHAT_MESSAGE_TEXT = "Failed to send";
const SENT_CHAT_MESSAGE_TEXT = "Sent";
const NEW_CHAT_MESSAGE_TEXT = "New message";
const SEEN_CHAT_MESSAGE_TEXT = "Seen";
const INDICATOR_SIZE = 20;


interface Props {
    chatMessageStatus: ChatMessageStatus,
    messageSender: string;      // NOTE: using prop such as this can enable group chats
    messageTime: string;
    messageContent: string;
    isMessageSeen: boolean;
}

export default function ChatMessageRow(props: Props) {
    function getChatMessageDetailsText(): string {
        if (isChatMessageSent === true) {
            if (props.chatMessageStatus === ChatMessageStatus.CONFIRMED) {
                return SENT_CHAT_MESSAGE_TEXT;
            } else if (props.chatMessageStatus === ChatMessageStatus.SENDING) {
                return SENDING_CHAT_MESSAGE_TEXT;
            } else if (props.chatMessageStatus === ChatMessageStatus.FAILED_TO_SEND) {
                return FAILED_TO_SEND_CHAT_MESSAGE_TEXT;
            }
        } else {
            if (props.isMessageSeen === true) {
                return SEEN_CHAT_MESSAGE_TEXT;
            } else {
                return NEW_CHAT_MESSAGE_TEXT;
            }
        }
    }

    const isChatMessageSent = props.messageSender === DUMMY_ACCOUNT;
    const chatMessageSenderStyle = isChatMessageSent === true
        ? "message-sender" : "message-receiver";
    return <div className="chat-message-row margin-bottom-2">
        <div className={`chat-message ${chatMessageSenderStyle}`}>
            { isChatMessageSent === true && props.chatMessageStatus === ChatMessageStatus.FAILED_TO_SEND &&
                <div className={`chat-message-indicator ${chatMessageSenderStyle}`}>
                    <button className="chat-message-sent-indicator send-failed tooltip" onClick={() => console.log("TODO-resend!")}>
                        <LuMessageCircleWarning size={INDICATOR_SIZE} />
                        <span className="tooltip-text">{RESEND_CHAT_MESSAGE_TEXT}</span>
                    </button>
                </div>
            }
            { isChatMessageSent === true && props.chatMessageStatus === ChatMessageStatus.SENDING &&
                <div className={`chat-message-indicator ${chatMessageSenderStyle}`}>
                    <div className="chat-message-sent-indicator sending tooltip">
                        <LoadingSpinner />
                        <span className="tooltip-text">{SENDING_CHAT_MESSAGE_TEXT}</span>
                    </div>
                </div> 
            }
            <div className={`chat-message-bubble ${chatMessageSenderStyle}`}>
                <div className="chat-message-content bold-text">{props.messageContent}</div>
            </div>
        </div>
        <span className={`chat-message-details ${chatMessageSenderStyle}`}>{getChatMessageDetailsText()} {props.messageTime}</span>
    </div>
}
