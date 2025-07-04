import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Layout, Card, Typography, Select } from 'antd';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

function ProductPage({ type, title }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // State mới để lưu danh mục
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect giờ sẽ tải cả danh sách mục và danh sách danh mục
  useEffect(() => {
    fetchItems();
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data));
  }, [type, searchTerm]);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/products`, { params: { search: searchTerm, type: type } });
      setItems(response.data);
    } catch (error) { message.error(`Lỗi khi tải dữ liệu ${title}!`); }
    finally { setLoading(false); }
  };

  const showAddModal = () => {
    setEditingItem(null);
    form.setFieldsValue({ type: type, commissionRate: 0, stock: 0, selling_price: 0 });
    setIsModalVisible(true);
  };
  
  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/products/${editingItem.id}`, values);
        message.success('Cập nhật thành công!');
      } else {
        await axios.post("http://localhost:5000/api/products", values);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      fetchItems();
    } catch (error) { message.error("Thao tác thất bại!"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      message.success('Xóa thành công!');
      fetchItems();
    } catch (error) { message.error('Lỗi khi xóa!'); }
  };

  const handleCancel = () => setIsModalVisible(false);
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const columns = [
    { title: 'Mã', dataIndex: 'id', key: 'id' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' }, // Thêm cột danh mục
    { title: 'Giá bán', dataIndex: 'selling_price', key: 'selling_price', render: formatCurrency },
    ...(type === 'service' ? [{ title: 'Hoa hồng (%)', dataIndex: 'commissionRate', key: 'commissionRate', render: (rate) => `${rate || 0}%` }] : []),
    ...(type === 'product' ? [{ title: 'Tồn kho', dataIndex: 'stock', key: 'stock' }] : []),
    { title: 'Hành động', key: 'action', render: (_, record) => ( <Space size="middle"> <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button> <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy"> <Button type="link" danger>Xóa</Button> </Popconfirm> </Space> ), },
  ];

  // Lọc ra danh mục phù hợp với trang hiện tại (Sản phẩm hoặc Dịch vụ)
  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <div>
      <Title level={3}>{title}</Title>
      <Layout style={{ background: 'transparent' }}>
        <Sider width={250} style={{ background: '#fff', padding: '16px', marginRight: '16px', borderRadius: '8px' }}>
          <Title level={5}>Tìm kiếm & Lọc</Title>
          <Card size="small" title="Tìm kiếm">
            <Input.Search placeholder="Tìm theo tên hoặc mã..." allowClear onSearch={value => setSearchTerm(value)} onChange={e => { if (e.target.value === '') { setSearchTerm(''); } }} />
          </Card>
        </Sider>
        <Content>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button type="primary" onClick={showAddModal}>Thêm mới</Button>
          </div>
          <Table columns={columns} dataSource={items} loading={loading} rowKey="id" bordered />
        </Content>
      </Layout>
      <Modal title={editingItem ? `Sửa` : `Thêm mới`} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={form} layout="vertical">
            <Form.Item name="type" label="Loại" rules={[{ required: true }]} hidden>
                <Input />
            </Form.Item>
            <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
            
            {/* THAY THẾ Ô NHẬP TAY BẰNG Ô CHỌN */}
            <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                <Select placeholder="Chọn danh mục">
                    {filteredCategories.map(cat => (
                        <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="selling_price" label="Giá bán" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')}/></Form.Item>
            
            {form.getFieldValue('type') === 'service' ? (
                <Form.Item name="commissionRate" label="Tỷ lệ hoa hồng (%)"><InputNumber min={0} max={100} style={{ width: "100%" }} /></Form.Item>
            ) : (
                <Form.Item name="stock" label="Tồn kho"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            )}
        </Form>
      </Modal>
    </div>
  );
}

export default ProductPage;