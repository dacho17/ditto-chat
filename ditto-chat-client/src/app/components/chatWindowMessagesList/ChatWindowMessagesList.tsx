import ChatMessageRow from "../chatMessageRow/ChatMessageRow";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import { ChatThreadMessageStatus } from "../../enums/ChatThreadMessageStatus";
import "./ChatWindowMessagesList.css";

const START_THE_CHAT_INDICATOR_TEXT = "No message history. Be the first one to message the tenant";
const CHAT_STARTED_INDICATOR_TEXT = "Conversation started";
const NUMBER_OF_CHAT_MESSAGES_PER_PAGE = 10;

const DUMMY_MESSAGE_LIST: ChatThreadMessage[] = [
    new ChatThreadMessage(
        ChatThreadMessageStatus.SENDING, "id-1", "Message which is being sent", "18/06/2026 15:10", false, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.FAILED_TO_SEND, "id-1", "Message which failed to be sent", "18/06/2026 15:05", false, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-2", "New, not seen message", "18/06/2026 15:00", true, false
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-2", "Response Message", "16/06/2026 11:13", true, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-2", "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum",
        "16/06/2026 11:13", true, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-1", "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum",
        "16/06/2026 11:12", false, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-1",
        "Second Message", "16/06/2026 11:12", false, true
    ),
    new ChatThreadMessage(
        ChatThreadMessageStatus.CONFIRMED, "id-1",
        "First Message", "16/06/2026 11:11", false, true
    ),
];
const DUMMY_OLDER_MESSAGES_LOADING_STATUS = false;
const DUMMY_IS_ENTIRE_CHAT_HISTORY_LOADED = true;

export default function ChatWindowMessagesList() {
    function getFirstChatMessagerRow(): React.JSX.Element {
        if (DUMMY_MESSAGE_LIST.length === 0) {
            return <div className="chat-window-messages-list-indicator-row margin-bottom-10">
                <span>{START_THE_CHAT_INDICATOR_TEXT}</span>
            </div>
        } else if (DUMMY_IS_ENTIRE_CHAT_HISTORY_LOADED === true || DUMMY_MESSAGE_LIST.length < NUMBER_OF_CHAT_MESSAGES_PER_PAGE) {
            return <div className='chat-window-messages-list-indicator-row margin-top-3 margin-bottom-2'>
                <span>{CHAT_STARTED_INDICATOR_TEXT}</span>
            </div>
        } else {
            if (DUMMY_OLDER_MESSAGES_LOADING_STATUS) {
                return  <LoadingSpinner />
            } else {
                return <div className='chat-window-messages-list-indicator-row margin-bottom-1'>
                    <ShowMoreButton
                        showMoreFunc={() => console.log("TODO-show more func")}
                        isDirectionUpwards={true}
                    />
                </div>
            }
        }
    }

    return <div className="chat-window-messages-list">
        <div className="margin-bottom-2" />
            {DUMMY_MESSAGE_LIST.map(chatMessage => {
                return <ChatMessageRow
                    chatThreadMessage={chatMessage}
                />
            })}
            {getFirstChatMessagerRow()}
    </div>
}
