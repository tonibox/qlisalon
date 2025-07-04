import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Card, DatePicker, Space } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function RevenueReportPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]); // State cho khoảng ngày

  // useEffect sẽ chạy lại mỗi khi dateRange thay đổi
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
    }

    axios.get('http://localhost:5000/api/payments', { params })
      .then(res => {
        const sorted = res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(sorted);
      })
      .catch(() => message.error('Lỗi khi tải báo cáo!'))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'id', key: 'id' },
    { title: 'Mã hóa đơn', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString('vi-VN') },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: 'Tiền thu', dataIndex: 'amount', key: 'amount', align: 'right', render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ' },
  ];

  const totalRevenue = payments.reduce((sum, item) => sum + item.amount, 0);

  // Các lựa chọn đặt sẵn cho bộ lọc ngày
  const rangePresets = [
    { label: 'Hôm nay', value: [dayjs(), dayjs()] },
    { label: '7 ngày qua', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Tháng trước', value: [dayjs().add(-1, 'month').startOf('month'), dayjs().add(-1, 'month').endOf('month')] },
  ];

  return (
    <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Báo cáo Thu Chi</Title>
            <RangePicker presets={rangePresets} onChange={setDateRange} />
        </div>
        <Table
            columns={columns}
            dataSource={payments}
            loading={loading}
            rowKey="id"
            bordered
            footer={() => (
            <div style={{ textAlign: 'right' }}>
                <Text strong>Tổng thu: {totalRevenue.toLocaleString('vi-VN')} đ</Text>
            </div>
            )}
        />
    </Card>
  );
}

export default RevenueReportPage;