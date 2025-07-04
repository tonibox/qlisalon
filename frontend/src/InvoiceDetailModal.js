import React from 'react';
import { Modal, Button, Row, Col, Typography, Table, Divider } from 'antd';

const { Title, Text } = Typography;

const InvoiceDetailModal = ({ visible, onCancel, invoice }) => {
  if (!invoice) return null;

  const itemColumns = [
    { 
      title: 'Tên DV/SP & Nhân viên', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.consultantNames && (
            <div style={{fontSize: '12px', color: 'gray'}}>Tư vấn: {record.consultantNames}</div>
          )}
          {record.serviceStaffNames && (
            <div style={{fontSize: '12px', color: 'gray'}}>Người làm: {record.serviceStaffNames}</div>
          )}
        </div>
      )
    },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { 
      title: 'Đơn giá', 
      dataIndex: 'selling_price', // Sửa lỗi: dùng selling_price
      key: 'selling_price', 
      align: 'right', 
      render: val => (val || 0).toLocaleString() + ' đ' 
    },
    { 
      title: 'Giảm giá', 
      dataIndex: 'calculatedDiscount', 
      key: 'discount', 
      align: 'right', 
      render: val => (val || 0).toLocaleString() + ' đ'
    },
    { 
      title: 'Thành tiền', 
      key: 'subtotal', 
      align: 'right', 
      // Sửa lỗi: dùng selling_price
      render: (_, record) => ((record.selling_price * record.quantity) - (record.calculatedDiscount || 0)).toLocaleString() + ' đ' 
    },
  ];

  const totalOriginalAmount = invoice.items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={800} // Tăng độ rộng modal
      title={`Chi tiết hóa đơn - ${invoice.id}`}
      footer={[ <Button key="close" type="primary" onClick={onCancel}>Đóng</Button> ]}
    >
        <Row gutter={16}>
            <Col span={12}><Text strong>Khách hàng:</Text> {invoice.customerName}</Col>
            <Col span={12} style={{textAlign: 'right'}}><Text strong>Ngày tạo:</Text> {new Date(invoice.createdAt).toLocaleString('vi-VN')}</Col>
        </Row>
        <Divider />
        <Table
            columns={itemColumns}
            dataSource={invoice.items}
            pagination={false}
            rowKey="id"
            size="small"
        />
        <Row justify="end" style={{marginTop: 16}}>
            <Col span={10}>
                <Row>
                    <Col span={12}><Text>Tổng tiền hàng:</Text></Col>
                    <Col span={12} style={{textAlign: 'right'}}><Text>{totalOriginalAmount.toLocaleString()} đ</Text></Col>
                </Row>
                 <Row>
                    <Col span={12}><Text>Tổng giảm giá:</Text></Col>
                    <Col span={12} style={{textAlign: 'right'}}><Text>{(invoice.totalDiscount || 0).toLocaleString()} đ</Text></Col>
                </Row>
                 <Row>
                    <Col span={12}><Title level={5}>Tổng thanh toán:</Title></Col>
                    <Col span={12} style={{textAlign: 'right'}}><Title level={5}>{invoice.totalAmount.toLocaleString()} đ</Title></Col>
                </Row>
            </Col>
        </Row>
    </Modal>
  );
};

export default InvoiceDetailModal;