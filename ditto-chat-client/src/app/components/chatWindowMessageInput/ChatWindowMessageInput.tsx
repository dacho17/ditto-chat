import { IoAttachOutline, IoSendOutline } from "react-icons/io5";
import { BsEmojiSmileUpsideDown } from "react-icons/bs";
import IconButton from "../iconButton/IconButton";
import CONSTANTS from "../../../Constants";
import "./ChatWindowMessageInput.css";

const INPUT_PLACEHOLDER_VALUE = "Message";

export default function ChatWindowMessageInput() {
    return <div className="chat-window-message-input">
        <input
            className="chat-window-message-input-field"
            disabled={false}
            type="text"
            name="new-chat-message"
            placeholder={INPUT_PLACEHOLDER_VALUE}
            // value={"TODO"}
            // ref={"TODO"}
            // onChange={(event) => onInputChanged(event, false)}
            // onBlur={(event) => onInputChanged(event, true)}
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
                onClick={() => console.log("TODO-send-func")}
                disabled={false}
            >
                <IoSendOutline size={CONSTANTS.ICON_SIZE} />
            </button>
        </div>
    </div>
}
