import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Tooltip, Title, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip, Title, Legend);

const PieChart = ({ typeOption, allTasks }) => {
    // Filter option get from droplist filter
    const typeValue = typeOption?.value;

    // Remove duplicate value
    const types = [...new Set(allTasks?.map((item) => item?.[typeValue]))];

    // Count quantity of each option and put to array
    const countTask = () => {
        const arr = types?.map((type) => {
            return allTasks?.filter((item) => item?.[typeValue] === type).length;
        });
        return arr;
    };

    // Data structure of chart.js
    var data = {
        labels: types,
        datasets: [
            {
                label: 'Công việc',
                data: countTask(),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
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
                text: 'Biểu đồ thống kê công việc',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map((data) => (sum += data));
                    let percentage = ((value * 100) / sum).toFixed(2) + '%';
                    return percentage;
                },
                color: '#000000',
            },
        },
    };

    return (
        <div>
            <Pie data={data} height={400} options={options} plugins={[ChartDataLabels]} />
        </div>
    );
};

export default PieChart;
