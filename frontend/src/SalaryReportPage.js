import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Card } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

function SalaryReportPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Chúng ta có thể dùng lại API lấy danh sách nhân viên đã có
    axios.get('http://localhost:5000/api/staff')
      .then(res => {
        setStaffList(res.data);
      })
      .catch(() => message.error('Lỗi khi tải báo cáo lương!'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { 
      title: 'STT', 
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    { title: 'Mã nhân viên', dataIndex: 'id', key: 'id' },
    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
    { 
      title: 'Lương cơ bản', 
      dataIndex: 'salary', 
      key: 'salary', 
      align: 'right', 
      render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ' 
    },
  ];

  // Tính tổng lương
  const totalSalary = staffList.reduce((sum, item) => sum + (item.salary || 0), 0);

  return (
    <Card>
      <Title level={4}>Báo cáo Lương nhân viên</Title>
      <Table
        columns={columns}
        dataSource={staffList}
        loading={loading}
        rowKey="id"
        bordered
        pagination={false}
        footer={() => (
          <div style={{ textAlign: 'right' }}>
            <Text strong>Tổng lương tháng: {totalSalary.toLocaleString('vi-VN')} đ</Text>
          </div>
        )}
      />
    </Card>
  );
}

export default SalaryReportPage;