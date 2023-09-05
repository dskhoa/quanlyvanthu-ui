import httpRequest from '~/utils/httpRequest';

// Create document function
export const createDocument = async (data = {}) => {
    try {
        const res = await httpRequest.post('/document/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Upload file of document function
export const uploadFile = async (documentId, data) => {
    try {
        const res = await httpRequest.post(`/document/upload/${documentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete attach file of document function
export const deleteFileUrl = async (documentId, data) => {
    try {
        const res = await httpRequest.patch(`/document/delete-file-url/${documentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Update document function
export const updateDocument = async (documentId, data = {}) => {
    try {
        const res = await httpRequest.put(`/document/update/${documentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change document status function
export const changeDocumentStatus = async (documentId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/document/change-status/${documentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change document document department function
export const changeDocumentLocation = async (documentId, data = {}) => {
    try {
        const res = await httpRequest.patch(`/document/change-location/${documentId}`, data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete document function
export const deleteDocumentById = async (documentId) => {
    try {
        const res = await httpRequest.delete(`/document/delete/${documentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete many document function
export const deleteManyDocument = async (data = {}) => {
    try {
        const res = await httpRequest.post('/document/delete-many', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all documents function
export const getAllDocument = async (
    page,
    limit,
    flag,
    fName,
    fNote,
    fCode,
    fType,
    fStatus,
    fLevel,
    fIssuedDate,
    fSender,
) => {
    try {
        const res = await httpRequest.get(
            `/document/get-all?page=${page}&limit=${limit}&documentIn=${flag}&documentName=${fName}&note=${fNote}&code=${fCode}&type=${fType}&status=${fStatus}&level=${fLevel}&issuedDate=${fIssuedDate}&sender=${fSender}`,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get document by id function
export const getDocumentById = async (documentId) => {
    try {
        const res = await httpRequest.get(`/document/get/${documentId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
