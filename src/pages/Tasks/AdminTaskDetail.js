import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faXmark,
    faPlusCircle,
    faCheckCircle,
    faCircleXmark,
    faArrowRotateLeft,
    faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import CommentItem from '~/components/CommentItem';
import * as taskServices from '~/services/taskServices';
import * as notificationServices from '~/services/notificationServices';
import * as commentServices from '~/services/commentServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { setLevelColor, setFileIcon } from '~/utils/setMultiConditions';
import { useFetchComments, useFetchUsers, useFetchDocuments } from '~/hooks';
import Loading from '~/components/Loading';
import { formatVNDateTime } from '~/utils/formatDateTime';
import { faMessage } from '@fortawesome/free-regular-svg-icons';

const AdminTaskDetail = ({ socket }) => {
    const [commentId, setCommentId] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSave, setIsSave] = useState(false);
    const [tab, setTab] = useState('detail');
    const [task, setTask] = useState({});
    const [attachFiles, setAttachFiles] = useState([]);
    // Progress bar state
    const [percent, setPercent] = useState('');
    const [progressStyle, setProgressStyle] = useState('');

    const userId = JSON.parse(localStorage.getItem('userId'));
    const { id } = useParams();
    const navigate = useNavigate();
    const allUsers = useFetchUsers().publicUsers;
    const allComments = useFetchComments({ id, allUsers, isSave, qtyCmt: false });
    const allDocuments = useFetchDocuments().inProgressDocs;
    const ref = useRef();

    // Update tab
    const onUpdateTab = (value) => {
        setTab(value);
    };

    // Get link to reference document detail
    const getRefLink = () => {
        const refLink = allDocuments.find((item) => item.documentName === task?.refLink);
        return `${process.env.REACT_APP_BASE_URL}/documents/detail/${refLink?._id}`;
    };

    // Get assignment resources of leader
    const getLeaderResources = () => {
        const leaderResources = task?.resources?.find((item) => item.userId === task?.leader?.value);
        return leaderResources;
    };

    // Change task progress
    const handleChangeProgress = async (value) => {
        setLoading(true);
        const res = await taskServices.updateProgress(id, { taskProgress: value });
        if (res.code === 200) {
            successNotify(value === 'Hoàn thành' ? 'Nhiệm vụ đã hoàn thành' : 'Nhiệm vụ chưa hoàn thành');
            setIsSave((isSave) => !isSave);

            const data1 = {
                flag: false,
                msg: '',
            };
            await taskServices.undoTask(id, data1);

            const newNotiId = await Promise.all(
                getAssignToIds(task?.assignTo)?.map(async (userId) => {
                    const noti = await notificationServices.createNotification({
                        notification: `Nhiệm vụ ${task?.taskName} ${
                            value === 'Hoàn thành' ? 'đã hoàn thành' : 'không được chấp nhận'
                        }`,
                        userId: userId,
                        linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${id}`,
                    });
                    return { notiId: noti.data._id, userId: noti.data.userId };
                }),
            );
            socket.current?.emit('sendNotification', {
                senderId: userId,
                _id: newNotiId,
                receiverId: getAssignToIds(task?.assignTo),
                text: `Nhiệm vụ ${task?.taskName} ${value === 'Hoàn thành' ? 'đã hoàn thành' : 'không được chấp nhận'}`,
                linkTask: `${process.env.REACT_APP_BASE_URL}/tasks/detail/${id}`,
                isRead: false,
            });
            setLoading(false);
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    // Delete attach file
    const handleDeleteFile = async (fileName) => {
        const data = {
            filename: fileName,
        };
        const res = await taskServices.deleteFileUrl(id, data);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res.message);
        }
    };

    // Create or edit comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        const data = {
            taskId: id,
            content: comment,
        };
        let res;
        if (commentId) {
            res = await commentServices.updateComment(commentId, data);
        } else {
            res = await commentServices.createComment(data);
        }
        if (res.code === 200) {
            setComment('');
            setCommentId('');
            setIsSave((isSave) => !isSave);
            successNotify(res.message);
        } else {
            errorNotify(res);
        }
    };

    // Delete one comment
    const handleDelete = async (id) => {
        const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn bình luận không?`;
        if (!window.confirm(confirmMsg)) return;
        const res = await commentServices.deleteCommentById(id);
        if (res.code === 200) {
            successNotify(res.message);
            setIsSave((isSave) => !isSave);
        } else {
            errorNotify(res);
        }
    };

    // Just get id of assigned users
    const getAssignToIds = (arr) => {
        const final = arr.map((item) => item.value);
        return final;
    };

    // Get comment by id
    useEffect(() => {
        if (!commentId) return;
        const fetchApi = async () => {
            const res = await commentServices.getCommentById(commentId);
            if (res.code === 200) {
                setComment(res.data.content);
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, [commentId]);

    // Update progress bar
    useEffect(() => {
        const setStatusPercentage = () => {
            if (task?.progress === 'Hoàn thành') {
                setPercent('100%');
                setProgressStyle('text-[1rem] md:text-[1.4rem] progress-bar full');
            } else if (task?.progress === 'Chờ duyệt') {
                setPercent('60%');
                setProgressStyle('text-[1rem] md:text-[1.4rem] progress-bar percent60');
            } else if (task?.progress === 'Đang xử lý') {
                setPercent('30%');
                setProgressStyle('text-[1rem] md:text-[1.4rem] progress-bar percent30');
            }
        };
        setStatusPercentage();
    }, [task?.progress]);

    // Get current task data
    useEffect(() => {
        if (!id) return;
        const fetchApi = async () => {
            const res = await taskServices.getTaskById(id);
            if (res.code === 200) {
                setTask(res.data);
            } else {
                navigate('/error');
            }
        };
        fetchApi();
    }, [id, isSave, navigate]);

    // Add more attach file
    useEffect(() => {
        if (attachFiles.length === 0) return;
        const uploadFile = async () => {
            const data = new FormData();
            for (let i = 0; i < attachFiles?.length; i++) {
                data.append('myFile', attachFiles[i]);
            }
            const res = await taskServices.uploadFile(id, data);
            if (res.code === 200) {
                setAttachFiles([]);
                ref.current.value = '';
                successNotify(res.message);
                setIsSave((isSave) => !isSave);
            } else {
                errorNotify(res.message);
            }
        };
        uploadFile();
    }, [attachFiles, id]);

    return (
        <>
            <ul className="flex flex-wrap text-[1.5rem] font-medium text-center text-gray-500">
                <li onClick={() => onUpdateTab('detail')} className="mr-2 cursor-pointer">
                    <h3
                        className={
                            tab === 'detail'
                                ? 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-white activeTab'
                                : 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-white'
                        }
                    >
                        Chi tiết
                    </h3>
                </li>
                <li onClick={() => onUpdateTab('resources')} className="mr-2 cursor-pointer">
                    <h3
                        className={
                            tab === 'resources'
                                ? 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-white activeTab'
                                : 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-white'
                        }
                    >
                        Tài nguyên
                    </h3>
                </li>
            </ul>
            <div className="block lg:flex lg:items-start lg:gap-4">
                <div className="bg-white p-[16px] mb-5 shadow-lg flex-[5]">
                    <div className={tab === 'detail' ? '' : 'hidden'}>
                        <div>
                            <h3 className="inline-block text-[2rem] font-bold">
                                {task?.taskName}{' '}
                                <span className="inline-block align-text-top w-fit text-white text-[1.3rem] font-semibold text-center p-1 rounded-lg bg-blue-500">
                                    {task?.type}
                                </span>{' '}
                                <span className={setLevelColor(task?.level)}>{task?.level}</span>
                            </h3>
                            <p className="text-[1.4rem] mt-6">{task?.desc}</p>
                            <div className="flex items-center mt-12">
                                <div className="flex-1">
                                    <h3 className="text-[1.8rem] font-bold">Ngày bắt đầu:</h3>
                                    <p className="text-[1.4rem]">{formatVNDateTime(task?.createdAt)}</p>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[1.8rem] font-bold">Ngày kết thúc:</h3>
                                    <p className="text-[1.4rem]">{formatVNDateTime(task?.dueDate)}</p>
                                </div>
                            </div>
                            <div className="mt-12">
                                <h3 className="text-[1.8rem] font-bold">Tiến trình:</h3>
                                <div className="bg-gray-200 rounded-full mt-3">
                                    <div className={progressStyle}>
                                        <span>{percent}</span> <span>{task?.progress}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <h3 className="text-[1.8rem] font-bold">Người thực hiện:</h3>
                                <div className="group relative flex -space-x-2 w-fit">
                                    {task?.assignTo?.slice(0, 3).map((at, index) => {
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
                                            task?.assignTo?.length > 3
                                                ? 'hs-dropdown relative inline-flex [--placement:top-left]'
                                                : 'hidden'
                                        }
                                    >
                                        <div className="inline-flex items-center justify-center h-[35px] w-[35px] rounded-full bg-gray-200 border-2 border-white font-medium text-gray-700 shadow-sm align-middle">
                                            <span className="font-medium leading-none text-[1.3rem]">
                                                +{task?.assignTo?.length - 3}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="group-hover:block hidden absolute top-0 left-[120%] whitespace-nowrap z-10 px-3 py-2 text-[1.4rem] font-medium text-white bg-gray-900 rounded-lg shadow-sm">
                                        {task?.assignTo?.map((item, index) => {
                                            return (
                                                <p key={index} className="m-auto">{`${item?.label} - ${item.flag}`}</p>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <h3 className="text-[1.8rem] font-bold">File đính kèm:</h3>
                                <ul>
                                    {task?.attachFiles?.map((item, index) => (
                                        <li key={index} className="mb-2">
                                            <div className="flex items-center w-fit">
                                                <div className="w-[24px] h-[24px] mr-3">{setFileIcon(item)}</div>
                                                <span className="flex-1">
                                                    <a
                                                        className="text-blue-600 text-[1.4rem]"
                                                        href={item}
                                                        target="_blank"
                                                        rel="noreferrer noopener"
                                                    >
                                                        {item.replace('http://192.168.1.188:8080/static/', '')}
                                                    </a>
                                                    <span
                                                        onClick={() => handleDeleteFile(item)}
                                                        className="inline-block align-middle text-[1.7rem] text-red-600 ml-3 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </span>
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                    <li>
                                        <label
                                            className="text-center text-[1.4rem] leading-[1] font-bold text-blue-700 bg-transparent py-[6px] rounded-3xl cursor-pointer"
                                            htmlFor="upload"
                                        >
                                            <FontAwesomeIcon icon={faPlusCircle} /> Thêm mới
                                        </label>
                                        <input
                                            id="upload"
                                            className="absolute opacity-0 z-[-1] rounded-3xl"
                                            type="file"
                                            name="myFile"
                                            onChange={(e) => setAttachFiles(e.target.files)}
                                            multiple
                                            ref={ref}
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12">
                                <h3 className="text-[1.8rem] font-bold">Liên kết liên quan:</h3>
                                <NavLink
                                    className="text-[1.4rem]"
                                    to={getRefLink().replace('http://192.168.1.188', '')}
                                >
                                    {task?.refLink}
                                </NavLink>
                            </div>
                        </div>
                        <div className="block md:flex items-center gap-5 mt-12">
                            <button
                                onClick={() => handleChangeProgress('Hoàn thành')}
                                className={
                                    task?.progress === 'Chờ duyệt'
                                        ? 'w-full md:w-fit text-center text-[white] bg-[#27a243] mt-4 md:mt-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]'
                                        : 'hidden'
                                }
                            >
                                <FontAwesomeIcon icon={faCheckCircle} /> Chấp nhận
                            </button>
                            <button
                                onClick={() => handleChangeProgress('Đang xử lý')}
                                className={
                                    task?.progress === 'Chờ duyệt'
                                        ? 'w-full md:w-fit text-center text-[white] bg-[#f7bb07] mt-4 md:mt-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]'
                                        : 'hidden'
                                }
                            >
                                <FontAwesomeIcon icon={faCircleXmark} /> Không chấp nhận
                            </button>
                            <button
                                onClick={() => handleChangeProgress('Đang xử lý')}
                                className={
                                    task?.progress === 'Hoàn thành'
                                        ? 'w-full md:w-fit text-center text-[white] bg-red-600 mt-4 md:mt-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]'
                                        : 'hidden'
                                }
                            >
                                <FontAwesomeIcon icon={faArrowRotateLeft} /> Hoàn tác
                            </button>
                            <div
                                onClick={() => navigate(-1)}
                                className="block w-full md:w-fit text-center text-[white] bg-blue-600 my-4 md:my-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] cursor-pointer"
                            >
                                {'<<'} Trở về
                            </div>
                        </div>
                    </div>
                    <div className={tab === 'resources' ? '' : 'hidden'}>
                        <div className="border border-dashed border-[#cccccc] p-5">
                            <p className="text-[1.4rem] font-bold">
                                Người nộp: <span className="font-normal">{task?.leader?.label}</span>
                            </p>
                            <div>
                                <p className="text-[1.4rem] font-bold">Tài nguyên:</p>
                                <ul>
                                    {getLeaderResources()?.resources?.map((fileName, index) => {
                                        return (
                                            <li key={index} className="mb-2">
                                                <div className="flex items-center w-fit">
                                                    <div className="w-[24px] h-[24px] mr-3">
                                                        {setFileIcon(fileName)}
                                                    </div>
                                                    <a
                                                        className="text-blue-600 text-[1.4rem] flex-1"
                                                        href={fileName}
                                                        target="_blank"
                                                        rel="noreferrer noopener"
                                                    >
                                                        {fileName.replace('http://192.168.1.188:8080/static/', '')}
                                                    </a>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-[2]">
                    <div className="bg-white p-[16px] shadow-lg">
                        <h3>Bình luận</h3>
                        <form>
                            <InputField
                                textarea
                                className="default textarea"
                                rows="3"
                                cols="50"
                                placeholder="Viết gì đó..."
                                value={comment}
                                setValue={setComment}
                            />
                            <button
                                onClick={handleSubmitComment}
                                className="w-full md:w-fit text-[1.4rem] text-center text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                            >
                                Gửi
                            </button>
                        </form>
                        <ul className="max-h-[500px] mt-5 p-2 overflow-y-auto">
                            {allComments?.map((cm, index) => {
                                return (
                                    <CommentItem
                                        key={index}
                                        currUserId={userId}
                                        userCommentId={cm?.userId}
                                        img={
                                            cm?.avatar ||
                                            'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg'
                                        }
                                        username={cm?.userName}
                                        content={cm?.content}
                                        cmtDate={cm?.date}
                                        handleEdit={() => setCommentId(cm?.commentId)}
                                        handleDelete={() => handleDelete(cm?.commentId)}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                    <div className={task?.isUndo?.flag === true ? 'bg-white p-[16px] shadow-lg mt-5' : 'hidden'}>
                        <p className="flex items-center gap-x-3">
                            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-600 text-[2rem]" />
                            <span className="text-[1.5rem]">Yêu cầu hoàn tác từ người dùng</span>
                        </p>
                        <p className="flex items-center gap-x-3 mt-2">
                            <FontAwesomeIcon icon={faMessage} className="text-red-600 text-[2rem]" />
                            <span className="text-[1.5rem]">{task?.isUndo?.msg}</span>
                        </p>
                    </div>
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

export default AdminTaskDetail;
