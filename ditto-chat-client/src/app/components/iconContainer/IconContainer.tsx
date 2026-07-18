import "./IconContainer.css";

interface Props {
    icon: React.JSX.Element
}

export default function IconContainer(props: Props) {
    return <div className="icon-container">
        {props.icon}
    </div>
}
