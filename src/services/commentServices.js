import httpRequest from '~/utils/httpRequest';

// Create comment
export const createComment = async (data = {}) => {
    try {
        const res = await httpRequest.post('/comment/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Update comment
export const updateComment = async (commentId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/comment/update/${commentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete comment
export const deleteCommentById = async (commentId) => {
    try {
        const res = await httpRequest.delete(`/comment/delete/${commentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all comments function
export const getAllComment = async () => {
    try {
        const res = await httpRequest.get('/comment/get-all');
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get comment by id
export const getCommentById = async (commentId) => {
    try {
        const res = await httpRequest.get(`/comment/get/${commentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
