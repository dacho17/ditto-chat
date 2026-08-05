import { useParams } from "react-router-dom";

export default function useChatThreadIdParam(): string | null {
    const { chatThreadId } = useParams();

    if (chatThreadId === null || chatThreadId === undefined) {
        return null;
    }

    return chatThreadId;
}
