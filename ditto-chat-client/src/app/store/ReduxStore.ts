import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";


export const reduxStore = configureStore({
    reducer: {
        // EXAMPLE: userNotifications: userNotificationsSlice.reducer,
    }
});

export type RootState = ReturnType<typeof reduxStore.getState>;  // helper type
export type AppDispatch = typeof reduxStore.dispatch;            // helper type

export const useAppDispatch = () => useDispatch<AppDispatch>();                 // overriding default useDispatch function
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;     // overriding default useAppSelector function
