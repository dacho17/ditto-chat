import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AuthSlice } from "./AuthSlice";
import { UrlHistorySlice } from "./UrlHistorySlice";
import { HomeSlice } from "./HomeSlice";
import { AccountSlice } from "./AccountSlice";
import { ChattersSlice } from "./ChattersSlice";
import { ChatSlice } from "./ChatSlice";
import { ChatterSlice } from "./ChatterSlice";

export const reduxStore = configureStore({
    reducer: {
        authSlice: AuthSlice.reducer,
        urlHistorySlice: UrlHistorySlice.reducer,
        homeSlice: HomeSlice.reducer,
        accountSlice: AccountSlice.reducer,
        chattersSlice: ChattersSlice.reducer,
        chatSlice: ChatSlice.reducer,
        chatterSlice: ChatterSlice.reducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: false
        });
    }
});

export type RootState = ReturnType<typeof reduxStore.getState>;  // helper type
export type AppDispatch = typeof reduxStore.dispatch;            // helper type

export const useAppDispatch = () => useDispatch<AppDispatch>();                 // overriding default useDispatch function
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;     // overriding default useAppSelector function

export type AyncThunkRejectType = { rejectValue: { redirectUrl: string } | null };  // used as a Reject Type by AsyncThunk Functions in Slices
