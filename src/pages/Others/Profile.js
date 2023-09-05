import { useState, useEffect, useContext, useRef } from 'react';
import FormData from 'form-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import ProfileForm from '~/components/Form/ProfileForm';
import * as authServices from '~/services/authServices';
import * as userServices from '~/services/userServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { UserInfoContext } from '~/App';
import { useFetchTasks } from '~/hooks';
import { formatVNDate } from '~/utils/formatDateTime';

const Profile = ({ socket }) => {
    const [isReqChangeInfo, setIsReqChangeInfo] = useState(true);
    const [isSave, setIsSave] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [currUser, setCurrUser] = useState({});
    const { isChangeUserInfo, setIsChangeUserInfo } = useContext(UserInfoContext);

    const userRole = JSON.parse(localStorage.getItem('userRole'));
    const allTasks = useFetchTasks();
    const ref = useRef();

    // Change avatar function
    const changeAvatar = async (e) => {
        const data = new FormData();
        const file = e.target.files[0];
        data.append('myFile', file);
        if (!file) return;
        const res = await userServices.changeAvatar(data);
        if (res.code === 200) {
            successNotify(res.message);
            setIsChangeUserInfo(!isChangeUserInfo);
        } else {
            errorNotify(res);
        }
    };

    // Remove avatar function
    const handleRemoveAvatar = async () => {
        const confirmMsg = 'Bạn có chắc muốn xóa ảnh nền không?';
        if (!window.confirm(confirmMsg)) return;
        const res = await userServices.removeAvatar(currUser?.avatar?.replace('http://192.168.1.188:8080/static/', ''));
        if (res.code === 200) {
            successNotify(res.message);
            ref.current.value = '';
            setIsChangeUserInfo(!isChangeUserInfo);
        } else {
            errorNotify(res);
        }
    };

    // Get all complete tasks quantity
    const getCompleteTaskQty = () => {
        const qty = allTasks?.filter((item) => item?.progress === 'Hoàn thành');
        return qty;
    };

    // Get complete percentage of all tasks
    const getPercentProgress = () => {
        return `${(getCompleteTaskQty().length / allTasks.length) * 100}%`;
    };

    // Get current user data
    useEffect(() => {
        const fetchApi = async () => {
            const res = await authServices.getCurrUser();
            setCurrUser(res);
            setIsReqChangeInfo(res.isReqChangeInfo);
        };
        fetchApi();
    }, [isSave, isChangeUserInfo]);

    return (
        <>
            <div className="flex flex-col xl:flex-row h-full gap-8">
                <div className="flex flex-col gap-8 w-full xl:w-[320px]">
                    <div className="flex w-full xl:w-[320px] h-[320px] bg-white shadow-4Way">
                        <div className="m-auto">
                            <label className="label">
                                <input
                                    className="hidden"
                                    ref={ref}
                                    disabled={currUser?.avatar === '' ? false : true}
                                    type="file"
                                    name="myFile"
                                    onChange={(e) => changeAvatar(e)}
                                />
                                <figure className="relative w-[200px] h-[200px]">
                                    <img
                                        src="https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg"
                                        className="w-[200px] h-[200px] box-border rounded-full border-2 border-solid border-[#ccc] shadow-md transition-all hover:shadow-xl cursor-pointer"
                                        alt="avatar"
                                    />
                                    <figcaption className="flex cursor-pointer absolute top-0 w-full h-full rounded-full transition-all bg-[#000] opacity-0 hover:bg-[#000] hover:opacity-40">
                                        <img
                                            className="w-[50px] h-[50px] m-auto"
                                            src="https://raw.githubusercontent.com/ThiagoLuizNunes/angular-boilerplate/master/src/assets/imgs/camera-white.png"
                                            alt=""
                                        />
                                    </figcaption>
                                    <div
                                        className={
                                            currUser?.avatar !== ''
                                                ? 'group absolute top-0 w-[200px] h-[200px]'
                                                : 'hidden'
                                        }
                                    >
                                        <img
                                            src={currUser?.avatar}
                                            className="absolute top-0 w-full h-full box-border rounded-full border-2 border-solid border-[#ccc] shadow-md transition-all hover:shadow-xl"
                                            alt="avatar"
                                        />
                                        <div
                                            onClick={handleRemoveAvatar}
                                            className="absolute top-0 right-0 hidden text-[2rem] group-hover:block cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </div>
                                    </div>
                                </figure>
                            </label>
                        </div>
                    </div>
                    <div className="w-full xl:w-[320px] h-fit bg-white p-[12px] shadow-4Way">
                        <div>
                            <h1 className="text-[2.2rem] font-bold mb-7">Tất cả nhiệm vụ</h1>
                            <h3 className="text-[1.4rem] font-semibold">Mức độ hoàn thành</h3>
                            <div className="w-full bg-gray-200 rounded-full mt-3">
                                <div
                                    title={getPercentProgress() !== 'NaN%' ? getPercentProgress() : '100%'}
                                    style={{ width: getPercentProgress() }}
                                    className={`bg-blue-600 text-[1.4rem] font-medium text-blue-100 text-center p-4 leading-none rounded-full`}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-9">
                                <div>
                                    <h3 className="text-[1.4rem] text-white px-2 rounded-xl bg-[#cccccc]">
                                        {userRole === 'Member' ? 'Được giao' : 'Đã tạo'}
                                    </h3>
                                    <p className="font-semibold text-[#cccccc] text-center">{allTasks.length}</p>
                                </div>
                                <div>
                                    <h3 className="text-[1.4rem] text-white px-2 rounded-xl bg-green-600">
                                        Hoàn thành
                                    </h3>
                                    <p className="font-semibold text-green-600 text-center">
                                        {getCompleteTaskQty().length}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[1.4rem] text-white px-2 rounded-xl bg-red-600">
                                        Chưa hoàn thành
                                    </h3>
                                    <p className="font-semibold text-red-600 text-center">
                                        {allTasks.length - getCompleteTaskQty().length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="px-10 bg-white h-fit shadow-4Way">
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Họ và tên:</span>{' '}
                            <span className="flex-1">{currUser?.fullName}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Giới tính:</span>{' '}
                            <span className="flex-1">{currUser?.gender}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Ngày sinh:</span>{' '}
                            <span className="flex-1">{formatVNDate(currUser?.birthDate)}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Email:</span>{' '}
                            <span className="flex-1">{currUser?.email}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Số điện thoại:</span>{' '}
                            <span className="flex-1">{currUser?.phoneNumber}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Phòng ban:</span>{' '}
                            <span className="flex-1">{currUser?.department}</span>
                        </p>
                        <hr />
                        <p className="flex text-[1.8rem] py-[12px]">
                            <span className="mr-5 lg:mr-0 lg:w-[240px] font-bold">Vai trò:</span>{' '}
                            <span className="flex-1">{currUser?.role}</span>
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowProfileForm(true)}
                            className={
                                isReqChangeInfo
                                    ? 'w-full lg:w-fit text-[1.5rem] text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] mt-7 disabled'
                                    : 'w-full lg:w-fit text-[1.5rem] text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] mt-7'
                            }
                        >
                            {isReqChangeInfo ? 'Đã gửi yêu cầu' : 'Chỉnh sửa'}
                        </button>
                    </div>
                </div>
            </div>
            {showProfileForm && (
                <ProfileForm
                    formTitle="Chỉnh sửa thông tin cá nhân"
                    setShowForm={setShowProfileForm}
                    setIsSave={() => setIsSave(!isSave)}
                    socket={socket}
                />
            )}
        </>
    );
};

export default Profile;
