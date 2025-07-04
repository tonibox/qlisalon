import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Card, Typography, Select, Checkbox } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

function CommissionSettingsPage() {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [allItems, setAllItems] = useState([]); // Tất cả SP và DV
  const [commissionSettings, setCommissionSettings] = useState({}); // Lưu cài đặt dạng { itemId: { rate: 10 } }
  const [loading, setLoading] = useState(false);

  // Tải danh sách nhân viên ban đầu
  useEffect(() => {
    axios.get('http://localhost:5000/api/staff').then(res => setStaffList(res.data));
    axios.get('http://localhost:5000/api/products').then(res => setAllItems(res.data));
  }, []);

  // Tải cài đặt hoa hồng khi chọn một nhân viên
  useEffect(() => {
    if (selectedStaffId) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/staff/${selectedStaffId}/commission-rules`)
        .then(res => {
          // Chuyển mảng luật thành object để dễ quản lý
          const settings = {};
          res.data.forEach(rule => {
            settings[rule.targetId] = { rate: rule.rate };
          });
          setCommissionSettings(settings);
        })
        .catch(() => message.error('Lỗi khi tải cài đặt!'))
        .finally(() => setLoading(false));
    } else {
      setCommissionSettings({}); // Reset khi không chọn nhân viên nào
    }
  }, [selectedStaffId]);

  // Xử lý khi tick vào checkbox
  const handleCheckChange = (itemId, checked) => {
    const newSettings = { ...commissionSettings };
    if (checked) {
      // Nếu tick, thêm vào cài đặt với rate mặc định là 0
      newSettings[itemId] = { rate: newSettings[itemId]?.rate || 0 };
    } else {
      // Nếu bỏ tick, xóa khỏi cài đặt
      delete newSettings[itemId];
    }
    setCommissionSettings(newSettings);
  };
  
  // Xử lý khi thay đổi rate
  const handleRateChange = (itemId, rate) => {
    setCommissionSettings(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], rate: rate || 0 }
    }));
  };

  const handleSave = async () => {
    if (!selectedStaffId) {
      message.error('Vui lòng chọn nhân viên!');
      return;
    }
    setLoading(true);
    // Chuyển object cài đặt thành mảng luật để gửi đi
    const rulesToSave = Object.entries(commissionSettings).map(([itemId, settings]) => ({
      staffId: selectedStaffId,
      targetId: itemId,
      type: 'item', // Hiện tại chỉ hỗ trợ theo từng item
      rate: settings.rate
    }));

    try {
      await axios.post(`http://localhost:5000/api/staff/${selectedStaffId}/commission-rules`, rulesToSave);
      message.success('Đã lưu cài đặt hoa hồng!');
    } catch {
      message.error('Lỗi khi lưu cài đặt!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      key: 'checkbox',
      width: 50,
      render: (itemId) => <Checkbox checked={!!commissionSettings[itemId]} onChange={(e) => handleCheckChange(itemId, e.target.checked)} />
    },
    { title: 'Tên Dịch vụ / Sản phẩm', dataIndex: 'name', key: 'name' },
    {
      title: 'Tỷ lệ Hoa hồng (%)',
      key: 'rate',
      width: 200,
      render: (_, record) => (
        <InputNumber
          disabled={!commissionSettings[record.id]} // Chỉ bật khi đã tick
          min={0} max={100}
          value={commissionSettings[record.id]?.rate}
          onChange={(value) => handleRateChange(record.id, value)}
          addonAfter="%"
        />
      )
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Cài đặt Hoa hồng</Title>
        <Button type="primary" onClick={handleSave} loading={loading} disabled={!selectedStaffId}>
          Lưu thay đổi
        </Button>
      </div>
      <Select
        showSearch
        placeholder="Chọn một nhân viên để cài đặt"
        style={{ width: '100%', marginBottom: 16 }}
        value={selectedStaffId}
        onChange={setSelectedStaffId}
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        options={staffList.map(s => ({ value: s.id, label: s.name }))}
      />
      {selectedStaffId && (
        <Table
          columns={columns}
          dataSource={allItems}
          loading={loading}
          bordered
          pagination={{ pageSize: 15 }}
          rowKey="id"
        />
      )}
    </Card>
  );
}

export default CommissionSettingsPage;