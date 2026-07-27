import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearAccountState, requestAccountImageUploadUrl, setIsChatterImageBeingUploaded, uploadAccountImageToS3 } from "../../store/AccountSlice";
import { refreshChatterOverview, setIsLoadingChatterOverview } from "../../store/AuthSlice";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import UploadImageButton from "../../components/uploadImageButton/UploadImageButton";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import ChatterOverview from "../../classes/ChatterOverview";
import UploadFileIntent from "../../classes/UploadFileIntent";
import CONSTANTS from "../../../Constants";
import "./AccountPage.css";

const PAGE_NAME_TEXT = "Account";
const CHANGE_IMAGE_TEXT = "Change Image";

export default function AccountPage() {
    const { chatterOverview, isLoadingChatterOverview } = useAppSelector(state => state.authSlice);
    const { isChatterImageBeingUploaded } = useAppSelector(state => state.accountSlice);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setIsLoadingChatterOverview(true));
        dispatch(refreshChatterOverview());
        dispatch(setIsLoadingChatterOverview(false));
    }, []);

    // TODO: Implement Upload Image Function. I need to understand how to retrieve fileName and extension
    async function uploadChatterImage(arg): Promise<void> {
        dispatch(setIsChatterImageBeingUploaded(true));

        const newChatterImageUploadIntent = new UploadFileIntent(
            "TODO-fileName", ".jpeg"
        );

        try {
            const s3UploadUrlDto = await dispatch(requestAccountImageUploadUrl({ uploadFileIntent: newChatterImageUploadIntent })).unwrap();
            console.log(`Retrieved s3UploadUrlDto: ${s3UploadUrlDto}`);

            const res = await dispatch(uploadAccountImageToS3({ s3PreSignedUploadUrl: s3UploadUrlDto })).unwrap();

            // TODO: The new image URL needs to be set so that the Image is shown!
        } catch (err) {
        } finally {
            dispatch(setIsChatterImageBeingUploaded(false));
        }
    }

    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backOnClickFunction={() => {
                    dispatch(clearAccountState());
                    navigate(CONSTANTS.HOME_URL);       // TODO: user can arrive to this page from others as well. e.g. by entering url
                }}
                backHeaderContent={
                    <div className="page-header-page-name">
                        {PAGE_NAME_TEXT}
                    </div>
                }
                mainPage={
                    <div className="account-page">
                        { isLoadingChatterOverview === true
                            ? <LoadingSpinner />
                            : <>
                                <div className="account-page-account-details-container">
                                    <AccountDetails
                                        accountOverview={chatterOverview as ChatterOverview}
                                        isDisplayedInPanel={true}
                                    />
                                </div>
                                <div className="account-page-edit-chatter-image-container">
                                    <UploadImageButton 
                                        buttonText={CHANGE_IMAGE_TEXT}
                                        uploadFunction={() => uploadChatterImage("TODO")}
                                        isCurrentlyUploading={isChatterImageBeingUploaded}
                                    />
                                </div>
                            </>                        
                        }
                    </div>
                }
            />
        }
    />
}
