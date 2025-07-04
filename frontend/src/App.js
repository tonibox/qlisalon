import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
    DashboardOutlined,
    FileDoneOutlined,
    AppstoreOutlined,
    ShopOutlined,
    TeamOutlined,
    BarChartOutlined,
    SettingOutlined,
    PlusCircleOutlined,
    UnorderedListOutlined,
    BoxPlotOutlined,
    GiftOutlined,
    UserOutlined,
    SolutionOutlined,
    LineChartOutlined,
    PieChartOutlined,
    DollarCircleOutlined,
    SlidersOutlined,
    AppstoreAddOutlined,
    PartitionOutlined,
    // --- BƯỚC 1: IMPORT ICON MỚI ---
    SmileOutlined,
} from '@ant-design/icons';

// Import các trang của bạn (giữ nguyên như cũ)
import DashboardPage from './DashboardPage';
import CreateInvoicePage from './CreateInvoicePage';
import InvoiceListPage from './InvoiceListPage';
import ProductPage from './ProductPage';
import ServicePackagePage from './ServicePackagePage';
import StaffPage from './StaffPage';
import CustomerPage from './CustomerPage';
import RevenueReportPage from './RevenueReportPage';
import CommissionReportPage from './CommissionReportPage';
import SalaryReportPage from './SalaryReportPage';
import CommissionSettingsPage from './CommissionSettingsPage';
import CategorySettingsPage from './CategorySettingsPage';
import AdjustmentsPage from './AdjustmentsPage';

const { Header, Content, Sider, Footer } = Layout;
const { Title } = Typography;

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const menuItems = [
    // ... (Giữ nguyên cấu trúc menuItems như cũ)
    getItem(<Link to="/">Tổng quan</Link>, '/', <DashboardOutlined />),
    getItem('Hóa đơn', 'invoices', <FileDoneOutlined />, [
        getItem(<Link to="/invoices/create">Tạo hóa đơn</Link>, '/invoices/create', <PlusCircleOutlined />),
        getItem(<Link to="/invoices/list">DS hóa đơn</Link>, '/invoices/list', <UnorderedListOutlined />),
    ]),
    getItem('Quản lý sản phẩm', 'products', <AppstoreOutlined />, [
        getItem(<Link to="/products">Sản phẩm</Link>, '/products', <BoxPlotOutlined />),
        getItem(<Link to="/service-packages">Gói dịch vụ</Link>, '/service-packages', <GiftOutlined />),
    ]),
    getItem('Quản lý Salon', 'salon', <ShopOutlined />, [
        getItem(<Link to="/staff">Nhân viên</Link>, '/staff', <UserOutlined />),
        getItem(<Link to="/customers">Khách hàng</Link>, '/customers', <TeamOutlined />),
    ]),
    getItem('Báo cáo', 'reports', <BarChartOutlined />, [
        getItem(<Link to="/reports/revenue">Doanh thu</Link>, '/reports/revenue', <LineChartOutlined />),
        getItem(<Link to="/reports/commissions">Hoa hồng</Link>, '/reports/commissions', <PieChartOutlined />),
        getItem(<Link to="/reports/salary">Bảng lương</Link>, '/reports/salary', <DollarCircleOutlined />),
    ]),
    getItem('Thiết lập', 'settings', <SettingOutlined />, [
        getItem(<Link to="/settings/commissions">Cài đặt hoa hồng</Link>, '/settings/commissions', <SlidersOutlined />),
        getItem(<Link to="/settings/categories">Phân loại</Link>, '/settings/categories', <AppstoreAddOutlined />),
        getItem(<Link to="/settings/adjustments">Các khoản điều chỉnh</Link>, '/settings/adjustments', <PartitionOutlined />),
    ]),
];

const App = () => {
    const location = useLocation();
    const openKeys = ['/' + location.pathname.split('/')[1]];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={250}>
                {/* --- BƯỚC 2: THAY THẾ DIV PLACEHOLDER BẰNG TÊN SALON --- */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 0',
                    cursor: 'pointer'
                }}>
                    <SmileOutlined style={{ fontSize: '28px', color: '#fff' }}/>
                    <Title level={4} style={{ color: '#fff', margin: '0 0 0 10px', lineHeight: '1' }}>
                        My Salon
                    </Title>
                </div>
                {/* ----------------------------------------------------------- */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={openKeys}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: '#fff' }}>
                    <Title level={3} style={{ margin: '16px 0' }}>Quản lý Salon</Title>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
                        <Routes>
                             {/* ... (Giữ nguyên các Route của bạn) ... */}
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/invoices/create" element={<CreateInvoicePage />} />
                            <Route path="/invoices/list" element={<InvoiceListPage />} />
                            <Route path="/products" element={<ProductPage />} />
                            <Route path="/service-packages" element={<ServicePackagePage />} />
                            <Route path="/staff" element={<StaffPage />} />
                            <Route path="/customers" element={<CustomerPage />} />
                            <Route path="/reports/revenue" element={<RevenueReportPage />} />
                            <Route path="/reports/commissions" element={<CommissionReportPage />} />
                            <Route path="/reports/salary" element={<SalaryReportPage />} />
                            <Route path="/settings/commissions" element={<CommissionSettingsPage />} />
                            <Route path="/settings/categories" element={<CategorySettingsPage />} />
                            <Route path="/settings/adjustments" element={<AdjustmentsPage />} />
                        </Routes>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Salon Management ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

const AppWrapper = () => (
    <Router>
        <App />
    </Router>
);

export default AppWrapper;