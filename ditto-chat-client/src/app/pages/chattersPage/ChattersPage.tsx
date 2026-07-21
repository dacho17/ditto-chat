import { useNavigate } from "react-router-dom";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import ChatThreadButton from "../../components/chatThreadButton/ChatThreadButton";
import SearchBar from "../../components/searchBar/SearchBar";
import ChatThreadOverview from "../../classes/ChatThreadOverview";
import ChatterOverview from "../../classes/ChatterOverview";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import CONSTANTS from "../../../Constants";
import "./ChattersPage.css";

const SEARCH_INPUT_PLACEHOLDER_VALUE = "Search Chatters";
const DUMMY_CHATTERS: ChatThreadOverview[] = [
    new ChatThreadOverview(
        "id-1", new ChatterOverview(
            "Contacted", "Chatter", "contacted.chatter", DittoConsultingLogo, true
        ),
        0, "21/12/2112", "I contacted you"
    ),
    new ChatThreadOverview(
        "id-2", new ChatterOverview(
            "Not", "Contacted Chatter", "not.contacted.chatter", ChatterIconImage, false
        ),
        0, null, null
    )
];


export default function ChattersPage() {
    const navigate = useNavigate();

    /*
    TODO:
        - as input changes, results change (are retrieved from server)
            - logic for this already exists in Client!
    */

    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backTargetUrl={`${CONSTANTS.HOME_URL}`}
                backHeaderContent={
                    <div className="chatters-page-header-search-bar-container">
                        <SearchBar
                            inputPlaceholder={SEARCH_INPUT_PLACEHOLDER_VALUE}
                        />
                    </div>
                }
                mainPage={
                    <div className="chatters-page">
                        <div className="chatters-page-chatters-list-container">
                            {DUMMY_CHATTERS.map(chatter => {
                                return <ChatThreadButton
                                    chatThreadOverview={chatter}
                                    openChatFunction={() => navigate(`${CONSTANTS.CHAT_URL}`)}
                                //  onClick, leads to /chat, either: a) new, if does not exist, or b) existing, if exists
                                />
                            })}
                        </div>
                    </div>
                }
        />}
    />
}
