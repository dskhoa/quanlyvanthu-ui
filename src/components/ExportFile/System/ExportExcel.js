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
        const title = [{ A: 'Báo cáo thống kê hệ thống năm 2023' }, {}];

        const subTitle = [
            {
                A: `Tổng hợp dữ liệu hệ thống: ${`Từ ngày ${formatVNDate(props.fFrom) || '?'} đến ngày ${
                    formatVNDate(props.fTo) || '?'
                }`}`,
            },
            {},
        ];

        let table = [
            {
                A: 'STT',
                B: 'Tên phòng ban',
                C: 'Tổng số người dùng',
                D: 'Tổng số văn bản đến',
                E: 'Tổng số văn bản đi',
                F: 'Tổng số công việc',
                G: 'Tổng số bình luận',
                H: 'Tổng số thông báo',
            },
        ];

        props.filterData.forEach((row, index) => {
            table.push({
                A: index + 1,
                B: row.department,
                C: row.allUsers,
                D: row.allDocumentIns,
                E: row.allDocumentOuts,
                F: row.allTasks,
                G: row.allComments,
                H: row.allNotifications,
            });
        });

        const finalData = [...title, ...subTitle, ...table];

        const wb = XLSX.utils.book_new();

        const sheet = XLSX.utils.json_to_sheet(finalData, {
            skipHeader: true,
        });

        const merge = [
            { s: { r: 5, c: 7 }, e: { r: props?.filterData?.length + 4, c: 7 } },
            { s: { r: 5, c: 6 }, e: { r: props?.filterData?.length + 4, c: 6 } },
            { s: { r: 5, c: 5 }, e: { r: props?.filterData?.length + 4, c: 5 } },
        ];
        sheet['!merges'] = merge;

        XLSX.utils.book_append_sheet(wb, sheet, 'report');

        const workbookBlob = workbook2blob(wb);

        var headerIndexes = [];
        finalData.forEach((data, index) => (data['A'] === 'STT' ? headerIndexes.push(index) : null));

        const dataInfo = {
            titleRange: 'A1:H2',
            subTitleRange: 'A3:H3',
            tbodyRange: `A5:H${finalData.length}`,
            theadRange: headerIndexes?.length >= 1 ? `A${headerIndexes[0] + 1}:H${headerIndexes[0] + 1}` : null,
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
                sheet.column('C').width(20).style({ horizontalAlignment: 'center' });
                sheet.column('D').width(25).style({ horizontalAlignment: 'center' });
                sheet.column('E').width(20).style({ horizontalAlignment: 'center' });
                sheet.column('F').width(20).style({ horizontalAlignment: 'center' });
                sheet.column('G').width(20).style({ horizontalAlignment: 'center' });
                sheet.column('H').width(20).style({ horizontalAlignment: 'center' });

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

                if (dataInfo.tbodyRange) {
                    sheet.range(dataInfo.tbodyRange).style({
                        wrapText: true,
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
