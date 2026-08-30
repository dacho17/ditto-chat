import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { newAccountImage, setIsChatterImageBeingUploaded } from "../../store/AccountSlice";
import { setIsLoadingChatterOverview } from "../../store/AuthSlice";
import { newUploadFileIntent, uploadFileToS3Bucket } from "../../store/AwsSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import PageContent from "../../components/pageContent/PageContent";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import UploadImageButton from "../../components/uploadImageButton/UploadImageButton";
import SliceHelper from "../../helpers/SliceHelper";
import FileHelper from "../../helpers/FileHelper";
import Mapper from "../../helpers/Mapper";
import Validator, { VALID_ACCOUNT_IMAGE_FILE_TYPES } from "../../helpers/Validator";
import ChatterOverview from "../../classes/ChatterOverview";
import UploadFileIntent from "../../classes/UploadFileIntent";
import AccountImageForm from "../../classes/AccountImageForm";
import { FilePurpose } from "../../enums/FilePurpose";
import CONSTANTS from "../../../Constants";
import "./AccountPage.css";

const PAGE_NAME_TEXT = "Account";
const CHANGE_IMAGE_TEXT = "Change Image";

export default function AccountPage() {
    const { chatterOverview, isLoadingChatterOverview } = useAppSelector(state => state.authSlice);
    const { isChatterImageBeingUploaded } = useAppSelector(state => state.accountSlice);
    const dispatch = useAppDispatch();
    const [sendTryToUploadChatterImage, didUnhandledServerErrorOccur] = useTryToSendRequest<null>();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();

    async function tryToUploadChatterImage(fileName: string, inputFileType: string, fileSize: number, fileContentStream: ReadableStream): Promise<void> {
        if (Validator.validateUploadAccountImageFileType(inputFileType) === false) {
            toast.error(`${CONSTANTS.INVALID_FILE_TYPE_UPLOAD_ATTEMPT_CLIENT_MESSAGE}: ${VALID_ACCOUNT_IMAGE_FILE_TYPES}`);
            return;
        }

        if (Validator.validateSharedFileSize(fileSize) === false) {
            toast.error(CONSTANTS.INVALID_FILE_SIZE_UPLOAD_ATTEMPT_CLIENT_MESSAGE);
            return;
        }

        const fileMetadata = new UploadFileIntent(fileName, Mapper.inputFileTypeToSharedFileType(inputFileType), fileSize, FilePurpose.ACCOUNT_IMAGE);

        dispatch(setIsChatterImageBeingUploaded(true));
        await sendTryToUploadChatterImage(async () => {
            const imageBlob = await FileHelper.createBlobFromStream(fileContentStream);
            if (imageBlob === null) {
                // do nothing, loading spinner will indicate loading. The Image Upload is a separate activity which progresses irrespective of imageBlob being null
            } else {
                const imageUrl = URL.createObjectURL(imageBlob);
                (document.getElementById("account-details-image-id") as HTMLImageElement).src = imageUrl;
            }

            const s3UploadUrl = await dispatch(newUploadFileIntent({ uploadFileIntentForm: fileMetadata })).unwrap();
            const awsS3UploadFileResponse = await dispatch(uploadFileToS3Bucket(
                { s3PreSignedUploadUrl: s3UploadUrl, fileContentStream: fileContentStream }
            )).unwrap();

            const newAccountImageForm = new AccountImageForm(s3UploadUrl.getS3ObjectKey());
            await dispatch(newAccountImage({ newAccountImageForm: newAccountImageForm }));
            return null;
        }, () => dispatch(setIsChatterImageBeingUploaded(false)));
    }

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
        dispatch(setIsLoadingChatterOverview(false));
    }, []);

    function getAccountPageContent(): React.JSX.Element {
        return <>
            <div className="account-page-account-details-container">
                <AccountDetails
                    accountOverview={chatterOverview as ChatterOverview}
                    isDisplayedInPanel={false}
                />
            </div>
            <div className="account-page-edit-chatter-image-container">
                <UploadImageButton
                    buttonText={CHANGE_IMAGE_TEXT}
                    buttonIcon={null}
                    uploadFunction={tryToUploadChatterImage}
                    isCurrentlyUploading={isChatterImageBeingUploaded}
                />
            </div>
        </>
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
                        <PageContent
                            regularPageContent={getAccountPageContent()}
                            isLoadingPage={isLoadingChatterOverview}
                            didUnhandledServerErrorOccur={didUnhandledServerErrorOccur}
                            showResponseErrorCard={true}
                        />
                    </div>
                }
            />
        }
    />
}
