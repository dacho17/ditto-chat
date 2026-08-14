// NOTE: in every Reducer, consider that Client may know better than the Server!
    // 1. Server did not yet log action by Client
    // 2. Server returned "stale" data before it logged Client action

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType, RootState } from "./ReduxStore";
import { updateChatThreadOverviewFromList } from "./HomeSlice";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import AwsClient from "../clients/AwsClient";
import SliceHelper from "../helpers/SliceHelper";
import TimeHelper from "../helpers/TimeHelper";
import Mapper from "../helpers/Mapper";
import ChatThread from "../classes/ChatThread";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatThreadMessage from "../classes/ChatThreadMessage";
import UploadFileIntent from "../classes/UploadFileIntent";
import SharedFile from "../classes/SharedFile";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import { ChatThreadMessageStatus } from "../enums/ChatThreadMessageStatus";
import CONSTANTS from "../../Constants";


interface ChatState {
    chatThread: ChatThread | null;
    isLoadingChatThread: boolean;
    currentChatMessagesListPage: number;
    isLastChatMessagesListPage: boolean;
    isLoadingOlderMessages: boolean;
    currentChatMessageInput: string;

    chatSharedFileInOverlay: SharedFile | null;
}

const initialState: ChatState = {
    chatThread: null,
    isLoadingChatThread: true,
    currentChatMessagesListPage: 0,
    isLastChatMessagesListPage: false,
    isLoadingOlderMessages: false,
    currentChatMessageInput: "",

    chatSharedFileInOverlay: null
};

function sortChatThreadMessages(chatThreadMessages: ChatThreadMessage[]): ChatThreadMessage[] {
    return chatThreadMessages.toSorted((first, second) => {
        return second.getMessageTimestamp() - first.getMessageTimestamp();
    });
}

function mergeChatThreadMessages(chatThreadMessages: ChatThreadMessage[], chatThreadMessagePage: ChatThreadMessage[]): ChatThreadMessage[] {
    const mergedList = [...chatThreadMessages];

    for (let i = 0; i < chatThreadMessagePage.length; i++) {
        const isAlreadyInList =
            mergedList.find(chatThreadMessage =>
                (chatThreadMessage.getId() !== null
                    && chatThreadMessagePage[i].getId() !== null
                    && chatThreadMessage.getId() === chatThreadMessagePage[i].getId()
                ) ||
                (chatThreadMessage.getClientRef() !== null 
                    && chatThreadMessagePage[i].getClientRef() !== null
                    && chatThreadMessage.getClientRef() === chatThreadMessagePage[i].getClientRef()
                )
            ) !== undefined
        if (isAlreadyInList === false) {
            mergedList.push(chatThreadMessagePage[i]);
        }
    }

    return mergedList;
}

function getCommonLastSeenMessageId(
    chatThreadMessages: ChatThreadMessage[], clientLastSeenMessageId: string | null, serverLastSeenMessageId: string | null): string | null {
    if (clientLastSeenMessageId === null) return serverLastSeenMessageId;
    if (serverLastSeenMessageId === null) return clientLastSeenMessageId;

    const sortedChatThreadMessages = sortChatThreadMessages(chatThreadMessages);
    const clientLastSeenMessageIndex =
        sortedChatThreadMessages.findIndex(chatThreadMessage => chatThreadMessage.getId() === clientLastSeenMessageId);
    const serverLastSeenMessageIndex =
        sortedChatThreadMessages.findIndex(chatThreadMessage => chatThreadMessage.getId() === serverLastSeenMessageId);
    
    // cases where at least one chatThreadMessage is not found among the chatThreadMessages
    if (clientLastSeenMessageIndex === -1 && serverLastSeenMessageIndex === -1) {
        return null;
    } else if (clientLastSeenMessageIndex === -1) {
        return sortedChatThreadMessages[serverLastSeenMessageIndex].getId();
    } else if (serverLastSeenMessageIndex === -1) {
        return sortedChatThreadMessages[clientLastSeenMessageIndex].getId();
    }

    return clientLastSeenMessageIndex < serverLastSeenMessageIndex
        ? sortedChatThreadMessages[clientLastSeenMessageIndex].getId()
        : sortedChatThreadMessages[serverLastSeenMessageIndex].getId()
    ;
}

