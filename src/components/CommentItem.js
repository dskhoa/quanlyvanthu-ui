import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { formatVNTimeAgo } from '~/utils/formatDateTime';

const CommentItem = (props) => {
    const [showAction, setShowAction] = useState(false);

    const isYourComment = () => {
        if (props.currUserId === props.userCommentId) {
            return true;
        } else {
            return false;
        }
    };

    const toggle = (e) => {
        e.stopPropagation();
        setShowAction(!showAction);
    };

    return (
        <>
            <li onClick={() => setShowAction(false)} className="relative p-[10px] bg-white rounded-md shadow-4Way mb-3">
                {isYourComment() && (
                    <div className="absolute top-0 right-0 text-right">
                        <FontAwesomeIcon
                            onClick={toggle}
                            className="w-[16px] h-[16px] p-3 cursor-pointer"
                            icon={faEllipsisH}
                        />
                        <div
                            className={
                                !showAction
                                    ? 'hidden'
                                    : 'absolute top-[24px] right-0 w-[120px] h-fit bg-white shadow-4Way z-10'
                            }
                        >
                            <ul>
                                <li
                                    onClick={props.handleEdit}
                                    className="w-full text-left p-[8px] hover:bg-[#dddddd] cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                    <span className="ml-3">Sửa</span>
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
                )}
                <div className="flex">
                    <div className="w-[35px] h-[35px]">
                        <img className="w-full h-full object-cover rounded-full" src={props.img} alt="" />
                    </div>

                    <div className="ml-3 text-[14px] flex-1">
                        <h3 className="font-semibold">{props.username}</h3>

                        <p className="text-[16px] text-[#9a919b] break-all">{props.content}</p>
                        <div className="relative flex items-center">
                            <p className="text-[13px]">{formatVNTimeAgo(props.cmtDate)}</p>
                        </div>
                    </div>
                </div>
            </li>
        </>
    );
};

export default CommentItem;
