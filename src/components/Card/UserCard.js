import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import SwitchButton from '~/components/SwitchButton';
import DropList from '../DropList';

const UserCard = (props) => {
    const [showAction, setShowAction] = useState(false);
    const roleOptions = ['Moderator', 'Member'];

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
                        <li
                            onClick={props.handleDetail}
                            className="w-full text-left p-[8px] hover:bg-[#dddddd] cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faEye} />
                            <span className="ml-3">Chi tiết</span>
                        </li>
                        <li className="hover:bg-[#dddddd] cursor-pointer">
                            <NavLink className="block p-[8px] text-left" to={`/users/edit/${props.userId}`}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <span className="ml-3">Sửa</span>
                            </NavLink>
                        </li>
                        <li
                            onClick={props.handleDelete}
                            className="w-full text-left p-[8px] hover:bg-[#dddddd] cursor-pointer"
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
                <p className="font-bold w-[120px]">Họ và tên:</p>
                <p title={props.fullName} className="flex-1 truncate">
                    {props.fullName}
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Email:</p>
                <p title={props.email} className="flex-1 truncate">
                    {props.email}
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Số điện thoại:</p>
                <p title={props.phone} className="flex-1 truncate">
                    {props.phone}
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Phòng ban:</p>
                <p title={props.department} className="flex-1 truncate">
                    {props.department}
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Vai trò:</p>
                <p title={props.roleValue} className="flex-1">
                    <DropList
                        selectedValue={props.roleValue}
                        options={roleOptions}
                        setValue={props.setRoleValue}
                        setId={props.setRoleId}
                    />
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Trạng thái:</p>
                <SwitchButton
                    value={props.activeValue}
                    checked={props.activeChecked}
                    setValue={props.setIsActived}
                    setId={props.setActiveId}
                />
            </div>
        </div>
    );
};

export default UserCard;
