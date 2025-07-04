import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Card, Tag } from 'antd';
import axios from 'axios';

const { Title } = Typography;

// --- Cải tiến 1: Tách hằng số API ra ngoài ---
// Giúp dễ dàng thay đổi API endpoint ở một nơi duy nhất.
const API_URL = 'http://localhost:5000/api/reports/commissions-summary';

// --- Cải tiến 2: Tách định nghĩa cột ra ngoài component ---
// Giúp component chính gọn gàng hơn và tách biệt logic hiển thị.
const detailColumns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString('vi-VN') },
    { title: 'Mã hóa đơn', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: 'Dịch vụ/SP', dataIndex: 'serviceName', key: 'serviceName' },
    {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role) => {
            if (role === 'service') return <Tag color="processing">Người làm</Tag>;
            if (role === 'consultant') return <Tag color="success">Tư vấn</Tag>;
            return null;
        }
    },
    {
        title: 'Tiền hoa hồng',
        dataIndex: 'commissionAmount',
        key: 'commissionAmount',
        align: 'right',
        render: (val) => `${(val || 0).toLocaleString('vi-VN')} đ`
    },
];

const mainColumns = [
    {
        title: 'Tên nhân viên',
        dataIndex: 'staffName',
        key: 'staffName'
    },
    {
        title: 'Số giao dịch có HH',
        dataIndex: 'transactions',
        key: 'transactionCount',
        align: 'center',
        render: (transactions) => (transactions || []).length
    },
    {
        title: 'Tổng hoa hồng',
        dataIndex: 'totalCommission',
        key: 'totalCommission',
        align: 'right',
        render: (val) => `${(val || 0).toLocaleString('vi-VN')} đ`,
        sorter: (a, b) => a.totalCommission - b.totalCommission,
    },
];

// --- Component con để render bảng chi tiết (đã được tách ra) ---
const ExpandedRow = ({ transactions }) => {
    return <Table columns={detailColumns} dataSource={transactions} pagination={false} rowKey="id" />;
};


function CommissionReportPage() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_URL);
                setReportData(response.data); // Ant Design có thể tự xử lý key nếu có 'id' hoặc 'key'
            } catch (error) {
                // --- Cải tiến 3: Hiển thị lỗi chi tiết hơn trong console ---
                console.error("Lỗi khi tải báo cáo hoa hồng:", error);
                message.error('Có lỗi xảy ra, không thể tải báo cáo hoa hồng!');
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    // --- Cải tiến 4: Tách hàm render dòng mở rộng ra ngoài ---
    // Giúp component chính gọn gàng hơn
    const expandedRowRender = (record) => {
        return <ExpandedRow transactions={record.transactions} />;
    };

    return (
        <Card>
            <Title level={4}>Báo cáo tổng hợp Hoa hồng</Title>
            <Table
                columns={mainColumns}
                dataSource={reportData}
                loading={loading}
                // --- Cải tiến 5: Sử dụng hàm cho rowKey để rõ ràng hơn ---
                // Thay vì thêm key vào dữ liệu, ta chỉ cần chỉ định trường nào là duy nhất.
                rowKey={(record) => record.staffId}
                bordered
                expandable={{
                    expandedRowRender,
                    rowExpandable: record => record.transactions && record.transactions.length > 0,
                }}
            />
        </Card>
    );
}

export default CommissionReportPage;