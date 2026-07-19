import { useState } from "react";
import IconButton from "../iconButton/IconButton";
import "./IconButtonDropdown.css";

interface Props {
    icon: React.JSX.Element,
    dropdownItems: string[] // TODO: define this type better
}

export default function IconButtonDropdown(props: Props) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownOpenStyle = isDropdownOpen ? "open" : "closed";
    return <div className="icon-button-dropdown">
        <IconButton
            icon={props.icon}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
        <div className={`icon-button-dropdown-list ${dropdownOpenStyle}`}>
            { props.dropdownItems.map((dropdownItem, index) => {
                const isFirstItem = index === 0 ? true : false;

                const nonFirstItemStyle = isFirstItem ? "" : "non-first-item";
                return <button
                    className={`icon-button-dropdown-list-item ${nonFirstItemStyle}`}
                    onClick={() => console.log("TODO")}
                >
                    <div className="bold-text">
                        {dropdownItem}
                    </div>
                </button>
            }) }
        </div>
    </div>
}
