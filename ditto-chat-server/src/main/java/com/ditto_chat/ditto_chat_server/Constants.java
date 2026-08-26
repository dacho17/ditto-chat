package com.ditto_chat.ditto_chat_server;

public final class Constants {
    private Constants() {}

    public static final String REGISTER_URL = "/register";
    public static final String LOGIN_URL = "/login";
    public static final String FORGOT_PASSWORD_URL = "/forgot-password";
    public static final String RESET_PASSWORD_URL = "/reset-password";
    public static final String LOGOUT_URL = "/logout";
    public static final String HOME_URL = "/home";
    public static final String CHATTERS_URL = "/chatters";
    public static final String CHAT_URL = "/chat";
    public static final String CHATTER_URL = "/chatter";

    public static final int NUMBER_OF_ITEMS_PER_PAGE = 10;
	public static final String PAGE_NOT_FOUND_ERROR_MESSAGE = "You requested information which does not exist";
    public static final int NUMBER_OF_PARTICIPANTS_IN_NON_GROUP_CHAT_THREAD = 2;
}
