import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title, Legend);

const BarChart = ({ typeOption, allDocuments, allDocumentIns, allDocumentOuts }) => {
    // Filter option get from droplist filter
    const typeValue = typeOption?.value;

    // Remove duplicate value
    const types = [...new Set(allDocuments?.map((item) => item?.[typeValue]))];

    // Count quantity of each option and put to array
    const countDocumentIn = () => {
        const arr = types?.map((type) => {
            return allDocumentIns?.filter((item) => item?.[typeValue] === type).length;
        });
        return arr;
    };

    // Count quantity of each option and put to array
    const countDocumentOut = () => {
        const arr = types?.map((type) => {
            return allDocumentOuts?.filter((item) => item?.[typeValue] === type).length;
        });
        return arr;
    };

    // Data structure of chart.js
    var data = {
        labels: types,
        datasets: [
            {
                label: 'Văn bản đến',
                data: countDocumentIn(),
                backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
            {
                label: 'Văn bản đi',
                data: countDocumentOut(),
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Option structure of chart.js
    var options = {
        maintainAspectRatio: false,
        scales: {},
        plugins: {
            title: {
                display: true,
                text: 'Biểu đồ thống kê văn bản',
            },
        },
    };

    return (
        <div>
            <Bar data={data} height={400} options={options} />
        </div>
    );
};

export default BarChart;
