import { getSharedFiles, setCurrentSharedFilesListPage, setIsLoadingOlderSharedFiles } from "../../store/ChatterSlice";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import useChatterId from "../../hooks/UseChatterId";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import SharedFileButton from "../sharedFileButton/SharedFileButton";
import SharedFileOverlay from "../sharedFileOverlay/SharedFileOverlay";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import "./SharedFilesList.css";

const SHARED_FILES_TITLE = "Shared Files";

export default function SharedFilesList() {
    const { chatter, currentSharedFilesListPage, isLastSharedFilesListPage, isLoadingOlderSharedFiles, chatterSharedFileInOverlay }
        = useAppSelector(state => state.chatterSlice);
    const dispatch = useAppDispatch();
    const chatterId = useChatterId();

    async function tryGetOlderSharedFiles(): Promise<void> {
        dispatch(setCurrentSharedFilesListPage(currentSharedFilesListPage + 1));
        dispatch(setIsLoadingOlderSharedFiles(true));

        // TODO-result-caching: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

        try {
            const retrievedOlderSharedFiles = await dispatch(getSharedFiles({ chatterId: chatterId })).unwrap();

            // TODO-result-caching: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            return;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsLoadingOlderSharedFiles(false));
        }
    }

    const filesSharedWithChatter = chatter.getSharedFiles();
    return <div className="shared-files-list">
        <div className="shared-files-list-title bold-text">
            {SHARED_FILES_TITLE}
        </div>
        <div className="shared-files-list-files-container">
            <div className="shared-files-list-files">
                { filesSharedWithChatter.map(sharedFile => {
                    return <>
                        <div className="margin-bottom-1 margin-right-1">
                            <SharedFileButton
                                key={sharedFile.getFileUrl()}
                                sharedFile={sharedFile}
                                isShownInChatThreadMessage={false}
                            />
                        </div>
                    </>
                })}
                { chatterSharedFileInOverlay !== null && <SharedFileOverlay />}
            </div>
            { isLastSharedFilesListPage === false
                ? isLoadingOlderSharedFiles === true
                    ? <LoadingSpinner />
                    : <div className='shared-files-list-indicator-row margin-top-1'>
                        <ShowMoreButton
                            showMoreFunc={tryGetOlderSharedFiles}
                            isDirectionUpwards={false}
                        />
                    </div>
                : <></>
            }
        </div>
    </div>
}
