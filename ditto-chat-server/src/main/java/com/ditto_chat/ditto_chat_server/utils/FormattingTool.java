package com.ditto_chat.ditto_chat_server.utils;

import java.io.PrintWriter;
import java.io.StringWriter;

public class FormattingTool {
    public static String stringifyException(Exception e) {
        if (e == null) return "";
        
        String stackTrace = getStackTraceAsString(e);
        String exceptionMessage = e.getMessage();

        return String.format("Exception=\n{Message:%s\nStackTrace:%s\n}\n", exceptionMessage, stackTrace);
    }

	private static String getStackTraceAsString(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        
        return sw.toString();
    }
}
