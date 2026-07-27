import { IoArrowUpOutline, IoArrowDownOutline } from "react-icons/io5";
import CONSTANTS from "../../../Constants";
import "./ShowMoreButton.css";

interface Props {
    showMoreFunc: () => void,
    isDirectionUpwards: boolean
}

export default function ShowMoreButton(props: Props) {
    function getShowMoreIcon(): React.JSX.Element {
        return props.isDirectionUpwards === true ? <IoArrowUpOutline size={CONSTANTS.ICON_SIZE} /> : <IoArrowDownOutline size={CONSTANTS.ICON_SIZE} />
    }

    return <button
        className="show-more-button"
        onClick={() => props.showMoreFunc()}
    >
        {getShowMoreIcon()}
    </button>
}
