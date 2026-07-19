import IconContainer from "../iconContainer/IconContainer";
import "./IconButton.css";

interface Props {
    icon: React.JSX.Element,
    onClick: Function
}

export default function IconButton(props: Props) {

    return <button
        className="icon-button"
        onClick={() => props.onClick()}
    >
        <IconContainer icon={props.icon} />
    </button>
}
