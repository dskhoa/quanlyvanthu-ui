import { useState, useEffect, useContext } from 'react';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faBars, faCaretDown, faKey, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChangePasswordForm from '~/components/Form/ChangePasswordForm';
import { NavLink, useNavigate } from 'react-router-dom';
import * as authServices from '~/services/authServices';
import * as notificationServices from '~/services/notificationServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { UserInfoContext } from '~/App';
import NotificationCard from '~/components/Card/NotificationCard';

const Header = ({ setToggle, socket }) => {
    const [isSave, setIsSave] = useState(false);
    const [tab, setTab] = useState(false);
    const [notification, setNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [toggleSidebar, setToggleSidebar] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [userAvatar, setUserAvatar] = useState('');
    const [userName, setUserName] = useState('');

    const { isChangeUserInfo } = useContext(UserInfoContext);
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

    // isRead notification function
    const handleChangeNotificationStatus = async (id) => {
        await notificationServices.changeNotificationStatus(id);
        setIsSave((isSave) => !isSave);
    };

    // unRead notification length function
    const notificationNotReadLength = (notifications) => {
        const length = notifications?.filter((item) => item.isRead === false).length;
        return length;
    };

    // Delete one comment
    const handleDelete = async (id) => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn thông báo không?`;
        if (!window.confirm(confirmMsg)) return;
        const res = await notificationServices.deleteNotificationById(id);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    // Toggle sidebar
    useEffect(() => {
        setToggle(toggleSidebar);
    }, [setToggle, toggleSidebar]);

    // Get current user avatar
    useEffect(() => {
        const fetchApi = async () => {
            const res = await authServices.getCurrUser();
            setUserAvatar(res?.avatar);
            setUserName(res?.fullName);
        };
        fetchApi();
    }, [isChangeUserInfo]);

    // Get realtime notification function
    useEffect(() => {
        socket.current?.on('getNotification', (data) => {
            setNotification({
                _id: data._id.find((item) => item.userId === data.receiverId)?.notiId,
                notification: data.text,
                userId: data.receiverId,
                linkTask: data.linkTask,
                isRead: data.isRead,
                createdAt: Date.now(),
            });
        });
    }, [socket]);

    // Merge notification from db and socket.io
    useEffect(() => {
        if (!notification) return;
        setNotifications((prev) => prev.concat(notification));
    }, [notification]);

    // Get all notifications from server
    useEffect(() => {
        const fetchApi = async () => {
            const res = await notificationServices.getAllNotification();
            if (res.code === 200) {
                if (tab === false) {
                    setNotifications(res.data);
                } else {
                    setNotifications(res.notRead);
                }
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, [tab, isSave]);

    return (
        <>
            <div className="flex items-center justify-between xl:justify-end w-full h-[64px] bg-white text-[#9fa9ae] pl-[16px] pr-[24px] border-b-[1px] border-solid border-[#cccccc]">
                <div
                    onClick={() => setToggleSidebar(!toggleSidebar)}
                    className="xl:hidden p-[8px] hover:text-black cursor-pointer"
                >
                    <FontAwesomeIcon icon={faBars} />
                </div>
                <div className="flex items-center">
                    <div className="flex group relative p-[8px] hover:text-black cursor-pointer">
                        <FontAwesomeIcon className="text-[2.2rem] leading-none m-auto" icon={faBell} />
                        <p
                            className={
                                notificationNotReadLength(notifications) > 0
                                    ? 'absolute block top-0 right-0 text-center min-w-[18px] text-[1rem] font-semibold text-[white] bg-red-600 p-1.5 rounded-full leading-none'
                                    : 'hidden'
                            }
                        >
                            {notificationNotReadLength(notifications)}
                        </p>
                        <div className="hidden absolute bottom-[-12px] right-0 bg-transparent w-[100px] h-[24px] group-hover:block"></div>
                        <div className="hidden absolute top-[50px] right-[-80px] md:right-0 text-black bg-white shadow-4Way group-hover:block z-50">
                            <div className="p-[12px] cursor-default">
                                <h3 className="text-[2.4rem] font-bold">Thông báo</h3>
                                <div className="flex items-center gap-x-3 text-[1.5rem]">
                                    <div
                                        onClick={() => setTab(false)}
                                        className={
                                            tab === false
                                                ? 'text-blue-600 font-semibold bg-blue-50 p-3 rounded-xl cursor-pointer hover:bg-[#f1f1f1]'
                                                : 'font-semibold p-3 rounded-xl cursor-pointer hover:bg-[#f1f1f1]'
                                        }
                                    >
                                        Tất cả
                                    </div>
                                    <div
                                        onClick={() => setTab(true)}
                                        className={
                                            tab === true
                                                ? 'text-blue-600 font-semibold bg-blue-50 p-3 rounded-xl cursor-pointer hover:bg-[#f1f1f1]'
                                                : 'font-semibold p-3 rounded-xl cursor-pointer hover:bg-[#f1f1f1]'
                                        }
                                    >
                                        Chưa đọc
                                    </div>
                                </div>
                            </div>
                            <ul className="w-[320px] max-h-[300px] overflow-hidden hover:overflow-y-auto">
                                {notifications?.length > 0 ? (
                                    notifications
                                        ?.sort(function (a, b) {
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        })
                                        .map((notification, index) => {
                                            return (
                                                <NotificationCard
                                                    key={index}
                                                    linkTask={notification?.linkTask}
                                                    notification={notification?.notification}
                                                    createdAt={notification?.createdAt}
                                                    isRead={notification.isRead}
                                                    handleChangeNotificationStatus={() =>
                                                        handleChangeNotificationStatus(notification?._id)
                                                    }
                                                    handleDelete={() => {
                                                        handleDelete(notification?._id);
                                                    }}
                                                />
                                            );
                                        })
                                ) : (
                                    <li className="w-full truncate p-[12px] text-[1.3rem] text-center cursor-default">
                                        Không có thông báo
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="flex items-center gap-x-3 cursor-pointer">
                            <div className="w-[40px] h-[40px] rounded-full ml-8">
                                <img
                                    className="w-full h-full object-cover rounded-full"
                                    src={
                                        userAvatar
                                            ? userAvatar
                                            : 'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg'
                                    }
                                    alt="avatar"
                                />
                            </div>
                            <h3 className="hidden md:block font-bold text-black max-w-[150px] truncate">{userName}</h3>
                            <FontAwesomeIcon className="group-hover:text-black" icon={faCaretDown} />
                        </div>
                        <div className="hidden absolute bottom-[-12px] right-0 bg-transparent w-[180px] h-[24px] group-hover:block"></div>
                        <div className="hidden absolute top-[50px] right-0 text-black bg-white shadow-4Way group-hover:block">
                            <ul className="w-[180px]">
                                <li className="p-[12px] cursor-pointer hover:text-[#321fdb] hover:bg-[#eeeeee]">
                                    <NavLink className="py-[12px]" to="/profile">
                                        <FontAwesomeIcon icon={faUser} />
                                        <span className="ml-3">Thông tin cá nhân</span>
                                    </NavLink>
                                </li>
                                <li
                                    onClick={() => setShowChangePassword(true)}
                                    className="p-[12px] cursor-pointer hover:text-[#321fdb] hover:bg-[#eeeeee]"
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                    <span className="ml-3">Đổi mật khẩu</span>
                                </li>
                                <li
                                    onClick={handleSignOut}
                                    className="p-[12px] cursor-pointer hover:text-[#321fdb] hover:bg-[#eeeeee] border-t"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                    <span className="ml-3">Đăng xuất</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {showChangePassword && <ChangePasswordForm setShowChangePassword={setShowChangePassword} />}
        </>
    );
};

export default Header;
