import httpRequest from '~/utils/httpRequest';

// Create notification function
export const createNotification = async (data) => {
    try {
        const res = await httpRequest.post('/notification/create', data);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Get all notifications function
export const getAllNotification = async () => {
    try {
        const res = await httpRequest.get('/notification/get-all');
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Change notification status function
export const changeNotificationStatus = async (notificationId) => {
    try {
        const res = await httpRequest.patch(`/notification/change-status/${notificationId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};

// Delete notification function
export const deleteNotificationById = async (notificationId) => {
    try {
        const res = await httpRequest.delete(`/notification/delete/${notificationId}`);
        return res.data;
    } catch (error) {
        console.log(error);
        return error.response.data.message;
    }
};
