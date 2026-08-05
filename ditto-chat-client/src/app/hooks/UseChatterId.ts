import { useParams } from "react-router-dom";
import { useAppSelector } from "../store/ReduxStore";

export default function useChatterId(): string | null {
    const { chatterId } = useParams();
    const { chatter } = useAppSelector(state => state.chatterSlice);

    if (chatterId !== undefined) {    // This is case on Mobile and Tablet Devices where chatterId is present in URL (/chatter/chatterId)
        return chatterId;
    } else if (chatter !== null) {   // This is case on PC devices where chatter is on /home Page, and no chatterId is in the URL
        return chatter.getChatterOverview().getId();
    } else {
        return null;
    }
}
