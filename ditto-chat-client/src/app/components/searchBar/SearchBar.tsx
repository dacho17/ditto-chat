import { IoSearchOutline } from "react-icons/io5";
import IconContainer from "../iconContainer/IconContainer";
import "./SearchBar.css";


interface Props {
    inputPlaceholder: string;
}

const ICON_SIZE = 26;

export default function SearchBar(props: Props) {
    return <div className="search-bar">
        <div className="search-bar-icon-container">
            <IconContainer icon={ <IoSearchOutline size={ICON_SIZE} /> } />
        </div>
        <input
            className="search-bar-input"
            disabled={false}
            type="text"
            name="search-bar-input"
            placeholder={props.inputPlaceholder}
            // value={"TODO"}
            // ref={"TODO"}
            // onChange={(event) => onInputChanged(event, false)}
            // onBlur={(event) => onInputChanged(event, true)}
        />
    </div>
}
