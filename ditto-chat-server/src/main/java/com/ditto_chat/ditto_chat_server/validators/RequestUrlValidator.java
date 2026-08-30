package com.ditto_chat.ditto_chat_server.validators;

public class RequestUrlValidator extends GeneralValidator {
    private static final short MINIMUM_ALLOWED_SEARCH_FILTER_LENGTH = 0;
    private static final short INITIAL_PAGE_NUMBER = 0;

    public static void validateSearchFilter(String searchFilterValue) {
        boolean isSearchFilterValid = searchFilterValue != null && MINIMUM_ALLOWED_SEARCH_FILTER_LENGTH <= searchFilterValue.trim().length();
        if (isSearchFilterValid == false) {
            throwValidationException(String.format("SearchFilterValue validation has failed in validateSearchFilter for searchFilterValue=%s", searchFilterValue));
        }
    }

    public static void validatePageNumber(Integer pageNumber) {
        boolean isPageNumberValid = pageNumber != null && INITIAL_PAGE_NUMBER <= pageNumber.intValue();
        if (isPageNumberValid == false) {
            throwValidationException(String.format("PageNumber validation has failed in validatePageNumber for pageNumber=%s", pageNumber));
        }
    }
}
