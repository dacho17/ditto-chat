import { IoSearchOutline } from "react-icons/io5";
import IconContainer from "../iconContainer/IconContainer";
import "./ChatThreadsSearch.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chats";
const ICON_SIZE = 26;

export default function ChatThreadsSearch() {
    return <div className="chat-threads-search">
        <div className="chat-threads-search-icon-container">
            <IconContainer icon={ <IoSearchOutline size={ICON_SIZE} /> } />
        </div>
        <input
            className="chat-threads-search-input"
            disabled={false}
            type="text"
            name="chat-threads-search-input"
            placeholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
            // value={"TODO"}
            // ref={"TODO"}
            // onChange={(event) => onInputChanged(event, false)}
            // onBlur={(event) => onInputChanged(event, true)}
        />
    </div>
}
