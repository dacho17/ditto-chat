import { IoAttachOutline, IoSendOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { appendChatThreadMessagesToList, requestChatThreadMessageAttachedFileUploadUrl, sendChatThreadMessage, setCurrentChatMessageInput, updateLastSeenChatThreadMessage, uploadChatThreadMessageAttachedFileToS3 } from "../../store/ChatSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import UploadImageButton from "../uploadImageButton/UploadImageButton";
import EmojiPopup from "../emojiPopup/EmojiPopup";
import Validator, { VALID_ATTACHED_FILE_TYPES } from "../../helpers/Validator";
import TimeHelper from "../../helpers/TimeHelper";
import CryptoHelper from "../../helpers/CryptoHelper";
import Mapper from "../../helpers/Mapper";
import ChatThread from "../../classes/ChatThread";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import UploadFileIntent from "../../classes/UploadFileIntent";
import SharedFile from "../../classes/SharedFile";
import CONSTANTS from "../../../Constants";
import DummyAttachedFile from '../../../assets/david-chat-image.jpg';
import "./ChatWindowMessageInput.css";

const INPUT_PLACEHOLDER_VALUE = "Message";

interface Props {
    activeChatThread: ChatThread
}

export default function ChatWindowMessageInput(props: Props) {
    const { currentChatMessageInput } = useAppSelector(state => state.chatSlice);
    const { chatterOverview } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const [sendTryToSendChatThreadMessage, _] = useTryToSendRequest<ChatThreadMessage>();
    const [sendTryToUpdateLastSeenChatThreadMessage, __] = useTryToSendRequest<null>();

    async function tryToSendChatThreadMessageWithoutAttachment(): Promise<ChatThreadMessage> {
        if (Validator.validateChatThreadMessageContent(currentChatMessageInput) === false) {
            toast.error(CONSTANTS.CHAT_THREAD_MESSAGE_MINIMUM_LENGTH_CLIENT_MESSAGE);
            return;
        }

        const newChatThreadMessageForm = new ChatThreadMessageForm(currentChatMessageInput, null, CryptoHelper.generateUuid(), false);
        return await sendTryToSendChatThreadMessage(async () => {
            return await dispatch(sendChatThreadMessage(
                { chatThreadId: props.activeChatThread.getOverview().getId(), chatThreadMessageForm: newChatThreadMessageForm })).unwrap();
        }, () => {});
    }

    async function tryToSendChatThreadMessageAttachedFile(fileName: string, inputFileType: string, fileSize: number, fileContentStream: ReadableStream): Promise<void> {
        if (Validator.validateUploadChatThreadMessageAttachedFileType(inputFileType) === false) {
            toast.error(`${CONSTANTS.CHAT_THREAD_MESSAGE_INVALID_ATTACHED_FILE_TYPE_CLIENT_MESSAGE} ${VALID_ATTACHED_FILE_TYPES}`);
            return;
        }

        if (Validator.validateSharedFileSize(fileSize) === false) {
            toast.error(CONSTANTS.CHAT_THREAD_MESSAGE_INVALID_ATTACHED_FILE_SIZE_CLIENT_MESSAGE);
            return;
        }

        // Adding the chatThreadMessage early, to show indication of the File being uploaded!
        const chatThreadMessageWithAttachedFile = ChatThreadMessage.createNewChatThreadMessage(
            CryptoHelper.generateUuid(),
            chatterOverview.getId(), currentChatMessageInput, null, TimeHelper.getCurrentTimestamp(), true
        );
        dispatch(appendChatThreadMessagesToList([chatThreadMessageWithAttachedFile]));

        await sendTryToSendChatThreadMessage(async () => {
            const fileMetadata = new UploadFileIntent(fileName, Mapper.inputFileTypeToSharedFileType(inputFileType), fileSize);
            const s3UploadUrlDto = await dispatch(requestChatThreadMessageAttachedFileUploadUrl({ uploadFileIntent: fileMetadata })).unwrap();

            const s3UploadFileResponseDto = await dispatch(uploadChatThreadMessageAttachedFileToS3(
                { s3PreSignedUploadUrl: s3UploadUrlDto, fileContentStream: fileContentStream }
            )).unwrap();

            // TODO-attachment: set correct URL instead of dummy
            const uploadedAttachedFile = new SharedFile(fileMetadata.getFileName(), fileMetadata.getFileType(), DummyAttachedFile, null, chatterOverview.getId());
            // creating the Form, based on the early created chatThreadMessage. Setting uploadedAttachedFile so that the UploadedFile gets related to the ChatThreadMessage
            const chatThreadMessageWithAttachedFileForm = new ChatThreadMessageForm(
                chatThreadMessageWithAttachedFile.getMessageContent(), uploadedAttachedFile, chatThreadMessageWithAttachedFile.getClientRef(), false
            );

            return await dispatch(sendChatThreadMessage(
                { chatThreadId: props.activeChatThread.getOverview().getId(), chatThreadMessageForm: chatThreadMessageWithAttachedFileForm })).unwrap();
        }, () => {});
    }

    async function tryToUpdateLastSeenChatThreadMessage(): Promise<void> {
        const currentLastUnseenMessage = props.activeChatThread.getMessages()
            .find(chatMessage => chatMessage.getIsMessageSeen() === false);
        if (currentLastUnseenMessage === undefined) {
            return; // there are no unseen messages currently
        }

        await sendTryToUpdateLastSeenChatThreadMessage(async () => {
            await dispatch(updateLastSeenChatThreadMessage(
                { chatThreadId: props.activeChatThread.getOverview().getId(), chatThreadMessageId: currentLastUnseenMessage.getId() })).unwrap();
            return null;
        }, () => {});
    }

    return <div className="chat-window-message-input">
        <input
            className="chat-window-message-input-field"
            disabled={false}
            type="text"
            name="new-chat-message"
            placeholder={INPUT_PLACEHOLDER_VALUE}
            value={currentChatMessageInput}
            onChange={(event) => {
                dispatch(setCurrentChatMessageInput(event.target.value));
            }}
            onFocus={tryToUpdateLastSeenChatThreadMessage}
        />
        <div className="chat-window-message-input-additions">
            <UploadImageButton
                buttonIcon={<IoAttachOutline size={CONSTANTS.ICON_SIZE} />}
                buttonText={null}
                uploadFunction={tryToSendChatThreadMessageAttachedFile}
                isCurrentlyUploading={false}
            />
            <div>
                <EmojiPopup />
            </div>
        </div>
        <div className="chat-window-message-input-send-button-container">
            <button className="chat-window-message-input-send-button"
                onClick={tryToSendChatThreadMessageWithoutAttachment}
                disabled={currentChatMessageInput.trim() === ""}
            >
                <IoSendOutline size={CONSTANTS.ICON_SIZE} />
            </button>
        </div>
    </div>
}
