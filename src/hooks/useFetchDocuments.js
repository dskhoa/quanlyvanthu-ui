import { useState, useEffect } from 'react';
import * as documentServices from '~/services/documentServices';

const useFetchDocuments = () => {
    const [allDocumentIns, setAllDocumentIns] = useState([]);
    const [allDocumentOuts, setAllDocumentOuts] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [inProgressDocs, setInProgressDocs] = useState([]);
    const [inProgressDocNames, setInProgressDocNames] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
            const res = await documentServices.getAllDocument(1, 1, true, '', '', '', '', '', '', '', '');
            if (res.code === 200) {
                const documentArray = res.allDocumentIn;
                setInProgressDocs(documentArray);
                setAllDocumentIns(res.allDocumentIn);
                setAllDocumentOuts(res.allDocumentOut);
                setAllDocuments(res.allDocuments);
                const documentNameArray = res.allDocumentIn?.map((item) => item.documentName);
                setInProgressDocNames(documentNameArray);
            } else {
                console.log(res);
            }
        };
        fetchApi();
    }, []);

    return { allDocumentIns, allDocumentOuts, allDocuments, inProgressDocs, inProgressDocNames };
};

export default useFetchDocuments;
