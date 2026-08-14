import { createSlice } from "@reduxjs/toolkit";
import { DeviceType } from "../enums/DeviceType";
import DeviceScreenHelper from "../helpers/DeviceScreenHelper";

interface DeviceTypeSlice {
    currentDeviceType: DeviceType | null;
}

const initialState = {
    currentDeviceType: DeviceScreenHelper.getDeviceType()
}

export const DeviceTypeSlice = createSlice({
    name: "deviceType",
    initialState,
    reducers: {
        setCurrentDeviceType: (state, action: { payload: DeviceType }) => {
            state.currentDeviceType = action.payload;
        }
    }
});

export const {
    setCurrentDeviceType
} = DeviceTypeSlice.actions;
