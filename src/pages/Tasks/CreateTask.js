import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import FormData from 'form-data';
import Select from 'react-select';
import DropList from '~/components/DropList';
import InputField from '~/components/InputField';
import FileInput from '~/components/FileInput';
import * as documentServices from '~/services/documentServices';
import * as taskServices from '~/services/taskServices';
import * as notificationServices from '~/services/notificationServices';
import * as taskTypeServices from '~/services/taskTypeServices';
import { disabledPastDate, fullNameValidator, dateValidator, dropListValidator } from '~/utils/formValidation';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { useFetchDocuments, useFetchUsers } from '~/hooks';
import Loading from '~/components/Loading';

const CreateTask = ({ title, socket }) => {
    const [allTaskTypes, setAllTaskTypes] = useState([]);
    const [addType, setAddType] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [isSave, setIsSave] = useState(false);
    const [prevAssignTo, setPrevAssignTo] = useState(JSON.parse(localStorage.getItem('prevAssignTo')) || []);
    // Input state
    const [fullName, setFullName] = useState('');
    const [deadline, setDeadline] = useState('');
    const [level, setLevel] = useState('Bình thường');
    const [document, setDocument] = useState('');
    const [newType, setNewType] = useState('');
    const [type, setType] = useState('');
    const [leader, setLeader] = useState();
    const [attachFiles, setAttachFiles] = useState([]);
    const [assignTo, setAssignTo] = useState([]);
    const [desc, setDesc] = useState('');
    const [resources, setResources] = useState([]);
    // Input validation state
    const [fullNameErrMsg, setFullNameErrMsg] = useState({});
    const [isFullNameErr, setIsFullNameErr] = useState(false);
    const [deadlineErrMsg, setDeadlineErrMsg] = useState({});
    const [isDeadlineErr, setIsDeadlineErr] = useState(false);
    const [leaderErrMsg, setLeaderErrMsg] = useState({});
    const [isLeaderErr, setIsLeaderErr] = useState(false);
    const [assignToErrMsg, setAssignToErrMsg] = useState({});
    const [isAssignToErr, setIsAssignToErr] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const allUsers = useFetchUsers().publicUsers.filter((item) => item?.role === 'Member');
    const documents = useFetchDocuments().inProgressDocNames;
    const allDocuments = useFetchDocuments().inProgressDocs;
    const levelOptions = ['Bình thường', 'Ưu tiên', 'Khẩn cấp'];

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

    // Handle add new type
    const handleAddNewType = async () => {
        const data = {
            taskType: newType,
        };
        const res = await taskTypeServices.createTaskType(data);
        if (res.code === 200) {
            setNewType('');
            setAddType(false);
            setIsSave((isSave) => !isSave);
            successNotify(res.message);
        } else {
            errorNotify(res);
        }
    };

    // Just get id of assigned user
    const getAssignToIds = (assignTo) => {
        const array = assignTo.map((item) => item.value);
        return array;
    };

    // Format all users array
    const getUserOptions = () => {
        const options = allUsers?.map((item) => {
            return { value: item._id, label: item.fullName, flag: 'Support' };
        });
        return options;
    };

    // Create user resource for each assigned user
    const setUserResource = () => {
        const options = assignTo?.map((item) => {
            return { userId: item.value, status: 'Chưa nộp', resources: [], isSubmit: false };
        });
        return options;
    };

    // Merge available resources with new resource without duplicate
    const mergeUserResources = () => {
        const ids = new Set(resources.map((d) => d.userId));
        const merged = [...resources, ...setUserResource().filter((d) => !ids.has(d.userId))];
        return merged;
    };

    // Get docId to reference document id
    const getDocId = (value) => {
        const doc = allDocuments.find((item) => item.documentName === value);
        return doc?._id;
    };

    // Create or edit task
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isfullNameValid = fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg);
        const isDateValid = dateValidator(deadline, setIsDeadlineErr, setDeadlineErrMsg);
        const isLeaderValid = dropListValidator(leader, setIsLeaderErr, setLeaderErrMsg);
        const isAssignToValid = dropListValidator(assignTo, setIsAssignToErr, setAssignToErrMsg);
        if (!isfullNameValid || !isDateValid || !isLeaderValid || !isAssignToValid) return;
        setLoading(true);
        const data = {
            taskName: fullName,
            type: type,
            dueDate: deadline,
            level: level,
            refLink: document,
            desc: desc,
            leader: leader,
            assignTo: assignTo,
            resources: mergeUserResources(),
        };

        let res;
        if (id) {
            res = await taskServices.updateTask(id, data);
        } else {
            res = await taskServices.createTask(data);
        }
        if (res.code === 200) {
            getDocId(document) && (await documentServices.updateDocument(getDocId(document), { assignTo: assignTo }));
            if (attachFiles) {
                const data = new FormData();
                for (let i = 0; i < attachFiles.length; i++) {
                    data.append('myFile', attachFiles[i]);
                }
                await taskServices.uploadFile(res.data._id, data);
            }

            if (leader) {
                const data = {
                    userId: leader.value,
                    flag: 'Leader',
                };
                await taskServices.changeAssignRole(res.data._id, data);
            }
            if (!id) {
                setPrevAssignTo(res.newTask.assignTo);
                const newNotiId = await Promise.all(
                    getAssignToIds(res.data.assignTo)?.map(async (userId) => {
                        const noti = await notificationServices.createNotification({
                            notification: 'Bạn có nhiệm vụ mới',
                            userId: userId,
                            linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${res.data._id}`,
                        });
                        return { notiId: noti.data._id, userId: noti.data.userId };
                    }),
                );
                socket.current?.emit('sendNotification', {
                    senderId: userId,
                    _id: newNotiId,
                    receiverId: getAssignToIds(res.data.assignTo),
                    text: 'Bạn có nhiệm vụ mới',
                    linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${res.data._id}`,
                    isRead: false,
                });
            } else {
                const others = getAssignToIds(res.data.assignTo);
                const prev = getAssignToIds(prevAssignTo);
                const final = others.filter((item) => !prev.includes(item));
                setPrevAssignTo(res.data.assignTo);
                const newNotiId = await Promise.all(
                    final?.map(async (userId) => {
                        const noti = await notificationServices.createNotification({
                            notification: 'Bạn có nhiệm vụ mới',
                            userId: userId,
                            linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${res.data._id}`,
                        });
                        return noti.data._id;
                    }),
                );
                socket.current?.emit('sendNotification', {
                    senderId: userId,
                    _id: newNotiId[0],
                    receiverId: final,
                    text: 'Bạn có nhiệm vụ mới',
                    linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${res.data._id}`,
                    isRead: false,
                });
            }
            setLoading(false);
            successNotify(res.message);
            navigate(-1);
        } else {
            setLoading(false);
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
    }, [isSave]);

    // Get available task data when edit task
    useEffect(() => {
        if (!id) return;
        const fetchApi = async () => {
            const res = await taskServices.getTaskById(id);
            setFullName(res.data.taskName);
            setType(res.data.type);
            setDeadline(res.data.dueDate);
            setLevel(res.data.level);
            setDocument(res.data.refLink);
            setDesc(res.data.desc);
            setAssignTo(res.data.assignTo);
            setLeader(res.data.leader);
            setResources(res.data.resources);
            setPrevAssignTo(res.data.assignTo);
        };
        fetchApi();
    }, [id]);

    // Save previous assigned user to localstorage
    useEffect(() => {
        localStorage.setItem('prevAssignTo', JSON.stringify(prevAssignTo));
    }, [prevAssignTo]);

    // Get user id
    useEffect(() => {
        const uid = JSON.parse(localStorage.getItem('userId'));
        setUserId(uid);
    }, []);

    return (
        <>
            <div className="bg-white p-[16px] shadow-4Way border-t-[3px] border-blue-600">
                <h1 className="text-[2rem] font-bold">{title}</h1>
                <form autoComplete="on">
                    <div className="mt-8">
                        <label className="font-bold">
                            Tên công việc: <span className="text-red-600">*</span>
                        </label>
                        <InputField
                            id="fullName"
                            className={isFullNameErr ? 'invalid' : 'default'}
                            placeholder="Tên công việc"
                            value={fullName}
                            setValue={setFullName}
                            onBlur={() => fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{fullNameErrMsg.fullName}</p>
                    </div>
                    <div className="flex flex-col md:flex-row mt-7 gap-6">
                        <div className="flex-1">
                            <label className="font-bold">
                                Ngày đến hạn: <span className="text-red-600">*</span>
                            </label>
                            <InputField
                                name="datetime-local"
                                className={isDeadlineErr ? 'invalid' : 'default'}
                                value={deadline}
                                setValue={setDeadline}
                                min={disabledPastDate()}
                                onBlur={() => dateValidator(deadline, setIsDeadlineErr, setDeadlineErrMsg)}
                            />
                            <p className="text-red-600 text-[1.3rem]">{deadlineErrMsg.dueDate}</p>
                        </div>
                        <div className="flex-1">
                            <label className="font-bold">Mức độ:</label>
                            <DropList
                                selectedValue={level}
                                options={levelOptions}
                                setValue={setLevel}
                                setId={() => undefined}
                            />
                        </div>
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">Dựa trên văn bản:</label>
                        <DropList
                            selectedValue={document}
                            options={documents}
                            setValue={setDocument}
                            setId={() => undefined}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row mt-7 gap-6">
                        <div className="flex-1">
                            <label className="font-bold">
                                Nhóm trưởng: <span className="text-red-600">*</span>
                            </label>
                            <Select
                                styles={selectStyles}
                                className={isLeaderErr && 'droplistInvalid'}
                                placeholder="--Vui lòng chọn--"
                                options={assignTo}
                                onChange={setLeader}
                                onBlur={() => dropListValidator(leader, setIsLeaderErr, setLeaderErrMsg)}
                                value={leader}
                            />
                            <p className="text-red-600 text-[1.3rem]">{leaderErrMsg.leader}</p>
                        </div>
                        <div className="flex-1">
                            <label className="font-bold">Loại:</label>
                            <div className="flex items-center gap-x-3">
                                {!addType ? (
                                    <div className="flex-1">
                                        <DropList
                                            selectedValue={type}
                                            options={allTaskTypes}
                                            setValue={setType}
                                            setId={() => undefined}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <InputField
                                            id="type"
                                            className="default"
                                            placeholder="Loại công việc"
                                            value={newType}
                                            setValue={setNewType}
                                        />
                                    </div>
                                )}
                                {!newType ? (
                                    <div onClick={() => setAddType(!addType)} className="text-[2rem] cursor-pointer">
                                        <FontAwesomeIcon icon={addType ? faXmark : faPlusCircle} />
                                    </div>
                                ) : (
                                    <div onClick={handleAddNewType} className="text-[2rem] cursor-pointer">
                                        <FontAwesomeIcon icon={faPlusCircle} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">
                            Người thực hiện: <span className="text-red-600">*</span>
                        </label>
                        <Select
                            styles={selectStyles}
                            isMulti
                            className={isAssignToErr && 'droplistInvalid'}
                            placeholder="--Vui lòng chọn--"
                            options={getUserOptions()}
                            onChange={setAssignTo}
                            onBlur={() => dropListValidator(assignTo, setIsAssignToErr, setAssignToErrMsg)}
                            value={assignTo}
                        />
                        <p className="text-red-600 text-[1.3rem]">{assignToErrMsg.assignTo}</p>
                    </div>
                    {!id && (
                        <div className="mt-7">
                            <label className="font-bold">File đính kèm:</label>
                            <FileInput setAttachFiles={setAttachFiles} />
                        </div>
                    )}
                    <div className="mt-7">
                        <label className="font-bold">Mô tả công việc:</label>
                        <InputField
                            textarea
                            className="default textarea"
                            placeholder="Mô tả công việc"
                            rows="6"
                            cols="50"
                            value={desc}
                            setValue={setDesc}
                        />
                    </div>
                    <div className="block md:flex items-center gap-5 mt-12">
                        <button
                            onClick={handleSubmit}
                            className="w-full md:w-fit text-center text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} /> Lưu thông tin
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(-1);
                            }}
                            className="block w-full md:w-fit text-center text-[white] bg-red-600 mt-4 md:mt-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faXmark} /> Hủy bỏ
                        </button>
                    </div>
                </form>
            </div>
            {loading && (
                <div className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[.15] z-[999]">
                    <Loading />
                </div>
            )}
        </>
    );
};

export default CreateTask;
