import { ReactNode } from "react";
import SideMenu from "../../components/sideMenu/SideMenu";
import "./PageWithSideMenu.css";

interface Props {
    mainPage: ReactNode
}

export default function PageWithSideMenu(props: Props) {
    return <div className="page-with-side-menu">
        <div className="side-menu-container">
            <SideMenu />
        </div>
        <div className="page-with-side-menu-main-page-container">
            {props.mainPage}
        </div>
    </div>
}
