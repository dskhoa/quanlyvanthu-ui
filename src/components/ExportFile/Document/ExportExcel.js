import * as XLSX from 'xlsx';
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { formatVNDate } from '~/utils/formatDateTime';

const ExportExcel = (props) => {
    const workbook2blob = (workbook) => {
        const wopts = {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary',
        };

        const wbout = XLSX.write(workbook, wopts);

        const blob = new Blob([s2ab(wbout)], {
            type: 'application/octet-stream',
        });

        return blob;
    };

    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);

        const view = new Uint8Array(buf);

        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i);
        }

        return buf;
    };

    const handleExport = () => {
        const title = [{ A: 'Báo cáo thống kê văn bản năm 2023' }, {}];
        const subTitle = [
            {
                A: `Tổng hợp văn bản theo Sổ: ${props.flag || '?'} - ${props.fType || '?'} - ${
                    props.fStatus || '?'
                } - ${props.fLevel || '?'} - ${`Từ ngày ${formatVNDate(props.fFrom) || '?'} đến ngày ${
                    formatVNDate(props.fTo) || '?'
                }`}`,
            },
            {},
        ];

        const total = [{ A: '' }, { A: `Tổng số ${props.allDocuments?.length} văn bản` }];

        let table = [
            {
                A: 'STT',
                B: 'Số ký hiệu',
                C: 'Loại văn bản',
                D: 'Tên văn bản',
                E: 'Ngày ban hành',
                F: 'Nơi ban hành',
                G: 'Mức độ',
                H: 'Trạng thái',
                I: 'Trích yếu',
            },
        ];

        props.allDocuments.forEach((row, index) => {
            table.push({
                A: index + 1,
                B: row.code,
                C: row.type,
                D: row.documentName,
                E: row.sendDate,
                F: row.sender,
                G: row.level,
                H: row.status,
                I: row.note,
            });
        });

        const finalData = [...title, ...subTitle, ...table, ...total];

        const wb = XLSX.utils.book_new();

        const sheet = XLSX.utils.json_to_sheet(finalData, {
            skipHeader: true,
        });

        XLSX.utils.book_append_sheet(wb, sheet, 'report');

        const workbookBlob = workbook2blob(wb);

        var headerIndexes = [];
        finalData.forEach((data, index) => (data['A'] === 'STT' ? headerIndexes.push(index) : null));

        const dataInfo = {
            titleRange: 'A1:I2',
            subTitleRange: 'A3:I3',
            tbodyRange: `A4:I${finalData.length}`,
            tbodyRangeBorder: `A5:I${finalData.length - 2}`,
            theadRange: headerIndexes?.length >= 1 ? `A${headerIndexes[0] + 1}:I${headerIndexes[0] + 1}` : null,
            totalRange: `A${finalData.length}:I${finalData.length}`,
        };

        return addStyle(workbookBlob, dataInfo);
    };

    const addStyle = (workbookBlob, dataInfo) => {
        return XlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
            workbook.sheets().forEach((sheet) => {
                sheet.usedRange().style({
                    fontFamily: 'Arial',
                    fontSize: 10,
                    verticalAlignment: 'top',
                });

                sheet.gridLinesVisible(false);

                sheet.column('A').width(5).style({ horizontalAlignment: 'center', bold: true });
                sheet.column('B').width(15);
                sheet.column('C').width(15);
                sheet.column('D').width(25);
                sheet.column('E').width(15).style({ horizontalAlignment: 'center' });
                sheet.column('F').width(15);
                sheet.column('G').width(12);
                sheet.column('H').width(12);
                sheet.column('I').width(35);
                sheet.column('J').width(15);

                sheet.range(dataInfo.titleRange).merged(true).style({
                    bold: true,
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                    fontSize: 18,
                });

                sheet.range(dataInfo.subTitleRange).merged(true).style({
                    bold: false,
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                    fontSize: 10,
                    border: false,
                });

                sheet.range(dataInfo.totalRange).merged(true).style({
                    bold: true,
                    horizontalAlignment: 'right',
                    verticalAlignment: 'center',
                });

                if (dataInfo.tbodyRange) {
                    sheet.range(dataInfo.tbodyRange).style({
                        wrapText: true,
                    });
                }

                if (dataInfo.tbodyRangeBorder) {
                    sheet.range(dataInfo.tbodyRangeBorder).style({
                        border: 'thin',
                    });
                }

                sheet.range(dataInfo.theadRange).style({
                    fill: 'FFFD04',
                    bold: true,
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                });
            });

            return workbook.outputAsync().then((workbookBlob) => URL.createObjectURL(workbookBlob));
        });
    };

    const createDownLoadData = () => {
        handleExport().then((url) => {
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', url);
            downloadAnchorNode.setAttribute('download', 'report.xlsx');
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    };

    return (
        <div className="flex justify-end">
            <button
                onClick={() => {
                    createDownLoadData();
                }}
                className="text-[1.3rem] w-full lg:w-fit md:text-[1.6rem] text-[white] bg-green-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] whitespace-nowrap"
            >
                Xuất tệp
            </button>
        </div>
    );
};

export default ExportExcel;
