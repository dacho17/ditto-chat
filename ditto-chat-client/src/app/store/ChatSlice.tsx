import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import TimeHelper from "../helpers/TimeHelper";
import Mapper from "../helpers/Mapper";
import ChatThread from "../classes/ChatThread";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatThreadMessage from "../classes/ChatThreadMessage";
import { ChatThreadMessageStatus } from "../enums/ChatThreadMessageStatus";
import CONSTANTS from "../../Constants";


interface ChatState {
    chatThread: ChatThread | null;
    isLoadingChatThread: boolean;
    currentChatMessagesListPage: number;
    isLastChatMessagesListPage: boolean;
    isLoadingOlderMessages: boolean;
    currentChatMessageInput: string;
}

const initialState: ChatState = {
    chatThread: null,
    isLoadingChatThread: true,
    currentChatMessagesListPage: 0,
    isLastChatMessagesListPage: false,
    isLoadingOlderMessages: false,
    currentChatMessageInput: ""
};

function sortChatThreadMessages(chatThreadMessages: ChatThreadMessage[]): ChatThreadMessage[] {
    return chatThreadMessages.toSorted((first, second) => {
        return second.getMessageTimestamp() - first.getMessageTimestamp();
    });
}

export const postChatThread = createAsyncThunk<ChatThread, { chatterId: string }, AyncThunkRejectType>(
    "chat/postChatThread",
    async ({ chatterId }, thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().postChatThread(chatterId);
            const createdChatThread = Mapper.chatThreadFromDto(res.data);

            return thunkAPI.fulfillWithValue(createdChatThread);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getChatThread = createAsyncThunk<ChatThread, { chatThreadId: string }, AyncThunkRejectType>(
    "chat/getChatThread",
    async ({ chatThreadId }, thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().getChatThread(chatThreadId);
            const chatThread = Mapper.chatThreadFromDto(res.data);

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

export const getChatThreadMessages = createAsyncThunk<ChatThreadMessage[], { chatThreadId: string }, AyncThunkRejectType>(
    "chat/getChatThreadMessages",
    async ({ chatThreadId }, thunkAPI) => {
        try {
            const { currentChatMessagesListPage } = (thunkAPI.getState() as RootState).chatSlice;

            const queryParams = new URLSearchParams();
            queryParams.set("pageNumber", currentChatMessagesListPage.toString());
            
            const res = await ChatClient.getChatClient().getChatThreadMessages(chatThreadId, queryParams);
            const { pagedList, isLastPage } = res.data;
            const pagedChatThreadMessages = pagedList.map(chatThreadMessageDto => Mapper.chatThreadMessageFromDto(chatThreadMessageDto));

            thunkAPI.dispatch(appendChatThreadMessagesToList(pagedChatThreadMessages));
            thunkAPI.dispatch(setIsLastChatMessagesListPage(isLastPage));

            return thunkAPI.fulfillWithValue(pagedChatThreadMessages);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const updateLastSeenChatThreadMessage = createAsyncThunk<void, { chatThreadId: string, chatThreadMessageId: string }, AyncThunkRejectType>(
    "chat/updateLastSeenChatThreadMessage",
    async ({ chatThreadId, chatThreadMessageId }, thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().updateLastSeenChatThreadMessage(chatThreadId, chatThreadMessageId);
            const newLastSeenChatThreadMessageDto = res.data;
            const newLastSeenChatThreadMessage = Mapper.chatThreadMessageFromDto(newLastSeenChatThreadMessageDto);

            thunkAPI.dispatch(setChatThreadMessagesToSeen(newLastSeenChatThreadMessage));
            
            return thunkAPI.fulfillWithValue(null);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const sendChatThreadMessage = createAsyncThunk<ChatThreadMessage, { chatThreadId: string, chatThreadMessageForm: ChatThreadMessageForm }, AyncThunkRejectType>(
    "chat/sendChatThreadMessage",
    async ({ chatThreadId, chatThreadMessageForm }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        if (chatThreadMessageForm.getIsMessageResent() === true) {
            thunkAPI.dispatch(setChatThreadMessageStatus({
                chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                newChatThreadMessageStatus: ChatThreadMessageStatus.SENDING
            }));
        } else {
            const newChatThreadMessage = new ChatThreadMessage(
                ChatThreadMessageStatus.SENDING, chatterOverview.getId(), chatThreadMessageForm.getMessage(), TimeHelper.getCurrentTimestamp(), true
            );
            newChatThreadMessage.setClientRef(chatThreadMessageForm.getChatMessageClientRef());
            
            thunkAPI.dispatch(addNewChatThreadMessageToList(newChatThreadMessage));
        }

        thunkAPI.dispatch(setCurrentChatMessageInput(initialState.currentChatMessageInput));

        try {
            const res = await ChatClient.getChatClient().sendChatThreadMessage(chatThreadId, chatThreadMessageForm);
            const sentChatThreadMessage = Mapper.chatThreadMessageFromDto(res.data);

            thunkAPI.dispatch(setChatThreadMessageStatus({
                chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                newChatThreadMessageStatus: ChatThreadMessageStatus.CONFIRMED 
            }));

            return thunkAPI.fulfillWithValue(sentChatThreadMessage);
        } catch (err: any) {
            // const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            
            thunkAPI.dispatch(setChatThreadMessageStatus({
                chatThreadMessageClientRef: chatThreadMessageForm.getChatMessageClientRef(),
                newChatThreadMessageStatus: ChatThreadMessageStatus.FAILED_TO_SEND
            }));
            
            return thunkAPI.rejectWithValue(null);
        }
    }
);

export const clearChatThreadHistory = createAsyncThunk<void, { chatThreadId: string }, AyncThunkRejectType>(
    "chat/clearChatThreadHistory",
    async ({ chatThreadId }, thunkAPI) => {
        try {
            const _ = await ChatClient.getChatClient().clearChatThreadHistory(chatThreadId);

            thunkAPI.dispatch(clearChatThreadMessages());
            
            return thunkAPI.fulfillWithValue(null);
        } catch (err: any) {
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
            const updatedChatThreadMessages = [...state.chatThread.getMessages(), ...action.payload];
            const sortedChatThreadMessages = sortChatThreadMessages(updatedChatThreadMessages);

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(sortedChatThreadMessages);
            state.chatThread = updatedChatThread;            
        },
        addNewChatThreadMessageToList: (state, action: { payload: ChatThreadMessage }) => {
            const updatedChatThreadMessages = [action.payload, ...state.chatThread.getMessages()];
            const sortedChatThreadMessages = sortChatThreadMessages(updatedChatThreadMessages);

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
        setLastChatThreadMessage: (state, action: { payload: { newLastChatThreadMessageContent: string, newLastChatThreadMessageTimestamp: number } }) => {
            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.getOverview().setLastMessage(action.payload.newLastChatThreadMessageContent);
            updatedChatThread.getOverview().setLastMessageTimestamp(action.payload.newLastChatThreadMessageTimestamp);

            state.chatThread = updatedChatThread;
        },
        setNumberOfUnseenChatThreadMessages: (state, action: { payload: number }) => {
            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.getOverview().setNumberOfUnseenMessages(action.payload);
            state.chatThread = updatedChatThread;
        },
        setChatThreadMessagesToSeen: (state, action: { payload: ChatThreadMessage }) => {
            const newLastSeenChatThreadMessage = action.payload;

            // set IsmessageSeen of all messages older than newLastSeenChatThreadMessage
            const updatedChatThreadMessages = state.chatThread.getMessages().map(chatThreadMessage => {
                if (chatThreadMessage.getMessageTimestamp() <= newLastSeenChatThreadMessage.getMessageTimestamp()) {
                    chatThreadMessage.setIsMessageSeen(true);
                }

                return chatThreadMessage;
            });
            const newNumberOfUneseenMessages =
                updatedChatThreadMessages.filter(chatThreadMessage => chatThreadMessage.getIsMessageSeen() === false).length;

            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages(updatedChatThreadMessages);
            updatedChatThread.getOverview().setNumberOfUnseenMessages(newNumberOfUneseenMessages);

            state.chatThread = updatedChatThread;
        },
        setCurrentChatMessageInput: (state, action: { payload: string }) => {
            state.currentChatMessageInput = action.payload;
        },
        clearChatThreadMessages: (state) => {
            const updatedChatThread = ChatThread.getShallowCopy(state.chatThread as ChatThread);
            updatedChatThread.setMessages([]);

            state.chatThread = updatedChatThread;
            state.currentChatMessagesListPage = initialState.currentChatMessagesListPage;
            state.isLastChatMessagesListPage = true;
        },
        clearChatState: (state) => {
            state.chatThread = initialState.chatThread;
            state.isLoadingChatThread = initialState.isLoadingChatThread;
            state.currentChatMessagesListPage = initialState.currentChatMessagesListPage;
            state.isLastChatMessagesListPage = initialState.isLastChatMessagesListPage;
            state.isLoadingOlderMessages = initialState.isLoadingOlderMessages;
            state.currentChatMessageInput = initialState.currentChatMessageInput;
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
    addNewChatThreadMessageToList,
    setChatThreadMessageStatus,
    setLastChatThreadMessage,
    setNumberOfUnseenChatThreadMessages,
    setChatThreadMessagesToSeen,
    setCurrentChatMessageInput,
    clearChatThreadMessages,
    clearChatState
} = ChatSlice.actions;
