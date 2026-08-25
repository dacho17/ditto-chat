package com.ditto_chat.ditto_chat_server.helpers;

import java.util.List;

import com.ditto_chat.ditto_chat_server.Constants;

public class EntityPaginationHelper {
    // if there exist at least one entry more than the maximum possible number of entries which can appear on the pages, the page is not last
    public static <T> boolean isLastEntityPage(List<T> pagedEntityList, Integer pageNumber, Boolean isInitialRetrieval) {
        Integer numberOfPagedEntries = pagedEntityList.size();
        if (isInitialRetrieval == true) {
            return numberOfPagedEntries != (pageNumber + 1) * Constants.NUMBER_OF_ITEMS_PER_PAGE + 1;
        } else {
            return numberOfPagedEntries != Constants.NUMBER_OF_ITEMS_PER_PAGE + 1;
        }
    }

    public static <T> void removeAdditionalEntityOnPage(List<T> pagedEntityList, Integer pageNumber, Boolean isInitialRetrieval) {
        if (pagedEntityList.size() == 0) {
            return;
        }

        if (isLastEntityPage(pagedEntityList, pageNumber, isInitialRetrieval) == false) {
            pagedEntityList.removeLast();
        }        
    }

    public static <T> boolean doesEntityPageExist(List<T> pagedEntityList, Integer pageNumber, Boolean isInitialRetrieval) {
        if (pagedEntityList.size() == 0 && pageNumber != 0) {
            return false;
        } else if (pagedEntityList.size() == 0 && pageNumber == 0) {
            return true;
        }

        // cases when list has at least one entry
        if (isInitialRetrieval == false) {
            return 0 < pagedEntityList.size()
                && pagedEntityList.size() <= Constants.NUMBER_OF_ITEMS_PER_PAGE;
        } else {
            return pageNumber * Constants.NUMBER_OF_ITEMS_PER_PAGE < pagedEntityList.size()
                && pagedEntityList.size() <= (pageNumber + 1) * Constants.NUMBER_OF_ITEMS_PER_PAGE;
        }
    }
}
