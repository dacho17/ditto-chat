import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { getChatThreadMessages, sendChatThreadMessage, setCurrentChatThreadMessagesListPage, setIsLoadingOlderMessages } from "../../store/ChatSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import ChatMessageRow from "../chatMessageRow/ChatMessageRow";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import ChatThread from "../../classes/ChatThread";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import { ChatThreadMessageStatus } from "../../enums/ChatThreadMessageStatus";
import CONSTANTS from "../../../Constants";
import "./ChatWindowMessagesList.css";

const START_THE_CHAT_INDICATOR_TEXT = "No message history. Be the first one to message the chatter";
const CHAT_STARTED_INDICATOR_TEXT = "Conversation started";

interface Props {
    activeChatThread: ChatThread
}

export default function ChatWindowMessagesList(props: Props) {
    const { isLastChatMessagesListPage, currentChatMessagesListPage, isLoadingOlderMessages } = useAppSelector(state => state.chatSlice);
    const { chatterOverview } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const [sendTryToGetOlderChatMessages, _] = useTryToSendRequest<null>();
    const [sendTryToResendChatMessage, __] = useTryToSendRequest<null>();

    async function tryToGetOlderChatMessages(): Promise<void> {
        await sendTryToGetOlderChatMessages(async () => {
            dispatch(setIsLoadingOlderMessages(true));
            dispatch(setCurrentChatThreadMessagesListPage(currentChatMessagesListPage + 1));

            await dispatch(getChatThreadMessages({ chatThreadId: props.activeChatThread.getOverview().getId() })).unwrap();
            return null;
        }, () => {
            dispatch(setIsLoadingOlderMessages(false));
        });
    }

    async function tryToResendChatMessage(chatMessageClientRef: string): Promise<void> {
        const failedChatMessage = props.activeChatThread.getMessages()
            .find(chatThreadMessage => chatThreadMessage.getClientRef() === chatMessageClientRef
                && chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND);
        if (failedChatMessage !== undefined) {
            const failedToSendChatThreadMessage = new ChatThreadMessageForm(
                failedChatMessage.getMessageContent(), failedChatMessage.getTemporaryS3ObjectKey(), failedChatMessage.getClientRef(), true
            );

            await sendTryToResendChatMessage(async () => {
                await dispatch(sendChatThreadMessage(
                    { chatThreadId: props.activeChatThread.getOverview().getId(), chatThreadMessageForm: failedToSendChatThreadMessage })).unwrap();
                return null;
            }, () => {});
        } else {
            toast.error(CONSTANTS.CHAT_THREAD_MESSAGE_NOT_RESENDABLE_CLIENT_MESSAGE);
        }
    }

    function getFirstChatMessagerRow(chatThreadMessages: ChatThreadMessage[]): React.JSX.Element {
        if (chatThreadMessages.length === 0) {
            return <div className="chat-window-messages-list-indicator-row margin-bottom-10">
                <span>{START_THE_CHAT_INDICATOR_TEXT}</span>
            </div>
        } else if (isLastChatMessagesListPage === true) {
            return <div className='chat-window-messages-list-indicator-row margin-top-3 margin-bottom-2'>
                <span>{CHAT_STARTED_INDICATOR_TEXT}</span>
            </div>
        } else {
            if (isLoadingOlderMessages === true) {
                return <div className='chat-window-messages-list-indicator-row'>
                    <LoadingSpinner />
                </div>
            } else {
                return <div className='chat-window-messages-list-indicator-row margin-bottom-1'>
                    <ShowMoreButton
                        showMoreFunc={tryToGetOlderChatMessages}
                        isDirectionUpwards={true}
                    />
                </div>
            }
        }
    }

    const displayedChatThreadMessages = props.activeChatThread.getMessages();
    return <div className="chat-window-messages-list">
        <div className="margin-bottom-2" />
            {displayedChatThreadMessages.map(chatMessage => {
                return <ChatMessageRow
                    key={chatMessage.getId()}
                    chatThreadMessage={chatMessage}
                    loggedInChatterId={chatterOverview.getId()}
                    resendFunction={(chatMessageClientRef: string) => tryToResendChatMessage(chatMessageClientRef)}
                />
            })}
            {getFirstChatMessagerRow(displayedChatThreadMessages)}
    </div>
}