function getLastRegisteredChatThreadMessage(chatThreadMessages: ChatThreadMessage[]): ChatThreadMessage | null {
    const sortedChatThreadMessages = sortChatThreadMessages(chatThreadMessages);
    
    if (sortedChatThreadMessages.length === 0) {
        return null;
    }

    const lastRegisteredChatThreadMessage =
        sortedChatThreadMessages.find(chatThreadMessage => chatThreadMessage.getStatus() === ChatThreadMessageStatus.CONFIRMED);
    return lastRegisteredChatThreadMessage !== undefined
        ? lastRegisteredChatThreadMessage
        : null
    ;
}

function setIsSeenValueOnChatThreadMessageList(chatThreadMessages: ChatThreadMessage[], lastSeenByChatterMessageId: string | null): {
    updatedIsSeenChatThreadMessageList: ChatThreadMessage[], numberOfUnseenMessages: number} {
    const sortedChatThreadMessages = sortChatThreadMessages(chatThreadMessages);
    
    let isChatThreadMessageNewerThanLastSeen = true;
    const resultChatThreadMessageList = sortedChatThreadMessages.map(chatThreadMessage => {
        if (chatThreadMessage.getIsMessageReceived() === false) {   // this case prevents SENDING and FAILED messages from being considered
            chatThreadMessage.setIsMessageSeen(true);
            return chatThreadMessage;
        }

        if (isChatThreadMessageNewerThanLastSeen === false) {
            chatThreadMessage.setIsMessageSeen(true);
            return chatThreadMessage;
        }

        if (chatThreadMessage.getId() === lastSeenByChatterMessageId) {
            isChatThreadMessageNewerThanLastSeen = false;
            chatThreadMessage.setIsMessageSeen(true);
            return chatThreadMessage;
        }

        // chatThreadMessage is Received and is after the Last Seen (message is unseen)
        chatThreadMessage.setIsMessageSeen(false || chatThreadMessage.getIsMessageSeen());
        return chatThreadMessage;
    });

    return {
        updatedIsSeenChatThreadMessageList: resultChatThreadMessageList,
        numberOfUnseenMessages: resultChatThreadMessageList.filter(chatThreadMessage => chatThreadMessage.getIsMessageSeen() === false).length
    };
}

