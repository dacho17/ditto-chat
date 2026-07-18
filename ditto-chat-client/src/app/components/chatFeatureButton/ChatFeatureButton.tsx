import IconContainer from "../iconContainer/IconContainer";
import { ListType } from "../../enums/ListType";
import "./ChatFeatureButton.css";

interface Props {
	parentListType: ListType,
    chatFeatureName: string,
    chatFeatureIcon: React.JSX.Element,
}

export default function ChatFeatureButton(props: Props) {
    function getButtonStyleClassName(): string {
        return props.parentListType === ListType.ROW ? "button-as-column" : "button-as-row";
    }

    function getFeatureText(): React.JSX.Element {
        return props.parentListType === ListType.COLUMN
            ? <>
                <div className="margin-right-1" />
                <div className="bold-text">
                    {props.chatFeatureName}
                </div>
            </>
            : <>
                <div className="margin-bottom-1" />
                <div className="regular-faded-text">
                    {props.chatFeatureName}
                </div>
            </>;
    }

    const buttonStyleClassName = getButtonStyleClassName();
    return <button className={`chat-feature-button ${buttonStyleClassName}`}>
        <IconContainer icon={props.chatFeatureIcon} />
        {getFeatureText()}
    </button>
}
