const ctx = document.getElementById('myPieChart').getContext('2d');
Chart.register(ChartDataLabels);

window.myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#000',
                font: {
                    weight: 'bold',
                    size: 16,
                    family: 'Be Vietnam Pro' 
                },
                formatter: (value) => value + '%'
            }
        }
    }
});

