import { toast } from 'react-toastify';

export const successNotify = (msg) =>
    toast.success(msg, {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        theme: 'colored',
    });

export const errorNotify = (msg) =>
    toast.error(msg, {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        theme: 'colored',
    });
