import ChatterOverview from "../../classes/ChatterOverview";
import "./AccountDetails.css";

interface Props {
    accountOverview: ChatterOverview;
    isDisplayedInPanel: boolean;
}

export default function AccountDetails(props: Props) {

    const displayedInPanelStyle = props.isDisplayedInPanel ? "displayed-in-panel" : "";
    return <div className={`account-details ${displayedInPanelStyle}`}>
        <div className="account-details-chatter-image-section">
            <div className="account-details-chatter-image-container">
                <img
                    id="account-details-image-id"
                    className="account-details-chatter-image"
                    src={props.accountOverview.getChatterImageUrl()}
                    alt={props.accountOverview.getChatterFullName()}
                />
            </div>
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
