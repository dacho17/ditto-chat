export default class DeviceScreenHelper {
    private static MOBILE_SCREEN_WIDTH_THRESHOLD: 720;
    private static TABLET_SCREEN_WIDTH_THRESHOLD: 1024;

    public static getViewPortDimensions(): { height: number, width: number } {
        return {
            height: window.innerHeight.valueOf(),
            width: window.innerWidth.valueOf()            
        };
    }

    public static isMobileScreen(): boolean {
        return window.innerWidth.valueOf() <= DeviceScreenHelper.MOBILE_SCREEN_WIDTH_THRESHOLD;
    }

    public static isTabletScreen(): boolean {
        return DeviceScreenHelper.MOBILE_SCREEN_WIDTH_THRESHOLD < window.innerWidth.valueOf()
            && window.innerWidth.valueOf() <= this.TABLET_SCREEN_WIDTH_THRESHOLD;
    }

    public static isPcScreen(): boolean {
        return this.TABLET_SCREEN_WIDTH_THRESHOLD < window.innerWidth.valueOf();
    }
}
