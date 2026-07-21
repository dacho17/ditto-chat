import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import UploadImageButton from "../../components/uploadImageButton/UploadImageButton";
import CONSTANTS from "../../../Constants";
import "./AccountPage.css";

const PAGE_NAME_TEXT = "Account";
const CHANGE_IMAGE_TEXT = "Change Image";

export default function AccountPage() {
    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backTargetUrl={CONSTANTS.HOME_URL}
                backHeaderContent={
                    <div className="page-header-page-name">
                        {PAGE_NAME_TEXT}
                    </div>
                }
                mainPage={
                    <div className="account-page">
                        <div className="account-page-account-details-container">
                            <AccountDetails isDisplayedInPanel={true} />
                        </div>
                        <div className="account-page-edit-chatter-image-container">
                            <UploadImageButton 
                                buttonText={CHANGE_IMAGE_TEXT}
                                uploadFunction={() => console.log("TODO-implement file upload function")}
                            />
                        </div>
                    </div>
                }
            />
        }
    />
}
