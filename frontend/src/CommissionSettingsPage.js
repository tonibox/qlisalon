import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, InputNumber, message, Card, Typography, Select, Checkbox } from 'antd';
import axios from 'axios';

const { Title } = Typography;

function CommissionSettingsPage() {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [commissionSettings, setCommissionSettings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff').then(res => setStaffList(res.data));
    axios.get('http://localhost:5000/api/products').then(res => setAllItems(res.data));
  }, []);

  const fetchCommissionRules = useCallback(async (staffId) => {
    if (!staffId) {
      setCommissionSettings({});
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/staff/${staffId}/commission-rules`);
      const settings = {};
      res.data.forEach(rule => {
        settings[rule.targetId] = { rate: rule.rate };
      });
      setCommissionSettings(settings);
    } catch (error) {
      message.error('Lỗi khi tải cài đặt!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissionRules(selectedStaffId);
  }, [selectedStaffId, fetchCommissionRules]);

  const handleCheckChange = (itemId, checked) => {
    const newSettings = { ...commissionSettings };
    if (checked) {
      newSettings[itemId] = { rate: newSettings[itemId]?.rate || 0 };
    } else {
      delete newSettings[itemId];
    }
    setCommissionSettings(newSettings);
  };

  const handleRateChange = (itemId, rate) => {
    setCommissionSettings(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), rate: rate || 0 }
    }));
  };

  const handleSave = async () => {
    if (!selectedStaffId) {
      message.error('Vui lòng chọn nhân viên!');
      return;
    }
    setLoading(true);
    const rulesToSave = Object.entries(commissionSettings).map(([itemId, settings]) => ({
      staffId: selectedStaffId,
      targetId: itemId,
      type: 'item',
      rate: settings.rate
    }));

    try {
      await axios.post(`http://localhost:5000/api/staff/${selectedStaffId}/commission-rules`, rulesToSave);
      message.success('Đã lưu cài đặt hoa hồng!');
      // >>>>>>> DÒNG SỬA LỖI QUAN TRỌNG <<<<<<<
      await fetchCommissionRules(selectedStaffId); // Tải lại dữ liệu để cập nhật UI
    } catch (error) {
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
          disabled={!commissionSettings[record.id]}
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