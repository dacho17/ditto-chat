import { IoAttachOutline, IoSendOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { appendChatThreadMessagesToList, requestChatThreadMessageAttachedFileUploadUrl, sendChatThreadMessage, setCurrentChatMessageInput, updateLastSeenChatThreadMessage, uploadChatThreadMessageAttachedFileToS3 } from "../../store/ChatSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import UploadImageButton from "../uploadImageButton/UploadImageButton";
import EmojiPopup from "../emojiPopup/EmojiPopup";
import Validator from "../../helpers/Validator";
import TimeHelper from "../../helpers/TimeHelper";
import CryptoHelper from "../../helpers/CryptoHelper";
import Mapper from "../../helpers/Mapper";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import UploadFileIntent from "../../classes/UploadFileIntent";
import SharedFile from "../../classes/SharedFile";
import CONSTANTS from "../../../Constants";
import DummyAttachedFile from '../../../assets/david-chat-image.jpg';
import "./ChatWindowMessageInput.css";

const INPUT_PLACEHOLDER_VALUE = "Message";

export default function ChatWindowMessageInput() {
    const { currentChatMessageInput, chatThread } = useAppSelector(state => state.chatSlice);
    const { chatterOverview } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();

    async function trySendChatThreadMessage(newChatThreadMessageForm: ChatThreadMessageForm): Promise<ChatThreadMessage> {
        try {
            const sentChatThreadMessage = await dispatch(sendChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageForm: newChatThreadMessageForm })).unwrap();
            return sentChatThreadMessage;
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        }
    }

    async function tryUpdateLastSeenChatThreadMessage(): Promise<void> {
        const currentLastUnseenMessage = chatThread.getMessages()
            .find(chatMessage => chatMessage.getIsMessageSeen() === false);
        if (currentLastUnseenMessage === undefined) {
            return; // there are no unseen messages currently
        }

        try {
            await dispatch(updateLastSeenChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageId: currentLastUnseenMessage.getId() })).unwrap();
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {}
    }

    async function trySendChatThreadMessageAttachedFile(fileName: string, inputFileType: string, fileSize: number, fileContentStream: ReadableStream): Promise<void> {
        if (Validator.validateUploadChatThreadMessageAttachedFileType(inputFileType) === false) {
            console.log("TODO-toasting: Notify user that they are attepmting to upload unsupported File Type. Tell them what passes");
            return;
        }

        if (Validator.validateSharedFileSize(fileSize) === false) {
            console.log("TODO-toasting: Notify user that they are attepmting to upload File of size over 2 MBs.");
            return;
        }

        const fileMetadata = new UploadFileIntent(fileName, Mapper.inputFileTypeToSharedFileType(inputFileType), fileSize);

        // Adding the chatThreadMessage early, to show indication of the File being uploaded!
        const chatThreadMessageWithAttachedFile = ChatThreadMessage.createNewChatThreadMessage(
            CryptoHelper.generateUuid(),
            chatterOverview.getId(), currentChatMessageInput, null, TimeHelper.getCurrentTimestamp(), true
        );
        dispatch(appendChatThreadMessagesToList([chatThreadMessageWithAttachedFile]));

        try {
            const s3UploadUrlDto = await dispatch(requestChatThreadMessageAttachedFileUploadUrl({ uploadFileIntent: fileMetadata })).unwrap();
            console.log(`Retrieved s3UploadUrlDto: ${s3UploadUrlDto}`);

            const res = await dispatch(uploadChatThreadMessageAttachedFileToS3(
                { s3PreSignedUploadUrl: s3UploadUrlDto, fileContentStream: fileContentStream }
            )).unwrap();

            // TODO-attachment: set correct URL instead of dummy
            const uploadedAttachedFile = new SharedFile(fileMetadata.getFileName(), fileMetadata.getFileType(), DummyAttachedFile, null, chatterOverview.getId());
            // recreating the Form, based on the early created chatThreadMessage. Setting uploadedAttachedFile so that the UploadedFile gets related to the ChatThreadMessage
            const chatThreadMessageWithAttachedFileForm = new ChatThreadMessageForm(
                chatThreadMessageWithAttachedFile.getMessageContent(), uploadedAttachedFile, chatThreadMessageWithAttachedFile.getClientRef(), false
            );

            const sentChatThreadMessage = await trySendChatThreadMessage(chatThreadMessageWithAttachedFileForm);
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        }
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
            onFocus={() => tryUpdateLastSeenChatThreadMessage()}
        />
        <div className="chat-window-message-input-additions">
            <UploadImageButton
                buttonIcon={<IoAttachOutline size={CONSTANTS.ICON_SIZE} />}
                buttonText={null}
                uploadFunction={trySendChatThreadMessageAttachedFile}
                isCurrentlyUploading={false}
            />
            <div>
                <EmojiPopup />
            </div>
        </div>
        <div className="chat-window-message-input-send-button-container">
            <button className="chat-window-message-input-send-button"
                onClick={() => {
                    const newChatThreadMessage = new ChatThreadMessageForm(currentChatMessageInput, null, CryptoHelper.generateUuid(), false);
                    trySendChatThreadMessage(newChatThreadMessage);
                }}
                disabled={currentChatMessageInput.trim() === ""}
            >
                <IoSendOutline size={CONSTANTS.ICON_SIZE} />
            </button>
        </div>
    </div>
}
