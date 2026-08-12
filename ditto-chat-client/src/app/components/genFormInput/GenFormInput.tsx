import { type HTMLInputTypeAttribute, useRef } from 'react';
import './GenFormInput.css';

interface FormInput {
    name: string;
    placeholder: string;
    inputState: GenFormInputState;
    setInputStateFn: React.Dispatch<React.SetStateAction<GenFormInputState>>;
    inputType: HTMLInputTypeAttribute;
    isDisabled: boolean;
    validationFn?: Function;
    errMsg?: string;
}

export type GenFormInputState = {
    entered: string;
    isValid: boolean;
    isTouched: boolean;
}

export const INITIAL_GEN_FORM_INPUT_STATE = {
    entered: "",
    isValid: false,
    isTouched: false,
} as GenFormInputState;

export default function GenFormInput(props: FormInput) {
    const inputRef = useRef<HTMLInputElement>(null);

    function onInputChanged(event: { target: HTMLInputElement; }, didBlur: boolean) {
        props.setInputStateFn((prevState: GenFormInputState): GenFormInputState => {
            return {
                entered: event.target.value,
                isValid: props.validationFn ? props.validationFn(event.target.value) : true,
                isTouched: prevState.isTouched || didBlur
            }
        });
    }

    const isInputInvalid =
        props.validationFn !== undefined
        && props.inputState.isValid === false
        && props.inputState.isTouched === true
        && props.errMsg !== undefined;

    const invalidInputClass = isInputInvalid === true ? "invalid-input" : "";
    return (
        <div className="gen-form-input">
            <div className={`gen-form-input-content ${invalidInputClass}`}>
                <input
                    className="gen-form-input-value"
                    ref={inputRef}
                    name={props.name}
                    type={props.inputType}
                    value={props.inputState.entered}
                    disabled={props.isDisabled}
                    onChange={(event) => onInputChanged(event, false)}
                    onBlur={(event) => onInputChanged(event, true)} />
                <label 
                    className="gen-form-input-placeholder"
                    htmlFor={props.name}
                    onClick={() => inputRef.current!.focus()}
                    >
                        {props.placeholder}
                </label>
            </div>
            { isInputInvalid === true && <span className="gen-form-input-error-msg">{props.errMsg}</span> }
        </div>
    );
}
