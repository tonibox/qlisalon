import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined,
  UserOutlined, TeamOutlined, CreditCardOutlined, BarChartOutlined, SettingOutlined
} from '@ant-design/icons';
import './App.css';

// Import tất cả các trang
import DashboardPage from './DashboardPage';
import ProductPage from './ProductPage';
import CustomerPage from './CustomerPage';
import InvoiceListPage from './InvoiceListPage';
import CreateInvoicePage from './CreateInvoicePage';
import StaffPage from './StaffPage';
import ServicePackagePage from './ServicePackagePage';
import RevenueReportPage from './RevenueReportPage';
import SalaryReportPage from './SalaryReportPage';
import CommissionReportPage from './CommissionReportPage';
import CategorySettingsPage from './CategorySettingsPage';
import CommissionSettingsPage from './CommissionSettingsPage';
import AdjustmentsPage from './AdjustmentsPage';

const { Header, Content, Footer, Sider } = Layout;

// Component Menu với cấu trúc đã được sửa lại
const AppMenu = () => {
  const location = useLocation();
  
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/products') || path.startsWith('/services')) return ['hang-hoa-group'];
    if (path.startsWith('/customers') || path.startsWith('/service-packages')) return ['doi-tac-group'];
    if (path.startsWith('/invoices')) return ['giao-dich'];
    if (path.startsWith('/staff')) return ['nhan-vien'];
    if (path.startsWith('/reports')) return ['bao-cao'];
    if (path.startsWith('/settings')) return ['cai-dat'];
    return ['tong-quan'];
  };

  const menuItems = [
    { key: 'tong-quan', icon: <DashboardOutlined />, label: <Link to="/">Tổng quan</Link> },
    { key: 'giao-dich', icon: <ShoppingCartOutlined />, label: <Link to="/invoices">Bán hàng</Link> },
    { 
      key: 'hang-hoa-group', 
      icon: <AppstoreOutlined />, 
      label: 'Hàng hóa',
      children: [
        { key: 'hang-hoa-sp', label: <Link to="/products">Sản phẩm</Link> },
        { key: 'hang-hoa-dv', label: <Link to="/services">Dịch vụ</Link> },
      ]
    },
    { 
      key: 'doi-tac-group', 
      icon: <UserOutlined />, 
      label: 'Đối tác',
      children: [
        { key: 'doi-tac-kh', label: <Link to="/customers">Khách hàng</Link> },
        { key: 'doi-tac-goi-dv', label: <Link to="/service-packages">Gói dịch vụ</Link> },
      ]
    },
    { 
      key: 'nhan-vien', 
      icon: <TeamOutlined />, 
      label: 'Nhân viên',
      children: [
        { key: 'staff-list', label: <Link to="/staff">Danh sách nhân viên</Link> },
        { key: 'staff-adjustments', label: <Link to="/staff/adjustments">Thưởng/Phạt</Link> }
      ]
    },
    { 
      key: 'bao-cao', 
      icon: <BarChartOutlined />, 
      label: 'Báo cáo',
      children: [
        { key: 'report-revenue', label: <Link to="/reports/revenue">Báo cáo thu chi</Link> },
        { key: 'report-salary', label: <Link to="/reports/salary">Báo cáo lương</Link> },
        { key: 'report-commission', label: <Link to="/reports/commissions">Báo cáo hoa hồng</Link> },
      ]
    },
    // Chỉ có một mục Cài đặt duy nhất chứa các menu con
    { 
      key: 'cai-dat', 
      icon: <SettingOutlined />, 
      label: 'Cài đặt',
      children: [
        { key: 'setting-categories', label: <Link to="/settings/categories">Danh mục</Link> },
        { key: 'setting-commission', label: <Link to="/settings/commissions">Hoa hồng</Link> }
      ]
    },
  ];

  return <Menu theme="dark" mode="inline" defaultSelectedKeys={getSelectedKeys()} defaultOpenKeys={getSelectedKeys()} items={menuItems} />;
};

function App() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="logo" />
          <AppMenu />
        </Sider>
        <Layout className="site-layout">
          <Header style={{ padding: '0 16px', background: '#fff' }}>
            <span style={{float: 'right'}}>Xin chào, Thu ngân!</span>
          </Header>
          <Content style={{ margin: '16px' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductPage type="product" title="Quản lý Hàng hóa" />} />
                <Route path="/services" element={<ProductPage type="service" title="Quản lý Dịch vụ" />} />
                <Route path="/customers" element={<CustomerPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/invoices" element={<CreateInvoicePage />} />
                <Route path="/invoices/list" element={<InvoiceListPage />} />
                <Route path="/service-packages" element={<ServicePackagePage />} />
                <Route path="/reports/revenue" element={<RevenueReportPage />} />
                <Route path="/reports/salary" element={<SalaryReportPage />} />
                <Route path="/reports/commissions" element={<CommissionReportPage />} />
                <Route path="/settings/categories" element={<CategorySettingsPage />} />
                <Route path="/settings/commissions" element={<CommissionSettingsPage />} />
                <Route path="/staff/adjustments" element={<AdjustmentsPage />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>My Salon ©{new Date().getFullYear()}</Footer>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;