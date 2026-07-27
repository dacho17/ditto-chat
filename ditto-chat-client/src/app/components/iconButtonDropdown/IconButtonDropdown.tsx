import { useState } from "react";
import IconButton from "../iconButton/IconButton";
import DropdownItem from "../../classes/DropdownItem";
import "./IconButtonDropdown.css";

interface Props {
    icon: React.JSX.Element,
    dropdownItems: DropdownItem[]
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
                    key={`id-${index}-${dropdownItem.getItemName()}`}
                    className={`icon-button-dropdown-list-item ${nonFirstItemStyle}`}
                    onClick={() => {
                        dropdownItem.getFunction()();
                        setIsDropdownOpen(false);
                    }}
                >
                    <div className="bold-text">
                        {dropdownItem.getItemName()}
                    </div>
                </button>
            }) }
        </div>
    </div>
}
