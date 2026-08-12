import "./AuthenticationForm.css";

interface Props {
    formTitle: string;
    inputGroups: React.JSX.Element,
    submitFormButton: React.JSX.Element,
    formLinks: React.JSX.Element
}

export default function AuthenticationForm(props: Props) {
    return <div className="authentication-form">
        <div className="authentication-form-title">{props.formTitle}</div>
        <form className="authentication-form-content">
            <div className="authentication-form-input-groups-container">
                {props.inputGroups}
            </div>
            <div className="authentication-form-submit-button-row">
                <div className="authentication-form-submit-button-container">
                    {props.submitFormButton}
                </div>
            </div>
            <div className="authentication-form-links-container">
                {props.formLinks}
            </div>
        </form>
    </div>
}
