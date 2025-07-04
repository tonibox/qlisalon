import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Typography, Table, Divider, InputNumber } from 'antd';

const { Title, Text } = Typography;

const PrintInvoiceModal = ({ visible, onCancel, onComplete, invoiceData }) => {
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    if (visible && invoiceData) {
      setAmountPaid(invoiceData.totalAmount);
    }
  }, [visible, invoiceData]);
  
  if (!invoiceData) return null;

  const { cart, customerId, totalAmount, totalDiscount, customers } = invoiceData;
  const customer = customers.find(c => c.id === customerId);

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = `<style>body { margin: 0; padding: 10px; } .ant-table-summary { font-weight: bold; } </style>${printContents}`;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const itemColumns = [
    { title: 'Tên DV/SP', dataIndex: 'name', key: 'name' },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: 'Đơn giá', dataIndex: 'selling_price', key: 'price', align: 'right', render: val => (val || 0).toLocaleString() },
    { title: 'Thành tiền', key: 'subtotal', align: 'right', render: (_, record) => (record.selling_price * record.quantity).toLocaleString() },
  ];

  const totalOriginalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={500}
      title="Hóa đơn thanh toán"
      footer={[
        <Button key="back" onClick={onCancel}>Hủy</Button>,
        <Button key="print" onClick={handlePrint}>In hóa đơn</Button>,
        <Button key="submit" type="primary" onClick={() => onComplete(amountPaid)}>Hoàn thành</Button>,
      ]}
    >
      <div id="printableArea">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={4}>Tên Salon Của Bạn</Title>
          <Text>Địa chỉ của bạn</Text><br/>
          <Text>Số điện thoại: 123456789</Text>
        </div>
        <Divider>HÓA ĐƠN BÁN LẺ</Divider>
        <Row>
          <Col span={12}><Text strong>Khách hàng:</Text> {customer ? customer.name : 'Khách vãng lai'}</Col>
          <Col span={12} style={{ textAlign: 'right' }}><Text>Ngày: {new Date().toLocaleDateString('vi-VN')}</Text></Col>
        </Row>
        <Table dataSource={cart} columns={itemColumns} pagination={false} size="small" rowKey="id" style={{ marginTop: 20 }}/>
        <Row justify="end" style={{ marginTop: 16 }}>
          <Col span={10}>
            <Row><Col span={12}><Text>Tổng tiền hàng:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>{totalOriginalAmount.toLocaleString()} đ</Text></Col></Row>
            <Row><Col span={12}><Text>Tổng giảm giá:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>{(totalDiscount || 0).toLocaleString()} đ</Text></Col></Row>
            <Row><Col span={12}><Title level={5}>KHÁCH CẦN TRẢ:</Title></Col><Col span={12} style={{ textAlign: 'right' }}><Title level={5}>{totalAmount.toLocaleString()} đ</Title></Col></Row>
          </Col>
        </Row>
        <Divider/>
        <div style={{ textAlign: 'center', marginTop: 20 }}><Text>Cảm ơn quý khách và hẹn gặp lại!</Text></div>
      </div>
      <Divider>Xác nhận thanh toán</Divider>
      <Row justify="end" align="middle">
          <Col span={12} style={{textAlign: 'right', paddingRight: '16px'}}><Text strong>Số tiền khách trả:</Text></Col>
          <Col span={12}>
            <InputNumber value={amountPaid} onChange={setAmountPaid} min={0} style={{width: '100%'}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
          </Col>
      </Row>
    </Modal>
  );
};

export default PrintInvoiceModal;