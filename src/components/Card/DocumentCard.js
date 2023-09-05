import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import DropList from '../DropList';

const DocumentCard = (props) => {
    const [showAction, setShowAction] = useState(false);
    const statusOptions = ['Khởi tạo', 'Đang xử lý', 'Hoàn thành'];
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
                            <NavLink className="block p-[8px] text-left" to={`/documents/detail/${props.documentId}`}>
                                <FontAwesomeIcon icon={faEye} />
                                <span className="ml-3">Chi tiết</span>
                            </NavLink>
                        </li>
                        <li className={userRole === 'Member' ? 'hidden' : 'hover:bg-[#dddddd] cursor-pointer'}>
                            <NavLink
                                className="block p-[8px] text-left"
                                to={`/documents/${props.path}/${props.documentId}`}
                            >
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
                <p className="font-bold w-[120px]">Số ký hiệu:</p>
                <p className="flex-1 truncate">{props.code}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Tên văn bản:</p>
                <p className="flex-1 truncate">{props.docName}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Loại văn bản:</p>
                <p className="flex-1 truncate">{props.type}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Mức độ:</p>
                <p className={props.levelClass}>{props.level}</p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Trạng thái:</p>
                <p className="flex-1">
                    <DropList
                        selectedValue={props.statusValue}
                        options={statusOptions}
                        setValue={props.setStatusValue}
                        setId={props.setStatusId}
                    />
                </p>
            </div>
            <div className="flex items-center mb-3">
                <p className="font-bold w-[120px]">Vị trí hiện tại:</p>
                <p className="flex-1">
                    <DropList
                        selectedValue={props.locationValue}
                        options={props.locationOptions}
                        setValue={props.setLocationValue}
                        setId={props.setLocationId}
                    />
                </p>
            </div>
        </div>
    );
};

export default DocumentCard;
