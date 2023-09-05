import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import InputField from '~/components/InputField';
import * as authServices from '~/services/authServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { emailValidator } from '~/utils/formValidation';
import Loading from '~/components/Loading';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    // Input state
    const [email, setEmail] = useState('');
    // Input validation state
    const [emailErrMsg, setEmailErrMsg] = useState({});
    const [isEmailErr, setIsEmailErr] = useState(false);

    // Send email to reset password
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmailValid = emailValidator(email, setIsEmailErr, setEmailErrMsg);

        if (!isEmailValid) return;
        setLoading(true);
        const data = {
            email: email,
        };
        const res = await authServices.forgotPassword(data);
        if (res.code === 200) {
            localStorage.setItem('resetToken', res.resetToken);
            setLoading(false);
            successNotify(res.message);
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center w-screen h-screen bg-[#ebedef]">
                <div className="w-[330px] md:w-[450px] h-fit bg-white p-[36px] rounded-md shadow-4Way">
                    <h1 className="text-[#9fa9ae] text-center italic text-[4.6rem] font-semibold">
                        QLVB <span className="text-[2.4rem]">v1.0</span>
                    </h1>
                    <h1 className="text-[#9fa9ae] text-center text-[2.0rem] font-medium mb-16">Quên mật khẩu</h1>
                    <form autoComplete="on">
                        <InputField
                            id="email"
                            className={isEmailErr ? 'invalid' : 'default'}
                            name="email"
                            placeholder="Email"
                            value={email}
                            setValue={setEmail}
                            onBlur={() => emailValidator(email, setIsEmailErr, setEmailErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{emailErrMsg.email}</p>
                        <div className="mt-7 text-right">
                            <NavLink className="hover:underline" to="/signin">
                                {'<<'} Trở về đăng nhập
                            </NavLink>
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="w-full text-[white] bg-[#321fdb] mt-10 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            Gửi
                        </button>
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

export default ForgotPassword;
