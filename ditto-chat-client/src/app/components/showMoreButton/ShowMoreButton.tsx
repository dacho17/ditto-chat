import { IoArrowUpOutline, IoArrowDownOutline } from "react-icons/io5";
import "./ShowMoreButton.css";

const ICON_SIZE = 60;

interface Props {
    showMoreFunc: () => void,
    isDirectionUpwards: boolean
}

export default function ShowMoreButton(props: Props) {
    function getShowMoreIcon(): React.JSX.Element {
        return props.isDirectionUpwards === true ? <IoArrowUpOutline size={ICON_SIZE} /> : <IoArrowDownOutline size={ICON_SIZE} />
    }

    return <button className="show-more-button">
        {getShowMoreIcon()}
    </button>
}
