import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Card, Typography, DatePicker, Popconfirm, Tag, Space } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdjustments();
    axios.get('http://localhost:5000/api/staff').then(res => setStaffList(res.data));
  }, []);

  const fetchAdjustments = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/salary-adjustments')
      .then(res => setAdjustments(res.data))
      .catch(() => message.error('Lỗi khi tải dữ liệu!'))
      .finally(() => setLoading(false));
  };

  const showModal = () => {
    form.setFieldsValue({ date: dayjs() }); // Mặc định là ngày hôm nay
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const dataToSave = { ...values, date: values.date.format('YYYY-MM-DD') };
      await axios.post('http://localhost:5000/api/salary-adjustments', dataToSave);
      message.success('Thêm khoản mới thành công!');
      setIsModalVisible(false);
      fetchAdjustments();
    } catch (error) {
      message.error('Thao tác thất bại!');
    }
  };

  const handleDelete = async (id) => {
    try {
        await axios.delete(`http://localhost:5000/api/salary-adjustments/${id}`);
        message.success('Xóa thành công!');
        fetchAdjustments();
    } catch {
        message.error('Lỗi khi xóa!');
    }
  };

  const columns = [
    { title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (date) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'bonus' ? 'blue' : 'orange'}>{type === 'bonus' ? 'THƯỞNG' : 'PHẠT'}</Tag> },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right', render: (val) => (val || 0).toLocaleString('vi-VN') + ' đ' },
    { title: 'Hành động', key: 'action', render: (_, record) => <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record.id)}><Button type="link" danger>Xóa</Button></Popconfirm> }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Thưởng / Phạt</Title>
        <Button type="primary" onClick={showModal}>Thêm mới</Button>
      </div>
      <Table columns={columns} dataSource={adjustments} rowKey="id" loading={loading} />
      <Modal title="Thêm khoản Thưởng/Phạt" open={isModalVisible} onOk={handleSave} onCancel={handleCancel} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="staffId" label="Chọn nhân viên" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhân viên">{staffList.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select>
          </Form.Item>
           <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại"><Option value="bonus">Thưởng</Option><Option value="deduction">Phạt</Option></Select>
          </Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} /></Form.Item>
          <Form.Item name="reason" label="Lý do" rules={[{ required: true }]}><Input.TextArea rows={2}/></Form.Item>
          <Form.Item name="date" label="Ngày ghi nhận" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
export default AdjustmentsPage;