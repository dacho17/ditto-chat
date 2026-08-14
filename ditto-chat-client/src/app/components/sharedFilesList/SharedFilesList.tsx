import { getSharedFiles, setCurrentSharedFilesListPage, setIsLoadingOlderSharedFiles } from "../../store/ChatterSlice";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import SharedFileButton from "../sharedFileButton/SharedFileButton";
import SharedFileOverlay from "../sharedFileOverlay/SharedFileOverlay";
import ShowMoreButton from "../showMoreButton/ShowMoreButton";
import Chatter from "../../classes/Chatter";
import "./SharedFilesList.css";

interface Props {
    selectedChatter: Chatter
}

const SHARED_FILES_TITLE = "Shared Files";
export default function SharedFilesList(props: Props) {
    const { currentSharedFilesListPage, isLastSharedFilesListPage, isLoadingOlderSharedFiles, chatterSharedFileInOverlay }
        = useAppSelector(state => state.chatterSlice);
    const dispatch = useAppDispatch();
    const [sendTryToGetOlderSharedFiles, _] = useTryToSendRequest<null>();

    async function tryToGetOlderSharedFiles(): Promise<void> {
        await sendTryToGetOlderSharedFiles(async () => {
            dispatch(setCurrentSharedFilesListPage(currentSharedFilesListPage + 1));
            dispatch(setIsLoadingOlderSharedFiles(true));

            // TODO-result-caching: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache
            await dispatch(getSharedFiles({ chatterId: props.selectedChatter.getChatterOverview().getId() })).unwrap();
            // TODO-result-caching: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache

            return null;
        }, () => {
            dispatch(setIsLoadingOlderSharedFiles(false));
        });
    }

    function getNotLastSharedFilesListPageIndicatorComponent(): React.JSX.Element {
        if (isLastSharedFilesListPage === true) {
            return <></>
        }

        return <div className='shared-files-list-indicator-row margin-top-1'>
            { isLoadingOlderSharedFiles === true
                ? <LoadingSpinner />
                : <ShowMoreButton
                    showMoreFunc={tryToGetOlderSharedFiles}
                    isDirectionUpwards={false}
                />
            }
        </div>
    }

    return <div className="shared-files-list">
        <div className="shared-files-list-title bold-text">
            {SHARED_FILES_TITLE}
        </div>
        <div className="shared-files-list-files-container">
            <div className="shared-files-list-files">
                { props.selectedChatter.getSharedFiles().map(sharedFile => {
                    return <>
                        <div 
                            key={`margin-${sharedFile.getFileUrl()}`}
                            className="margin-bottom-1 margin-right-1"
                        >
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
            { getNotLastSharedFilesListPageIndicatorComponent() }
        </div>
    </div>
}
