import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons';
import InputField from '~/components/InputField';
import * as departmentServices from '~/services/departmentServices';
import { fullNameValidator } from '~/utils/formValidation';
import { successNotify, errorNotify } from '~/components/ToastMessage';
import Loading from '~/components/Loading';

const CreateDepartment = ({ title }) => {
    const [loading, setLoading] = useState(false);
    // Input state
    const [fullName, setFullName] = useState('');
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(false);
    // Input validation state
    const [fullNameErrMsg, setFullNameErrMsg] = useState({});
    const [isFullNameErr, setIsFullNameErr] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const statusList = [
        ['Hoạt động', true],
        ['Không hoạt động', false],
    ];

    // Create or edit document type function
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isfullNameValid = fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg);
        if (!isfullNameValid) return;
        setLoading(true);
        const data = {
            departmentName: fullName,
            status: status,
            note: note,
        };
        let res;
        if (id) {
            res = await departmentServices.updateDepartment(id, data);
        } else {
            res = await departmentServices.createDepartment(data);
        }
        if (res.code === 200) {
            setLoading(false);
            successNotify(res.message);
            navigate('/departments');
        } else {
            setLoading(false);
            errorNotify(res);
        }
    };

    // Get available department data when edit department
    useEffect(() => {
        if (!id) return;
        const fetchApi = async () => {
            const res = await departmentServices.getDepartmentById(id);
            setFullName(res.data.departmentName);
            setStatus(res.data.status);
            setNote(res.data.note);
        };
        fetchApi();
    }, [id]);

    return (
        <>
            <div className="bg-white p-[16px] shadow-4Way border-t-[3px] border-blue-600">
                <h1 className="text-[2rem] font-bold">{title}</h1>
                <form>
                    <div className="mt-8">
                        <label className="font-bold">
                            Tên phòng ban: <span className="text-red-600">*</span>
                        </label>
                        <InputField
                            className={isFullNameErr ? 'invalid' : 'default'}
                            placeholder="Tên phòng ban"
                            value={fullName}
                            setValue={setFullName}
                            onBlur={() => fullNameValidator(fullName, setIsFullNameErr, setFullNameErrMsg)}
                        />
                        <p className="text-red-600 text-[1.3rem]">{fullNameErrMsg.fullName}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center mt-7">
                        <label className="font-bold mr-7">Trạng thái:</label>
                        <div className="flex items-center">
                            {statusList.map((st, index) => {
                                return (
                                    <div key={index} className="flex items-center mr-5">
                                        <InputField
                                            name="radio"
                                            className="flex w-[15px] h-[15px]"
                                            checked={status === st[1]}
                                            setValue={() => setStatus(st[1])}
                                        />
                                        <label className="text-[1.5rem] ml-3">{st[0]}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-7">
                        <label className="font-bold">Ghi chú:</label>
                        <InputField
                            textarea
                            rows="6"
                            cols="50"
                            className="default textarea"
                            placeholder="Ghi chú"
                            value={note}
                            setValue={setNote}
                        />
                    </div>
                    <div className="block md:flex items-center gap-5 mt-12">
                        <button
                            onClick={handleSubmit}
                            className="w-full md:w-fit text-center text-[white] bg-[#321fdb] px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s]"
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} /> Lưu thông tin
                        </button>
                        <NavLink
                            to="/departments"
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

export default CreateDepartment;
