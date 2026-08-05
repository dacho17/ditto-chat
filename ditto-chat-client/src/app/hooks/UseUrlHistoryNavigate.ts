import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/ReduxStore";
import { addUrlToUrlHistory, popUrlFromUrlHistory } from "../store/UrlHistorySlice";
import CONSTANTS from "../../Constants";

export default function useUrlHistoryNavigate(): { addUrlToHistory: (urlQueryParams: string) => void, navigateBack: () => void } {
    const { urlHistoryList } = useAppSelector(state => state.urlHistorySlice);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    function addUrlToHistory(urlQueryParams: string) {
        let urlToAdd = urlQueryParams !== "" ? `${location.pathname}?${urlQueryParams}` : location.pathname;
        dispatch(addUrlToUrlHistory(urlToAdd));
    }

    function navigateBack() {
        if (urlHistoryList.length <= 1) {
            navigate(CONSTANTS.HOME_URL);
        }
        const targetUrl = urlHistoryList[1];

        dispatch(popUrlFromUrlHistory());
        navigate(targetUrl);
    }

    return {
        addUrlToHistory: addUrlToHistory,
        navigateBack: navigateBack
    };
}
