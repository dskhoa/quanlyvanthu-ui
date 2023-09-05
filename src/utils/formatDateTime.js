import TimeAgo from 'javascript-time-ago';

export const formatVNDate = (dateToFormat) => {
    const date = new Date(dateToFormat || null);
    let intl = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
    });
    const formatedDate = intl.format(date);
    return formatedDate;
};

export const formatVNDateTime = (dateTimeToFormat) => {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
    };
    const date = new Date(dateTimeToFormat || null);
    let intl = new Intl.DateTimeFormat('it-IT', options);
    const formatedDate = intl.format(date);
    return formatedDate;
};

export const formatVNTimeAgo = (timeToFormat) => {
    const timeAgo = new TimeAgo();
    const result = timeAgo.format(new Date(timeToFormat));
    return result;
};
