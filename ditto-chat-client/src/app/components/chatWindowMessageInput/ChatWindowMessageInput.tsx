import { useParams } from "react-router-dom";
import { IoAttachOutline, IoSendOutline } from "react-icons/io5";
import { BsEmojiSmileUpsideDown } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { sendChatThreadMessage, setCurrentChatMessageInput } from "../../store/ChatSlice";
import IconButton from "../iconButton/IconButton";
import CryptoHelper from "../../helpers/CryptoHelper";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import CONSTANTS from "../../../Constants";
import "./ChatWindowMessageInput.css";

const INPUT_PLACEHOLDER_VALUE = "Message";

export default function ChatWindowMessageInput() {
    const { currentChatMessageInput } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
	const { chatThreadId } = useParams();

    async function trySendChatThreadMessage(): Promise<void> {
        const newChatThreadMessage = new ChatThreadMessageForm(currentChatMessageInput, CryptoHelper.generateUuid(), false);
        
        try {
            await dispatch(sendChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageForm: newChatThreadMessage })).unwrap();
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        }
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
