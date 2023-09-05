import httpRequest from '~/utils/httpRequest';

// Create req data function
export const createReqChangeInfo = async (data) => {
    try {
        const res = await httpRequest.post('/req-change-info/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all req data function
export const getAllReqChangeInfo = async () => {
    try {
        const res = await httpRequest.get('/req-change-info/get-all');
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change req data status function
export const changeReqChangeInfoStatus = async (reqDataId, data) => {
    try {
        const res = await httpRequest.patch(`/req-change-info/change-status/${reqDataId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete req data function
export const deleteReqChangeInfoById = async (reqDataId) => {
    try {
        const res = await httpRequest.delete(`/req-change-info/delete/${reqDataId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
