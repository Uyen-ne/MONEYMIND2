// Lấy phần tử canvas từ HTML để vẽ biểu đồ
const ctx = document.getElementById('myPieChart').getContext('2d');

// Đăng ký plugin DataLabels để hiện chữ phần trăm lên mặt biểu đồ
Chart.register(ChartDataLabels);

// Khởi tạo biểu đồ Pie Chart
const myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Ăn uống', 'Chi phí đi lại', 'Chi phí cố định'],
        datasets: [{
            // Số liệu % dựa trên bản thiết kế Figma
            data: [33, 22,  45], 
            
            // 3 mã màu đã được hút chính xác từ bản thiết kế Figma
            backgroundColor: ['#A0F9E8', '#FFCECE', '#CCFFCC'], 
            
            // Tắt viền trắng phân cách giữa các mảng màu
            borderWidth: 0 
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Ép biểu đồ nằm gọn trong khung kích thước đã định
        plugins: {
            legend: {
                display: false // Ẩn các chú thích màu sắc mặc định của Chart.js
            },
            datalabels: {
                color: '#000', // Đặt màu chữ phần trăm là màu đen
                font: {
                    weight: 'bold', // In đậm chữ
                    size: 16        // Kích thước chữ 16px
                },
                formatter: (value) => {
                    return value + '%'; // Tự động thêm dấu % vào phía sau số liệu
                }
            }
        }
    }
});