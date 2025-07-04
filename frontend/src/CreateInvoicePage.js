import React, { useState, useEffect, useRef } from 'react';
import { Select, Button, Table, InputNumber, message, Card, Typography, Tabs, List, Input, Popconfirm, Layout, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrintInvoiceModal from './PrintInvoiceModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content, Sider } = Layout;

// --- COMPONENT CON CHO NỘI DUNG MỘT HÓA ĐƠN ---
const InvoiceTabContent = ({ invoice = {}, customers, staff, onCartChange, onCustomerChange }) => {
    const { cart = [], customerId } = invoice;
    const [ownedPackages, setOwnedPackages] = useState([]);

    useEffect(() => {
        if (customerId) {
            axios.get(`http://localhost:5000/api/customers/${customerId}/packages`)
                .then(res => {
                    setOwnedPackages(res.data.filter(p => p.sessionsRemaining > 0));
                })
                .catch(() => setOwnedPackages([]));
        } else {
            setOwnedPackages([]);
        }
    }, [customerId]);

    const handleItemChange = (itemId, field, value) => {
        const newCart = cart.map(item => {
            if (item.id === itemId) {
                let updatedItem = { ...item, [field]: (value === undefined ? null : value) };
                if (['quantity', 'discountValue', 'discountType', 'selling_price'].includes(field)) {
                    const newQty = updatedItem.quantity || 1;
                    const newPrice = updatedItem.selling_price || 0;
                    const newDiscountValue = updatedItem.discountValue || 0;
                    const newDiscountType = updatedItem.discountType || 'amount';
                    let calculatedDiscount = 0;
                    const subtotal = newPrice * newQty;
                    if (newDiscountType === 'percent') { calculatedDiscount = subtotal * (newDiscountValue / 100); } 
                    else { calculatedDiscount = newDiscountValue; }
                    updatedItem.calculatedDiscount = calculatedDiscount;
                }
                return updatedItem;
            }
            return item;
        });
        onCartChange(newCart);
    };

    const handleRemoveItem = (itemId) => { onCartChange(cart.filter(item => item.id !== itemId)); };
    
    const handleUsePackage = (cartItem) => {
        const customerPackage = ownedPackages.find(p => p.serviceId === cartItem.id);
        if (!customerPackage) return;
        const newCart = cart.map(item => {
            if (item.id === cartItem.id) {
                return { ...item, selling_price: 0, discountValue: 0, calculatedDiscount: 0, usedPackageId: customerPackage.id, isPaidByPackage: true };
            }
            return item;
        });
        onCartChange(newCart);
    };

    const cartColumns = [
        { title: 'Tên DV/SP', dataIndex: 'name', render: (text, record) => (<div><Text strong>{text}</Text>{record.type === 'service' ? (<div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}><Select mode="multiple" allowClear size="small" placeholder="Tư vấn" style={{ width: '100%' }} value={record.consultantIds} onChange={(values) => handleItemChange(record.id, 'consultantIds', values)} options={staff.map(s => ({ label: s.name, value: s.id }))} /><Select mode="multiple" allowClear size="small" placeholder="Người làm" style={{ width: '100%' }} value={record.serviceStaffIds} onChange={(values) => handleItemChange(record.id, 'serviceStaffIds', values)} options={staff.map(s => ({ label: s.name, value: s.id }))} /></div>) : <div style={{marginTop: '8px'}}><Select mode="multiple" allowClear size="small" placeholder="Tư vấn" style={{ width: '100%' }} value={record.consultantIds} onChange={(values) => handleItemChange(record.id, 'consultantIds', values)} options={staff.map(s => ({ label: s.name, value: s.id }))} /></div>}</div>) },
        { title: 'SL', dataIndex: 'quantity', width: 80, render: (text, record) => <InputNumber min={1} value={text} onChange={(val) => handleItemChange(record.id, 'quantity', val)} /> },
        { title: 'Đơn giá', dataIndex: 'selling_price', width: 120, render: (price, record) => <InputNumber min={0} value={price} style={{width: '100%'}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} onChange={(val) => handleItemChange(record.id, 'selling_price', val)} /> },
        { title: 'Giảm giá', key: 'discount', width: 180, render: (_, record) => (<Input.Group compact><InputNumber style={{ width: 'calc(100% - 65px)' }} value={record.discountValue} min={0} onChange={(val) => handleItemChange(record.id, 'discountValue', val)} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : '0'} /><Select style={{ width: 65 }} value={record.discountType} onChange={(val) => handleItemChange(record.id, 'discountType', val)}><Option value="amount">VND</Option><Option value="percent">%</Option></Select></Input.Group>) },
        { title: 'Thành tiền', key: 'subtotal', width: 120, render: (_, record) => ((record.selling_price * record.quantity) - (record.calculatedDiscount || 0)).toLocaleString('vi-VN') + ' đ' },
        { title: 'Hành động', key: 'action', width: 120, render: (_, record) => { const availablePackage = ownedPackages.find(p => p.serviceId === record.id); const isAlreadyUsed = record.isPaidByPackage; return (<Space>{availablePackage && !isAlreadyUsed && (<Button type="primary" size="small" onClick={() => handleUsePackage(record)}>Dùng gói</Button>)}<Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleRemoveItem(record.id)}><Button type="link" danger>Xóa</Button></Popconfirm></Space>) } },
    ];
    
    return (
        <Card bordered={false} style={{padding: 0, background: 'transparent'}}>
            <Select showSearch placeholder="Tìm hoặc chọn khách hàng..." style={{ width: '100%', marginBottom: 16 }} value={customerId} onChange={onCustomerChange} options={customers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` }))} allowClear />
            {ownedPackages.length > 0 && (<Card size="small" type="inner" title="Gói dịch vụ khách đã mua" style={{marginBottom: 16}}>{ownedPackages.map(pkg => (<div key={pkg.id} style={{display: 'flex', justifyContent: 'space-between'}}><Text>{pkg.packageName}</Text><Text strong>Còn lại: {pkg.sessionsRemaining} buổi</Text></div>))}</Card>)}
            <Table columns={cartColumns} dataSource={cart} rowKey="id" pagination={false} />
        </Card>
    );
};

// --- COMPONENT CHÍNH CỦA TRANG ---
function CreateInvoicePage() {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [packages, setPackages] = useState([]);
    const [staff, setStaff] = useState([]);
    const [customers, setCustomers] = useState([]);
    const initialPanes = [{ title: 'Hóa đơn 1', customerId: null, cart: [], key: '1', closable: true }];
    const [activeKey, setActiveKey] = useState(initialPanes[0].key);
    const [panes, setPanes] = useState(initialPanes);
    const newTabIndex = useRef(1);
    const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
    const [invoiceToPrint, setInvoiceToPrint] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/customers').then(res => setCustomers(res.data));
        axios.get('http://localhost:5000/api/staff').then(res => setStaff(res.data));
        axios.get('http://localhost:5000/api/products', { params: { type: 'service' } }).then(res => setServices(res.data));
        axios.get('http://localhost:5000/api/products', { params: { type: 'product' } }).then(res => setProducts(res.data));
        axios.get('http://localhost:5000/api/service-packages').then(res => setPackages(res.data));
    }, []);

    const onTabChange = (key) => setActiveKey(key);
    const updatePaneContent = (key, newContent) => { setPanes(panes.map(pane => pane.key === key ? { ...pane, ...newContent } : pane)); };
    
    const handleAddItemToActiveCart = (item) => {
        const activePane = panes.find(p => p.key === activeKey);
        if (!activePane) return;
        const { cart } = activePane; let newCart;
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            newCart = cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
        } else {
            const price = item.price !== undefined ? item.price : item.selling_price;
            newCart = [...cart, { ...item, selling_price: price, quantity: 1, consultantIds: [], serviceStaffIds: [], discountType: 'amount', discountValue: 0, calculatedDiscount: 0, isPaidByPackage: false }];
        }
        updatePaneContent(activeKey, { cart: newCart });
    };

    const addTab = () => { newTabIndex.current++; const newActiveKey = `newTab${newTabIndex.current}`; setPanes([...panes, { title: `Hóa đơn ${newTabIndex.current}`, customerId: null, cart: [], key: newActiveKey, closable: true }]); setActiveKey(newActiveKey); };
    
    const removeTab = (targetKey) => {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        if (newPanes.length > 0) {
            let newActiveKey = activeKey;
            if (newActiveKey === targetKey) {
                const targetIndex = panes.findIndex((pane) => pane.key === targetKey);
                const newIndex = targetIndex === 0 ? 0 : targetIndex - 1;
                newActiveKey = newPanes[newIndex].key;
            }
            setPanes(newPanes);
            setActiveKey(newActiveKey);
        } else {
            newTabIndex.current = 1;
            const initialPane = { title: 'Hóa đơn 1', customerId: null, cart: [], key: '1', closable: true };
            setPanes([initialPane]);
            setActiveKey('1');
        }
    };

    const onTabEdit = (targetKey, action) => action === 'add' ? addTab() : removeTab(targetKey);
    
    const handleCheckout = () => {
        const activePane = panes.find(p => p.key === activeKey);
        if (!activePane || activePane.cart.length === 0) { message.error('Hóa đơn hiện tại rỗng!'); return; }
        const { cart, customerId } = activePane;
        const totalAmount = cart.reduce((total, item) => total + (item.selling_price * item.quantity - (item.calculatedDiscount || 0)), 0);
        const totalDiscount = cart.reduce((total, item) => total + (item.calculatedDiscount || 0), 0);
        setInvoiceToPrint({ cart, customerId, totalAmount, totalDiscount, customers });
        setIsPrintModalVisible(true);
    };

    const handleCompleteAndSave = async (amountPaid) => {
        if (!invoiceToPrint) return;
        const finalInvoiceData = { customerId: invoiceToPrint.customerId, items: invoiceToPrint.cart, totalAmount: invoiceToPrint.totalAmount, totalDiscount: invoiceToPrint.totalDiscount, amountPaid: amountPaid };
        try {
            await axios.post('http://localhost:5000/api/invoices', finalInvoiceData);
            message.success('Lưu hóa đơn thành công!');
            setIsPrintModalVisible(false);
            removeTab(activeKey);
            navigate('/invoices/list');
        } catch (error) { message.error('Lỗi khi lưu hóa đơn!'); }
    };
    
    const ItemList = ({ items, onSelect }) => (
        <List
            grid={{ gutter: 8, xs: 2 }}
            dataSource={items}
            renderItem={(item) => (
                <List.Item>
                    <Card hoverable size="small" onClick={() => onSelect(item)} bodyStyle={{ padding: 8, textAlign: 'center' }}>
                        <Text strong ellipsis>{(item.name || '')}</Text>
                        <Text type="secondary" style={{ display: 'block' }}>{(item.price || item.selling_price || 0).toLocaleString('vi-VN')} đ</Text>
                    </Card>
                </List.Item>
            )}
        />
    );

    const selectionTabs = [
        { key: 'services', label: 'Dịch vụ', children: <ItemList items={services} onSelect={handleAddItemToActiveCart}/> },
        { key: 'products', label: 'Sản phẩm', children: <ItemList items={products} onSelect={handleAddItemToActiveCart}/> },
        { key: 'packages', label: 'Gói dịch vụ', children: <ItemList items={packages} onSelect={handleAddItemToActiveCart}/> },
    ];
    
    const activePane = panes.find(p => p.key === activeKey);
    const totalAmount = activePane ? activePane.cart.reduce((total, item) => total + (item.selling_price * item.quantity - (item.calculatedDiscount || 0)), 0) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
            <Layout style={{ background: 'transparent', flex: 1, overflow: 'hidden' }}>
                <Content style={{ overflow: 'auto', paddingRight: '16px' }}>
                    <Tabs type="editable-card" onChange={onTabChange} activeKey={activeKey} onEdit={onTabEdit}>
                        {panes.map((pane) => (
                            <Tabs.TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                                <InvoiceTabContent invoice={pane} customers={customers} staff={staff} onCartChange={(newCart) => updatePaneContent(pane.key, { cart: newCart })} onCustomerChange={(customerId) => updatePaneContent(pane.key, { customerId: customerId })}/>
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                </Content>
                <Sider width={350} theme="light" style={{ background: 'rgb(249, 250, 252)', borderRadius: '8px' }}>
                     <Card title="Chọn dịch vụ/sản phẩm" size="small" bordered={false} bodyStyle={{padding: "0 8px"}}>
                        <Tabs defaultActiveKey="services" items={selectionTabs} />
                     </Card>
                </Sider>
            </Layout>
            <div style={{ flexShrink: 0, paddingTop: '16px' }}>
                <Card bodyStyle={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px'}}>
                    <Title level={4} style={{margin: 0}}>Tổng thanh toán: {totalAmount.toLocaleString('vi-VN')} đ</Title>
                    <Button type="primary" size="large" onClick={handleCheckout}>THANH TOÁN</Button>
                </Card>
            </div>
            <PrintInvoiceModal visible={isPrintModalVisible} onCancel={() => setIsPrintModalVisible(false)} onComplete={handleCompleteAndSave} invoiceData={invoiceToPrint} />
        </div>
    );
}

export default CreateInvoicePage;