import { useState, useEffect } from 'react';
import * as commentServices from '~/services/commentServices';

const useFetchComments = ({ id, allUsers, isSave, qtyCmt }) => {
    const [allComments, setAllComments] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const res = await commentServices.getAllComment();
            if (res.code === 200) {
                const filterComments = res?.data
                    ?.filter((item) => item.taskId === id)
                    .map((comment) => {
                        const user = allUsers?.find((user) => user._id === comment.userId);
                        return {
                            userName: user?.fullName,
                            avatar: user?.avatar,
                            commentId: comment?._id,
                            userId: comment?.userId,
                            content: comment?.content,
                            date: comment?.createdAt,
                        };
                    });
                setAllComments(qtyCmt ? res.data : filterComments);
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, [id, allUsers, isSave, qtyCmt]);

    return allComments;
};

export default useFetchComments;
