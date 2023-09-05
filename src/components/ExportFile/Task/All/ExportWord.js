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
    const dataHeader = ['STT', 'Tên công việc', 'Loại công việc', 'Mức độ', 'Tiến trình', 'Trạng thái', 'Đến hạn'];

    const handleExport = () => {
        let tbody;
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
                                    text: `Tổng hợp công việc: ${props.progress || '?'} - ${props.fType || '?'} - ${
                                        props.fStatus || '?'
                                    } - ${props.fLevel || '?'} - ${`Từ ngày ${
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
                        (tbody = new Table({
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
                            ],
                        })),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: '',
                                    size: 36,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({
                                    text: `Tổng số ${props.allTasks?.length} công việc`,
                                    bold: true,
                                    italics: true,
                                    font: 'Arial',
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        props.allTasks?.forEach((item, index) => {
            var tableRow = new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `${index + 1}`,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                        ],
                        verticalAlign: VerticalAlign.TOP,
                        width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: item.taskName,
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
                                children: [
                                    new TextRun({
                                        text: item.type,
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
                                children: [
                                    new TextRun({
                                        text: item.level,
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
                                alignment: AlignmentType.TOP,
                                children: [
                                    new TextRun({
                                        text: item.progress,
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
                                children: [
                                    new TextRun({
                                        text: item.status,
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
                                children: [
                                    new TextRun({
                                        text: new Date(item.dueDate).toLocaleDateString(),
                                        font: 'Arial',
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                            }),
                        ],
                        verticalAlign: VerticalAlign.TOP,
                        width: { size: 10, type: WidthType.PERCENTAGE },
                    }),
                ],
            });
            tbody.root.push(tableRow);
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
