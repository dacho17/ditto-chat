import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import CONSTANTS from "../../../Constants";
import "./ChatterPage.css";

const CHATTER_NAME_TEXT = "Chatter";

export default function ChatterPage() {
    // TODO: redirect if 1024+ !
    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backTargetUrl={`${CONSTANTS.CHAT_URL}`}     // TODO: chatId is needed
                backHeaderContent={
                    <div className="page-header-page-name">
                        {CHATTER_NAME_TEXT}
                    </div>
                }
                mainPage={
                    <div className="chatter-page">
                        <div className="chatter-page-account-details-container">
                            <AccountDetails isDisplayedInPanel={true} />
                        </div>
                        <div className="chatter-page-shared-files-list-container">
                            <SharedFilesList />
                        </div>
                    </div>
                }
        />}
    />
}
