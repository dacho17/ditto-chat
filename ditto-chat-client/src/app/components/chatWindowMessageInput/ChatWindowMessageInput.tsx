import { IoAttachOutline, IoSendOutline } from "react-icons/io5";
import { BsEmojiSmileUpsideDown } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { sendChatThreadMessage, setCurrentChatMessageInput, updateLastSeenChatThreadMessage } from "../../store/ChatSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import IconButton from "../iconButton/IconButton";
import CryptoHelper from "../../helpers/CryptoHelper";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import CONSTANTS from "../../../Constants";
import "./ChatWindowMessageInput.css";

const INPUT_PLACEHOLDER_VALUE = "Message";

export default function ChatWindowMessageInput() {
    const { currentChatMessageInput, chatThread } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();

    async function trySendChatThreadMessage(): Promise<void> {
        const newChatThreadMessage = new ChatThreadMessageForm(currentChatMessageInput, CryptoHelper.generateUuid(), false);
        
        try {
            await dispatch(sendChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageForm: newChatThreadMessage })).unwrap();
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        }
    }

    async function tryUpdateLastSeenChatThreadMessage(): Promise<void> {
        const currentLastUnseenMessage = chatThread.getMessages()
            .find(chatMessage => chatMessage.getIsMessageSeen() === false);
        if (currentLastUnseenMessage === undefined) {
            return; // there are no unseen messages currently
        }

        try {
            await dispatch(updateLastSeenChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageId: currentLastUnseenMessage.getId() })).unwrap();
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {}
    }

    return <div className="chat-window-message-input">
        <input
            className="chat-window-message-input-field"
            disabled={false}
            type="text"
            name="new-chat-message"
            placeholder={INPUT_PLACEHOLDER_VALUE}
            value={currentChatMessageInput}
            onChange={(event) => {
                dispatch(setCurrentChatMessageInput(event.target.value));
            }}
            onFocus={() => tryUpdateLastSeenChatThreadMessage()}
        />
        <div className="chat-window-message-input-additions">
            <IconButton
                icon={<IoAttachOutline size={CONSTANTS.ICON_SIZE} />}
                onClick={() => console.log("TODO")} 
            />
            <IconButton
                icon={<BsEmojiSmileUpsideDown size={CONSTANTS.ICON_SIZE} />}
                onClick={() => console.log("TODO")} 
            />
        </div>
        <div className="chat-window-message-input-send-button-container">
            <button className="chat-window-message-input-send-button"
                onClick={() => trySendChatThreadMessage()}
                disabled={currentChatMessageInput.trim() === ""}
            >
                <IoSendOutline size={CONSTANTS.ICON_SIZE} />
            </button>
        </div>
    </div>
}
