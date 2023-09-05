import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import * as userServices from '~/services/userServices';
import { passwordValidator } from '~/utils/formValidation';
import { successNotify, errorNotify } from '../ToastMessage';
import Loading from '../Loading';

const ChangePasswordForm = ({ setShowChangePassword }) => {
    const [loading, setLoading] = useState(false);
    // Input state
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Input validation state
    const [oldPasswordErrMsg, setOldPasswordErrMsg] = useState({});
    const [passwordErrMsg, setPasswordErrMsg] = useState({});
    const [confirmPasswordErrMsg, setConfirmPasswordErrMsg] = useState({});
    const [isOldPasswordErr, setIsOldPasswordErr] = useState(false);
    const [isPasswordErr, setIsPasswordErr] = useState(false);
    const [isConfirmPasswordErr, setIsConfirmPasswordErr] = useState(false);

    // Change password function
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isOldPasswordValid = passwordValidator(
            oldPassword,
            oldPassword,
            setIsOldPasswordErr,
            setOldPasswordErrMsg,
        );
        const isPasswordValid = passwordValidator(password, password, setIsPasswordErr, setPasswordErrMsg);
        const isConfirmPasswordValid = passwordValidator(
            confirmPassword,
            password,
            setIsConfirmPasswordErr,
            setConfirmPasswordErrMsg,
        );

        if (!isOldPasswordValid || !isPasswordValid || !isConfirmPasswordValid) return;
        setLoading(true);
        const data = {
            oldPassword: oldPassword,
            newPassword: password,
        };
        const res = await userServices.changePassword(data);
        if (res.code === 200) {
            setLoading(false);
            successNotify(res.message);
            setShowChangePassword(false);
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    return (
        <>
            <div
                onClick={() => setShowChangePassword(false)}
                className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[0.3]"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-[330px] md:w-[450px] h-fit bg-white p-[36px] rounded-md shadow-4Way animate-fadeIn"
                >
                    <h1 className="text-[#9fa9ae] text-center italic text-[4.6rem] font-semibold">
                        QLVB <span className="text-[2.4rem]">v1.0</span>
                    </h1>
                    <h1 className="text-[#9fa9ae] text-center text-[2.0rem] font-medium mb-16">Đổi mật khẩu</h1>
                    <form>
                        <InputField
                            className={isOldPasswordErr ? 'invalid' : 'default'}
                            name="password"
                            placeholder="Mật khẩu cũ"
                            value={oldPassword}
                            setValue={setOldPassword}
                            onBlur={() =>
                                passwordValidator(oldPassword, oldPassword, setIsOldPasswordErr, setOldPasswordErrMsg)
                            }
                        />
                        <p className="text-red-600 text-[1.3rem]">{oldPasswordErrMsg.oldPassword}</p>
                        <div className="mt-7">
                            <InputField
                                className={isPasswordErr ? 'invalid' : 'default'}
                                name="password"
                                placeholder="Mật khẩu mới"
                                value={password}
                                setValue={setPassword}
                                onBlur={() =>
                                    passwordValidator(password, password, setIsPasswordErr, setPasswordErrMsg)
                                }
                            />
                            <p className="text-red-600 text-[1.3rem]">{passwordErrMsg.newPassword}</p>
                        </div>
                        <div className="mt-7">
                            <InputField
                                className={isConfirmPasswordErr ? 'invalid' : 'default'}
                                name="password"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                setValue={setConfirmPassword}
                                onBlur={() =>
                                    passwordValidator(
                                        confirmPassword,
                                        password,
                                        setIsConfirmPasswordErr,
                                        setConfirmPasswordErrMsg,
                                    )
                                }
                            />
                            <p className="text-red-600 text-[1.3rem]">{confirmPasswordErrMsg.confirmPassword}</p>
                        </div>
                        <div className="flex justify-center items-center gap-5">
                            <button
                                onClick={handleSubmit}
                                className="w-full text-[white] bg-[#321fdb] mt-12 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} /> Lưu
                            </button>
                            <button
                                onClick={() => setShowChangePassword(false)}
                                className="w-full text-[white] bg-red-600 mt-12 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                            >
                                <FontAwesomeIcon icon={faXmark} /> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {loading && (
                <div className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[.15] z-[999]">
                    <Loading />
                </div>
            )}
        </>
    );
};

export default ChangePasswordForm;
