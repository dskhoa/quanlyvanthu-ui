import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { formatVNTimeAgo } from '~/utils/formatDateTime';

const NotificationCard = (props) => {
    return (
        <li
            onClick={props.handleChangeNotificationStatus}
            className="group/item-list relative w-full p-[12px] text-[1.3rem] cursor-pointer hover:bg-[#eeeeee] transition-all duration-[0.5s]"
        >
            <NavLink className="w-full" to={props.linkTask.replace('http://192.168.1.188', '')}>
                <p title={props.notification} className="w-[90%] truncate">
                    {props.notification}
                </p>
                <p className="text-[1rem]">{formatVNTimeAgo(props.createdAt)}</p>
            </NavLink>
            {!props.isRead && (
                <div className="absolute top-[50%] translate-y-[-50%] right-[16px] text-blue-500">
                    <FontAwesomeIcon icon={faCircle} />
                </div>
            )}
            <div
                onClick={props.handleDelete}
                className="hidden absolute top-[50%] translate-y-[-50%] right-[36px] w-[30px] h-[30px] bg-white text-[1.8rem] leading-none rounded-full shadow-4Way group-hover/item-list:flex"
            >
                <FontAwesomeIcon className="m-auto" icon={faXmark} />
            </div>
        </li>
    );
};

export default NotificationCard;
