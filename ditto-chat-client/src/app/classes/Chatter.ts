import ChatterOverview from "./ChatterOverview";
import SharedFile from "./SharedFile";

export default class Chatter {
    private chatterOverview: ChatterOverview;
    private sharedFiles: SharedFile[];

    public constructor(
        chatterOverview: ChatterOverview,
        sharedFiles: SharedFile[]
    ) {
        this.chatterOverview = chatterOverview;
        this.sharedFiles = sharedFiles;
    }

    public getChatterOverview(): ChatterOverview {
        return this.chatterOverview;
    }

    public getSharedFiles(): SharedFile[] {
        return this.sharedFiles;
    }

    public setSharedFiles(sharedFiles: SharedFile[]): void {
        this.sharedFiles = sharedFiles;
    }

    public static getShallowCopy(chatter: Chatter): Chatter {
        return new Chatter(
            chatter.getChatterOverview(),
            chatter.getSharedFiles()
        );
    }
}
