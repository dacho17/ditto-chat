import { ReactNode } from "react";
import BackHeader from "../../components/backHeader/BackHeader";
import "./PageWithBackHeader.css";

interface Props {
    backOnClickFunction: Function;
    backHeaderContent: ReactNode;
    mainPage: ReactNode;
}

export default function PageWithBackHeader(props: Props) {
    return <div className="page-with-back-header full-screen-height">
        <div className="back-header-container">
            <BackHeader
                onClickFunction={props.backOnClickFunction}
                backHeaderContent={props.backHeaderContent}
            />
        </div>
        <div className="main-page-container">
            {props.mainPage}
        </div>
    </div>
}
