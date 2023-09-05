// Check box function
export const handleCheck = (checked, setChecked, setCheckedAll, id, data) => {
    setChecked((prev) => {
        const isChecked = checked?.includes(id);
        if (isChecked) {
            setCheckedAll(false);
            return checked?.filter((item) => item !== id);
        } else {
            if ([...prev, id].length === data?.length) {
                setCheckedAll(true);
            }
            return [...prev, id];
        }
    });
};

// Check box all function
export const handleCheckAll = (checkedAll, checkedLength, data, setChecked) => {
    const idsArray = [];
    if (checkedAll === false) {
        if (checkedLength === data?.length) {
            return setChecked([]);
        }
        return setChecked((checked) => checked);
    }
    data?.map((item) => {
        return idsArray.push(item._id);
    });
    setChecked(idsArray);
};
