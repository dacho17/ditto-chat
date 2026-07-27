// NOTE: This component is a subset of ChatThreadButton Component!

import ChatterOverview from "../../classes/ChatterOverview";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./ChatterButton.css";

interface Props {
    chatterOverview: ChatterOverview,
    openChatFunction: Function
}

export default function ChatterButton(props: Props) {

    return <button
        className="chatter-button"
        onClick={() => props.openChatFunction()}
    >
        <div className="chatter-button-chatter-image-container">
            <ChatterIcon
                chatterFullName={props.chatterOverview.getChatterFullName()}
                chatterImageUrl={props.chatterOverview.getChatterImageUrl()}
                isOnline={props.chatterOverview.getIsChatterOnline()}
            />
        </div>
        <div className="chatter-button-summary">
            <div className="chatter-button-summary-row line-height-2">
                <span className="bold-text handle-overflow">{props.chatterOverview.getChatterFullName()}</span>
            </div>
            <div className="chatter-button-summary-row line-height-2">
                <span className="regular-faded-text">{props.chatterOverview.getChatterUsername()}</span>
            </div>
        </div>
    </button>
}
