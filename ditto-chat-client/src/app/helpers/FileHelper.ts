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
            console.error(`An error occurred while reading the image: ${JSON.stringify(err)}!`);
            return null;
        } finally {
            streamReader.releaseLock();
        }

        return new Blob(blobParts, { type: CONSTANTS.CONTENT_TYPE_STREAM });
    }
}
