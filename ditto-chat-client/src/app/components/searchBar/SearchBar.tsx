import { IoSearchOutline } from "react-icons/io5";
import IconContainer from "../iconContainer/IconContainer";
import CONSTANTS from "../../../Constants";
import "./SearchBar.css";

interface Props {
    inputVariable: string;
    setInputVariable: (newInputVariable: string) => void;
    inputPlaceholder: string;
}

export default function SearchBar(props: Props) {
    return <div className="search-bar">
        <div className="search-bar-icon-container">
            <IconContainer icon={ <IoSearchOutline size={CONSTANTS.ICON_SIZE} /> } />
        </div>
        <input
            className="search-bar-input"
            disabled={false}
            type="text"
            name="search-bar-input"
            placeholder={props.inputPlaceholder}
            value={props.inputVariable}
            onChange={(event: { target: HTMLInputElement }) => {
                props.setInputVariable(event.target.value);
            }}
        />
    </div>
}
