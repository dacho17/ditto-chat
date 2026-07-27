import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import ActiveChatThreadPanel from "../../components/activeChatThreadPanel/ActiveChatThreadPanel";
import ChatThreadsPanel from "../../components/chatThreadsPanel/ChatThreadsPanel";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import "./HomePage.css";

export default function HomePage() {
    const isTabletScreen = DeviceScreenHelper.isTabletScreen();
    const isPcScreen = DeviceScreenHelper.isPcScreen();

    return <PageWithSideMenu
        mainPage={
            <div className="home-page">
                <div className="chat-thread-panel-container">
                    <ChatThreadsPanel />
                </div>
                { (isTabletScreen || isPcScreen) && 
                    <div className="chat-window-container">
                        <ChatWindow />
                    </div>
                }
                { isPcScreen && 
                    <div className="active-chat-thread-panel-container">
                        <ActiveChatThreadPanel />
                    </div>                
                }
            </div>
        }
    />
}
