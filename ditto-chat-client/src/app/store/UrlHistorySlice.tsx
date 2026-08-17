import { createSlice } from "@reduxjs/toolkit";
import UrlHelper from "../helpers/UrlHelper";

interface UrlHistoryState {
    urlHistoryList: string[];
    didClickBrowserNavigationButton: boolean;
}

const initialState: UrlHistoryState = {
    urlHistoryList: [],
    didClickBrowserNavigationButton: false
}

const URL_HISTORY_LOCAL_STORAGE_KEYS = {
    urlHistoryList: "urlHistoryList"
};

export function getUrlHistoryFromLocalStorage(): string[] {
    const urlHistoryListString = localStorage.getItem(URL_HISTORY_LOCAL_STORAGE_KEYS.urlHistoryList);

    let urlHistoryList = [];
    if (urlHistoryListString !== null && urlHistoryListString !== "") {
        urlHistoryList = JSON.parse(urlHistoryListString) as string[];
    }

    return urlHistoryList;
}

// NOTE: Redux Toolkit supports Side Effects within Reducers and ExtraReducers
export const UrlHistorySlice = createSlice({
    name: "urlHistory",
    initialState,
    reducers: {
        refreshUrlHistory: (state) => {
            if (state.urlHistoryList.length !== 0) {
                // state.urlHistoryList does not need to be set if it already contains urls
                return;
            }

            const urlHistoryList = getUrlHistoryFromLocalStorage();
            if (urlHistoryList.length === 0) {
                // if urlHistoryList is not stored in Web Browser Local Storage, initialize it there and return
                localStorage.setItem(URL_HISTORY_LOCAL_STORAGE_KEYS.urlHistoryList, "");
                return;
            }

            // set state.urlHistoryList to initial, or value from Local Storage
            if (urlHistoryList.length === 0) {
                state.urlHistoryList = [];
            } else {
                state.urlHistoryList = urlHistoryList;
            }
        },
        addUrlToUrlHistory: (state, action: { payload: string } ) => {
            const urlHistoryList = getUrlHistoryFromLocalStorage();

            // console.log(`Current UrlHistoryList: ${urlHistoryList}. Attempting to add newUrl=${action.payload}`);
            if (urlHistoryList.length > 0 && action.payload === urlHistoryList[0]) {
                // console.log(`Attempt was made to addUrlToUrlHistory for the Urls newUrl: ${action.payload} and urlHistoryList[0]: ${urlHistoryList[0]}. Urls are the same and this Call is ignored,`);
                return;
            }

            if (urlHistoryList.length > 0 && UrlHelper.doOldAndNewUrlDifferOnlyInQueryParams(action.payload, urlHistoryList[0])) {
                // console.log(`Only queryParams changed between the old and new Urls. The last url logged in history will be updated by removing old and adding new url.`);
                urlHistoryList.shift();
                // console.log(`UrlHistoryList after Pop: ${urlHistoryList}`);
            }

            urlHistoryList.unshift(action.payload);
            localStorage.setItem(URL_HISTORY_LOCAL_STORAGE_KEYS.urlHistoryList, JSON.stringify(urlHistoryList));
            // console.log(`UrlHistoryList after unshift: ${urlHistoryList}`);

            state.urlHistoryList = urlHistoryList;
            // console.log(`state List after unshift: ${state.urlHistoryList}`);
        },
        popUrlFromUrlHistory: (state) => {
            const urlHistoryList = getUrlHistoryFromLocalStorage();

            if (urlHistoryList.length === 0) {
                // console.log("Pop should not be called on an empty list!");
                return;
            }

            urlHistoryList.shift();
            localStorage.setItem(URL_HISTORY_LOCAL_STORAGE_KEYS.urlHistoryList, JSON.stringify(urlHistoryList));

            state.urlHistoryList = urlHistoryList;
        },
        setDidClickBrowserNavigationButton: (state, action: { payload: boolean }) => {
            state.didClickBrowserNavigationButton = action.payload;
        },
        clearUrlHistoryState: (state) => {
            localStorage.removeItem(URL_HISTORY_LOCAL_STORAGE_KEYS.urlHistoryList);

            state.urlHistoryList = initialState.urlHistoryList;
            state.didClickBrowserNavigationButton = initialState.didClickBrowserNavigationButton;
        }
    }
});

export const {
    refreshUrlHistory,
    addUrlToUrlHistory,
    popUrlFromUrlHistory,
    setDidClickBrowserNavigationButton,
    clearUrlHistoryState
} = UrlHistorySlice.actions;
