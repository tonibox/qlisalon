import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm } from 'antd';
import axios from 'axios';

const { Option } = Select;

function ServicePackagePage() {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPackages();
    axios.get('http://localhost:5000/api/products', { params: { type: 'service' } })
      .then(res => setServices(res.data));
  }, []);

  const fetchPackages = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/service-packages')
      .then(res => {
        // Sắp xếp theo ID để giữ thứ tự ổn định
        const sortedData = res.data.sort((a, b) => a.id.localeCompare(b.id));
        setPackages(sortedData);
      })
      .catch(() => message.error('Lỗi khi tải gói dịch vụ!'))
      .finally(() => setLoading(false));
  };

  const showModal = (pkg = null) => {
    setEditingPackage(pkg);
    if (pkg) {
      form.setFieldsValue(pkg);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true); // Bật loading khi bắt đầu lưu

      if (editingPackage) {
        // Logic Sửa
        await axios.put(`http://localhost:5000/api/service-packages/${editingPackage.id}`, values);
        message.success('Cập nhật gói dịch vụ thành công!');
      } else {
        // Logic Thêm mới
        await axios.post('http://localhost:5000/api/service-packages', values);
        message.success('Tạo gói dịch vụ thành công!');
      }
      
      setIsModalVisible(false);
      setEditingPackage(null);
      fetchPackages(); // Tải lại dữ liệu sau khi lưu thành công

    } catch (error) {
      message.error('Thao tác thất bại!');
      setLoading(false); // Tắt loading nếu có lỗi
    }
  };
  
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/service-packages/${id}`);
      message.success('Xóa gói dịch vụ thành công!');
      fetchPackages(); // Tải lại dữ liệu
    } catch (error) {
      message.error('Lỗi khi xóa!');
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã gói', dataIndex: 'id', key: 'id' },
    { title: 'Tên gói dịch vụ', dataIndex: 'name', key: 'name' },
    { title: 'Số buổi', dataIndex: 'totalSessions', key: 'totalSessions' },
    { title: 'Giá bán', dataIndex: 'price', key: 'price', render: (price) => (price || 0).toLocaleString('vi-VN') + ' đ' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 16}}>
        <Button type="primary" onClick={() => showModal(null)}>
          Thêm Gói dịch vụ
        </Button>
      </div>
      <Table columns={columns} dataSource={packages} rowKey="id" loading={loading} bordered />
      <Modal title={editingPackage ? "Sửa gói dịch vụ" : "Tạo gói dịch vụ mới"} open={isModalVisible} onOk={handleSave} onCancel={handleCancel} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ totalSessions: 1, price: 0 }}>
          <Form.Item name="name" label="Tên gói dịch vụ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="serviceId" label="Dịch vụ áp dụng" rules={[{ required: true }]}>
            <Select placeholder="Chọn một dịch vụ">
              {services.map(service => (
                <Option key={service.id} value={service.id}>{service.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="totalSessions" label="Tổng số buổi" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="price" label="Giá gói" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ServicePackagePage;