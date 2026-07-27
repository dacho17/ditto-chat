export default class TimeHelper {
    public static getCurrentTimestamp(): number {
        return Date.now();
    }

    public static dateStringToTimestamp(dateString: string): number {
        const date = new Date(dateString);
        return date.getTime();
    }

    public static timestampToDate(timestamp: number): Date {
        return new Date(timestamp);
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

    public static getLocalTimeAndDate(timestamp: number): { localTime: string, localDate: string} {
        const timestampDate = TimeHelper.timestampToDate(timestamp);
        const localTime = timestampDate.toLocaleTimeString();
        const localDate = timestampDate.toLocaleDateString();

        return { localTime: localTime, localDate: localDate };
    }

    public static getServerFormattedCurrentTimestamp(): string {
        const currentDate = TimeHelper.timestampToDate(TimeHelper.getCurrentTimestamp());
        
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
}
