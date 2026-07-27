import ChatThreadOverview from "./ChatThreadOverview";
import ChatThreadMessage from "./ChatThreadMessage";

export default class ChatThread {
    private overview: ChatThreadOverview;
    private messages: ChatThreadMessage[];

    public constructor(overview: ChatThreadOverview, messages: ChatThreadMessage[]) {
        this.overview = overview;
        this.messages = messages;
    }

    public getOverview(): ChatThreadOverview {
        return this.overview;
    }

    public getMessages(): ChatThreadMessage[] {
        return this.messages;
    }

    public setMessages(chatThreadMessages: ChatThreadMessage[]): void {
        this.messages = chatThreadMessages;
    }

    public static getShallowCopy(chatThread: ChatThread): ChatThread {
        return new ChatThread(
            chatThread.getOverview(),
            chatThread.getMessages()
        );
    }
}
