import { DeviceType } from "../enums/DeviceType";

export default class DeviceScreenHelper {
    private static MOBILE_SCREEN_WIDTH_THRESHOLD = 720;
    private static TABLET_SCREEN_WIDTH_THRESHOLD = 1024;

    public static getDeviceType(): DeviceType {
        if (DeviceScreenHelper.isMobilePhoneScreen() === true) {
            return DeviceType.MOBILE_PHONE;
        } else if (DeviceScreenHelper.isTabletScreen() === true) {
            return DeviceType.TABLET;
        } else {
            return DeviceType.PC;
        }
    }

    private static isMobilePhoneScreen(): boolean {
        return window.innerWidth.valueOf() <= DeviceScreenHelper.MOBILE_SCREEN_WIDTH_THRESHOLD;
    }

    private static isTabletScreen(): boolean {
        return DeviceScreenHelper.MOBILE_SCREEN_WIDTH_THRESHOLD < window.innerWidth.valueOf()
            && window.innerWidth.valueOf() <= DeviceScreenHelper.TABLET_SCREEN_WIDTH_THRESHOLD;
    }
}
