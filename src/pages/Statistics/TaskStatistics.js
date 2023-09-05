import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import DropList from '~/components/DropList';
import * as taskServices from '~/services/taskServices';
import * as taskTypeServices from '~/services/taskTypeServices';
import ExportExcelAll from '~/components/ExportFile/Task/All/ExportExcel';
import ExportWordAll from '~/components/ExportFile/Task/All/ExportWord';
import ExportExcelUser from '~/components/ExportFile/Task/User/ExportExcel';
import ExportWordUser from '~/components/ExportFile/Task/User/ExportWord';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { useFetchTasks, useFetchUsers } from '~/hooks';
import Loading from '~/components/Loading';

const TaskStatistics = () => {
    const [allTaskTypes, setAllTaskTypes] = useState([]);
    const [tab, setTab] = useState('Tổng hợp');
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('Excel(.xlsx)');
    const [preview, setPreview] = useState(false);
    const [statisticTasks, setStatisticTasks] = useState([]);
    const [statisticUserTasks, setStatisticUserTasks] = useState([]);
    // Filter statistic state
    const [fType, setFType] = useState('');
    const [fProgress, setFProgress] = useState('');
    const [fStatus, setFStatus] = useState('');
    const [fLevel, setFLevel] = useState('');
    const [fFrom, setFFrom] = useState('');
    const [fTo, setFTo] = useState('');

    const allTasks = useFetchTasks();
    const allUsers = useFetchUsers().privateUsers;
    // Filter statistic options
    const tabOptions = ['Tổng hợp', 'Thành viên'];
    const levelOptions = ['Bình thường', 'Ưu tiên', 'Khẩn cấp'];
    const progressOptions = ['Đang xử lý', 'Chờ duyệt', 'Hoàn thành'];
    const statusOptions = ['Còn hạn', 'Sắp đến hạn', 'Quá hạn'];
    const exportOptions = ['Excel(.xlsx)', 'Word(.docx)'];
    let timer;

    const checkFromTo = (createdAt, from, to) => {
        return (
            new Date(new Date(createdAt).toLocaleDateString()).getTime() <= new Date(to).getTime() &&
            new Date(new Date(createdAt).toLocaleDateString()).getTime() >= new Date(from).getTime()
        );
    };

    // Statistic all function
    const handleStatisticAll = async () => {
        setLoading(true);
        if (fProgress || fType || fStatus || fLevel || (fFrom && fTo)) {
            const res = await taskServices.getAllTask(
                1,
                1,
                '',
                '',
                '',
                fType || '',
                fStatus || '',
                fLevel || '',
                fProgress || '',
            );
            if (res.code === 200) {
                let finalData;
                if (fFrom && fTo) {
                    finalData = res?.allTasks?.filter((item) => {
                        return checkFromTo(item.createdAt, fFrom, fTo);
                    });
                    setStatisticTasks(finalData);
                } else {
                    setStatisticTasks(res.allTasks);
                }
                setLoading(false);
                setPreview(true);
                successNotify('Thống kê thành công');
            } else {
                setLoading(false);
                console.log(res);
            }
        } else {
            setLoading(false);
            errorNotify('Hãy chọn ít nhất 1 trường');
        }
    };

    // Statistic users function
    const handleStatisticUsers = () => {
        setLoading(true);
        if (!(fFrom && fTo)) {
            setLoading(false);
            return errorNotify('Hãy chọn khoảng thời gian cần thốn kê');
        }
        const finalData = allUsers?.map((u) => {
            const tasks = allTasks
                ?.filter((t) => t?.assignTo?.find((item) => item.value === u._id))
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo));
            const unDueTask = tasks
                ?.filter((pt) => pt?.status === 'Còn hạn')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const dueSoonTask = tasks
                ?.filter((pt) => pt?.status === 'Sắp đến hạn')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const outOfDateTask = tasks
                ?.filter((pt) => pt?.status === 'Quá hạn')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const inProgressTask = tasks
                ?.filter((pt) => pt?.progress === 'Đang xử lý')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const pendingTask = tasks
                ?.filter((pt) => pt?.status === 'Chờ duyệt')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const finishTask = tasks
                ?.filter((pt) => pt?.status === 'Hoàn thành')
                ?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;

            return {
                user: u.fullName,
                tasks,
                unDueTask,
                dueSoonTask,
                outOfDateTask,
                inProgressTask,
                pendingTask,
                finishTask,
            };
        });
        timer = setTimeout(() => {
            setLoading(false);
            setStatisticUserTasks(finalData);
            successNotify('Thống kê thành công');
            setPreview(true);
        }, 1500);
    };

    useEffect(() => {
        return () => clearTimeout(timer);
    }, [timer]);

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

    return (
        <>
            <div className="bg-white p-[16px] mb-5 shadow-4Way border-t-[3px] border-blue-600">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <h1 className="text-[2rem] md:text-[2.4rem] font-bold">Thống kê công việc</h1>
                    <button
                        onClick={tab === 'Tổng hợp' ? handleStatisticAll : handleStatisticUsers}
                        className="text-[1.3rem] w-fit md:text-[1.6rem] text-[white] bg-blue-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] whitespace-nowrap"
                    >
                        <FontAwesomeIcon icon={faChartColumn} /> Thống kê
                    </button>
                </div>
                <div className="w-[50%] mt-5">
                    <h3>Theo:</h3>
                    <DropList selectedValue={tab} options={tabOptions} setValue={setTab} setId={() => undefined} />
                </div>
                {tab === 'Tổng hợp' ? (
                    <div className="mt-5">
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="flex-1">
                                <label className="text-[1.4rem]">Tiến trình:</label>
                                <DropList
                                    selectedValue={fProgress}
                                    options={progressOptions}
                                    setValue={setFProgress}
                                    setId={() => undefined}
                                />
                            </div>

                            <div className="block md:flex items-center gap-1 flex-1">
                                <div className="flex items-center flex-1 gap-1">
                                    <div className="flex-1">
                                        <label className="text-[1.4rem]">Từ ngày:</label>
                                        <InputField
                                            name="date"
                                            className="default leading-[1.3]"
                                            value={fFrom}
                                            setValue={setFFrom}
                                        />
                                    </div>
                                    <span className="mt-10">-</span>
                                </div>
                                <div className="flex-1 mt-5 md:mt-0">
                                    <label className="text-[1.4rem]">Đến ngày:</label>
                                    <InputField
                                        name="date"
                                        className="default leading-[1.3]"
                                        value={fTo}
                                        setValue={setFTo}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-5 mt-[12.5px]">
                            <div className="flex-1">
                                <label className="text-[1.4rem]">Loại công việc:</label>
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
                    </div>
                ) : (
                    <div className="mt-5">
                        <div className="block md:flex items-center gap-1 flex-1">
                            <div className="flex items-center flex-1 gap-1">
                                <div className="flex-1">
                                    <label className="text-[1.4rem]">Từ ngày:</label>
                                    <InputField
                                        name="date"
                                        className="default leading-[1.3]"
                                        value={fFrom}
                                        setValue={setFFrom}
                                    />
                                </div>
                                <span className="mt-10">-</span>
                            </div>
                            <div className="flex-1 mt-5 md:mt-0">
                                <label className="text-[1.4rem]">Đến ngày:</label>
                                <InputField
                                    name="date"
                                    className="default leading-[1.3]"
                                    value={fTo}
                                    setValue={setFTo}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className={preview ? 'bg-white p-[16px] mb-5 shadow-4Way border-t-[3px] border-blue-600' : 'hidden'}>
                {tab === 'Tổng hợp' ? (
                    <div className="flex items-center gap-5 w-full md:w-[50%]">
                        <DropList
                            selectedValue={exportType}
                            options={exportOptions}
                            setValue={setExportType}
                            setId={() => undefined}
                        />
                        {exportType === 'Excel(.xlsx)' ? (
                            <ExportExcelAll
                                allTasks={statisticTasks}
                                fType={fType}
                                fStatus={fStatus}
                                fLevel={fLevel}
                                fProgress={fProgress}
                                fFrom={fFrom}
                                fTo={fTo}
                            />
                        ) : (
                            <ExportWordAll
                                allTasks={statisticTasks}
                                fType={fType}
                                fStatus={fStatus}
                                fLevel={fLevel}
                                fProgress={fProgress}
                                fFrom={fFrom}
                                fTo={fTo}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-5 w-full md:w-[50%]">
                        <DropList
                            selectedValue={exportType}
                            options={exportOptions}
                            setValue={setExportType}
                            setId={() => undefined}
                        />
                        {exportType === 'Excel(.xlsx)' ? (
                            <ExportExcelUser allDatas={statisticUserTasks} fFrom={fFrom} fTo={fTo} />
                        ) : (
                            <ExportWordUser allDatas={statisticUserTasks} fFrom={fFrom} fTo={fTo} />
                        )}
                    </div>
                )}
            </div>
            {loading && (
                <div className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[.15] z-[999]">
                    <Loading />
                </div>
            )}
        </>
    );
};

export default TaskStatistics;
