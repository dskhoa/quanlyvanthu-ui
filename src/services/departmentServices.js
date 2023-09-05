import httpRequest from '~/utils/httpRequest';

// Create department function
export const createDepartment = async (data = {}) => {
    try {
        const res = await httpRequest.post('/department/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Update department function
export const updateDepartment = async (departmentId, data = {}) => {
    try {
        const res = await httpRequest.put(`/department/update/${departmentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Activate department function
export const activateDepartment = async (departmentId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/department/activate/${departmentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete department function
export const deleteDepartmentById = async (departmentId) => {
    try {
        const res = await httpRequest.delete(`/department/delete/${departmentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete many department function
export const deleteManyDepartment = async (data = {}) => {
    try {
        const res = await httpRequest.post('/department/delete-many', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all departments function
export const getAllDepartment = async (page, limit, search) => {
    try {
        const res = await httpRequest.get(`/department/get-all?page=${page}&limit=${limit}&search=${search}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get department by id function
export const getDepartmentById = async (departmentId) => {
    try {
        const res = await httpRequest.get(`/department/get/${departmentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
