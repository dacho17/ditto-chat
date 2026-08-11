import { LuMessageCircleWarning } from "react-icons/lu";
import SharedFileButton from "../sharedFileButton/SharedFileButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import TimeHelper from "../../helpers/TimeHelper";
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
    chatThreadMessage: ChatThreadMessage;
    loggedInChatterId: string;
    resendFunction: (chatMessageClientRef: string) => Promise<void>;
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

    function getChatThreadMessageTime(chatThreadMessageTimestamp: number): string {
        const localTimeOfDay = TimeHelper.timestampToLocalTimeOfDay(chatThreadMessageTimestamp);
        const localCalendarDay = TimeHelper.timestampToLocalCalendarDay(chatThreadMessageTimestamp);
        return `${localTimeOfDay} ${localCalendarDay}`;
    }

    function getChatThreadMessageAttachedFileContent(): React.JSX.Element {
        if (props.chatThreadMessage.getIsAttachingFile() === true) {
            return <div className="chat-message-bubble-attached-file-container">
                <div className="chat-message-bubble-attached-file-uploading-background">
                    <LoadingSpinner />
                </div>
            </div>
        } else if (props.chatThreadMessage.getAttachedFile() !== null) {
            return <div className="chat-message-bubble-attached-file-container">
                <SharedFileButton
                    key={props.chatThreadMessage.getAttachedFile().getFileUrl()}
                    sharedFile={props.chatThreadMessage.getAttachedFile()}
                    isShownInChatThreadMessage={true}
                />
            </div>
        } else {
            return <></>
        }
    }

    const isChatMessageSent = props.chatThreadMessage.getIsMessageReceived() === false;
    const chatMessageSenderStyle = isChatMessageSent ? "message-sender" : "message-receiver";
    return <div className="chat-message-row margin-bottom-2">
        <div className={`chat-message ${chatMessageSenderStyle}`}>
            { isChatMessageSent === true && props.chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND &&
                <div className={`chat-message-indicator ${chatMessageSenderStyle}`}>
                    <button
                        className="chat-message-sent-indicator send-failed tooltip"
                        onClick={() => props.resendFunction(props.chatThreadMessage.getClientRef())}
                    >
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
                { getChatThreadMessageAttachedFileContent() }
            </div>
        </div>
        <span className={`chat-message-details ${chatMessageSenderStyle}`}>
            {getChatMessageDetailsText()} {getChatThreadMessageTime(props.chatThreadMessage.getMessageTimestamp())}
        </span>
    </div>
}
