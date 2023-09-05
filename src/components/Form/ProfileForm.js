import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import InputField from '../InputField';
import DropList from '../DropList';
import * as userServices from '~/services/userServices';
import * as authServices from '~/services/authServices';
import * as departmentServices from '~/services/departmentServices';
import * as reqChangeInfoServices from '~/services/reqChangeInfoServices';
import * as notificationServices from '~/services/notificationServices';
import { successNotify, errorNotify } from '../ToastMessage';
import { fullNameValidator, emailValidator } from '~/utils/formValidation';
import Loading from '../Loading';
import { UserInfoContext } from '~/App';

const ProfileForm = ({ formTitle, setShowForm, setIsSave, socket }) => {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    // Input state
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [birth, setBirth] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    // Input validation state
    const [fullNameErrMsg, setFullNameErrMsg] = useState({});
    const [emailErrMsg, setEmailErrMsg] = useState({});
    const [isFullNameErr, setIsFullNameErr] = useState(false);
    const [isEmailErr, setIsEmailErr] = useState(false);
    const { isChangeUserInfo, setIsChangeUserInfo } = useContext(UserInfoContext);

    const genderList = ['Nam', 'Nữ'];
    const userRole = JSON.parse(localStorage.getItem('userRole'));
    const userId = JSON.parse(localStorage.getItem('userId'));

    // Update user profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isFullNameValid = fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg);
        const isEmailValid = emailValidator(email, setIsEmailErr, setEmailErrMsg);
        if (!isFullNameValid || !isEmailValid) return;
        setLoading(true);
        const data = {
            fullName: fullName,
            gender: gender,
            birthDate: birth,
            email: email,
            phoneNumber: phone,
            department: department,
        };
        const res = await userServices.updateUser(userId, data);
        if (res.code === 200) {
            setLoading(false);
            successNotify(res.message);
            setIsChangeUserInfo(!isChangeUserInfo);
            setShowForm(false);
            setIsSave(true);
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    // Member send request to admin
    const handleRequestChange = async (e) => {
        e.preventDefault();
        const isFullNameValid = fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg);
        const isEmailValid = emailValidator(email, setIsEmailErr, setEmailErrMsg);
        if (!isFullNameValid || !isEmailValid) return;
        setLoading(true);
        const dataToChange = {
            fullName: fullName,
            gender: gender,
            birthDate: birth,
            email: email,
            phoneNumber: phone,
            department: department,
        };
        const finalData = {
            userId: userId,
            dataToChange: dataToChange,
        };
        const res = await reqChangeInfoServices.createReqChangeInfo(finalData);
        if (res.code === 200) {
            setLoading(false);
            successNotify(res.message);
            setShowForm(false);
            setIsSave(true);
            await userServices.changeReqChangeInfoStatus(userId, { isReqChangeInfo: true });
            const newNotiId = await notificationServices.createNotification({
                notification: `Yêu cầu đổi thông tin của ${fullName}`,
                userId: allUsers?.find((item) => item.role === 'Admin')._id,
                linkTask: `${process.env.REACT_APP_BASE_URL}/users/request-change`,
            });
            socket.current?.emit('sendNotification', {
                senderId: userId,
                _id: [{ notiId: newNotiId.data._id, userId: newNotiId.data.userId }],
                receiverId: [allUsers?.find((item) => item.role === 'Admin')._id],
                text: `Yêu cầu đổi thông tin của ${fullName}`,
                linkTask: `${process.env.REACT_APP_BASE_URL}/users/request-change`,
                isRead: false,
            });
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    // Get public info of user
    useEffect(() => {
        const fetchApi = async () => {
            const res = await userServices.getPublicInfo();
            setAllUsers(res.data);
        };
        fetchApi();
    }, []);

    // Get available user data when edit user
    useEffect(() => {
        const fetchApi = async () => {
            const res = await authServices.getCurrUser();
            setFullName(res.fullName);
            setGender(res.gender);
            setBirth(res.birthDate);
            setEmail(res.email);
            setPhone(res.phoneNumber);
            setDepartment(res.department);
        };
        fetchApi();
    }, []);

    // Get all departments from server
    useEffect(() => {
        const fetchApi = async () => {
            const res = await departmentServices.getAllDepartment(1, 1, '');
            const departmentArray = res.allDepartments
                ?.filter((item) => item.status !== false)
                .map((item) => item.departmentName);
            setDepartments(departmentArray);
        };
        fetchApi();
    }, []);

    return (
        <>
            <div
                onClick={() => setShowForm(false)}
                className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-[#000000]/[0.3] z-50"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-[330px] md:w-[450px] h-fit bg-white p-[36px] rounded-md shadow-4Way animate-fadeIn"
                >
                    <h1 className="text-[#9fa9ae] text-center italic text-[4.6rem] font-semibold">
                        QLVB <span className="text-[2.4rem]">v1.0</span>
                    </h1>
                    <h1 className="text-[#9fa9ae] text-center text-[2.0rem] font-medium mb-16">{formTitle}</h1>
                    <form autoComplete="on">
                        <InputField
                            id="fullName"
                            className={isFullNameErr ? 'invalid' : 'default'}
                            placeholder="Họ và tên"
                            value={fullName}
                            setValue={setFullName}
                            onBlur={() => fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{fullNameErrMsg.fullName}</p>
                        <div className="flex items-center mt-7">
                            {genderList.map((g, index) => {
                                return (
                                    <div key={index} className="flex items-center mr-5">
                                        <InputField
                                            name="radio"
                                            className="flex w-[15px] h-[15px]"
                                            checked={gender === g}
                                            setValue={() => setGender(g)}
                                        />
                                        <label className="text-[1.5rem] ml-3">{g}</label>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-7">
                            <InputField
                                name="date"
                                className="default leading-[1.3]"
                                placeholder="Ngày sinh"
                                value={birth}
                                setValue={setBirth}
                            />
                        </div>
                        <div className="mt-7">
                            <InputField
                                id="email"
                                name="email"
                                className={isEmailErr ? 'invalid' : 'default'}
                                placeholder="Email"
                                value={email}
                                setValue={setEmail}
                                onBlur={() => emailValidator(email, setIsEmailErr, setEmailErrMsg)}
                            />
                            <p className="text-red-600 text-[1.3rem]">{emailErrMsg.email}</p>
                        </div>
                        <div className="mt-7">
                            <InputField
                                id="phone"
                                className="default"
                                placeholder="Số điện thoại"
                                value={phone}
                                setValue={setPhone}
                            />
                        </div>
                        <div className="mt-7">
                            <DropList
                                selectedValue={department}
                                options={departments}
                                setValue={setDepartment}
                                setId={() => undefined}
                            />
                        </div>
                        <div className="flex justify-center items-center gap-5">
                            <button
                                onClick={userRole === 'Admin' ? handleSubmit : handleRequestChange}
                                className="w-full text-[white] bg-[#321fdb] mt-12 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                            >
                                <FontAwesomeIcon icon={userRole === 'Admin' ? faFloppyDisk : faPaperPlane} />{' '}
                                {userRole === 'Admin' ? 'Lưu' : 'Gửi yêu cầu'}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-full text-[white] bg-red-600 mt-12 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                            >
                                <FontAwesomeIcon icon={faXmark} /> Hủy
                            </button>
                        </div>
                    </form>
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

export default ProfileForm;
