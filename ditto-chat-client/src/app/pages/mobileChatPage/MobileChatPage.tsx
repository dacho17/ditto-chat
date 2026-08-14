import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { pollActiveChatThread } from "../../store/ChatSlice";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import PageContent from "../../components/pageContent/PageContent";
import ChatterOverviewInfo from "../../components/chatterOverviewInfo/ChatterOverviewInfo";
import ChatFeatureList from "../../components/chatFeatureList/ChatFeatureList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import SliceHelper from "../../helpers/SliceHelper";
import { ListType } from "../../enums/ListType";
import { DeviceType } from "../../enums/DeviceType";
import CONSTANTS from "../../../Constants";
import "./MobileChatPage.css";

export default function MobileChatPage() {
    const { chatThread, isLoadingChatThread } = useAppSelector(state => state.chatSlice);
    const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);
    const dispatch = useAppDispatch();
	const { chatThreadId } = useParams();
    const [sendTryToGetChatThread, didUnhandledServerErrorOccur] = useTryToSendRequest<null>();
    const [sendTryToPollActiveChatThread, _] = useTryToSendRequest<null>();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentDeviceType !== DeviceType.MOBILE_PHONE) {
            let inheritedChatThreadId = chatThreadId !== undefined
                ? chatThreadId : "";
            navigate(`${CONSTANTS.HOME_URL}/${inheritedChatThreadId}`);
            return;
        }
    }, [currentDeviceType]);

    async function tryToPollActiveChatThread() {
        if (chatThreadId === undefined) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToPollActiveChatThread(async () => {
            await dispatch(pollActiveChatThread({ chatThreadId: chatThreadId })).unwrap();

            return null;
        }, () => {});
    }
	
	useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
        SliceHelper.tryToGetChatThread(chatThreadId, sendTryToGetChatThread, dispatch);

        // TODO-polling: uncomment Polling
        // const interval = setInterval(tryPollActiveChatThread, CONSTANTS.CHAT_POLLING_INTERVAL_IN_MS);
        // return () => {
        //     clearInterval(interval);
        // }
    }, [chatThreadId]);

    function getMobileChatPageHeaderContent(): React.JSX.Element {
        if (chatThread === null) {
            return <></>
        }

        return <>
            <div className="chat-page-header-content-chatter-overview-info-container">
                <ChatterOverviewInfo
                    chatterOverview={chatThread.getOverview().getChatterOverview()}
                />
            </div>
            <div className="chat-page-header-content-feature-list-container">
                <ChatFeatureList
                    activeChatThread={chatThread}
                    listType={ListType.ROW}
                />
            </div>                    
        </>
    }

    return <PageWithBackHeader
        backOnClickFunction={() => {
            navigateBack();
        }}
        backHeaderContent={
            <div className="chat-page-header-content">
                <PageContent
                    regularPageContent={getMobileChatPageHeaderContent()}
                    isLoadingPage={isLoadingChatThread}
                    didUnhandledServerErrorOccur={didUnhandledServerErrorOccur}
                    showResponseErrorCard={false}
                />
            </div>
        }
        mainPage={
            <ChatWindow didUnhandledServerErrorOccur={didUnhandledServerErrorOccur} />
        }
    />
}
