import ChatterOverview from "../../classes/ChatterOverview";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import "./AccountDetails.css";

interface Props {
    accountOverview: ChatterOverview;
    isDisplayedInPanel: boolean;
}

export default function AccountDetails(props: Props) {

    const displayedInPanelStyle = props.isDisplayedInPanel ? "displayed-in-panel" : "";
    return <div className={`account-details ${displayedInPanelStyle}`}>
        <div className="account-details-chatter-image-section">
            <ChatterIcon
                chatterFullName={props.accountOverview.getChatterFullName()}
                chatterImageUrl={props.accountOverview.getChatterImageUrl()}
                isOnline={props.accountOverview.getIsChatterOnline()}
                isShownAsAccountImage={true}
            />
        </div>
        <div className="account-details-chatter-name-section">
            <div className="account-details-chatter-name margin-bottom-1">
                {props.accountOverview.getChatterFullName()}
            </div>
            <div className="account-details-chatter-username">
                {props.accountOverview.getChatterUsername()}
            </div>
        </div>
    </div>
}
