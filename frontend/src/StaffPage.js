import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tag, Select, Layout, Card, Typography } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Sider, Content } = Layout;
const { Title } = Typography;

function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [searchTerm]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/staff', { params: { search: searchTerm } });
      setStaff(response.data);
    } catch (error) { message.error('Lỗi khi tải danh sách nhân viên!'); }
    finally { setLoading(false); }
  };

  const handleEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingStaff) {
        await axios.put(`http://localhost:5000/api/staff/${editingStaff.id}`, values);
        message.success('Cập nhật thành công!');
      } else {
        await axios.post('http://localhost:5000/api/staff', values);
        message.success('Thêm thành công!');
      }
      setIsModalVisible(false);
      fetchStaff();
    } catch (error) { message.error('Thao tác thất bại!'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/staff/${id}`);
      message.success('Xóa nhân viên thành công!');
      fetchStaff();
    } catch (error) { message.error('Lỗi khi xóa!'); }
  };

  const columns = [
    { title: 'Mã nhân viên', dataIndex: 'id', key: 'id' },
    { title: 'Họ và tên', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Lương cơ bản', // <-- CỘT MỚI
      dataIndex: 'salary', 
      key: 'salary',
      align: 'right',
      render: (salary) => (salary || 0).toLocaleString('vi-VN') + ' đ'
    },
    { 
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: status => <Tag color={status === 'Đang làm việc' ? 'green' : 'red'}>{status}</Tag>
    },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => ( <Space> <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button> <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy"> <Button type="link" danger>Xóa</Button> </Popconfirm> </Space> ),
    },
  ];

  return (
    // Bố cục revert về dạng cũ không có sidebar theo yêu cầu trước đó
    <>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button type="primary" onClick={showAddModal}>Thêm nhân viên</Button>
        <Input.Search placeholder="Tìm theo tên hoặc số điện thoại..." allowClear onSearch={value => setSearchTerm(value)} onChange={e => { if (e.target.value === '') { setSearchTerm(''); } }} style={{ width: 300 }} />
      </Space>
      <Table columns={columns} dataSource={staff} loading={loading} rowKey="id" bordered />
      <Modal title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ salary: 0 }}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
          {/* TRƯỜNG NHẬP LƯƠNG MỚI */}
          <Form.Item name="salary" label="Lương cơ bản" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
          {editingStaff && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Option value="Đang làm việc">Đang làm việc</Option>
                <Option value="Đã nghỉ">Đã nghỉ</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

export default StaffPage;