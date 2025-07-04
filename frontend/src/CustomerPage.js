import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Layout, Card, Typography } from 'antd';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Title } = Typography;

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/customers', {
          params: { search: searchTerm }
        });
        setCustomers(response.data);
      } catch (error) { message.error('Lỗi khi tải dữ liệu khách hàng!'); }
      finally { setLoading(false); }
    };
    fetchCustomers();
  }, [searchTerm]);

  // ... (Tất cả các hàm handleDelete, handleEdit, handleOk... giữ nguyên không đổi)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
      message.success('Xóa khách hàng thành công!');
    } catch (error) { message.error('Lỗi khi xóa khách hàng!'); }
  };

  const handleEdit = (record) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        const res = await axios.put(`http://localhost:5000/api/customers/${editingCustomer.id}`, values);
        setCustomers(customers.map(c => (c.id === editingCustomer.id ? res.data : c)));
        message.success('Cập nhật thành công!');
      } else {
        const res = await axios.post('http://localhost:5000/api/customers', values);
        setCustomers([...customers, res.data]);
        message.success('Thêm thành công!');
      }
      setIsModalVisible(false);
    } catch (error) { message.error('Thao tác thất bại!'); }
  };

  const columns = [
    { title: 'Mã khách hàng', dataIndex: 'id', key: 'id' },
    { title: 'Tên khách hàng', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ background: 'transparent' }}>
      {/* THANH SIDEBAR BÊN TRÁI */}
      <Sider width={250} style={{ background: '#fff', padding: '16px', marginRight: '16px', borderRadius: '8px' }}>
        <Title level={5}>Tìm kiếm & Lọc</Title>
        <Card size="small" title="Tìm kiếm">
          <Input.Search
            placeholder="Tìm theo tên hoặc số điện thoại..."
            allowClear
            onSearch={value => setSearchTerm(value)}
            onChange={e => {
              if (e.target.value === '') {
                setSearchTerm('');
              }
            }}
          />
        </Card>
      </Sider>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <Content>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button type="primary" onClick={showAddModal}>Thêm khách hàng</Button>
        </div>
        <Table columns={columns} dataSource={customers} loading={loading} rowKey="id" bordered />
      </Content>

      {/* Modal giữ nguyên không đổi */}
      <Modal title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={form} layout="vertical">
            {/* Các Form.Item giữ nguyên */}
            <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default CustomerPage;