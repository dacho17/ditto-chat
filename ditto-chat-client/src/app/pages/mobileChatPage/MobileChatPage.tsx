import { useNavigate } from "react-router-dom";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import ChatterOverviewInfo from "../../components/chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../../components/chatFeatureList/ChatFeatureList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./MobileChatPage.css";

export default function MobileChatPage() {
    const navigate = useNavigate();
    
    if (false) {    // TODO: if screen size is not mobile screen size. Redirect to Home, where chat is!
        navigate(CONSTANTS.HOME_URL);
    }

    return <PageWithBackHeader
        backTargetUrl={CONSTANTS.HOME_URL}
        backHeaderContent={
            <div className="chat-page-header-content">
                <div className="chat-page-header-content-chatter-overview-info-container">
                    <ChatterOverviewInfo />
                </div>
                <div className="chat-page-header-content-feature-list-container">
                    <ChatFeatureList listType={ListType.ROW} />
                </div>
            </div>
        }
        mainPage={
            <ChatWindow />
        }
    />
}
