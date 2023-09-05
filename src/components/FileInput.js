const FileInput = ({ setAttachFiles }) => {
    return (
        <input
            className="block w-full text-[1.4rem] text-gray-900 border border-gray-300 rounded-[4px] cursor-pointer bg-gray-50 file:py-[6px] file:rounded-[4px]"
            id="multiple_files"
            type="file"
            name="myFile"
            multiple
            onChange={(e) => setAttachFiles(e.target.files)}
        />
    );
};

export default FileInput;
