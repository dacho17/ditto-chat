import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatterState, getChatter, setIsLoadingChatter } from "../../store/ChatterSlice";
import PageWithSideMenu from "../pageWithSideMenu/PageWithSideMenu";
import PageWithBackHeader from "../pageWithBackHeader/PageWithBackHeader";
import AccountDetails from "../../components/accountDetails/AccountDetails";
import SharedFilesList from "../../components/sharedFilesList/SharedFilesList";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import CONSTANTS from "../../../Constants";
import "./ChatterPage.css";

export default function ChatterPage() {
    const { chatter, isLoadingChatter } = useAppSelector(state => state.chatterSlice);
    const dispatch = useAppDispatch();
    const { chatterId } = useParams();
    const navigate = useNavigate();

    if (DeviceScreenHelper.isPcScreen() === true) {
        dispatch(clearChatterState());
        navigate(CONSTANTS.HOME_URL);
    }

    useEffect(() => {
        tryGetChatter();
    }, []);

    async function tryGetChatter(): Promise<void> {
        dispatch(setIsLoadingChatter(true));

        try {
            await dispatch(getChatter({ chatterId: chatterId }));
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsLoadingChatter(false));
        }
    }

    return <PageWithSideMenu
        mainPage={ isLoadingChatter === true
            ? <LoadingSpinner />
            : <PageWithBackHeader
            backOnClickFunction={() => {
                dispatch(clearChatterState());
                navigate(`${CONSTANTS.CHAT_URL}/${chatter.getChatterOverview().getChatThreadId()}`);
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
