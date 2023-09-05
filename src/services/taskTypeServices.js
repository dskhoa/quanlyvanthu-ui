import httpRequest from '~/utils/httpRequest';

// Create task type
export const createTaskType = async (data = {}) => {
    try {
        const res = await httpRequest.post('/task-type/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all task types function
export const getAllTaskType = async () => {
    try {
        const res = await httpRequest.get('/task-type/get-all');
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
