import { useState, useEffect } from 'react';
import * as userServices from '~/services/userServices';

const useFetchUsers = () => {
    const [publicUsers, setPublicUsers] = useState([]);
    const [privateUsers, setPrivateUsers] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const userRole = JSON.parse(localStorage.getItem('userRole'));
            const res1 = await userServices.getPublicInfo();
            if (res1.code === 200) {
                setPublicUsers(res1.data);
            } else {
                console.log(res1);
            }
            if (userRole === 'Member') return;
            const res2 = await userServices.getAllUser(1, 1, '');
            if (res2.code === 200) {
                const filterArray = res2?.allUsers?.filter((item) => item.role === 'Member');
                setPrivateUsers(filterArray);
            } else {
                console.log(res2);
            }
        };
        fetchApi();
    }, []);

    return { publicUsers, privateUsers };
};

export default useFetchUsers;
