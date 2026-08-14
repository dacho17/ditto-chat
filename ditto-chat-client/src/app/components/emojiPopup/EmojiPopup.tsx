import { useEffect, useRef, useState } from "react";
import { BsEmojiSmileUpsideDown } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { setCurrentChatMessageInput } from "../../store/ChatSlice";
import IconButton from "../iconButton/IconButton";
import CONSTANTS from "../../../Constants";
import "./EmojiPopup.css";

const EMOJI_CODES_LIST = [  // randomly sampled (with heart) from: https://unicode.org/emoji/charts/full-emoji-list.html
    "\u{1F643}",
    "\u{1F605}",
    "\u{1F609}",
    "\u{1F60A}",
    "\u{1F972}",
    "\u{2764}",
    "\u{1F63A}",
    "\u{1F44B}",
    "\u{1F44C}",
    "\u{1F90C}",
    "\u{1FAF0}",
    "\u{270C}",
];

export default function EmojiPopup() {
    const { currentChatMessageInput } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
    const [isEmojiPopupOpened, setIsEmojiPopupOpened] = useState(false);
    const emojiButtonRef = useRef(null);
    const emojiPopupRef = useRef(null);

    // if EmojiPopup is opened, registers an EventListener to Call a Function to Close the Popup if MouseClick is detected outside of the Emoji Popup Elements
    useEffect(() => {
        if (isEmojiPopupOpened === false) {
            // If the popup isn't open, don't listen for clicks
            return;
        }

        document.addEventListener("click", closePopupOnClickOutside);
        return () => document.removeEventListener("click", closePopupOnClickOutside);
    }, [isEmojiPopupOpened]);

    function addEmojiToChatMessageInput(emojiCode: string): void {
        dispatch(setCurrentChatMessageInput(currentChatMessageInput + emojiCode));
    }

    function closePopupOnClickOutside(event: PointerEvent): void {
        if (
            emojiPopupRef.current !== null && emojiButtonRef.current !== null &&
            !emojiPopupRef.current.contains(event.target) && !emojiButtonRef.current.contains(event.target)
        ) {
            // Close if the click target is completely outside the ref elements (emoji button and emoji popup)
            setIsEmojiPopupOpened(false);
        }
    }

    const dropdownOpenStyle = isEmojiPopupOpened ? "open" : "closed";
    return <div className="emoji-popup" ref={emojiButtonRef}>
        <IconButton
            icon={<BsEmojiSmileUpsideDown size={CONSTANTS.ICON_SIZE} />}
            onClick={() => setIsEmojiPopupOpened(!isEmojiPopupOpened)}
        />
        <div className={`emoji-popup-box ${dropdownOpenStyle}`} ref={emojiPopupRef}>
            { EMOJI_CODES_LIST.map((emojiCode, index) => {
                return <IconButton
                    key={`emoji-icon-${index}`}
                    icon={<div className="emoji-icon">{emojiCode}</div>}
                    onClick={() => addEmojiToChatMessageInput(emojiCode)}
                />
            })}
        </div>
    </div>
}
