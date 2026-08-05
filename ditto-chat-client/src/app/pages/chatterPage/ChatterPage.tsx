import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatterState } from "../../store/ChatterSlice";
import useChatterId from "../../hooks/UseChatterId";
import useUrlHistoryNavigate from "../../hooks/UseUrlHistoryNavigate";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import CONSTANTS from "../../../Constants";
import "./ChatterPage.css";

export default function ChatterPage() {
    const { chatter, isLoadingChatter } = useAppSelector(state => state.chatterSlice);
    const dispatch = useAppDispatch();
    const chatterId = useChatterId();
    const { addUrlToHistory, navigateBack } = useUrlHistoryNavigate();
    const navigate = useNavigate();

    // TODO: revise this!
    if (DeviceScreenHelper.isPcScreen() === true) {
        dispatch(clearChatterState());
        navigate(CONSTANTS.HOME_URL);
    }

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        addUrlToHistory("");
        SliceHelper.tryGetChatter(chatterId, dispatch);
    }, []);

    return <PageWithSideMenu
        mainPage={ isLoadingChatter === true
            ? <LoadingSpinner />
            : <PageWithBackHeader
            backOnClickFunction={() => {
                const chatterChatThreadId = chatter.getChatterOverview().getChatThreadId();
                navigateBack();
                // NavigationHelper.navigateToChat(navigate, chatterChatThreadId, null, UrlHelper.constructInitialHomePageQueryParams(new URLSearchParams()));
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
                        <SharedFilesList />
                    </div>
                </div>
            }
        />}            
    />
}
