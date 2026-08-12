import './CtaButton.css';

interface Props {
    label: string;
    actionFn: Function;
    isDisabled: boolean;
}

export default function CtaButton(props: Props) {
    return (
        <button
            className="cta-button"
            type='button'
            disabled={props.isDisabled}
            onClick={(event: any) => props.actionFn(event)}>
              {props.label}
        </button>
    );
}
