import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { getChatThreadMessages, sendChatThreadMessage, setCurrentChatThreadMessagesListPage, setIsLoadingOlderMessages } from "../../store/ChatSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import ChatMessageRow from "../chatMessageRow/ChatMessageRow";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import ChatThreadMessage from "../../classes/ChatThreadMessage";
import ChatThreadMessageForm from "../../classes/ChatThreadMessageForm";
import { ChatThreadMessageStatus } from "../../enums/ChatThreadMessageStatus";
import "./ChatWindowMessagesList.css";

const START_THE_CHAT_INDICATOR_TEXT = "No message history. Be the first one to message the tenant";
const CHAT_STARTED_INDICATOR_TEXT = "Conversation started";

export default function ChatWindowMessagesList() {
    const { chatThread, isLastChatMessagesListPage, currentChatMessagesListPage, isLoadingOlderMessages } = useAppSelector(state => state.chatSlice);
    const { chatterOverview } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();

    async function tryGetOlderChatMessages(): Promise<void> {
        dispatch(setIsLoadingOlderMessages(true));
        dispatch(setCurrentChatThreadMessagesListPage(currentChatMessagesListPage + 1));

        // TODO: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

        try {
            await dispatch(getChatThreadMessages({ chatThreadId: chatThreadId })).unwrap();

            // TODO: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            return;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsLoadingOlderMessages(false));
        }
    }

    async function tryResendChatMessage(chatMessageClientRef: string): Promise<void> {
        const failedChatMessage = chatThread.getMessages()
            .find(chatThreadMessage => chatThreadMessage.getClientRef() === chatMessageClientRef
                && chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND);
        if (failedChatMessage !== undefined) {
            const failedToSendChatThreadMessage = new ChatThreadMessageForm(failedChatMessage.getMessageContent(), failedChatMessage.getClientRef(), true);

            try {
                await dispatch(sendChatThreadMessage({ chatThreadId: chatThreadId, chatThreadMessageForm: failedToSendChatThreadMessage })).unwrap();
            } catch (err) {
                console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
            }
        } else {
            console.log("ERROR: Referenced messsage does not exist!");
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
                return  <LoadingSpinner />
            } else {
                return <div className='chat-window-messages-list-indicator-row margin-bottom-1'>
                    <ShowMoreButton
                        showMoreFunc={tryGetOlderChatMessages}
                        isDirectionUpwards={true}
                    />
                </div>
            }
        }
    }

    const displayedChatThreadMessages = chatThread.getMessages();
    return <div className="chat-window-messages-list">
        <div className="margin-bottom-2" />
            {displayedChatThreadMessages.map(chatMessage => {
                return <ChatMessageRow
                    key={chatMessage.getId()}
                    chatThreadMessage={chatMessage}
                    loggedInChatterId={chatterOverview.getId()}
                    resendFunction={(chatMessageClientRef: string) => tryResendChatMessage(chatMessageClientRef)}
                />
            })}
            {getFirstChatMessagerRow(displayedChatThreadMessages)}
    </div>
}
