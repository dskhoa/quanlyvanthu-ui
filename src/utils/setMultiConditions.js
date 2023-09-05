import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilePowerpoint, faFileWord, faFilePdf, faFile } from '@fortawesome/free-solid-svg-icons';

// Set level color
export const setLevelColor = (level) => {
    if (level === 'Ưu tiên') {
        return 'inline-block align-text-top w-fit level priority';
    } else if (level === 'Khẩn cấp') {
        return 'inline-block align-text-top w-fit level emergency';
    } else {
        return 'inline-block align-text-top w-fit level normal';
    }
};

// Set file icon
export const setFileIcon = (fileName) => {
    if (fileName.includes('.xlsx') || fileName.includes('.csv')) {
        return <FontAwesomeIcon className="w-full h-full text-green-700" icon={faFileExcel} />;
    } else if (fileName.includes('.pptx') || fileName.includes('.ppt')) {
        return <FontAwesomeIcon className="w-full h-full text-[#ff5722]" icon={faFilePowerpoint} />;
    } else if (fileName.includes('.docx') || fileName.includes('.doc')) {
        return <FontAwesomeIcon className="w-full h-full text-blue-700" icon={faFileWord} />;
    } else if (fileName.includes('.pdf')) {
        return <FontAwesomeIcon className="w-full h-full text-red-600" icon={faFilePdf} />;
    } else {
        return <FontAwesomeIcon className="w-full h-full text-black" icon={faFile} />;
    }
};
