import ChatThreadMessage from "./ChatThreadMessage";
import ChatThreadOverview from "./ChatThreadOverview";

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
}
