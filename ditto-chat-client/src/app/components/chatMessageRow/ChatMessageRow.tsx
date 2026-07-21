import { LuMessageCircleWarning } from "react-icons/lu";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import { ChatThreadMessageStatus } from "../../enums/ChatThreadMessageStatus";
import "./ChatMessageRow.css";

const FAILED_TO_SEND_CHAT_MESSAGE_TEXT = "Failed to send";
const SENT_CHAT_MESSAGE_TEXT = "Sent";
const NEW_CHAT_MESSAGE_TEXT = "New message";
const SEEN_CHAT_MESSAGE_TEXT = "Seen";
const SENDING_CHAT_MESSAGE_TEXT = "Sending";
const RESEND_CHAT_MESSAGE_TEXT = "Re-send";
const INDICATOR_SIZE = 20;


interface Props {
    chatThreadMessage: ChatThreadMessage
}

export default function ChatMessageRow(props: Props) {
    function getChatMessageDetailsText(): string {
        if (isChatMessageSent === true) {
            if (props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.CONFIRMED) {
                return SENT_CHAT_MESSAGE_TEXT;
            } else if (props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.SENDING) {
                return SENDING_CHAT_MESSAGE_TEXT;
            } else if (props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND) {
                return FAILED_TO_SEND_CHAT_MESSAGE_TEXT;
            }
        } else {
            if (props.chatThreadMessage.getIsMessageSeen() === true) {
                return SEEN_CHAT_MESSAGE_TEXT;
            } else {
                return NEW_CHAT_MESSAGE_TEXT;
            }
        }
    }

    const isChatMessageSent = props.chatThreadMessage.getIsMessageReceived() === false;
    const chatMessageSenderStyle = isChatMessageSent ? "message-sender" : "message-receiver";
    return <div className="chat-message-row margin-bottom-2">
        <div className={`chat-message ${chatMessageSenderStyle}`}>
            { isChatMessageSent === true && props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND &&
                <div className={`chat-message-indicator ${chatMessageSenderStyle}`}>
                    <button className="chat-message-sent-indicator send-failed tooltip" onClick={() => console.log("TODO-resend!")}>
                        <LuMessageCircleWarning size={INDICATOR_SIZE} />
                        <span className="tooltip-text">{RESEND_CHAT_MESSAGE_TEXT}</span>
                    </button>
                </div>
            }
            { isChatMessageSent === true && props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.SENDING &&
                <div className={`chat-message-indicator ${chatMessageSenderStyle}`}>
                    <div className="chat-message-sent-indicator sending tooltip">
                        <LoadingSpinner />
                        <span className="tooltip-text">{SENDING_CHAT_MESSAGE_TEXT}</span>
                    </div>
                </div> 
            }
            <div className={`chat-message-bubble ${chatMessageSenderStyle}`}>
                <div className="chat-message-content bold-text">{props.chatThreadMessage.getMessageContent()}</div>
            </div>
        </div>
        <span className={`chat-message-details ${chatMessageSenderStyle}`}>{getChatMessageDetailsText()} {props.chatThreadMessage.getMessageTime()}</span>
    </div>
}
