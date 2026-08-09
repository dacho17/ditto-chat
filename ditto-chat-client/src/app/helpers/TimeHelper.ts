export default class TimeHelper {
    public static getCurrentTimestamp(): number {
        return Date.now();
    }

    public static addSecondsToTimeStamp(timestamp: number, seconds: number): number {
        return timestamp + seconds * 1000;
    }

    public static dateStringToTimestamp(dateString: string): number {
        const date = new Date(dateString);
        return date.getTime();
    }

    public static isTimestampToday(timestamp: number): boolean {
        const timestampDate = TimeHelper.timestampToDate(timestamp);
        const timestampDay = timestampDate.getDay();
        const timestampMonth = timestampDate.getMonth();
        const timestampYear = timestampDate.getFullYear();

        const todayDate = TimeHelper.timestampToDate(TimeHelper.getCurrentTimestamp());
        const todayDay = todayDate.getDay();
        const todayMonth = todayDate.getMonth();
        const todayYear = todayDate.getFullYear();

        return timestampDay === todayDay
            && timestampMonth === todayMonth
            && timestampYear === todayYear;
    }

    public static timestampToLocalTimeOfDay(timestamp: number): string {
        const currentDate = TimeHelper.timestampToDate(timestamp);
        
        const localHour = TimeHelper.prependLeadingZero(currentDate.toLocaleTimeString('hr', { hour: '2-digit' }));
        const localMinute = TimeHelper.prependLeadingZero(currentDate.toLocaleTimeString('hr', { minute: '2-digit' }));

        return `${localHour}:${localMinute}`;
    }

    public static timestampToLocalCalendarDay(timestamp: number): string {
        const currentDate = TimeHelper.timestampToDate(timestamp);
        
        const localYear = TimeHelper.prependLeadingZero(currentDate.toLocaleDateString('en-US', { year: 'numeric'}));
        const localMonth = TimeHelper.prependLeadingZero(currentDate.toLocaleDateString('en-US', { month: '2-digit' }));
        const localDay = TimeHelper.prependLeadingZero(currentDate.toLocaleDateString('en-US', { day: '2-digit' }));
        
        return `${localDay}/${localMonth}/${localYear}`;
    }

    public static getServerFormattedTimestamp(timestamp: number): string {
        const currentDate = TimeHelper.timestampToDate(timestamp);
        
        const localYear = currentDate.toLocaleDateString('en-US', { year: 'numeric'});
        const localMonth = currentDate.toLocaleDateString('en-US', { month: '2-digit' });
        const localDay = currentDate.toLocaleDateString('en-US', { day: '2-digit' });

        const localHour = currentDate.toLocaleTimeString('hr', { hour: '2-digit' });
        const localMinute = currentDate.toLocaleTimeString('hr', { minute: '2-digit' });
        const localSecond = currentDate.toLocaleTimeString('hr', { second: '2-digit' });

        return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}:${localSecond}`;
    }

    public static async delay(delayMiliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delayMiliseconds));
    }

    private static timestampToDate(timestamp: number): Date {
        return new Date(timestamp);
    }

    private static prependLeadingZero(datePart: string): string {
        return datePart.length === 1
            ? `0${datePart}`
            : datePart;
    }
}
