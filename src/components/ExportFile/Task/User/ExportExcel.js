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
        const title = [{ A: 'Báo cáo thống kê công việc năm 2023' }, {}];

        const subTitle = [
            {
                A: `Tổng hợp công việc theo thành viên: ${`Từ ngày ${formatVNDate(props.fFrom) || '?'} đến ngày ${
                    formatVNDate(props.fTo) || '?'
                }`}`,
            },
            {},
        ];

        let table = [
            {
                A: 'STT',
                B: 'Thành viên',
                C: 'Tên công việc',
                D: 'Loại công việc',
                E: 'Mức độ',
                F: 'Hoàn thành',
                G: 'Chờ duyệt',
                H: 'Chưa hoàn thành',
                I: 'Còn hạn',
                J: 'Sắp đến hạn',
                K: 'Quá hạn',
                L: 'Tổng',
            },
        ];

        props.allDatas.map((row, index) => {
            return row?.tasks?.forEach((t) => {
                table.push({
                    A: index + 1,
                    B: row?.user,
                    C: t?.taskName,
                    D: t?.type,
                    E: t?.level,
                    F: row?.finishTask,
                    G: row?.pendingTask,
                    H: row?.inProgressTask,
                    I: row?.unDueTask,
                    J: row?.dueSoonTask,
                    K: row?.outOfDateTask,
                    L: row?.tasks?.length,
                });
            });
        });

        const finalData = [...title, ...subTitle, ...table];

        const wb = XLSX.utils.book_new();

        const sheet = XLSX.utils.json_to_sheet(finalData, {
            skipHeader: true,
        });
        let acc = 5;
        const mergeArray = props.allDatas
            .filter((f) => f.tasks.length !== 0)
            .map((item) => {
                const merge = [
                    { s: { r: acc, c: 0 }, e: { r: item?.tasks?.length + acc - 1, c: 0 } },
                    { s: { r: acc, c: 1 }, e: { r: item?.tasks?.length + acc - 1, c: 1 } },
                    { s: { r: acc, c: 5 }, e: { r: item?.tasks?.length + acc - 1, c: 5 } },
                    { s: { r: acc, c: 6 }, e: { r: item?.tasks?.length + acc - 1, c: 6 } },
                    { s: { r: acc, c: 7 }, e: { r: item?.tasks?.length + acc - 1, c: 7 } },
                    { s: { r: acc, c: 8 }, e: { r: item?.tasks?.length + acc - 1, c: 8 } },
                    { s: { r: acc, c: 9 }, e: { r: item?.tasks?.length + acc - 1, c: 9 } },
                    { s: { r: acc, c: 10 }, e: { r: item?.tasks?.length + acc - 1, c: 10 } },
                    { s: { r: acc, c: 11 }, e: { r: item?.tasks?.length + acc - 1, c: 11 } },
                ];
                acc = acc + item?.tasks?.length;
                return merge;
            });

        var flatArray = mergeArray.reduce(function (flatOutput, flatItem) {
            return flatOutput.concat(flatItem);
        }, []);
        sheet['!merges'] = flatArray;

        XLSX.utils.book_append_sheet(wb, sheet, 'report');

        const workbookBlob = workbook2blob(wb);

        var headerIndexes = [];
        finalData.forEach((data, index) => (data['A'] === 'STT' ? headerIndexes.push(index) : null));

        const dataInfo = {
            titleRange: 'A1:L2',
            subTitleRange: 'A3:L3',
            tbodyRange: `A4:L${finalData.length}`,
            tbodyRangeBorder: `A5:L${finalData.length}`,
            theadRange: headerIndexes?.length >= 1 ? `A${headerIndexes[0] + 1}:L${headerIndexes[0] + 1}` : null,
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
                sheet.column('C').width(25).style({ horizontalAlignment: 'left' });
                sheet.column('D').width(15).style({ horizontalAlignment: 'center' });
                sheet.column('E').width(15).style({ horizontalAlignment: 'center' });
                sheet.column('F').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('G').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('H').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('I').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('J').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('K').width(10).style({ horizontalAlignment: 'center' });
                sheet.column('L').width(10).style({ horizontalAlignment: 'center' });

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
