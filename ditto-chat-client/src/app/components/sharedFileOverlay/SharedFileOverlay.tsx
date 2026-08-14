import { useEffect, useRef, useState } from "react";
import { IoCloseOutline, IoDownloadOutline } from "react-icons/io5";
import { AiOutlineFilePdf } from "react-icons/ai";
import { GrDocumentTxt } from "react-icons/gr";
import { useAppDispatch } from "../../store/ReduxStore";
import useSharedFileOverlayInfo from "../../hooks/UseSharedFileOverlayInfo";
import IconButton from "../iconButton/IconButton";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import TimeHelper from "../../helpers/TimeHelper";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import { SharedFileType } from "../../enums/SharedFileType";
import CONSTANTS from "../../../Constants";
import "./SharedFileOverlay.css";

export default function SharedFileOverlay() {
    const [sharedFileOverlayInfo, setSharedFileInOverlay] = useSharedFileOverlayInfo();
    const dispatch = useAppDispatch();
    const [isInitialClick, setIsInitialClick] = useState(true);
    const sharedFileImageContainerRef = useRef(null);
    const sharedFileOverlayHeaderRef = useRef(null);

    useEffect(() => {
        if (isInitialClick === true) {  // delaying adding EventListener not to get immediately when the SharedFileButton is Clicked!
            setIsInitialClick(false);
            return;
        }

        document.addEventListener("click", closeSharedFileOverlayOnBackgroundClick);
        return () => document.removeEventListener("click", closeSharedFileOverlayOnBackgroundClick);
    }, [isInitialClick]);

    function closeSharedFileOverlayOnBackgroundClick(event: PointerEvent): void {
        if (
            sharedFileImageContainerRef.current !== null && !sharedFileImageContainerRef.current.contains(event.target) &&
            sharedFileOverlayHeaderRef.current !== null && !sharedFileOverlayHeaderRef.current.contains(event.target)
        ) {
            // Close if the click target is completely outside the ref element (non-image Container area of the screen)
            closeSharedFileOverlay();
        }
    }

    function closeSharedFileOverlay(): void {
        dispatch(setSharedFileInOverlay(null));
    }

    function onDownloadButtonClick(): void {
        const sharedFileDownloadHTMLElement = document.getElementById("shared-file-overlay-download-anchor") as HTMLAnchorElement;
        sharedFileDownloadHTMLElement.click();
    }

    function getFileSharedAtTime(): string {
        const localTimeOfDay = TimeHelper.timestampToLocalTimeOfDay(sharedFileOverlayInfo.sharedFile.getFileSharedAtTimestamp());
        const localCalendarDay = TimeHelper.timestampToLocalCalendarDay(sharedFileOverlayInfo.sharedFile.getFileSharedAtTimestamp());
        return `${localTimeOfDay} ${localCalendarDay}`;
    }

    function getIconSize(): number {
        // Image Size is also set in CSS Style of this Component to the same values
        const MOBILE_SCREEN_OVERLAY_IMAGE_SIZE = 200;
        const NON_MOBILE_SCREEN_OVERLAY_IMAGE_SIZE = 400;
        return DeviceScreenHelper.isMobileScreen() === true
            ? MOBILE_SCREEN_OVERLAY_IMAGE_SIZE : NON_MOBILE_SCREEN_OVERLAY_IMAGE_SIZE;
    }

    function getFileSharedImageUrl(): React.JSX.Element {
        if (sharedFileOverlayInfo.sharedFile.getFileType() === SharedFileType.TXT) {
            return <GrDocumentTxt size={getIconSize()} className="alert" />
        } else if (sharedFileOverlayInfo.sharedFile.getFileType() === SharedFileType.PDF) {
            return <AiOutlineFilePdf size={getIconSize()} className="alert" />
        } else {
            return <img className="shared-file-overlay-file-image" src={sharedFileOverlayInfo.sharedFile.getFileUrl()} />
        }
    }

    return <div className="shared-file-overlay">
        <div className="shared-file-overlay-content">
            <div
                className="shared-file-overlay-header"
                ref={sharedFileOverlayHeaderRef}
            >
                <div className="shared-file-overlay-header-sender-info">
                    <div className="shared-file-overlay-header-sender-icon">
                        <ChatterIcon
                            chatterFullName={sharedFileOverlayInfo.sharedFileSender.getChatterFullName()}
                            chatterImageUrl={sharedFileOverlayInfo.sharedFileSender.getChatterImageUrl()}
                            isOnline={sharedFileOverlayInfo.sharedFileSender.getIsChatterOnline()}
                            isShownAsAccountImage={false}
                        />
                    </div>
                    <div className="shared-file-overlay-header-sender-details">
                        <div className="bold-text handle-overflow">
                            {sharedFileOverlayInfo.sharedFileSender.getChatterFullName()}
                        </div>
                        <div className="regular-faded-text">
                            {getFileSharedAtTime()}
                        </div>
                    </div>
                </div>
                <div className="shared-file-overlay-header-options">
                    <IconButton
                        key={`shared-file-overlay-header-download-option`}
                        icon={<IoDownloadOutline size={CONSTANTS.LARGER_ICON_SIZE} />}
                        onClick={() => onDownloadButtonClick()}
                    />
                    { DeviceScreenHelper.isMobileScreen() === true
                        ? <div className="margin-left-1" /> : <div className="margin-left-2" />
                    }
                    <IconButton
                        key={`shared-file-overlay-header-close-option`}
                        icon={<IoCloseOutline size={CONSTANTS.LARGER_ICON_SIZE} />}
                        onClick={() => closeSharedFileOverlay()}
                    />
                    <a id="shared-file-overlay-download-anchor" href={sharedFileOverlayInfo.sharedFile.getFileUrl()} download />
                </div>
            </div>
            <div className="shared-file-overlay-file-container">
                <div
                    className="shared-file-overlay-file-image-container"
                    ref={sharedFileImageContainerRef}
                >
                    { getFileSharedImageUrl()}
                </div>
            </div>
        </div>
    </div>
}
