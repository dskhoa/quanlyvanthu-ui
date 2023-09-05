import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

const InputField = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    let Comp = 'input';

    const toggle = () => {
        setShowPassword(!showPassword);
    };

    const setTypes = () => {
        const inputName = props.name;
        if (inputName === 'password') {
            return !showPassword ? 'password' : 'text';
        } else if (inputName === 'email') {
            return 'email';
        } else if (inputName === 'date') {
            return 'date';
        } else if (inputName === 'datetime-local') {
            return 'datetime-local';
        } else if (inputName === 'radio') {
            return 'radio';
        } else {
            return 'text';
        }
    };

    if (props.textarea) {
        Comp = 'textarea';
    }

    return (
        <div className="relative rounded-md">
            <Comp
                id={props.id}
                className={props.className}
                type={setTypes()}
                value={props.value}
                placeholder={props.placeholder}
                onChange={(e) => props.setValue(e.target.value)}
                onBlur={props.onBlur}
                rows={props.rows}
                cols={props.cols}
                checked={props.checked}
                autoComplete="on"
                min={props.min}
            />
            <div
                onClick={toggle}
                className={
                    props.name === 'password'
                        ? 'absolute top-[50%] translate-y-[-50%] right-[16px] p-[10px] cursor-pointer'
                        : 'hidden'
                }
            >
                <FontAwesomeIcon icon={!showPassword ? faEyeSlash : faEye} />
            </div>
        </div>
    );
};

export default InputField;
