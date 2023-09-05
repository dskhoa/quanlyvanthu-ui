import httpRequest from '~/utils/httpRequest';

// Create document type function
export const createDocumentType = async (data = {}) => {
    try {
        const res = await httpRequest.post('/document-type/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all document types function
export const getAllDocumentType = async (page, limit, search) => {
    try {
        const res = await httpRequest.get('/document-type/get-all');
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
