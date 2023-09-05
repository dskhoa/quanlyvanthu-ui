import { useNavigate } from 'react-router-dom';
import * as authServices from '~/services/authServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';

const BlockPage = () => {
    const navigate = useNavigate();

    // Sign out function
    const handleSignOut = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return;
        const data = {
            token: refreshToken,
        };
        const res = await authServices.signOut(data);
        if (res.code === 200) {
            localStorage.clear();
            successNotify(res.message);
            navigate('/signin');
        } else {
            errorNotify(res);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <section className="bg-white">
                <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                    <div className="mx-auto max-w-screen-sm text-center">
                        <h1 className="mb-4 text-[7.2rem] leading-[1] tracking-tight font-extrabold md:text-[12rem] text-red-600">
                            403
                        </h1>
                        <p className="mb-4 text-[2.6rem] tracking-tight font-bold text-gray-900 md:text-[4.2rem]">
                            Truy cập bị từ chối.
                        </p>
                        <p className="mb-4 text-[1.5rem] md:text-[1.8rem] font-light text-gray-500">
                            Xin lỗi, tài khoản của bạn tạm thời bị vô hiệu hóa.
                        </p>
                        <div
                            onClick={handleSignOut}
                            className="inline-block text-white bg-red-600 hover:bg-[#1b2e4b] font-medium rounded-lg text-[1.5rem] md:text-[1.8rem] px-6 py-3 text-center mt-8 transition-all duration-[1s] cursor-pointer"
                        >
                            Đăng xuất ngay
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlockPage;
