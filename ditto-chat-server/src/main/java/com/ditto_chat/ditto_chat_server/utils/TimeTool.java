package com.ditto_chat.ditto_chat_server.utils;

import java.sql.Timestamp;

public class TimeTool {
    private static final long MINUTES_TO_MS_MULTIPLIER = 60000;
    
    public static Timestamp getCurrentTimestamp() {
		return new Timestamp(System.currentTimeMillis());
	}

    public static Timestamp addMinutesToTimestamp(Timestamp timestamp, int minutesToAdd) {
        long currentTimestampInMs = timestamp.getTime();
        long minutesToAddInMs = minutesToAdd * MINUTES_TO_MS_MULTIPLIER;

        return new Timestamp(currentTimestampInMs + minutesToAddInMs);
    }

    public static boolean areTimestampsEqual(Timestamp first, Timestamp second) {
        if (first == null || second == null) {
            return false;
        }
        
        return first.getTime() == second.getTime();
    }
}
