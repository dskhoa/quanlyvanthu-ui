import httpRequest from '~/utils/httpRequest';

// Create user function
export const createUser = async (data = {}) => {
    try {
        const res = await httpRequest.post('/user/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Update user function
export const updateUser = async (userId, data = {}) => {
    try {
        const res = await httpRequest.put(`/user/update/${userId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Update user role function
export const updateRole = async (userId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/user/update-role/${userId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Activate user function
export const activateUser = async (userId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/user/activate/${userId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete user function
export const deleteUserById = async (userId) => {
    try {
        const res = await httpRequest.delete(`/user/delete/${userId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete many user function
export const deleteManyUser = async (data = {}) => {
    try {
        const res = await httpRequest.post('/user/delete-many', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all users function
export const getAllUser = async (page, limit, search) => {
    try {
        const res = await httpRequest.get(`/user/get-all?page=${page}&limit=${limit}&search=${search}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get user by id function
export const getUserById = async (userId) => {
    try {
        const res = await httpRequest.get(`/user/get/${userId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change user password function
export const changePassword = async (data = {}) => {
    try {
        const res = await httpRequest.patch('/user/change-password', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change user avatar function
export const changeAvatar = async (data) => {
    try {
        const res = await httpRequest.post('/user/change-avatar', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Remove user avatar function
export const removeAvatar = async (fileName) => {
    try {
        const res = await httpRequest.delete(`/user/file/${fileName}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get public user info function
export const getPublicInfo = async () => {
    try {
        const res = await httpRequest.get(`/user/public-info`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change req change info status function
export const changeReqChangeInfoStatus = async (userId, data) => {
    try {
        const res = await httpRequest.patch(`/user/change-req-info-status/${userId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
