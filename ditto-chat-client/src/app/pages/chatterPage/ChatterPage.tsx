import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import ChatterOverview from "../../classes/ChatterOverview";
import CONSTANTS from "../../../Constants";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./ChatterPage.css";

const CHATTER_PAGE_TEXT = "Chatter";
const DUMMY_CHATTER_ACCOUNT = new ChatterOverview(
    "Name",
    "Surname",
    "name.surname",
    ChatterIconImage,
    true
);

export default function ChatterPage() {
    // TODO: redirect if 1024+ !
    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backTargetUrl={`${CONSTANTS.CHAT_URL}`}     // TODO: chatId is needed
                backHeaderContent={
                    <div className="page-header-page-name">
                        {CHATTER_PAGE_TEXT}
                    </div>
                }
                mainPage={
                    <div className="chatter-page">
                        <div className="chatter-page-account-details-container">
                            <AccountDetails
                                accountOverview={DUMMY_CHATTER_ACCOUNT}
                                isDisplayedInPanel={true}
                            />
                        </div>
                        <div className="chatter-page-shared-files-list-container">
                            <SharedFilesList />
                        </div>
                    </div>
                }
        />}
    />
}
