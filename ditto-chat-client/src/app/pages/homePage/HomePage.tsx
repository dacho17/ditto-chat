import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatThreadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import "./HomePage.css";

export default function HomePage() {
    return <PageWithSideMenu
        mainPage={
            <div className="home-page">
                <div className="chat-thread-panel-container">
                    <ChatThreadsPanel />
                </div>
                <div className="chat-window-container">
                    <ChatWindow />
                </div>
                <div className="active-chat-thread-panel-container">
                    <ActiveChatThreadPanel />
                </div>
            </div>
        }
    />
}
