import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import IconButton from "../iconButton/IconButton";
import CONSTANTS from "../../../Constants";
import "./BackHeader.css";

interface Props {
    backTargetUrl: string;
    backHeaderContent: ReactNode;
}

export default function BackHeader(props: Props) {
    const navigate = useNavigate();

    return <div className="back-header">
        <div className="back-header-back-button-container">
            <IconButton
                icon={<IoArrowBackOutline size={CONSTANTS.ICON_SIZE} /> }
                onClick={() => navigate(props.backTargetUrl)}
            />
        </div>        
        <div className="back-header-content-container">
            {props.backHeaderContent}
        </div>
    </div>
}
