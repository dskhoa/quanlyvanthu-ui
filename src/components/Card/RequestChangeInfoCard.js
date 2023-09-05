import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import * as userServices from '~/services/userServices';
import { formatVNDate } from '~/utils/formatDateTime';

const RequestChangeInfoCard = (props) => {
    const [showMore, setShowMore] = useState(false);
    const [showDelBtn, setShowBtn] = useState(false);
    const [currentUserData, setCurrentUserData] = useState({});

    const toggle = (e) => {
        setShowMore(!showMore);
    };

    const handleDoubleClick = () => {
        setShowBtn(!showDelBtn);
    };

    const highlightInfo = (oldVal, newVal) => {
        if (oldVal === newVal) return;
        return 'bg-[#f7bb07] font-bold';
    };

    useEffect(() => {
        const fetchApi = async () => {
            const res = await userServices.getUserById(props.currentUserId);
            if (res.code === 200) {
                setCurrentUserData(res.data);
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, [props.currentUserId]);

    return (
        <div onDoubleClick={handleDoubleClick} className="mb-5 shadow-4Way">
            <div className="flex items-center justify-between bg-white p-5">
                <div onClick={toggle} className="flex items-center gap-x-3 cursor-pointer">
                    <FontAwesomeIcon className="text-blue-600" icon={faPen} />
                    <h3 className="text-[1.4rem] font-bold">
                        Yêu cầu của {currentUserData?.fullName} - <span>{formatVNDate(props.createdAt)}</span>
                    </h3>
                </div>
                <div className="flex items-center">
                    {props.status === 'pending' && (
                        <div className="flex items-center text-[2.2rem] leading-none">
                            <div onClick={props.handleApprove} className="text-green-600 p-3 cursor-pointer">
                                <FontAwesomeIcon icon={faCheck} />
                            </div>
                            <div onClick={props.handleReject} className="text-red-600 p-3 cursor-pointer">
                                <FontAwesomeIcon icon={faXmark} />
                            </div>
                        </div>
                    )}
                    {props.status === 'approved' && (
                        <h3 className="text-[1.4rem] font-bold text-green-600 p-3">Chấp nhận</h3>
                    )}
                    {props.status === 'rejected' && (
                        <h3 className="text-[1.4rem] font-bold text-red-600 p-3">Từ chối</h3>
                    )}
                    {showDelBtn && props.tab !== 'pending' && (
                        <FontAwesomeIcon
                            onClick={props.handleDelete}
                            className="text-[1.5rem] leading-none p-3 opacity-60 hover:opacity-100 cursor-pointer"
                            icon={faXmark}
                        />
                    )}
                </div>
            </div>
            {showMore && (
                <div className="w-full text-[1.4rem] bg-white p-5 border-t">
                    <h3 className="text-[2rem] font-bold mb-5">Thông tin cần thay đổi</h3>
                    <p>
                        <span className="font-bold">Họ và tên:</span> <span>{currentUserData?.fullName}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span className={highlightInfo(currentUserData?.fullName, props.newName)}>{props.newName}</span>
                    </p>
                    <p>
                        <span className="font-bold">Giới tính:</span> <span>{currentUserData?.gender}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span className={highlightInfo(currentUserData?.gender, props.newGender)}>
                            {props.newGender}
                        </span>
                    </p>
                    <p>
                        <span className="font-bold">Ngày sinh:</span>{' '}
                        <span>{formatVNDate(currentUserData?.birthDate)}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span
                            className={highlightInfo(
                                formatVNDate(currentUserData?.birthDate),
                                formatVNDate(props.newBirthDate),
                            )}
                        >
                            {formatVNDate(props.newBirthDate)}
                        </span>
                    </p>
                    <p>
                        <span className="font-bold">Email:</span> <span>{currentUserData?.email}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span className={highlightInfo(currentUserData?.email, props.newEmail)}>{props.newEmail}</span>
                    </p>
                    <p>
                        <span className="font-bold">Số điện thoại:</span> <span>{currentUserData?.phoneNumber}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span className={highlightInfo(currentUserData?.phoneNumber, props.newPhone)}>
                            {props.newPhone}
                        </span>
                    </p>
                    <p>
                        <span className="font-bold">Phòng ban:</span> <span>{currentUserData?.department}</span>{' '}
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>{' '}
                        <span className={highlightInfo(currentUserData?.department, props.newDepartment)}>
                            {props.newDepartment}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RequestChangeInfoCard;
