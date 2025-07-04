import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Layout, Card, Typography, DatePicker, Checkbox, Tabs } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Component con để hiển thị chi tiết khi mở rộng một hóa đơn
const ExpandedInvoiceDetail = ({ invoiceId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      axios.get(`http://localhost:5000/api/invoices/${invoiceId}/payments`)
        .then(res => {
          setPayments(res.data);
        })
        .catch(() => message.error('Không thể tải lịch sử thanh toán'))
        .finally(() => setLoading(false));
    }
  }, [invoiceId]);

  const paymentColumns = [
    { title: 'Mã phiếu', dataIndex: 'id', key: 'id' },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString('vi-VN') },
    { title: 'Tài khoản tạo', dataIndex: 'createdBy', key: 'createdBy' },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="green">{status.toUpperCase()}</Tag> },
    { title: 'Tiền thu', dataIndex: 'amount', key: 'amount', align: 'right', render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ' },
  ];

  const tabItems = [
    {
      key: 'payment-history',
      label: 'Lịch sử thanh toán',
      children: <Table columns={paymentColumns} dataSource={payments} rowKey="id" loading={loading} pagination={false} size="small"/>
    },
    {
      key: 'info',
      label: 'Thông tin',
      children: <p>Các thông tin chi tiết khác của hóa đơn có thể hiển thị ở đây.</p>
    }
  ];

  return <Tabs defaultActiveKey="payment-history" items={tabItems} />;
};


function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(['Hoàn thành']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const params = { status: statusFilter };
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
      }
      try {
        const response = await axios.get('http://localhost:5000/api/invoices', { params });
        setInvoices(response.data);
      } catch (error) {
        message.error('Lỗi khi tải danh sách hóa đơn!');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [dateRange, statusFilter]);

  const columns = [
    { title: 'Mã hóa đơn', dataIndex: 'id', key: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString('vi-VN') },
    { 
      title: 'Nhân viên thực hiện', // <-- CỘT MỚI
      dataIndex: 'staffNames', 
      key: 'staffNames',
    },
    { 
      title: 'Phương thức TT', // <-- CỘT MỚI
      dataIndex: 'paymentMethods', 
      key: 'paymentMethods',
    },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right', render: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'default';
        if (status === 'Hoàn thành') color = 'green';
        if (status === 'Ghi nợ') color = 'orange';
        if (status === 'Đã hủy') color = 'red';
        return <Tag color={color}>{status ? status.toUpperCase() : ''}</Tag>;
      }
    }
  ];

  return (
    <Layout style={{ background: 'transparent' }}>
      <Sider width={250} style={{ background: '#fff', padding: '16px', marginRight: '16px', borderRadius: '8px' }}>
        <Title level={5}>Tìm kiếm & Lọc</Title>
        <Card size="small" title="Thời gian" style={{marginBottom: '16px'}}>
            <RangePicker style={{ width: '100%' }} onChange={(dates) => setDateRange(dates)} />
        </Card>
        <Card size="small" title="Trạng thái">
            <Checkbox.Group options={[{ label: 'Hoàn thành', value: 'Hoàn thành' }, { label: 'Đã hủy', value: 'Đã hủy' }]} value={statusFilter} onChange={(vals) => setStatusFilter(vals)} style={{ display: 'flex', flexDirection: 'column' }} />
        </Card>
      </Sider>
      <Content>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={() => navigate('/invoices/new')}>Tạo hóa đơn</Button>
        </div>
        <Table
          columns={columns}
          dataSource={invoices}
          loading={loading}
          rowKey="id"
          bordered
          expandable={{
            expandedRowRender: (record) => <ExpandedInvoiceDetail invoiceId={record.id} />,
            rowExpandable: (record) => true,
          }}
        />
      </Content>
    </Layout>
  );
}

export default InvoiceListPage;