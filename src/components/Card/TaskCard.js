import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const TaskCard = (props) => {
    const [showAction, setShowAction] = useState(false);
    const userRole = JSON.parse(localStorage.getItem('userRole'));

    const toggle = (e) => {
        e.stopPropagation();
        setShowAction(!showAction);
    };

    return (
        <div onClick={() => setShowAction(false)} className="text-[1.4rem] bg-white p-[16px] mb-5 shadow-4Way">
            <div className="flex items-center justify-between relative text-right mb-3">
                <div className="flex items-center">
                    <input type="checkbox" checked={props.checkBox} onChange={props.handleCheckBox} />
                </div>
                <FontAwesomeIcon onClick={toggle} className="w-[16px] h-[16px] cursor-pointer" icon={faEllipsisH} />
                <div
                    className={
                        !showAction ? 'hidden' : 'absolute top-[24px] right-0 w-[120px] h-fit bg-white shadow-4Way z-10'
                    }
                >
                    <ul>
                        <li className="hover:bg-[#dddddd] cursor-pointer">
                            <NavLink className="block p-[8px] text-left" to={`/tasks/detail/${props.taskId}`}>
                                <FontAwesomeIcon icon={faEye} />
                                <span className="ml-3">Chi tiết</span>
                            </NavLink>
                        </li>
                        <li className={userRole === 'Member' ? 'hidden' : 'hover:bg-[#dddddd] cursor-pointer'}>
                            <NavLink className="block p-[8px] text-left" to={`/tasks/edit/${props.taskId}`}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <span className="ml-3">Sửa</span>
                            </NavLink>
                        </li>
                        <li
                            onClick={props.handleDelete}
                            className={
                                userRole === 'Member'
                                    ? 'hidden'
                                    : 'w-full text-left p-[8px] hover:bg-[#dddddd] cursor-pointer'
                            }
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                            <span className="ml-3">Xóa</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">STT:</p>
                <p className="flex-1 truncate">{props.id}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Tên công việc:</p>
                <p className="flex-1 truncate">{props.taskName}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Tiến trình:</p>
                <div className="flex-1 bg-gray-200 rounded-full">
                    <div className={props.progressClass}></div>
                </div>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Đến hạn:</p>
                <p className="flex-1 truncate">{props.dueDate}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Trạng thái:</p>
                <div className="ml-[-0.5rem]">
                    <p className={props.statusClass}>{props.status}</p>
                </div>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Người thực hiện:</p>
                <div className="flex -space-x-2">
                    {props.assignTo.slice(0, 3).map((at, index) => {
                        const user = props.allUsers.find((user) => {
                            return user?._id === at.value;
                        });
                        return (
                            <img
                                key={index}
                                className="inline-block h-[35px] w-[35px] rounded-full ring-2 ring-white"
                                src={
                                    user?.avatar ||
                                    'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg'
                                }
                                alt="avatar"
                            />
                        );
                    })}
                    <div
                        className={
                            props.assignTo.length > 3
                                ? 'hs-dropdown relative inline-flex [--placement:top-left]'
                                : 'hidden'
                        }
                    >
                        <div className="inline-flex items-center justify-center h-[35px] w-[35px] rounded-full bg-gray-200 border-2 border-white font-medium text-gray-700 shadow-sm align-middle">
                            <span className="font-medium leading-none">+{props.assignTo.length - 3}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
