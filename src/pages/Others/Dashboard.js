import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBookmark, faListCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import BarChart from '~/components/Chart/BarChart';
import PieChart from '~/components/Chart/PieChart';
import { useFetchTasks, useFetchUsers, useFetchDocuments } from '~/hooks';
import * as documentServices from '~/services/documentServices';

const Dashboard = () => {
    const [allDocumentOuts, setAllDocumentOuts] = useState([]);
    // Chart option state
    const [barOption, setBarOption] = useState({
        label: 'Theo loại',
        value: 'type',
    });
    const [pieOption, setPieOption] = useState({
        label: 'Theo loại',
        value: 'type',
    });

    const allTasks = useFetchTasks();
    const allUsers = useFetchUsers().publicUsers;
    // const allDocuments = useFetchDocuments().allDocuments;
    const allDocumentIns = useFetchDocuments().allDocumentIns;
    // const allDocumentOuts = useFetchDocuments().allDocumentOuts;
    // Filter options in bar chart
    const barOptions = [
        {
            label: 'Theo loại',
            value: 'type',
        },
        {
            label: 'Theo nơi ban hành',
            value: 'sender',
        },
        {
            label: 'Theo trạng thái',
            value: 'status',
        },
        {
            label: 'Theo mức độ',
            value: 'level',
        },
        {
            label: 'Theo vị trí hiện tại',
            value: 'currentLocation',
        },
    ];
    // Filter options in pie chart
    const pieOptions = [
        {
            label: 'Theo loại',
            value: 'type',
        },
        {
            label: 'Theo tiến trình',
            value: 'progress',
        },
        {
            label: 'Theo trạng thái',
            value: 'status',
        },
        {
            label: 'Theo mức độ',
            value: 'level',
        },
    ];

    // React-select style
    const selectStyles = {
        singleValue: (base) => ({
            ...base,
            fontSize: '1.5rem',
            paddingLeft: '2px',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#000000',
            lineHeight: 0,
            fontSize: '1.5rem',
            paddingLeft: '8px',
        }),
        indicatorSeparator: (base) => ({
            ...base,
            display: 'none !important',
        }),
        indicatorsContainer: (base) => ({
            ...base,
            display: 'none !important',
        }),
        menu: (base) => ({
            ...base,
            padding: '0 !important',
            borderRadius: 'unset !important',
            marginTop: '1px !important',
        }),
        menuList: (base) => ({
            ...base,
            padding: '0 !important',
            borderRadius: 'unset !important',
        }),
        option: (base, { isSelected }) => ({
            ...base,
            fontSize: '1.5rem',
            padding: '0 16px',
            color: isSelected ? '#ffffff' : '#000000',
            backgroundColor: isSelected ? '#2684ff' : '#ffffff',
            ':hover': {
                color: '#ffffff',
                backgroundColor: '#2684ff',
            },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            fontSize: '1.5rem',
            padding: '0 16px',
        }),
        valueContainer: (base) => ({
            ...base,
            backgroundPosition: 'calc(100% - 12px) center !important',
            background: `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 20 20' aria-hidden='true' class='svg' xmlns='http://www.w3.org/2000/svg'><path d='M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z'></path></svg>") no-repeat`,
        }),
    };

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="text-white bg-[#2417ab] rounded-lg">
                    <div className="flex items-center justify-between p-[18px]">
                        <div>
                            <p className="font-bold text-[3rem]">{allUsers?.length}</p>
                            <p className="text-[1.4rem]">Người dùng</p>
                        </div>
                        <div className="text-[5.6rem] text-[#000000]/[0.3]">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                    </div>
                </div>
                <div className="text-white bg-[#2f8fe9] rounded-lg">
                    <div className="flex items-center justify-between p-[18px]">
                        <div>
                            <p className="font-bold text-[3rem]">{allDocumentIns?.length}</p>
                            <p className="text-[1.4rem]">Văn bản đến</p>
                        </div>
                        <div className="text-[5.6rem] text-[#000000]/[0.3]">
                            <FontAwesomeIcon icon={faBook} />
                        </div>
                    </div>
                </div>
                <div className="text-white bg-[#f7a10f] rounded-lg">
                    <div className="flex items-center justify-between p-[18px]">
                        <div>
                            <p className="font-bold text-[3rem]">{allDocumentOuts?.length}</p>
                            <p className="text-[1.4rem]">Văn bản đi</p>
                        </div>
                        <div className="text-[5.6rem] text-[#000000]/[0.3]">
                            <FontAwesomeIcon icon={faBookmark} />
                        </div>
                    </div>
                </div>
                <div className="text-white bg-[#df4545] rounded-lg">
                    <div className="flex items-center justify-between p-[18px]">
                        <div>
                            <p className="font-bold text-[3rem]">{allTasks?.length}</p>
                            <p className="text-[1.4rem]">Công việc</p>
                        </div>
                        <div className="text-[5.6rem] text-[#000000]/[0.3]">
                            <FontAwesomeIcon icon={faListCheck} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-[16px] shadow-4Way border-t-[3px] border-blue-600 mt-6">
                <div className="w-[50%]">
                    <Select styles={selectStyles} options={barOptions} onChange={setBarOption} value={barOption} />
                </div>
                <BarChart
                    typeOption={barOption}
                    allDocuments={[...allDocumentIns, ...allDocumentOuts]}
                    allDocumentIns={allDocumentIns}
                    allDocumentOuts={allDocumentOuts}
                />
            </div>
            <div className="bg-white p-[16px] shadow-4Way border-t-[3px] border-red-600 mt-6">
                <div className="w-[50%]">
                    <Select styles={selectStyles} options={pieOptions} onChange={setPieOption} value={pieOption} />
                </div>
                <PieChart typeOption={pieOption} allTasks={allTasks} />
            </div>
        </>
    );
};

export default Dashboard;
