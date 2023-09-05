import { useState, useEffect } from 'react';
import * as taskServices from '~/services/taskServices';

const useFetchTasks = () => {
    const [allTasks, setAllTasks] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const userRole = JSON.parse(localStorage.getItem('userRole'));
            const res = await taskServices.getAllTask(1, 1, '', '', '', '', '', '', '');
            if (res.code === 200) {
                if (userRole === 'Admin' || userRole === 'Moderator') {
                    setAllTasks(res.allTasks);
                } else {
                    setAllTasks(res.allMemberTasks);
                }
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, []);
    return allTasks;
};

export default useFetchTasks;
