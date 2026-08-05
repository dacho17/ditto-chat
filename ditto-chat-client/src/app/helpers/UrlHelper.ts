import CONSTANTS from "../../Constants";

const INITIAL_SEARCH_FILTER_VALUE = "";
const INITIAL_PAGE_NUMBER_VALUE = "0";
const QUERY_PARAMTER_DELIMITER = "?";

export default class UrlHelper {
    public static constructInitialHomePageQueryParams(queryParams: URLSearchParams): URLSearchParams {
        const homePageInitQueryParams = new URLSearchParams();
        homePageInitQueryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER,
            queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER) || INITIAL_SEARCH_FILTER_VALUE
        );
        
        homePageInitQueryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER,
            queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER) || INITIAL_PAGE_NUMBER_VALUE
        );

        return homePageInitQueryParams;
    }

    public static constructInitialChattersPageQueryParams(queryParams: URLSearchParams): URLSearchParams {
        const chattersPageInitQueryParams = new URLSearchParams();
        chattersPageInitQueryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER,
            queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER) || INITIAL_SEARCH_FILTER_VALUE
        );
        
        chattersPageInitQueryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER,
            queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER) || INITIAL_PAGE_NUMBER_VALUE
        );

        return chattersPageInitQueryParams;
    }

    public static doOldAndNewUrlDifferOnlyInQueryParams(newUrl: string, lastLoggedUrl: string): boolean {
        const newUrlParts = newUrl.split(QUERY_PARAMTER_DELIMITER);
        const lastLoggedUrlParts = lastLoggedUrl.split(QUERY_PARAMTER_DELIMITER);

        // if no queryParams appear within a url (no ? char), parts will have only one element. The entire url
        if (newUrlParts.length === 1 || lastLoggedUrlParts.length === 1) {
            return false;
        }

        // base urls differ
        if (newUrlParts[0] !== lastLoggedUrlParts[0]) {
            return false;
        }

        return true;
    }
}
