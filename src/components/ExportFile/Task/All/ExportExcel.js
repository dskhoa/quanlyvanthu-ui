import * as XLSX from 'xlsx';
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { formatVNDate, formatVNDateTime } from '~/utils/formatDateTime';

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
        const title = [{ A: 'Báo cáo thống kê công việc năm 2023' }, {}];

        const subTitle = [
            {
                A: `Tổng hợp công việc: ${props.fProgress || '?'} - ${props.fType || '?'} - ${props.fStatus || '?'} - ${
                    props.fLevel || '?'
                } - ${`Từ ngày ${formatVNDate(props.fFrom) || '?'} đến ngày ${formatVNDate(props.fTo) || '?'}`}`,
            },
            {},
        ];

        const total = [{ A: '' }, { A: `Tổng số ${props.allTasks?.length} công việc` }];

        let table = [
            {
                A: 'STT',
                B: 'Tên công việc',
                C: 'Loại công việc',
                D: 'Mức độ',
                E: 'Tiến trình',
                F: 'Trạng thái',
                G: 'Đến hạn',
            },
        ];

        props.allTasks.forEach((row, index) => {
            table.push({
                A: index + 1,
                B: row.taskName,
                C: row.type,
                D: row.level,
                E: row.progress,
                F: row.status,
                G: formatVNDateTime(row.dueDate),
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
            titleRange: 'A1:G2',
            subTitleRange: 'A3:G3',
            tbodyRange: `A4:G${finalData.length}`,
            tbodyRangeBorder: `A5:G${finalData.length - 2}`,
            theadRange: headerIndexes?.length >= 1 ? `A${headerIndexes[0] + 1}:G${headerIndexes[0] + 1}` : null,
            totalRange: `A${finalData.length}:G${finalData.length}`,
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
                sheet.column('C').width(20);
                sheet.column('D').width(25);
                sheet.column('E').width(20);
                sheet.column('F').width(20);
                sheet.column('G').width(20).style({ horizontalAlignment: 'center' });

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
