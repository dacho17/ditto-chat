import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatState, pollActiveChatThread } from "../../store/ChatSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import ChatterOverviewInfo from "../../components/chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../../components/chatFeatureList/ChatFeatureList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./MobileChatPage.css";

export default function MobileChatPage() {    
    const { chatThread, isLoadingChatThread } = useAppSelector(state => state.chatSlice);
    const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    // TODO-dynamical-resizing: revise this!
    if (DeviceScreenHelper.isMobileScreen() === false) {
        dispatch(clearChatState());
        navigate(CONSTANTS.HOME_URL);
    }

    async function tryPollActiveChatThread() {
        try {
            await dispatch(pollActiveChatThread({ chatThreadId: chatThreadId })).unwrap();
        } catch (err: any) {
            console.log("TODO: handle Error");
        }
    }
	
	useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
		SliceHelper.tryGetChatThread(chatThreadId, dispatch);

        // TODO-polling: uncomment Polling
        // const interval = setInterval(tryPollActiveChatThread, CONSTANTS.CHAT_POLLING_INTERVAL_IN_MS);
        // return () => {
        //     clearInterval(interval);
        // }
    }, [chatThreadId]);

    return <PageWithBackHeader
        backOnClickFunction={() => {
            navigateBack();
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
