import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    VerticalAlign,
    WidthType,
    TableLayoutType,
    AlignmentType,
    TextRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { formatVNDate } from '~/utils/formatDateTime';

const ExportWord = (props) => {
    const dataHeader = [
        'STT',
        'Thành viên',
        'Tên công việc',
        'Loại công việc',
        'Mức độ',
        'Hoàn thành',
        'Chờ duyệt',
        'Chưa hoàn thành',
        'Còn hạn',
        'Sắp đến hạn',
        'Quá hạn',
        'Tổng',
    ];

    const handleExport = () => {
        const getFirstCell = (index, data, tasks) => {
            if (index === 0) {
                return new TableCell({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `${data}`,
                                    font: 'Arial',
                                }),
                            ],
                        }),
                    ],
                    rowSpan: tasks?.length,
                    verticalAlign: VerticalAlign.TOP,
                    width: { size: 1, type: WidthType.PERCENTAGE },
                });
            } else {
                return;
            }
        };

        const get2ColumnCell = (index, data1, data2, tasks) => {
            if (index === 0) {
                return [
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `${data1}`,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                        ],
                        rowSpan: tasks?.length,
                        verticalAlign: VerticalAlign.TOP,
                        width: { size: 1, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `${data2}`,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                        ],
                        rowSpan: tasks?.length,
                        verticalAlign: VerticalAlign.TOP,
                        width: { size: 1, type: WidthType.PERCENTAGE },
                    }),
                ];
            } else {
                return [];
            }
        };

        const setTableRow = () => {
            const tableRow = props?.allDatas?.map((item, index) => {
                return item?.tasks?.map((t, idx) => {
                    return new TableRow({
                        children: [
                            ...get2ColumnCell(idx, index + 1, item?.user, item?.tasks),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                text: `${t?.taskName}`,
                                                font: 'Arial',
                                            }),
                                        ],
                                    }),
                                ],
                                verticalAlign: VerticalAlign.TOP,
                                width: { size: 10, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                text: `${t?.type}`,

                                                font: 'Arial',
                                            }),
                                        ],
                                    }),
                                ],
                                verticalAlign: VerticalAlign.TOP,
                                width: { size: 10, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                text: `${t?.level}`,
                                                font: 'Arial',
                                            }),
                                        ],
                                    }),
                                ],
                                verticalAlign: VerticalAlign.TOP,
                                width: { size: 10, type: WidthType.PERCENTAGE },
                            }),
                            getFirstCell(idx, item?.finishTask, item?.tasks),
                            getFirstCell(idx, item?.pendingTask, item?.tasks),
                            getFirstCell(idx, item?.inProgressTask, item?.tasks),
                            getFirstCell(idx, item?.unDueTask, item?.tasks),
                            getFirstCell(idx, item?.dueSoonTask, item?.tasks),
                            getFirstCell(idx, item?.outOfDateTask, item?.tasks),
                            getFirstCell(idx, item?.tasks?.length, item?.tasks),
                        ],
                    });
                });
            });

            var flatArray = tableRow.reduce(function (flatOutput, flatItem) {
                return flatOutput.concat(flatItem);
            }, []);
            return flatArray;
        };

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: 'Báo cáo thống kê công việc năm 2023',
                                    size: 36,
                                    bold: true,
                                    italics: true,
                                    font: 'Arial',
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `Tổng hợp công việc theo thành viên: ${`Từ ngày ${
                                        formatVNDate(props.fFrom) || '?'
                                    } đến ngày ${formatVNDate(props.fTo) || '?'}`}`,
                                    font: 'Arial',
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: '',
                                    size: 36,
                                }),
                            ],
                        }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            layout: TableLayoutType.FIXED,
                            rows: [
                                new TableRow({
                                    children: dataHeader.map((title) => {
                                        return new TableCell({
                                            width: { size: 100 / dataHeader.length, type: WidthType.PERCENTAGE },
                                            shading: {
                                                fill: 'FFFD04',
                                            },
                                            children: [
                                                new Paragraph({
                                                    alignment: AlignmentType.CENTER,
                                                    children: [
                                                        new TextRun({
                                                            text: title,
                                                            bold: true,
                                                            italics: true,
                                                            font: 'Arial',
                                                        }),
                                                    ],
                                                }),
                                            ],
                                            verticalAlign: VerticalAlign.CENTER,
                                        });
                                    }),
                                }),
                                ...setTableRow(),
                            ],
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'report.docx');
        });
    };

    return (
        <div className="flex justify-end">
            <button
                onClick={handleExport}
                className="text-[1.3rem] w-full lg:w-fit md:text-[1.6rem] text-[white] bg-blue-600 px-[16px] py-[8px] rounded-md hover:bg-[#1b2e4b] transition-all duration-[1s] whitespace-nowrap"
            >
                Xuất tệp
            </button>
        </div>
    );
};

export default ExportWord;
