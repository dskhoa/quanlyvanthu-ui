import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import DropList from '~/components/DropList';
import * as documentServices from '~/services/documentServices';
import * as notificationServices from '~/services/notificationServices';
import ExportExcel from '~/components/ExportFile/System/ExportExcel';
import ExportWord from '~/components/ExportFile/System/ExportWord';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { useFetchTasks, useFetchDepartments, useFetchComments, useFetchDocuments, useFetchUsers } from '~/hooks';
import Loading from '~/components/Loading';

const SystemStatistics = () => {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('Excel(.xlsx)');
    const [preview, setPreview] = useState(false);
    // List data function
    const [allDocumentOuts, setAllDocumentOuts] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    const [filterData, setFilterData] = useState([]);
    // Filter statistic state
    const [fFrom, setFFrom] = useState('');
    const [fTo, setFTo] = useState('');

    const allTasks = useFetchTasks();
    const allUsers = useFetchUsers().publicUsers;
    const allDepartments = useFetchDepartments({ isActived: undefined });
    const allComments = useFetchComments({ qtyCmt: true });
    const allDocumentIns = useFetchDocuments().allDocumentIns;
    // const allDocumentOuts = useFetchDocuments().allDocumentOuts;
    const exportOptions = ['Excel(.xlsx)', 'Word(.docx)'];
    let timer;

    const checkFromTo = (createdAt, from, to) => {
        return (
            new Date(new Date(createdAt).toLocaleDateString()).getTime() <= new Date(to).getTime() &&
            new Date(new Date(createdAt).toLocaleDateString()).getTime() >= new Date(from).getTime()
        );
    };

    // Statistic function
    const handleStatistic = async () => {
        if (!(fFrom && fTo)) return errorNotify('Hãy chọn khoảng thời gian cần thống kê');
        setLoading(true);
        const finalData = allDepartments?.map((d) => {
            const user = allUsers
                ?.filter((item) => item.department === d)
                .filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const documentIn = allDocumentIns
                ?.filter((item) => item.currentLocation === d)
                .filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const documentOut = allDocumentOuts
                ?.filter((item) => item.currentLocation === d)
                .filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const tasks = allTasks?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const comments = allComments?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            const notifications = allNotifications?.filter((item) => checkFromTo(item.createdAt, fFrom, fTo)).length;
            return {
                department: d,
                allUsers: user,
                allDocumentIns: documentIn,
                allDocumentOuts: documentOut,
                allComments: comments,
                allNotifications: notifications,
                allTasks: tasks,
            };
        });
        timer = setTimeout(() => {
            setLoading(false);
            setFilterData(finalData);
            successNotify('Thống kê thành công');
            setPreview(true);
        }, 1500);
    };

    useEffect(() => {
        return () => clearTimeout(timer);
    }, [timer]);

    // Get all notification from server
    useEffect(() => {
        const fetchApi = async () => {
            const res = await notificationServices.getAllNotification();
            setAllNotifications(res.all);
        };
        fetchApi();
    }, []);

    useEffect(() => {
        const fetchApi = async () => {
            const res = await documentServices.getAllDocument(1, 1, false, '', '', '', '', '', '', '', '');
            if (res.code === 200) {
                setAllDocumentOuts(res.allDocumentOut);
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
                    <h1 className="text-[2rem] md:text-[2.4rem] font-bold">Thống kê hệ thống</h1>
                    <button
                        onClick={handleStatistic}
                        className="text-[1.3rem] w-fit md:text-[1.6rem] text-[white] bg-blue-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] whitespace-nowrap"
                    >
                        <FontAwesomeIcon icon={faChartColumn} /> Thống kê
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-5 mt-5">
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
                            <InputField name="date" className="default leading-[1.3]" value={fTo} setValue={setFTo} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={preview ? 'bg-white p-[16px] mb-5 shadow-4Way border-t-[3px] border-blue-600' : 'hidden'}>
                <div className="flex items-center gap-5 w-full md:w-[50%]">
                    <DropList
                        selectedValue={exportType}
                        options={exportOptions}
                        setValue={setExportType}
                        setId={() => undefined}
                    />
                    {exportType === 'Excel(.xlsx)' ? (
                        <ExportExcel filterData={filterData} fFrom={fFrom} fTo={fTo} />
                    ) : (
                        <ExportWord allComments={allComments.length} filterData={filterData} fFrom={fFrom} fTo={fTo} />
                    )}
                </div>
            </div>
            {loading && (
                <div className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[.15] z-[999]">
                    <Loading />
                </div>
            )}
        </>
    );
};

export default SystemStatistics;