export const pollActiveChatThread = createAsyncThunk<ChatThread, { chatThreadId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/pollActiveChatThread",
    async ({ chatThreadId }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        try {
            const responseBody = await ChatClient.getChatClient().getChatThread(chatThreadId);
            const chatThread = Mapper.chatThreadFromDto(responseBody.data, chatterOverview.getId());

            thunkAPI.dispatch(registerPolledActiveChatThread(chatThread));

            return thunkAPI.fulfillWithValue(chatThread);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const postChatThread = createAsyncThunk<ChatThread, { chatterId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/postChatThread",
    async ({ chatterId }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        try {
            const res = await ChatClient.getChatClient().postChatThread(chatterId);
            const createdChatThread = Mapper.chatThreadFromDto(res.data, chatterOverview.getId());

            return thunkAPI.fulfillWithValue(createdChatThread);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getChatThread = createAsyncThunk<ChatThread, { chatThreadId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/getChatThread",
    async ({ chatThreadId }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        try {
            const res = await ChatClient.getChatClient().getChatThread(chatThreadId);
            const chatThread = Mapper.chatThreadFromDto(res.data, chatterOverview.getId());

            thunkAPI.dispatch(setChatThread(chatThread));
            if (chatThread.getMessages().length < CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE) {
                thunkAPI.dispatch(setIsLastChatMessagesListPage(true));
            }

            return thunkAPI.fulfillWithValue(chatThread);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getChatThreadMessages = createAsyncThunk<ChatThreadMessage[], { chatThreadId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/getChatThreadMessages",
    async ({ chatThreadId }, thunkAPI) => {
        try {
            const { currentChatMessagesListPage } = (thunkAPI.getState() as RootState).chatSlice;
            const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentChatMessagesListPage.toString());
            
            const res = await ChatClient.getChatClient().getChatThreadMessages(chatThreadId, queryParams);
            const { pagedList, isLastPage } = res.data;
            const pagedChatThreadMessages = pagedList.map(chatThreadMessageDto => Mapper.chatThreadMessageFromDto(chatThreadMessageDto, chatterOverview.getId()));

            thunkAPI.dispatch(appendChatThreadMessagesToList(pagedChatThreadMessages));
            thunkAPI.dispatch(setIsLastChatMessagesListPage(isLastPage));

            return thunkAPI.fulfillWithValue(pagedChatThreadMessages);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const updateLastSeenChatThreadMessage = createAsyncThunk<void, { chatThreadId: string, chatThreadMessageId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/updateLastSeenChatThreadMessage",
    async ({ chatThreadId, chatThreadMessageId }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        try {
            const res = await ChatClient.getChatClient().updateLastSeenChatThreadMessage(chatThreadId, chatThreadMessageId);
            const newLastSeenChatThreadMessageDto = res.data;
            const newLastSeenChatThreadMessage = Mapper.chatThreadMessageFromDto(newLastSeenChatThreadMessageDto, chatterOverview.getId());

            thunkAPI.dispatch(updateSeenChatThreadMessages(newLastSeenChatThreadMessage));
            const { chatThread } = (thunkAPI.getState() as RootState).chatSlice;    // I expect this assignment to contain chatThread updated by updateSeenChatThreadMessages Call!
            thunkAPI.dispatch(updateChatThreadOverviewFromList(chatThread.getOverview()));

            return thunkAPI.fulfillWithValue(null);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const sendChatThreadMessage = createAsyncThunk<ChatThreadMessage, { chatThreadId: string, chatThreadMessageForm: ChatThreadMessageForm }, { rejectValue: AsyncThunkRejectType }>(
    "chat/sendChatThreadMessage",
    async ({ chatThreadId, chatThreadMessageForm }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        if (chatThreadMessageForm.getIsMessageResent() === true) {
            thunkAPI.dispatch(setChatThreadMessageStatus({
                chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                newChatThreadMessageStatus: ChatThreadMessageStatus.SENDING
            }));
        } else {
            const isMessageWithAttachedFile = chatThreadMessageForm.getAttachedFile() !== null;
            if (isMessageWithAttachedFile === false) {
                const newChatThreadMessage = ChatThreadMessage.createNewChatThreadMessage(
                    chatThreadMessageForm.getChatMessageClientRef(),
                    chatterOverview.getId(), chatThreadMessageForm.getMessage(), null, TimeHelper.getCurrentTimestamp(), false
                );
                
                thunkAPI.dispatch(appendChatThreadMessagesToList([newChatThreadMessage]));
            } else {    // message carries an attachedFile and is already within ChatThreadMessagesList
                thunkAPI.dispatch(attachFileToSendingChatThreadMessage({
                    chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                    attachedFile: chatThreadMessageForm.getAttachedFile()
                }));
            }
        }

        thunkAPI.dispatch(setCurrentChatMessageInput(initialState.currentChatMessageInput));

        try {
            const res = await ChatClient.getChatClient().sendChatThreadMessage(chatThreadId, chatThreadMessageForm);
            const sentChatThreadMessage = Mapper.chatThreadMessageFromDto(res.data, chatterOverview.getId());

            sentChatThreadMessage.setClientRef(chatThreadMessageForm.getChatMessageClientRef());    // attaching clientRef to the server Response, so the message in Sending State can be referenced in the Reducers
            thunkAPI.dispatch(registerSentChatThreadMessage(sentChatThreadMessage));
            const { chatThread } = (thunkAPI.getState() as RootState).chatSlice;    // I expect this assignment to contain chatThread updated by registerSentChatThreadMessage Call!
            thunkAPI.dispatch(updateChatThreadOverviewFromList(chatThread.getOverview()));

            return thunkAPI.fulfillWithValue(sentChatThreadMessage);
        } catch (err: any) {
            // const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            console.log(`Error occurred: ${JSON.stringify(err)}`)
            thunkAPI.dispatch(setChatThreadMessageStatus({
                chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                newChatThreadMessageStatus: ChatThreadMessageStatus.FAILED_TO_SEND
            }));
            
            return thunkAPI.rejectWithValue(null);
        }
    }
);

export const clearChatThreadHistory = createAsyncThunk<void, { chatThreadId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chat/clearChatThreadHistory",
    async ({ chatThreadId }, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().clearChatThreadHistory(chatThreadId);
            SliceHelper.toastSuccessResponseMessage(responseBody);
            const { chatThreadHistoryClearedAt } = responseBody.data;
            const chatThreadHistoryClearedAtTimestamp = TimeHelper.dateStringToTimestamp(chatThreadHistoryClearedAt);

            thunkAPI.dispatch(clearChatThreadMessages(chatThreadHistoryClearedAtTimestamp));
            const { chatThread } = (thunkAPI.getState() as RootState).chatSlice;    // I expect this assignment to contain chatThread updated by clearChatThreadMessages Call!
            thunkAPI.dispatch(updateChatThreadOverviewFromList(chatThread.getOverview()));
            
            return thunkAPI.fulfillWithValue(null);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const requestChatThreadMessageAttachedFileUploadUrl = createAsyncThunk<S3PreSignedUrl, { uploadFileIntent: UploadFileIntent }, { rejectValue: AsyncThunkRejectType }>(
    "account/requestChatThreadMessageAttachedFileUploadUrl",
    async ({ uploadFileIntent } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().requestFileUploadUrl(uploadFileIntent);
            const S3PreSignedUrl = Mapper.s3PreSignedUrlFromDto(responseBody.data);

            return thunkAPI.fulfillWithValue(S3PreSignedUrl);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
export const uploadChatThreadMessageAttachedFileToS3 = createAsyncThunk<S3UploadFileResponseDto, { s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream }, { rejectValue: AsyncThunkRejectType }>(
    "account/uploadChatThreadMessageAttachedFileToS3",
    async ({ s3PreSignedUploadUrl, fileContentStream } , thunkAPI) => {
        try {
            const res = await AwsClient.getAwsClient().uploadFileToS3(s3PreSignedUploadUrl, fileContentStream);

            return thunkAPI.fulfillWithValue(res);
        } catch (err: any) {
            // TODO-aws: possibly AWS Sends special Error Types Back on S3 Image Upload. I may not be able to use ChatClientResponseErrorBody. Look into this!
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const ChatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChatThread: (state, action: { payload: ChatThread }) => {
            state.chatThread = action.payload;
        },
        setIsLoadingChatThread: (state, action: { payload: boolean }) => {
            state.isLoadingChatThread = action.payload;
        },
        setIsLastChatMessagesListPage: (state, action: { payload: boolean }) => {
            state.isLastChatMessagesListPage = action.payload;
        },
        setCurrentChatThreadMessagesListPage: (state, action: { payload: number }) => {
            state.currentChatMessagesListPage = action.payload;
        },
        setIsLoadingOlderMessages: (state, action: { payload: boolean }) => {
            state.isLoadingOlderMessages = action.payload;
        },
        appendChatThreadMessagesToList: (state, action: { payload: ChatThreadMessage[] }) => {
            const mergedChatThreadMessages = mergeChatThreadMessages(state.chatThread.getMessages(), action.payload);
            const sortedChatThreadMessages = sortChatThreadMessages(mergedChatThreadMessages);

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(sortedChatThreadMessages);
            state.chatThread = updatedChatThread;
        },
        setChatThreadMessageStatus: (state, action: { payload: { chatThreadMessageClientRef: string, newChatThreadMessageStatus: ChatThreadMessageStatus } }) => {
            const updatedChatThreadMessages = state.chatThread.getMessages().map(chatThreadMessage => {
                if (chatThreadMessage.getClientRef() === action.payload.chatThreadMessageClientRef) {
                    chatThreadMessage.setStatus(action.payload.newChatThreadMessageStatus);
                }

                return chatThreadMessage;
            });

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(updatedChatThreadMessages);

            state.chatThread = updatedChatThread;
        },
        attachFileToSendingChatThreadMessage: (state, action: { payload: { chatThreadMessageClientRef: string, attachedFile: SharedFile }}) => {
            const { chatThreadMessageClientRef, attachedFile } = action.payload;

            const updatedChatThreadMessages = state.chatThread.getMessages().map(chatThreadMessage => {
                if (chatThreadMessage.getClientRef() === chatThreadMessageClientRef) {
                    chatThreadMessage.setAttachedFile(attachedFile);
                }

                return chatThreadMessage;
            });

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(updatedChatThreadMessages);

            state.chatThread = updatedChatThread;
        },
        registerSentChatThreadMessage: (state, action: { payload: ChatThreadMessage}) => {
            const registeredSentChatThreadMessage = action.payload;

            const updatedChatThreadMessages = state.chatThread.getMessages().map(chatThreadMessage => {
                if (chatThreadMessage.getClientRef() === registeredSentChatThreadMessage.getClientRef()) {
                    chatThreadMessage.setStatus(ChatThreadMessageStatus.CONFIRMED);
                    chatThreadMessage.setClientRef(null);
                    chatThreadMessage.setId(registeredSentChatThreadMessage.getId());
                    chatThreadMessage.setMessageTimestamp(registeredSentChatThreadMessage.getMessageTimestamp());
                    
                    chatThreadMessage.setIsAttachingFile(false);
                    chatThreadMessage.setAttachedFile(registeredSentChatThreadMessage.getAttachedFile());   // attaching null or File with certainly set Timestamp!
                }

                return chatThreadMessage;
            });
            const sortedChatThreadMessages = sortChatThreadMessages(updatedChatThreadMessages);
            const lastRegisteredChatThreadMessage = getLastRegisteredChatThreadMessage(sortedChatThreadMessages);

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(sortedChatThreadMessages);

            // update lastMessage of ChatThread if the sent Message has the latest timestamp
            if (lastRegisteredChatThreadMessage !== null) {
                updatedChatThread.getOverview().setLastMessageTimestamp(lastRegisteredChatThreadMessage.getMessageTimestamp());
                updatedChatThread.getOverview().setLastMessage(lastRegisteredChatThreadMessage.getMessageContent());
            }

            state.chatThread = updatedChatThread;
        },
        registerPolledActiveChatThread: (state, action: { payload: ChatThread }) => {
            if (state.chatThread === null || state.chatThread.getOverview().getId() !== action.payload.getOverview().getId()) {
                // if polled chatThread is no longer stored in state, return
                return;
            }

            const unseenMessagesFromServer = action.payload.getMessages();
            const mergedChatThreadMessages = mergeChatThreadMessages(state.chatThread.getMessages(), unseenMessagesFromServer);
            const sortedChatThreadMessages = sortChatThreadMessages(mergedChatThreadMessages);

            const commonLastSeenByPeerMessageId = getCommonLastSeenMessageId(
                sortedChatThreadMessages, state.chatThread.getOverview().getLastSeenByPeerMessageId(), action.payload.getOverview().getLastSeenByPeerMessageId()
            );
            const commonLastSeenByChatterMessageId = getCommonLastSeenMessageId(
                sortedChatThreadMessages, state.chatThread.getOverview().getLastSeenByChatterMessageId(), action.payload.getOverview().getLastSeenByChatterMessageId()
            );
            const lastRegisteredChatThreadMessage = getLastRegisteredChatThreadMessage(sortedChatThreadMessages);
            const { updatedIsSeenChatThreadMessageList, numberOfUnseenMessages }
                = setIsSeenValueOnChatThreadMessageList(sortedChatThreadMessages, commonLastSeenByChatterMessageId);

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(updatedIsSeenChatThreadMessageList);
            updatedChatThread.getOverview().setLastSeenByPeerMessageId(commonLastSeenByPeerMessageId);
            if (lastRegisteredChatThreadMessage !== null) {
                updatedChatThread.getOverview().setLastMessageTimestamp(lastRegisteredChatThreadMessage.getMessageTimestamp());
                updatedChatThread.getOverview().setLastMessage(lastRegisteredChatThreadMessage.getMessageContent());
            }
            updatedChatThread.getOverview().setNumberOfUnseenMessages(numberOfUnseenMessages);

            state.chatThread = updatedChatThread;
        },
        updateSeenChatThreadMessages: (state, action: { payload: ChatThreadMessage }) => {
            const newLastSeenChatThreadMessage = action.payload;
            const commonLastSeenByChatterMessageId = getCommonLastSeenMessageId(
                state.chatThread.getMessages(), state.chatThread.getOverview().getLastSeenByChatterMessageId(), newLastSeenChatThreadMessage.getId()
            );
            const { updatedIsSeenChatThreadMessageList, numberOfUnseenMessages }
                = setIsSeenValueOnChatThreadMessageList(state.chatThread.getMessages(), commonLastSeenByChatterMessageId);

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(updatedIsSeenChatThreadMessageList);
            updatedChatThread.getOverview().setLastSeenByChatterMessageId(commonLastSeenByChatterMessageId);
            updatedChatThread.getOverview().setNumberOfUnseenMessages(numberOfUnseenMessages);

            state.chatThread = updatedChatThread;
        },
        setCurrentChatMessageInput: (state, action: { payload: string }) => {
            state.currentChatMessageInput = action.payload;
        },
        clearChatThreadMessages: (state, action: { payload: number }) => {
            const chatThreadHistoryClearedAtTimestamp = action.payload;

            const newChatThreadMessageHistory = state.chatThread.getMessages().filter(chatThreadMessage =>
                chatThreadMessage.getMessageTimestamp() >= chatThreadHistoryClearedAtTimestamp
                || chatThreadMessage.getStatus() === ChatThreadMessageStatus.FAILED_TO_SEND
                || chatThreadMessage.getStatus() === ChatThreadMessageStatus.SENDING
            );

            const newLastSeenByChatterMessageId
                = getCommonLastSeenMessageId(newChatThreadMessageHistory, state.chatThread.getOverview().getLastSeenByChatterMessageId(), null);
            const newLastSeenByPeerMessageId
                = getCommonLastSeenMessageId(newChatThreadMessageHistory, state.chatThread.getOverview().getLastSeenByPeerMessageId(), null);
            const lastRegisteredChatThreadMessage = getLastRegisteredChatThreadMessage(newChatThreadMessageHistory);
            const numberOfUnseenMessages = newChatThreadMessageHistory.filter(chatThreadMessage => chatThreadMessage.getIsMessageSeen() === false).length;

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(newChatThreadMessageHistory);
            updatedChatThread.getOverview().setChatThreadHistoryClearedAtTimestamp(chatThreadHistoryClearedAtTimestamp);
            updatedChatThread.getOverview().setNumberOfUnseenMessages(numberOfUnseenMessages);
            if (lastRegisteredChatThreadMessage === null) {
                updatedChatThread.getOverview().setLastMessageTimestamp(null);
                updatedChatThread.getOverview().setLastMessage(null);
            }

            if (newLastSeenByChatterMessageId === null) {
                updatedChatThread.getOverview().setLastSeenByChatterMessageId(null);
            }

            if (newLastSeenByPeerMessageId === null) {
                updatedChatThread.getOverview().setLastSeenByPeerMessageId(null);
            }

            state.chatThread = updatedChatThread;
            state.currentChatMessagesListPage = initialState.currentChatMessagesListPage;
            state.isLastChatMessagesListPage = true;
        },
        setChatSharedFileInOverlay: (state, action: { payload: SharedFile | null}) => {
            state.chatSharedFileInOverlay = action.payload;
        },
        clearChatState: (state) => {
            state.chatThread = initialState.chatThread;
            state.isLoadingChatThread = initialState.isLoadingChatThread;
            state.currentChatMessagesListPage = initialState.currentChatMessagesListPage;
            state.isLastChatMessagesListPage = initialState.isLastChatMessagesListPage;
            state.isLoadingOlderMessages = initialState.isLoadingOlderMessages;
            state.currentChatMessageInput = initialState.currentChatMessageInput;
            state.chatSharedFileInOverlay = initialState.chatSharedFileInOverlay;
        }
    }
});

export const {
    setChatThread,
    setIsLoadingChatThread,
    setIsLastChatMessagesListPage,
    setCurrentChatThreadMessagesListPage,
    setIsLoadingOlderMessages,
    appendChatThreadMessagesToList,
    attachFileToSendingChatThreadMessage,
    registerSentChatThreadMessage,
    registerPolledActiveChatThread,
    setChatThreadMessageStatus,
    updateSeenChatThreadMessages,
    setCurrentChatMessageInput,
    clearChatThreadMessages,
    setChatSharedFileInOverlay,
    clearChatState
} = ChatSlice.actions;
