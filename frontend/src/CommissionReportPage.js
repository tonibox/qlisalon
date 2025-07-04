import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Card, Tag } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

function CommissionReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // API này sẽ lấy dữ liệu đã được nhóm sẵn theo nhân viên
    axios.get('http://localhost:5000/api/reports/commissions-summary')
      .then(res => {
        // Thêm một key duy nhất cho mỗi dòng để Table hoạt động tốt
        const dataWithKeys = res.data.map(item => ({ ...item, key: item.staffId }));
        setReportData(dataWithKeys);
      })
      .catch(() => message.error('Lỗi khi tải báo cáo hoa hồng!'))
      .finally(() => setLoading(false));
  }, []);

  // Component con để render bảng chi tiết khi mở rộng
  const expandedRowRender = (record) => {
    const detailColumns = [
      { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString('vi-VN') },
      { title: 'Mã hóa đơn', dataIndex: 'invoiceId', key: 'invoiceId' },
      { title: 'Dịch vụ/SP', dataIndex: 'serviceName', key: 'serviceName' },
      { 
        title: 'Vai trò', 
        dataIndex: 'role', 
        key: 'role', 
        render: (role) => {
            if (role === 'service') return <Tag color="processing">Người làm</Tag>;
            if (role === 'consultant') return <Tag color="success">Tư vấn</Tag>;
            return null;
        }
      },
      { 
        title: 'Tiền hoa hồng', 
        dataIndex: 'commissionAmount', 
        key: 'commissionAmount', 
        align: 'right', 
        render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ' 
      },
    ];
    return <Table columns={detailColumns} dataSource={record.transactions} pagination={false} rowKey="id"/>;
  };

  // Các cột cho bảng chính (bảng tổng hợp)
  const mainColumns = [
    { 
      title: 'Tên nhân viên', 
      dataIndex: 'staffName', 
      key: 'staffName' 
    },
    { 
      title: 'Số giao dịch có HH', 
      dataIndex: 'transactions', 
      key: 'transactionCount', 
      align: 'center', 
      render: (transactions) => (transactions || []).length 
    },
    { 
      title: 'Tổng hoa hồng', 
      dataIndex: 'totalCommission', 
      key: 'totalCommission', 
      align: 'right', 
      render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ',
      sorter: (a, b) => a.totalCommission - b.totalCommission,
    },
  ];

  return (
    <Card>
      <Title level={4}>Báo cáo tổng hợp Hoa hồng</Title>
      <Table
        columns={mainColumns}
        dataSource={reportData}
        loading={loading}
        rowKey="staffId"
        bordered
        expandable={{ 
            expandedRowRender: expandedRowRender,
            rowExpandable: record => record.transactions && record.transactions.length > 0,
        }}
      />
    </Card>
  );
}

export default CommissionReportPage;