import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPenToSquare,
    faPlusCircle,
    faTrashCan,
    faSearch,
    faAngleLeft,
    faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import SwitchButton from '~/components/SwitchButton';
import DepartmentCard from '~/components/Card/DepartmentCard';
import InputField from '~/components/InputField';
import * as departmentServices from '~/services/departmentServices';
import { useDebounce } from '~/hooks';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { handleCheck, handleCheckAll } from '~/utils/handleCheckbox';
import Loading from '~/components/Loading';

const Department = () => {
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isSave, setIsSave] = useState(false);
    // Department state
    const [allDepartments, setAllDepartments] = useState([]);
    const [departmentLists, setDepartmentLists] = useState([]);
    // Activate department state
    const [activeId, setActiveId] = useState('');
    const [isActived, setIsActived] = useState(false);
    // Pagination state
    const [limit, setLimit] = useState(5);
    const [page, setPage] = useState(1);
    const [rowStart, setRowStart] = useState(1);
    const [rowEnd, setRowEnd] = useState(0);
    // Checkbox state
    const [checked, setChecked] = useState(JSON.parse(localStorage.getItem('departmentChecked')) || []);
    const [checkedAll, setCheckedAll] = useState(JSON.parse(localStorage.getItem('isCheckAllDepartment')) || false);

    const totalPage = Math.ceil(allDepartments?.length / limit);
    const debouncedValue = useDebounce(searchValue, 300);
    const tableHeader = ['STT', 'Tên phòng ban', 'Trạng thái', 'Ghi chú', 'Thao tác'];

    // Go to next page
    const handleNextPage = () => {
        setPage(page + 1);
        setRowStart(rowStart + +limit);
        setRowEnd(rowEnd + +limit);
    };

    // Back to previous page
    const handlePrevPage = () => {
        setPage(page - 1);
        setRowStart(rowStart - +limit);
        setRowEnd(rowEnd - +limit);
    };

    // Delete one row function
    const handleDelete = async (id) => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn phòng ban không?`;
        if (!window.confirm(confirmMsg)) return;
        const res = await departmentServices.deleteDepartmentById(id);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    // Delete many rows function
    const handleDeleteMany = async () => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn những phòng ban này không?`;
        if (!window.confirm(confirmMsg)) return;
        const data = {
            arrayId: checked,
        };
        const res = await departmentServices.deleteManyDepartment(data);
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

    // Get department from server
    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true);
            const res = await departmentServices.getAllDepartment(page, limit, debouncedValue);
            if (res.code === 200) {
                setLoading(false);
                setAllDepartments(res.allDepartments); // all departments
                setDepartmentLists(res.data); // departments with filter and pagination
            } else {
                setLoading(false);
            }
        };
        fetchApi();
    }, [isSave, page, limit, debouncedValue]);

    // Set pagination state to default when have filter
    useEffect(() => {
        if (debouncedValue || limit) {
            setPage(1);
            setRowStart(1);
            setRowEnd(0);
        } else {
            return;
        }
    }, [debouncedValue, limit]);

    // Activate department function
    useEffect(() => {
        if (!activeId) return;
        const handleActivateDepartment = async () => {
            const data = {
                status: isActived,
            };
            const res = await departmentServices.activateDepartment(activeId, data);
            if (res.code === 200) {
                successNotify(res.message);
                setIsSave((isSave) => !isSave);
            } else {
                errorNotify(res);
            }
        };
        handleActivateDepartment();
    }, [activeId, isActived]);

    // Save checked list in localstorage
    useEffect(() => {
        localStorage.setItem('departmentChecked', JSON.stringify(checked));
    }, [checked]);

    // Save checkedAll boolean in localstorage
    useEffect(() => {
        localStorage.setItem('isCheckAllDepartment', JSON.stringify(checkedAll));
    }, [checkedAll]);

    // Check all rows of document types function
    useEffect(() => {
        handleCheckAll(checkedAll, checked?.length, allDepartments, setChecked);
    }, [checkedAll, allDepartments, checked?.length]);

    return (
        <>
            <div className="bg-white p-[16px] mb-5 shadow-4Way">
                <h1 className="text-[1.8rem] md:text-[2.4rem] font-bold">Tìm kiếm</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="relative w-full">
                        <InputField
                            className="default icon"
                            placeholder="Tên phòng ban"
                            value={searchValue}
                            setValue={setSearchValue}
                        />
                        <div className="flex absolute top-[50%] translate-y-[-50%] left-0 w-[45px] h-[45px]">
                            <FontAwesomeIcon className="text-[#a9a9a9] m-auto" icon={faSearch} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:justify-between bg-[#f7f7f7] p-[16px] border border-solid border-[#cccccc] mb-[12px] md:mb-0 shadow-4Way">
                <h1 className="text-[1.8rem] md:text-[2.4rem] font-bold">Danh sách phòng ban</h1>
                <div className="flex md:flex-col lg:flex-row items-center gap-5 mt-3 md:mt-0">
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
                        to="/departments/create"
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
                                        <th scope="col" className="px-6 py-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked?.length === allDepartments?.length}
                                                    onChange={(e) => setCheckedAll(e.target.checked)}
                                                />
                                            </div>
                                        </th>
                                        {tableHeader?.map((item, index) => {
                                            return (
                                                <th key={index} scope="col" className="px-6 py-4">
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
                                    ) : departmentLists?.length !== 0 ? (
                                        departmentLists?.map((dl, index) => {
                                            return (
                                                <tr key={index} className="border-b">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked?.includes(dl?._id)}
                                                                onChange={() =>
                                                                    handleCheck(
                                                                        checked,
                                                                        setChecked,
                                                                        setCheckedAll,
                                                                        dl?._id,
                                                                        allDepartments,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="relative group whitespace-nowrap px-6 py-4 max-w-[200px]">
                                                        <p title={dl?.departmentName} className="w-[200px] truncate">
                                                            {dl?.departmentName}
                                                        </p>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center">
                                                            <SwitchButton
                                                                checked={dl?.status}
                                                                setValue={() => setIsActived(!dl?.status)}
                                                                setId={() => setActiveId(dl?._id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="relative group whitespace-nowrap px-6 py-4 max-w-[200px]">
                                                        <p title={dl?.note} className="w-[200px] truncate">
                                                            {dl?.note}
                                                        </p>
                                                    </td>
                                                    <td className="px-2 py-1 md:px-6 md:py-4">
                                                        <div className="flex items-center text-white">
                                                            <NavLink to={`/departments/edit/${dl?._id}`}>
                                                                <div className="flex w-[30px] h-[30px] bg-green-600 p-2 rounded-lg cursor-pointer hover:text-primary">
                                                                    <FontAwesomeIcon
                                                                        className="m-auto"
                                                                        icon={faPenToSquare}
                                                                    />
                                                                </div>
                                                            </NavLink>
                                                            <div
                                                                onClick={() => handleDelete(dl?._id)}
                                                                className="flex w-[30px] h-[30px] bg-red-600 p-2 ml-2 rounded-lg cursor-pointer hover:text-primary"
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
                            Hiển thị <span>{departmentLists?.length === 0 ? 0 : rowStart}</span> đến{' '}
                            <span>{rowEnd + departmentLists?.length}</span> của <span>{allDepartments?.length}</span>{' '}
                            mục
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
                            checked={checked?.length === allDepartments?.length}
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
                ) : departmentLists?.length !== 0 ? (
                    departmentLists?.map((dl, index) => {
                        return (
                            <DepartmentCard
                                key={index}
                                id={index + 1}
                                departmentId={dl?._id}
                                departmentName={dl?.departmentName}
                                note={dl?.note}
                                activeValue={dl?.status}
                                activeChecked={dl?.status}
                                setIsActived={() => setIsActived(!dl?.status)}
                                setActiveId={() => setActiveId(dl?._id)}
                                handleDelete={() => handleDelete(dl?._id)}
                                checkBox={checked?.includes(dl?._id)}
                                handleCheckBox={() =>
                                    handleCheck(checked, setChecked, setCheckedAll, dl?._id, allDepartments)
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

export default Department;
