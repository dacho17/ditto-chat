import { UnknownAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../store/ReduxStore";
import { setChatSharedFileInOverlay } from "../store/ChatSlice";
import { setChatterSharedFileInOverlay } from "../store/ChatterSlice";
import ChatterOverview from "../classes/ChatterOverview";
import SharedFile from "../classes/SharedFile";

type SharedFileOverlayInfoType = {
    sharedFile: SharedFile,
    sharedFileSender: ChatterOverview
} | null;

// This custom Hook checks whether sharedFileOverlay was opened in by Clicking a Shared File:
    // a) within ChatThreadMessage, or
    // b) within Shared File List on Chatter Page or within Chatter Side Panel,
// and returns the Shared File and Chatter Information (Read from Chat or Chatter Slice based on a) and b) cases) to be displayed on the SharedFileOverlay Page
export default function useSharedFileOverlayInfo(): [SharedFileOverlayInfoType, (sharedFileOverlayInfo: SharedFileOverlayInfoType) => UnknownAction] {
    const { chatSharedFileInOverlay, chatThread } = useAppSelector(state => state.chatSlice);
    const { chatterSharedFileInOverlay, chatter } = useAppSelector(state => state.chatterSlice);
    const { chatterOverview } = useAppSelector(state => state.authSlice);

    let sharedFileOverlayInfo = null;
    let setSharedFileInOverlayReducer = null;
    if (chatSharedFileInOverlay !== null) {
        const isFileSharedByLoggedInChatter = chatSharedFileInOverlay.getFileSharedByChatterId() === chatterOverview.getId();
        if (isFileSharedByLoggedInChatter === true) {
            sharedFileOverlayInfo = {
                sharedFile: chatSharedFileInOverlay,
                sharedFileSender: chatterOverview
            } as SharedFileOverlayInfoType;
        } else {
            sharedFileOverlayInfo = {
                sharedFile: chatSharedFileInOverlay,
                sharedFileSender: chatThread.getOverview().getChatterOverview()
            } as SharedFileOverlayInfoType;
        }

        setSharedFileInOverlayReducer = setChatSharedFileInOverlay;
    } else {
        const isFileSharedByLoggedInChatter = chatterSharedFileInOverlay.getFileSharedByChatterId() === chatterOverview.getId();
        if (isFileSharedByLoggedInChatter === true) {
            sharedFileOverlayInfo = {
                sharedFile: chatterSharedFileInOverlay,
                sharedFileSender: chatterOverview
            } as SharedFileOverlayInfoType;
        } else {
            sharedFileOverlayInfo = {
                sharedFile: chatterSharedFileInOverlay,
                sharedFileSender: chatter.getChatterOverview()
            } as SharedFileOverlayInfoType;

        }

        setSharedFileInOverlayReducer = setChatterSharedFileInOverlay;
    }

    return [sharedFileOverlayInfo, setSharedFileInOverlayReducer];
}
