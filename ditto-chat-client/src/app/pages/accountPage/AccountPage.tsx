import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import UploadImageButton from "../../components/uploadImageButton/UploadImageButton";
import ChatterOverview from "../../classes/ChatterOverview";
import CONSTANTS from "../../../Constants";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./AccountPage.css";

const PAGE_NAME_TEXT = "Account";
const CHANGE_IMAGE_TEXT = "Change Image";
const DUMMY_CHATTER_ACCOUNT = new ChatterOverview(
    "Name",
    "Surname",
    "name.surname",
    ChatterIconImage,
    true
);

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
                            <AccountDetails
                                accountOverview={DUMMY_CHATTER_ACCOUNT}
                                isDisplayedInPanel={true}
                            />
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
