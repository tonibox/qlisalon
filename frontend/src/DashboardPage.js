import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, message } from 'antd';
import { UserOutlined, AppstoreOutlined, FileDoneOutlined, DollarOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardPage() {
  const [stats, setStats] = useState({
    customerCount: 0,
    productCount: 0,
    invoiceCountToday: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats')
      .then(res => setStats(res.data))
      .catch(() => message.error('Lỗi khi tải dữ liệu thống kê!'));
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const chartData = {
    labels: ['Khách hàng', 'Sản phẩm', 'Hóa đơn hôm nay'],
    datasets: [
      {
        label: 'Số lượng',
        data: [stats.customerCount, stats.productCount, stats.invoiceCountToday],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Các thẻ thống kê */}
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Tổng khách hàng" value={stats.customerCount} prefix={<UserOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Tổng sản phẩm" value={stats.productCount} prefix={<AppstoreOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Hóa đơn hôm nay" value={stats.invoiceCountToday} prefix={<FileDoneOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="Doanh thu hôm nay" value={formatCurrency(stats.revenueToday)} prefix={<DollarOutlined />} />
        </Card>
      </Col>
      {/* Biểu đồ */}
      <Col span={24}>
        <Card title="Biểu đồ tổng quan">
          <Bar data={chartData} />
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardPage;