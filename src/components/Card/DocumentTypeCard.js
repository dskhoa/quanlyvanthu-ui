import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import SwitchButton from '../SwitchButton';

const DocumentTypeCard = (props) => {
    const [showAction, setShowAction] = useState(false);

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
                        <li onClick={() => setShowAction(false)} className="hover:bg-[#dddddd] cursor-pointer">
                            <NavLink
                                className="block p-[8px] text-left"
                                to={`/document-types/edit/${props.documentTypeId}`}
                            >
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
            <div className="relative group flex items-center mb-3">
                <p className="font-bold w-[120px]">Loại văn bản:</p>
                <p title={props.documentTypeName} className="flex-1 truncate">
                    {props.documentTypeName}
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
            <div className="relative group flex items-center mb-3">
                <p className="font-bold w-[120px]">Ghi chú:</p>
                <p title={props.note} className="flex-1 truncate">
                    {props.note}
                </p>
            </div>
        </div>
    );
};

export default DocumentTypeCard;
