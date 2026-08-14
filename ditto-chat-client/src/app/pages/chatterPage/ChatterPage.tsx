import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatterState } from "../../store/ChatterSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import PageContent from "../../components/pageContent/PageContent";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import SliceHelper from "../../helpers/SliceHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import CONSTANTS from "../../../Constants";
import "./ChatterPage.css";

export default function ChatterPage() {
    const { chatter, isLoadingChatter } = useAppSelector(state => state.chatterSlice);
    const dispatch = useAppDispatch();
    const { chatterId } = useParams();
    const [sendTryToGetChatter, didUnhandledServerErrorOccur] = useTryToSendRequest<null>();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    // TODO-dynamical-resizing: revise this!
    if (DeviceScreenHelper.isPcScreen() === true) {
        dispatch(clearChatterState());
        navigate(CONSTANTS.HOME_URL);
    }

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
                            isDisplayedInPanel={true}
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
