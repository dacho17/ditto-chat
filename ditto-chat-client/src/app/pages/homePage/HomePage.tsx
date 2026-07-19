import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatTheadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import SideMenu from "../../components/sideMenu/SideMenu";
import "./HomePage.css";

export default function HomePage() {
    return <div className="home-page full-screen-height">
        <div className="side-menu-container">
            <SideMenu />
        </div>
        <div className="chat-thread-panel-container">
            <ChatTheadsPanel />
        </div>
        <div className="chat-window-container">
            <ChatWindow />
        </div>
        <div className="active-chat-thread-panel-container">
            <ActiveChatThreadPanel />
        </div>
    </div>
}
