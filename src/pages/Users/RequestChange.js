import { useState, useEffect } from 'react';
import RequestChangeInfoCard from '~/components/Card/RequestChangeInfoCard';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import * as userServices from '~/services/userServices';
import * as reqChangeInfoServices from '~/services/reqChangeInfoServices';
import * as notificationServices from '~/services/notificationServices';
import Loading from '~/components/Loading';

const RequestChange = ({ socket }) => {
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState('pending');
    const [reqData, setReqData] = useState([]);
    const [isSave, setIsSave] = useState(false);

    // Update tab
    const onUpdateTab = (value) => {
        setTab(value);
    };

    const sendNotification = async (userId, result) => {
        const newNotiId = await notificationServices.createNotification({
            notification: `Yêu cầu đổi thông tin ${result}`,
            userId: userId,
            linkTask: `${process.env.REACT_APP_BASE_URL}/profile`,
        });
        socket.current?.emit('sendNotification', {
            senderId: '',
            _id: [{ notiId: newNotiId.data._id, userId: newNotiId.data.userId }],
            receiverId: [userId],
            text: `Yêu cầu đổi thông tin ${result}`,
            linkTask: `${process.env.REACT_APP_BASE_URL}/profile`,
            isRead: false,
        });
    };

    const handleApprove = async (reqDataId, userId, dataToChange) => {
        const res1 = await reqChangeInfoServices.changeReqChangeInfoStatus(reqDataId, { status: 'approved' });
        if (res1.code === 200) {
            const res2 = await userServices.updateUser(userId, dataToChange);
            if (res2.code === 200) {
                await userServices.changeReqChangeInfoStatus(userId, { isReqChangeInfo: false });
                setIsSave((isSave) => !isSave);
                successNotify(res1.message);
                sendNotification(userId, 'được chấp nhận');
            } else {
                console.log('Đã xảy ra lỗi');
            }
        } else {
            console.log(res1);
        }
    };

    const handleReject = async (reqDataId, userId) => {
        const res = await reqChangeInfoServices.changeReqChangeInfoStatus(reqDataId, { status: 'rejected' });
        if (res.code === 200) {
            await userServices.changeReqChangeInfoStatus(userId, { isReqChangeInfo: false });
            setIsSave((isSave) => !isSave);
            successNotify(res.message);
            sendNotification(userId, 'bị từ chối');
        } else {
            console.log(res);
        }
    };

    // Delete one row function
    const handleDelete = async (id) => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn yêu cầu không?`;
        if (!window.confirm(confirmMsg)) return;
        const res = await reqChangeInfoServices.deleteReqChangeInfoById(id);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true);
            const res = await reqChangeInfoServices.getAllReqChangeInfo();
            if (res.code === 200) {
                setLoading(false);
                if (tab === 'approved') {
                    setReqData(res.approvedData);
                } else if (tab === 'rejected') {
                    setReqData(res.rejectedData);
                } else {
                    setReqData(res.pendingData);
                }
            } else {
                setLoading(false);
                console.log(res);
            }
        };
        fetchApi();
    }, [tab, isSave]);

    return (
        <>
            <div className="bg-[#f7f7f7] border border-solid border-[#cccccc] mb-[12px] shadow-4Way">
                <div className="p-[16px]">
                    <h1 className="text-[1.8rem] md:text-[2.4rem] font-bold">Danh sách yêu cầu thay đổi thông tin</h1>
                </div>
                <div className="flex items-center px-[16px] border-t">
                    <h3>Lọc:</h3>
                    <ul className="flex items-center font-bold">
                        <li
                            onClick={() => onUpdateTab('pending')}
                            className={
                                tab === 'pending'
                                    ? 'px-5 py-3 text-blue-600'
                                    : 'px-5 py-3 hover:text-blue-600 cursor-pointer'
                            }
                        >
                            Đang chờ
                        </li>
                        <li
                            onClick={() => onUpdateTab('approved')}
                            className={
                                tab === 'approved'
                                    ? 'px-5 py-3 text-blue-600'
                                    : 'px-5 py-3 hover:text-blue-600 cursor-pointer'
                            }
                        >
                            Chấp nhận
                        </li>
                        <li
                            onClick={() => onUpdateTab('rejected')}
                            className={
                                tab === 'rejected'
                                    ? 'px-5 py-3 text-blue-600'
                                    : 'px-5 py-3 hover:text-blue-600 cursor-pointer'
                            }
                        >
                            Từ chối
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-5">
                {loading ? (
                    <div className="w-full text-center">
                        <Loading />
                    </div>
                ) : reqData?.length !== 0 ? (
                    reqData?.map((item, index) => {
                        return (
                            <RequestChangeInfoCard
                                key={index}
                                index={index}
                                tab={tab}
                                currentUserId={item?.userId}
                                newName={item?.dataToChange.fullName}
                                newGender={item?.dataToChange.gender}
                                newBirthDate={item?.dataToChange.birthDate}
                                newEmail={item?.dataToChange.email}
                                newPhone={item?.dataToChange.phoneNumber}
                                newDepartment={item?.dataToChange.department}
                                status={item?.status}
                                createdAt={item?.createdAt}
                                handleApprove={() => handleApprove(item?._id, item?.userId, item?.dataToChange)}
                                handleReject={() => handleReject(item?._id, item?.userId)}
                                handleDelete={() => handleDelete(item?._id)}
                            />
                        );
                    })
                ) : (
                    <p className="text-center p-5">Không tìm thấy dữ liệu</p>
                )}
            </div>
        </>
    );
};

export default RequestChange;
