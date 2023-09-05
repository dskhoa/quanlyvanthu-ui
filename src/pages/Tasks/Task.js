import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlusCircle,
    faFilterCircleXmark,
    faEye,
    faPenToSquare,
    faTrashCan,
    faAngleRight,
    faAngleLeft,
    faSearch,
} from '@fortawesome/free-solid-svg-icons';
import DropList from '~/components/DropList';
import InputField from '~/components/InputField';
import * as taskServices from '~/services/taskServices';
import * as taskTypeServices from '~/services/taskTypeServices';
import TaskCard from '~/components/Card/TaskCard';
import { handleCheck, handleCheckAll } from '~/utils/handleCheckbox';
import Loading from '~/components/Loading';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { formatVNDateTime } from '~/utils/formatDateTime';
import { useFetchUsers } from '~/hooks';

const Task = () => {
    const [loading, setLoading] = useState(false);
    const [isSave, setIsSave] = useState(false);
    // List data state
    const [allTaskTypes, setAllTaskTypes] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [taskLists, setTaskLists] = useState([]);
    // Pagination state
    const [limit, setLimit] = useState(5);
    const [page, setPage] = useState(1);
    const [rowStart, setRowStart] = useState(1);
    const [rowEnd, setRowEnd] = useState(0);
    // Checkbox state
    const [checked, setChecked] = useState(JSON.parse(localStorage.getItem('taskChecked')) || []);
    const [checkedAll, setCheckedAll] = useState(JSON.parse(localStorage.getItem('isCheckAllTask')) || false);
    //Filter input state
    const [fName, setFName] = useState('');
    const [fCreatedAt, setFCreatedAt] = useState('');
    const [fDueDate, setFDueDate] = useState('');
    const [fType, setFType] = useState('');
    const [fStatus, setFStatus] = useState('');
    const [fLevel, setFLevel] = useState('');

    const userRole = JSON.parse(localStorage.getItem('userRole'));
    const allUsers = useFetchUsers().publicUsers;
    const levelOptions = ['Bình thường', 'Ưu tiên', 'Khẩn cấp'];
    const statusOptions = ['Còn hạn', 'Sắp đến hạn', 'Quá hạn'];
    const tableHeader = [
        'STT',
        'Tên công việc',
        'Loại công việc',
        'Tiến trình',
        'Đến hạn',
        'Trạng thái',
        'Người thực hiện',
        'Thao tác',
    ];
    const totalPage = Math.ceil(allTasks?.length / limit);

    // Update progress bar
    const setProgressPercentage = (progress) => {
        if (progress === 'Hoàn thành') {
            return 'progress-bar full';
        } else if (progress === 'Chờ duyệt') {
            return 'progress-bar percent60';
        } else if (progress === 'Đang xử lý') {
            return 'progress-bar percent30';
        }
    };

    // Set status color
    const setStatusColor = (status) => {
        if (status === 'Sắp đến hạn') {
            return 'w-fit ml-2 status warning';
        } else if (status === 'Quá hạn') {
            return 'w-fit ml-2 status emergency';
        } else {
            return 'w-fit ml-2 status normal';
        }
    };

    // Go to the next page
    const handleNextPage = () => {
        setPage(page + 1);
        setRowStart(rowStart + +limit);
        setRowEnd(rowEnd + +limit);
    };

    // Back to the previous page
    const handlePrevPage = () => {
        setPage(page - 1);
        setRowStart(rowStart - +limit);
        setRowEnd(rowEnd - +limit);
    };

    // Remove filter
    const removeFilter = () => {
        setFName('');
        setFCreatedAt('');
        setFDueDate('');
        setFType('');
        setFStatus('');
        setFLevel('');
        setIsSave((isSave) => !isSave);
    };

    // Handle filter
    const filter = async () => {
        if (fName || fCreatedAt || fDueDate || fType || fStatus || fLevel) {
            setLoading(true);
            const res = await taskServices.getAllTask(
                page,
                limit,
                fName,
                fCreatedAt,
                fDueDate,
                fType,
                fStatus,
                fLevel,
                '',
            );
            if (res.code === 200) {
                setLoading(false);
                if (userRole === 'Admin' || userRole === 'Moderator') {
                    setPage(1);
                    setRowStart(1);
                    setRowEnd(0);
                    setTaskLists(res.tasks);
                    setAllTasks(res.allTasks);
                } else {
                    setPage(1);
                    setRowStart(1);
                    setRowEnd(0);
                    setTaskLists(res.memberTasks);
                    setAllTasks(res.allMemberTasks);
                }
            } else {
                setLoading(false);
            }
        } else {
            errorNotify('Hãy chọn ít nhất 1 trường');
        }
    };

    // isFilter boolean
    const isFilters = () => {
        if (fName || fCreatedAt || fDueDate || fType || fStatus || fLevel) {
            return true;
        } else {
            return false;
        }
    };

    // Delete one row function
    const handleDelete = async (id) => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn công việc không?`;
        if (!window.confirm(confirmMsg)) return;
        const res = await taskServices.deleteTaskById(id);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    // Delete many rows function
    const handleDeleteMany = async () => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn những công việc này không?`;
        if (!window.confirm(confirmMsg)) return;
        const data = {
            arrayId: checked,
        };
        const res = await taskServices.deleteManyTask(data);
        if (res.code === 200) {
            successNotify(res.message);
            setChecked([]);
            setPage(1);
            setRowStart(1);
            setRowEnd(0);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    //Get all task type
    useEffect(() => {
        const fetchApi = async () => {
            const res = await taskTypeServices.getAllTaskType();
            if (res.code === 200) {
                const typeName = res?.data?.map((item) => item?.taskType);
                setAllTaskTypes(typeName);
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, []);

    // Get all tasks from server
    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true);
            const res = await taskServices.getAllTask(
                page,
                limit,
                fName,
                fCreatedAt,
                fDueDate,
                fType,
                fStatus,
                fLevel,
                '',
            );
            if (res.code === 200) {
                setLoading(false);
                if (userRole === 'Admin' || userRole === 'Moderator') {
                    setTaskLists(res.tasks);
                    setAllTasks(res.allTasks);
                } else {
                    setTaskLists(res.memberTasks);
                    setAllTasks(res.allMemberTasks);
                }
            } else {
                setLoading(false);
            }
        };
        fetchApi();
        // eslint-disable-next-line
    }, [isSave, userRole, page, limit]);

    // Set pagination state to default when have filter
    useEffect(() => {
        if (!limit) return;
        setPage(1);
        setRowStart(1);
        setRowEnd(0);
    }, [limit]);

    // Save checked list in localstorage
    useEffect(() => {
        localStorage.setItem('taskChecked', JSON.stringify(checked));
    }, [checked]);

    // Save checkedAll boolean in localstorage
    useEffect(() => {
        localStorage.setItem('isCheckAllTask', JSON.stringify(checkedAll));
    }, [checkedAll]);

    // Check all rows of document types function
    useEffect(() => {
        handleCheckAll(checkedAll, checked?.length, allTasks, setChecked);
    }, [checkedAll, allTasks, checked?.length]);

    return (
        <>
            <div className="bg-white p-[16px] mb-5 shadow-4Way">
                <h1 className="text-[2rem] md:text-[2.4rem] font-bold">Tìm kiếm</h1>

                <div className="flex flex-col md:flex-row gap-5 mt-5">
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Tên công việc:</label>
                        <InputField className="default" placeholder="Tên công việc" value={fName} setValue={setFName} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Ngày bắt đầu:</label>
                        <InputField
                            name="date"
                            className="default leading-[1.3]"
                            value={fCreatedAt}
                            setValue={setFCreatedAt}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Ngày kết thúc:</label>
                        <InputField
                            name="datetime-local"
                            className="default leading-[1.3]"
                            value={fDueDate}
                            setValue={setFDueDate}
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-5 mt-[12.5px]">
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Loại:</label>
                        <DropList
                            selectedValue={fType}
                            options={allTaskTypes}
                            setValue={setFType}
                            setId={() => undefined}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Trạng thái:</label>
                        <DropList
                            selectedValue={fStatus}
                            options={statusOptions}
                            setValue={setFStatus}
                            setId={() => undefined}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[1.4rem]">Mức độ:</label>
                        <DropList
                            selectedValue={fLevel}
                            options={levelOptions}
                            setValue={setFLevel}
                            setId={() => undefined}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-5 mt-[20px]">
                    <button
                        onClick={filter}
                        className="flex-1 w-full text-[1.3rem] md:text-[1.6rem] text-[white] bg-blue-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                    >
                        <FontAwesomeIcon icon={faSearch} /> Tìm kiếm
                    </button>
                    <div className={isFilters() ? 'flex-1' : 'hidden'}>
                        <button
                            onClick={removeFilter}
                            className="w-full text-[1.3rem] md:text-[1.6rem] text-[white] bg-red-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faFilterCircleXmark} /> Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:justify-between bg-[#f7f7f7] p-[16px] border border-solid border-[#cccccc] mb-[12px] md:mb-0 shadow-4Way">
                <h1 className="text-[1.8rem] md:text-[2.4rem] font-bold">Danh sách công việc</h1>
                <div
                    className={
                        userRole === 'Member'
                            ? 'hidden'
                            : 'flex md:flex-col lg:flex-row items-center gap-5 mt-3 md:mt-0'
                    }
                >
                    <button
                        onClick={handleDeleteMany}
                        className={
                            checked?.length > 1
                                ? 'text-[1.3rem] w-full lg:w-fit md:text-[1.6rem] text-[white] bg-red-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] whitespace-nowrap'
                                : 'hidden'
                        }
                    >
                        <FontAwesomeIcon icon={faTrashCan} /> Xóa <span>({checked?.length})</span> mục
                    </button>
                    <NavLink
                        to="/tasks/create"
                        className="text-[1.3rem] w-full lg:w-fit md:text-[1.6rem] text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} /> Thêm mới
                    </NavLink>
                </div>
            </div>
            <div className="hidden md:flex flex-col bg-white shadow-4Way">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="overflow-hidden">
                            <table className="min-w-full text-left text-[1.4rem] font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                    <tr>
                                        <th scope="col" className={userRole === 'Member' ? 'hidden' : 'px-6 py-4'}>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked?.length === allTasks?.length}
                                                    onChange={(e) => setCheckedAll(e.target.checked)}
                                                />
                                            </div>
                                        </th>
                                        {tableHeader?.map((item, index) => {
                                            return (
                                                <th key={index} scope="col" className="whitespace-nowrap px-6 py-4">
                                                    {item}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="[&>*:nth-child(odd)]:bg-[#f9fafb]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="text-center p-5">
                                                <Loading />
                                            </td>
                                        </tr>
                                    ) : taskLists?.length !== 0 ? (
                                        taskLists?.map((tl, index) => {
                                            return (
                                                <tr key={index} className="border-b dark:border-neutral-500">
                                                    <td
                                                        className={
                                                            userRole === 'Member'
                                                                ? 'hidden'
                                                                : 'whitespace-nowrap px-6 py-4'
                                                        }
                                                    >
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked?.includes(tl?._id)}
                                                                onChange={() =>
                                                                    handleCheck(
                                                                        checked,
                                                                        setChecked,
                                                                        setCheckedAll,
                                                                        tl?._id,
                                                                        allTasks,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td
                                                        title={tl?.taskName}
                                                        className="whitespace-nowrap px-6 py-4 max-w-[1px] truncate"
                                                    >
                                                        {tl?.taskName}
                                                    </td>
                                                    <td
                                                        title={tl?.type}
                                                        className="whitespace-nowrap px-6 py-4 max-w-[1px] truncate"
                                                    >
                                                        {tl?.type}
                                                    </td>
                                                    <td title={tl?.progress} className="whitespace-nowrap px-6 py-4">
                                                        <div className="bg-gray-200 rounded-full">
                                                            <div className={setProgressPercentage(tl?.progress)}></div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        title={formatVNDateTime(tl?.dueDate)}
                                                        className="whitespace-nowrap px-6 py-4"
                                                    >
                                                        {formatVNDateTime(tl?.dueDate)}
                                                    </td>
                                                    <td title={tl?.status} className="whitespace-nowrap px-6 py-4">
                                                        <div className={setStatusColor(tl?.status)}>{tl?.status}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex -space-x-2">
                                                            {tl?.assignTo.slice(0, 3).map((at, index) => {
                                                                const user = allUsers?.find((user) => {
                                                                    return user?._id === at?.value;
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
                                                                    tl?.assignTo.length > 3
                                                                        ? 'hs-dropdown relative inline-flex [--placement:top-left]'
                                                                        : 'hidden'
                                                                }
                                                            >
                                                                <div className="inline-flex items-center justify-center h-[35px] w-[35px] rounded-full bg-gray-200 border-2 border-white font-medium text-gray-700 shadow-sm align-middle">
                                                                    <span className="font-medium leading-none text-[1.3rem]">
                                                                        +{tl?.assignTo.length - 3}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-1 md:px-6 md:py-4">
                                                        <div className="flex items-center text-white">
                                                            <NavLink to={`/tasks/detail/${tl?._id}`}>
                                                                <div className="flex w-[30px] h-[30px] bg-blue-600 p-2 rounded-lg cursor-pointer hover:text-primary">
                                                                    <FontAwesomeIcon className="m-auto" icon={faEye} />
                                                                </div>
                                                            </NavLink>
                                                            <NavLink to={`/tasks/edit/${tl?._id}`}>
                                                                <div
                                                                    className={
                                                                        userRole === 'Member'
                                                                            ? 'hidden'
                                                                            : 'flex w-[30px] h-[30px] bg-green-600 p-2 ml-2 rounded-lg cursor-pointer hover:text-primary'
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        className="m-auto"
                                                                        icon={faPenToSquare}
                                                                    />
                                                                </div>
                                                            </NavLink>
                                                            <div
                                                                onClick={() => handleDelete(tl?._id)}
                                                                className={
                                                                    userRole === 'Member'
                                                                        ? 'hidden'
                                                                        : 'flex w-[30px] h-[30px] bg-red-600 p-2 ml-2 rounded-lg cursor-pointer hover:text-primary'
                                                                }
                                                            >
                                                                <FontAwesomeIcon className="m-auto" icon={faTrashCan} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center p-5">
                                                Không tìm thấy dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between py-3 mx-5">
                    <div className="flex items-center text-[1.5rem]">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="bg-inherit border border-[#cccccc] text-[1.5rem] rounded-[8px] block w-fit px-[14px] py-[8px] outline-none"
                        >
                            <option value={5}>5 mục</option>
                            <option value={10}>10 mục</option>
                            <option value={100}>100 mục</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <p className="text-[1.5rem] mr-9">
                            Hiển thị <span>{taskLists?.length === 0 ? 0 : rowStart}</span> đến{' '}
                            <span>{rowEnd + taskLists?.length}</span> của <span>{allTasks?.length}</span> mục
                        </p>
                        <div
                            onClick={handlePrevPage}
                            className={
                                page <= 1 ? 'md-page-btn hover:bg-[#dddddd] disabled' : 'md-page-btn hover:bg-[#dddddd]'
                            }
                        >
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>
                        <div
                            onClick={handleNextPage}
                            className={
                                page >= totalPage
                                    ? 'md-page-btn hover:bg-[#dddddd] disabled'
                                    : 'md-page-btn hover:bg-[#dddddd]'
                            }
                        >
                            <FontAwesomeIcon icon={faAngleRight} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-5">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={checked?.length === allTasks?.length}
                            onChange={(e) => setCheckedAll(e.target.checked)}
                        />{' '}
                        <p className="ml-3 mt-1">Chọn tất cả</p>
                    </label>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        className="bg-inherit border border-[#cccccc] text-[1.5rem] rounded-[8px] block w-fit px-[14px] py-[8px] outline-none"
                    >
                        <option value={5}>5 mục</option>
                        <option value={10}>10 mục</option>
                        <option value={100}>100 mục</option>
                    </select>
                </div>
                {loading ? (
                    <div className="text-center p-5">
                        <Loading />
                    </div>
                ) : taskLists?.length !== 0 ? (
                    taskLists?.map((tl, index) => {
                        return (
                            <TaskCard
                                key={index}
                                id={index + 1}
                                taskId={tl?._id}
                                taskName={tl?.taskName}
                                progress={tl?.progress}
                                dueDate={new Date(tl?.dueDate).toLocaleDateString()}
                                status={tl?.status}
                                statusClass={setStatusColor(tl?.status)}
                                progressClass={setProgressPercentage(tl?.progress)}
                                assignTo={tl?.assignTo}
                                allUsers={allUsers}
                                handleDelete={() => handleDelete(tl?._id)}
                                checkBox={checked?.includes(tl?._id)}
                                handleCheckBox={() =>
                                    handleCheck(checked, setChecked, setCheckedAll, tl?._id, allTasks)
                                }
                            />
                        );
                    })
                ) : (
                    <p className="text-center p-5">Không tìm thấy dữ liệu</p>
                )}

                <div className="flex items-center justify-center">
                    <div
                        onClick={handlePrevPage}
                        className={
                            page <= 1 ? 'sm-page-btn hover:bg-[#bbbbbb] disabled' : 'sm-page-btn hover:bg-[#bbbbbb]'
                        }
                    >
                        Trước
                    </div>
                    <div
                        onClick={handleNextPage}
                        className={
                            page >= totalPage
                                ? 'sm-page-btn hover:bg-[#bbbbbb] disabled'
                                : 'sm-page-btn hover:bg-[#bbbbbb]'
                        }
                    >
                        Sau
                    </div>
                </div>
            </div>
        </>
    );
};

export default Task;
