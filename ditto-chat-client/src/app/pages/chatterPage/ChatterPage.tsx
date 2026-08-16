import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import PageContent from "../../components/pageContent/PageContent";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import SliceHelper from "../../helpers/SliceHelper";
import { DeviceType } from "../../enums/DeviceType";
import CONSTANTS from "../../../Constants";
import "./ChatterPage.css";

export default function ChatterPage() {
    const { chatter, isLoadingChatter } = useAppSelector(state => state.chatterSlice);
    const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);
    const dispatch = useAppDispatch();
    const { chatterId } = useParams();
    const [sendTryToGetChatter, didUnhandledServerErrorOccur] = useTryToSendRequest<null>();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentDeviceType === DeviceType.PC) {
            navigate(CONSTANTS.HOME_URL);
            return;
        }
    }, [currentDeviceType]);

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
        SliceHelper.tryToGetChatter(chatterId, sendTryToGetChatter, dispatch);
    }, []);

    function getChatterPageContent(): React.JSX.Element {
        if (chatter === null) {
            return <></>
        }

        return <PageWithBackHeader
            backOnClickFunction={() => {
                navigateBack();
            }}
            backHeaderContent={
                <div className="page-header-page-name">
                    {chatter.getChatterOverview().getChatterFullName()}
                </div>
            }
            mainPage={
                <div className="chatter-page">
                    <div className="chatter-page-account-details-container">
                        <AccountDetails
                            accountOverview={chatter.getChatterOverview()}
                            isDisplayedInPanel={false}
                        />
                    </div>
                    <div className="chatter-page-shared-files-list-container">
                        <SharedFilesList selectedChatter={chatter} />
                    </div>
                </div>
            }
        />
    }

    return <PageWithSideMenu
        mainPage={
            <PageContent
                regularPageContent={getChatterPageContent()}
                isLoadingPage={isLoadingChatter}
                didUnhandledServerErrorOccur={didUnhandledServerErrorOccur}
                showResponseErrorCard={true}
            />
        }
    />
}
