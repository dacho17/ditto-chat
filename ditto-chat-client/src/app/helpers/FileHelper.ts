import CONSTANTS from "../../Constants";

export default class FileHelper {
    public static async createBlobFromStream(fileContentStream: ReadableStream): Promise<Blob | null> {
        const streamReader = fileContentStream.getReader();
        const blobParts = [];

        try {
            for (; true ;) {
                const { done, value } = await streamReader.read();
                if (done === true) {
                    break;
                }

                blobParts.push(value);
            }
        } catch(err) {
            console.log("TODO: handle error occuring during File Stream Reading");
            return null;
        } finally {
            streamReader.releaseLock();
        }

        return new Blob(blobParts, { type: CONSTANTS.CONTENT_TYPE_STREAM });
    }
}
