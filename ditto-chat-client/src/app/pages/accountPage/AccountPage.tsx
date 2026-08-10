import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { requestAccountImageUploadUrl, setIsChatterImageBeingUploaded, uploadAccountImageToS3 } from "../../store/AccountSlice";
import { setIsLoadingChatterOverview } from "../../store/AuthSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import UploadImageButton from "../../components/uploadImageButton/UploadImageButton";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import FileHelper from "../../helpers/FileHelper";
import Validator from "../../helpers/Validator";
import ChatterOverview from "../../classes/ChatterOverview";
import UploadFileIntent from "../../classes/UploadFileIntent";
import "./AccountPage.css";

const PAGE_NAME_TEXT = "Account";
const CHANGE_IMAGE_TEXT = "Change Image";

export default function AccountPage() {
    const { chatterOverview, isLoadingChatterOverview } = useAppSelector(state => state.authSlice);
    const { isChatterImageBeingUploaded } = useAppSelector(state => state.accountSlice);
    const dispatch = useAppDispatch();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
        dispatch(setIsLoadingChatterOverview(false));
    }, []);

    async function uploadChatterImage(fileMetadata: UploadFileIntent, fileContentStream: ReadableStream): Promise<void> {
        if (Validator.validateUploadChatterImage(fileMetadata) === false) {
            return;
        }

        dispatch(setIsChatterImageBeingUploaded(true));

        try {
            const imageBlob = await FileHelper.createBlobFromStream(fileContentStream);
            if (imageBlob === null) {
                console.log("Exception occured during Reading. TODO-toasting: handle the case!");
            }
            const imageUrl = URL.createObjectURL(imageBlob);
            (document.getElementById("account-details-image-id") as HTMLImageElement).src = imageUrl;

            const s3UploadUrlDto = await dispatch(requestAccountImageUploadUrl({ uploadFileIntent: fileMetadata })).unwrap();
            console.log(`Retrieved s3UploadUrlDto: ${s3UploadUrlDto}`);

            const res = await dispatch(uploadAccountImageToS3(
                { s3PreSignedUploadUrl: s3UploadUrlDto, fileContentStream: fileContentStream }
            )).unwrap();
            
            // TODO-image-upload: set AuthSlice.chatterOverview.chatterImageUrl to the received URL (both in AuthSlice State and Browser Local Storage)
        } catch (err) {
        } finally {
            dispatch(setIsChatterImageBeingUploaded(false));
        }
    }

    return <PageWithSideMenu
        mainPage={
            <PageWithBackHeader
                backOnClickFunction={() => {
                    navigateBack();
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
                                        buttonIcon={null}
                                        uploadFunction={(fileMetadata: UploadFileIntent, fileContentStream: ReadableStream) =>
                                            uploadChatterImage(fileMetadata, fileContentStream)
                                        }
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
