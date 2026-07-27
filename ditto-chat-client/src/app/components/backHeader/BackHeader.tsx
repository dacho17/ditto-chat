import { ReactNode } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import IconButton from "../iconButton/IconButton";
import CONSTANTS from "../../../Constants";
import "./BackHeader.css";

interface Props {
    onClickFunction: Function;
    backHeaderContent: ReactNode;
}

export default function BackHeader(props: Props) {
    return <div className="back-header">
        <div className="back-header-back-button-container">
            <IconButton
                icon={<IoArrowBackOutline size={CONSTANTS.ICON_SIZE} /> }
                onClick={() => props.onClickFunction()}
            />
        </div>        
        <div className="back-header-content-container">
            {props.backHeaderContent}
        </div>
    </div>
}
