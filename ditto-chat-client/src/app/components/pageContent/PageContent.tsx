import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import ServerResponseErrorCard from "../serverResponseErrorCard/ServerResponseErrorCard";
import "./PageContent.css";

interface Props {
    regularPageContent: React.JSX.Element,
    isLoadingPage: boolean,
    didUnhandledServerErrorOccur: boolean,
    showResponseErrorCard: boolean
}

const SERVER_ERROR_OCCURED_TEXT = "Error occurred on the Server";
export default function PageContent(props: Props) {
    if (props.isLoadingPage === true) {
        return <div className="page-content-loading-spinner-container">
            <LoadingSpinner />
        </div>
    } else if (props.didUnhandledServerErrorOccur === true) {
        if (props.showResponseErrorCard === true) {
            return <div className="page-content-server-response-error-card-container">
                <ServerResponseErrorCard />
            </div>
        } else {
            return <div className="page-content-server-response-error-component-container">
                <div className="regular-faded-text">{SERVER_ERROR_OCCURED_TEXT}</div>
            </div>
        }
    } else {
        return props.regularPageContent;
    }
}
