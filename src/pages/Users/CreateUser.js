import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import DropList from '~/components/DropList';
import * as userServices from '~/services/userServices';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import { fullNameValidator, emailValidator, dropListValidator } from '~/utils/formValidation';
import { useFetchDepartments } from '~/hooks';
import Loading from '~/components/Loading';

const CreateUser = ({ title }) => {
    const [loading, setLoading] = useState(false);
    // Input state
    const [fullName, setFullName] = useState('');
    const [date, setDate] = useState('');
    const [gender, setGender] = useState('Nam');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    // Input validation state
    const [fullNameErrMsg, setFullNameErrMsg] = useState({});
    const [isFullNameErr, setIsFullNameErr] = useState(false);
    const [emailErrMsg, setEmailErrMsg] = useState({});
    const [isEmailErr, setIsEmailErr] = useState(false);
    const [departmentErrMsg, setDepartmentErrMsg] = useState({});
    const [isDepartmentErr, setIsDepartmentErr] = useState(false);

    const departments = useFetchDepartments({ isActived: false });
    const navigate = useNavigate();
    const { id } = useParams();
    const genderList = ['Nam', 'Nữ'];

    // Create or edit user function
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isfullNameValid = fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg);
        const isEmailValid = emailValidator(email, setIsEmailErr, setEmailErrMsg);
        const isDepartmentValid = dropListValidator(department, setIsDepartmentErr, setDepartmentErrMsg);
        if (!isEmailValid || !isfullNameValid || !isDepartmentValid) return;
        setLoading(true);
        const data = {
            fullName: fullName,
            gender: gender,
            birthDate: date,
            email: email,
            phoneNumber: phone,
            department: department,
        };
        let res;
        if (id) {
            res = await userServices.updateUser(id, data);
        } else {
            res = await userServices.createUser(data);
        }
        if (res.code === 200) {
            setLoading(false);
            successNotify(res.message);
            navigate('/users');
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    // Get available user data when edit user
    useEffect(() => {
        if (!id) return;
        const fetchApi = async () => {
            const res = await userServices.getUserById(id);
            setFullName(res.data.fullName);
            setDate(res.data.birthDate);
            setGender(res.data.gender);
            setEmail(res.data.email);
            setPhone(res.data.phoneNumber);
            setDepartment(res.data.department);
        };
        fetchApi();
    }, [id]);

    return (
        <>
            <div className="bg-white p-[16px] shadow-4Way border-t-[3px] border-blue-600">
                <h1 className="text-[2rem] font-bold">{title}</h1>
                <form autoComplete="on">
                    <div className="mt-8">
                        <label className="font-bold">
                            Họ và tên: <span className="text-red-600">*</span>
                        </label>
                        <InputField
                            id="fullName"
                            className={isFullNameErr ? 'invalid' : 'default'}
                            placeholder="Tên người dùng"
                            value={fullName}
                            setValue={setFullName}
                            onBlur={() => fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{fullNameErrMsg.fullName}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center mt-7">
                        <label className="font-bold mr-7">Giới tính:</label>
                        <div className="flex items-center">
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
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">Ngày sinh:</label>
                        <InputField name="date" className="default" value={date} setValue={setDate} />
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">
                            Email: <span className="text-red-600">*</span>
                        </label>
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
                        <label className="font-bold">Số điện thoại:</label>
                        <InputField
                            id="phone"
                            className="default"
                            placeholder="Số điện thoại"
                            value={phone}
                            setValue={setPhone}
                        />
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">
                            Phòng ban: <span className="text-red-600">*</span>
                        </label>
                        <DropList
                            isErr={isDepartmentErr}
                            selectedValue={department}
                            options={departments}
                            setValue={setDepartment}
                            setId={() => undefined}
                            onBlur={() => dropListValidator(department, setIsDepartmentErr, setDepartmentErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{departmentErrMsg.department}</p>
                    </div>
                    <div className="block md:flex items-center gap-5 mt-12">
                        <button
                            onClick={handleSubmit}
                            className="w-full md:w-fit text-center text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} /> Lưu thông tin
                        </button>
                        <NavLink
                            to="/users"
                            className="block w-full md:w-fit text-center text-[white] bg-red-600 mt-4 md:mt-0 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faXmark} /> Hủy bỏ
                        </NavLink>
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

export default CreateUser;
