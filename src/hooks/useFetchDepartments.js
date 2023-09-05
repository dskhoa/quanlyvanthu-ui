import { useState, useEffect } from 'react';
import * as departmentServices from '~/services/departmentServices';

const useFetchDepartments = ({ isActived }) => {
    const [allDepartments, setAllDepartments] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const res = await departmentServices.getAllDepartment(1, 1, '');
            const departmentArray = res.allDepartments
                ?.filter((item) => item.status !== isActived)
                .map((item) => item.departmentName);
            setAllDepartments(departmentArray);
        };
        fetchApi();
    }, [isActived]);

    return allDepartments;
};

export default useFetchDepartments;
