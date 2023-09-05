import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

const SidebarItem = (props) => {
    return (
        <li
            onClick={props.onClick}
            className="text-[1.4rem] text-[#9fa9ae] border-b-[1px] hover:bg-[#46546c] hover:text-white border-[#ffffff]/[0.05] cursor-pointer"
        >
            <div className="relative">
                <NavLink
                    to={props.path}
                    className={
                        props.path === '/documents' || props.path === '/statistics' || props.path === '/users'
                            ? ({ isActive }) =>
                                  isActive
                                      ? 'flex items-center py-[18px] pl-[25px] bg-[#46546c] text-white hover:text-white pointer-events-none'
                                      : 'flex items-center py-[18px] pl-[25px] pointer-events-none'
                            : ({ isActive }) =>
                                  isActive
                                      ? 'flex items-center py-[18px] pl-[25px] bg-[#46546c] text-white hover:text-white'
                                      : 'flex items-center py-[18px] pl-[25px]'
                    }
                >
                    <FontAwesomeIcon className="w-[18px] h-[18px] text-[1.8rem]" icon={props.icon} />
                    <span className="ml-6 text-[1.6rem]">{props.title}</span>
                </NavLink>
                {props.firstElement}
            </div>
            {props.secondElement}
        </li>
    );
};

export default SidebarItem;
