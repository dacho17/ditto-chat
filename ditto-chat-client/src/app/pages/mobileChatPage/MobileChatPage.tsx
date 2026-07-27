import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatState, getChatThread, setIsLoadingChatThread } from "../../store/ChatSlice";
import { refreshChatterOverview } from "../../store/AuthSlice";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import ChatterOverviewInfo from "../../components/chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../../components/chatFeatureList/ChatFeatureList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./MobileChatPage.css";

export default function MobileChatPage() {    
    const { chatThread, isLoadingChatThread } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
	const { chatThreadId } = useParams();
    const navigate = useNavigate();

    if (DeviceScreenHelper.isMobileScreen() === false) {
        dispatch(clearChatState());
        navigate(CONSTANTS.HOME_URL);
    }
	
	useEffect(() => {
		tryGetChatThread();
	}, []);

	async function tryGetChatThread(): Promise<void> {
		dispatch(setIsLoadingChatThread(true));
        dispatch(refreshChatterOverview());

		try {
			await dispatch(getChatThread({ chatThreadId: chatThreadId }));
		} catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
		} finally {
			dispatch(setIsLoadingChatThread(false));
		}
	}

    return <PageWithBackHeader
        backOnClickFunction={() => {
            dispatch(clearChatState());
            navigate(CONSTANTS.HOME_URL);    // TODO: this redirect needs to be revisited in the same way as others. Home is not the only "Back" option
        }}
        backHeaderContent={
            <div className="chat-page-header-content">
                { isLoadingChatThread === true
                    ? <LoadingSpinner />
                    : <>
                        <div className="chat-page-header-content-chatter-overview-info-container">
                            <ChatterOverviewInfo
                                chatterOverview={chatThread.getOverview().getChatterOverview()}
                            />
                        </div>
                        <div className="chat-page-header-content-feature-list-container">
                            <ChatFeatureList listType={ListType.ROW} />
                        </div>                    
                    </>
                }
            </div>
        }
        mainPage={
            <ChatWindow />
        }
    />
}
