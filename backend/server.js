const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');


// ===================================
// API CHO SẢN PHẨM & DỊCH VỤ (PRODUCTS)
// ===================================
app.get('/api/products', (req, res) => {
  const searchTerm = req.query.search || '';
  const productType = req.query.type || '';
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    let products = JSON.parse(data).products;
    if (productType) {
      products = products.filter(p => p.type === productType);
    }
    if (searchTerm) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    res.json(products);
  });
});

app.post('/api/products', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    const newItem = { id: `SP${Date.now()}`, ...req.body };
    db.products.push(newItem);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.status(201).json(newItem);
    });
  });
});

app.put('/api/products/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    const itemIndex = db.products.findIndex(p => p.id === req.params.id);
    if (itemIndex === -1) return res.status(404).send('Không tìm thấy');
    db.products[itemIndex] = { ...db.products[itemIndex], ...req.body };
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.json(db.products[itemIndex]);
    });
  });
});

app.delete('/api/products/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    db.products = db.products.filter(p => p.id !== req.params.id);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.status(200).send('Xóa thành công');
    });
  });
});

// ===================================
// API CHO KHÁCH HÀNG (CUSTOMERS)
// ===================================
app.get('/api/customers', (req, res) => {
  const searchTerm = req.query.search || '';
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    let customers = JSON.parse(data).customers;
    if (searchTerm) {
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    res.json(customers);
  });
});
// POST: Tạo khách hàng mới
app.post('/api/customers', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const newCustomer = { id: `KH${Date.now()}`, ...req.body };
        db.customers.push(newCustomer);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(201).json(newCustomer);
        });
    });
});

// PUT: Cập nhật thông tin khách hàng
app.put('/api/customers/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const customerIndex = db.customers.findIndex(c => c.id === req.params.id);
        if (customerIndex === -1) {
            return res.status(404).send('Không tìm thấy khách hàng');
        }
        db.customers[customerIndex] = { ...db.customers[customerIndex], ...req.body };
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.json(db.customers[customerIndex]);
        });
    });
});

// DELETE: Xóa khách hàng
app.delete('/api/customers/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        db.customers = db.customers.filter(c => c.id !== req.params.id);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(200).send('Xóa khách hàng thành công');
        });
    });
});

// ===================================
// API CHO NHÂN VIÊN (STAFF)
// ===================================
app.get('/api/staff', (req, res) => {
  const searchTerm = req.query.search || '';
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    let staff = JSON.parse(data).staff;
    if (searchTerm) {
      staff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    res.json(staff);
  });
});

app.put('/api/staff/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    const staffIndex = db.staff.findIndex(s => s.id === req.params.id);
    if (staffIndex === -1) return res.status(404).send('Không tìm thấy nhân viên');
    db.staff[staffIndex] = { ...db.staff[staffIndex], ...req.body };
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.json(db.staff[staffIndex]);
    });
  });
});
// POST: Tạo nhân viên mới
app.post('/api/staff', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        // Gán trạng thái và lương mặc định khi thêm mới
        const newStaff = { 
            id: `NV${Date.now()}`, 
            ...req.body, 
            status: 'Đang làm việc',
            salary: req.body.salary || 0
        };
        db.staff.push(newStaff);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(201).json(newStaff);
        });
    });
});

// DELETE: Xóa nhân viên
app.delete('/api/staff/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        db.staff = db.staff.filter(s => s.id !== req.params.id);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(200).send('Xóa nhân viên thành công');
        });
    });
});

// ===================================
// API CHO HÓA ĐƠN (INVOICES)
// ===================================
app.get('/api/invoices', (req, res) => {
    const { startDate, endDate, status } = req.query;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        let db = JSON.parse(data);
        let invoices = db.invoices;
        if (status && status.length > 0) { const statusArray = Array.isArray(status) ? status : [status]; invoices = invoices.filter(invoice => statusArray.includes(invoice.status)); }
        if (startDate && endDate) { invoices = invoices.filter(invoice => { const invoiceDate = new Date(invoice.createdAt); return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate); }); }
        const populatedInvoices = invoices.map(invoice => {
            const customer = db.customers.find(c => c.id === invoice.customerId);
            const staffInvolvedIds = new Set();
            (invoice.items || []).forEach(item => { (item.serviceStaffIds || []).forEach(id => staffInvolvedIds.add(id)); (item.consultantIds || []).forEach(id => staffInvolvedIds.add(id)); });
            const staffInvolvedNames = [...staffInvolvedIds].map(id => db.staff.find(s => s.id === id)?.name).filter(Boolean).join(', ');
            const payments = db.payments.filter(p => p.invoiceId === invoice.id);
            const paymentMethods = payments.map(p => p.paymentMethod).join(', ');
            return { ...invoice, customerName: customer ? customer.name : 'Khách vãng lai', staffNames: staffInvolvedNames, paymentMethods: paymentMethods };
        });
        res.json(populatedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
});

app.get('/api/invoices/:id', (req, res) => {
    const invoiceId = req.params.id;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const invoice = db.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            const customer = db.customers.find(c => c.id === invoice.customerId);
            const populatedItems = invoice.items.map(item => {
                const consultantNames = (item.consultantIds || []).map(id => db.staff.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                const serviceStaffNames = (item.serviceStaffIds || []).map(id => db.staff.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                return { ...item, consultantNames, serviceStaffNames };
            });
            const populatedInvoice = { ...invoice, items: populatedItems, customerName: customer ? customer.name : 'Khách vãng lai' };
            res.json(populatedInvoice);
        } else { res.status(404).send('Không tìm thấy hóa đơn'); }
    });
});

// POST: Tạo hóa đơn mới (phiên bản cuối cùng, xử lý tất cả nghiệp vụ)
app.post('/api/invoices', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const { customerId, items, totalAmount, totalDiscount, amountPaid } = req.body;
        if (!items || !Array.isArray(items)) { return res.status(400).send('Dữ liệu items không hợp lệ'); }
        
        // 1. TRỪ TỒN KHO
        items.forEach(item => { const productInfo = db.products.find(p => p.id === item.id && p.type === 'product'); if (productInfo && productInfo.stock !== undefined) { const productIndex = db.products.findIndex(p => p.id === item.id); if (productIndex !== -1) { db.products[productIndex].stock -= item.quantity; } } });
        
        // 2. TẠO HÓA ĐƠN & PHIẾU THU
        const newInvoice = { id: `HD${Date.now()}`, customerId, items, totalAmount, totalDiscount: totalDiscount || 0, amountPaid: amountPaid, debt: totalAmount - amountPaid, status: (totalAmount - amountPaid === 0) ? 'Hoàn thành' : 'Ghi nợ', createdAt: new Date().toISOString() };
        db.invoices.push(newInvoice);
        if (amountPaid > 0) { db.payments.push({ id: `TTHD${Date.now()}`, invoiceId: newInvoice.id, amount: amountPaid, paymentMethod: 'Tiền mặt', createdAt: newInvoice.createdAt, createdBy: 'Thu ngân', status: 'Đã thanh toán' }); }
        
        // 3. XỬ LÝ BÁN GÓI DV
        items.forEach(item => { const packageDetails = db.servicePackages.find(p => p.id === item.id); if (packageDetails && customerId) { db.customerPackages.push({ id: `CUS_PKG_${Date.now()}`, customerId: customerId, packageId: packageDetails.id, sessionsRemaining: packageDetails.totalSessions, purchasedAt: new Date().toISOString() }); } });
        
        // 4. TRỪ BUỔI KHI DÙNG GÓI DV
        items.forEach(item => { if (item.usedPackageId) { const packageIndex = db.customerPackages.findIndex(p => p.id === item.usedPackageId); if (packageIndex !== -1) { db.customerPackages[packageIndex].sessionsRemaining -= item.quantity; } } });
        
        // 5. TÍNH HOA HỒNG
        for (const item of items) {
            if (item.isPaidByPackage) continue;
            const isPackage = db.servicePackages.some(p => p.id === item.id);
            if (isPackage) continue;
            const priceAfterDiscount = (item.selling_price * item.quantity) - (item.calculatedDiscount || 0);
            const processCommissions = (staffIds, role) => {
                if (staffIds && staffIds.length > 0) {
                    staffIds.forEach(staffId => {
                        const serviceDetails = db.products.find(p => p.id === item.id);
                        if (!serviceDetails) return;
                        let rule = (db.commissionRules || []).find(r => r.staffId === staffId && r.type === 'item' && r.targetId === item.id);
                        if (!rule && serviceDetails.category) { rule = (db.commissionRules || []).find(r => r.staffId === staffId && r.type === 'category' && r.targetId === serviceDetails.category); }
                        if (rule && rule.rate > 0) {
                            const commissionAmount = (priceAfterDiscount * (rule.rate / 100)) / staffIds.length;
                            db.commissions.push({ id: `HH${Date.now()}${staffId}${role}`, invoiceId: newInvoice.id, staffId: staffId, serviceId: item.id, commissionAmount: commissionAmount, role: role, createdAt: newInvoice.createdAt });
                        }
                    });
                }
            };
            processCommissions(item.serviceStaffIds, 'service');
            processCommissions(item.consultantIds, 'consultant');
        }
        
        // LƯU TẤT CẢ VÀO FILE
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => { if (err) return res.status(500).send('Lỗi server'); res.status(201).json(newInvoice); });
    });
});

// ===================================
// API CHO GÓI DỊCH VỤ (SERVICE PACKAGES)
// ===================================

// GET: Lấy danh sách gói dịch vụ
app.get('/api/service-packages', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        res.json(JSON.parse(data).servicePackages || []);
    });
});

// POST: Tạo gói dịch vụ mới
app.post('/api/service-packages', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const newPackage = { id: `GOI${Date.now()}`, ...req.body };
        db.servicePackages.push(newPackage);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(201).json(newPackage);
        });
    });
});

// PUT: Cập nhật một gói dịch vụ
app.put('/api/service-packages/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const packageIndex = db.servicePackages.findIndex(p => p.id === req.params.id);
        if (packageIndex === -1) return res.status(404).send('Không tìm thấy gói dịch vụ');
        db.servicePackages[packageIndex] = { ...db.servicePackages[packageIndex], ...req.body };
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.json(db.servicePackages[packageIndex]);
        });
    });
});

// DELETE: Xóa một gói dịch vụ
app.delete('/api/service-packages/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        db.servicePackages = db.servicePackages.filter(p => p.id !== req.params.id);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(200).send('Xóa gói dịch vụ thành công');
        });
    });
});

// ===================================
// API CHO DANH MỤC (CATEGORIES)
// ===================================
app.get('/api/categories', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        res.json(JSON.parse(data).categories || []);
    });
});

app.post('/api/categories', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const newCategory = { id: `CAT${Date.now()}`, ...req.body };
        db.categories.push(newCategory);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(201).json(newCategory);
        });
    });
});
// PUT: Cập nhật một danh mục
app.put('/api/categories/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        
        const db = JSON.parse(data);
        const categoryIndex = db.categories.findIndex(c => c.id === req.params.id);

        if (categoryIndex === -1) {
            return res.status(404).send('Không tìm thấy danh mục');
        }

        // Cập nhật dữ liệu
        db.categories[categoryIndex] = { ...db.categories[categoryIndex], ...req.body };

        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.json(db.categories[categoryIndex]);
        });
    });
});
app.delete('/api/categories/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        db.categories = db.categories.filter(c => c.id !== req.params.id);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send('Lỗi server');
            res.status(200).send('Xóa danh mục thành công');
        });
    });
});

// ===================================
// API CHO LUẬT HOA HỒNG (COMMISSION RULES)
// ===================================
app.get('/api/staff/:id/commission-rules', (req, res) => {
  const staffId = req.params.id;
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    const rulesForStaff = (db.commissionRules || []).filter(r => r.staffId === staffId);
    res.json(rulesForStaff);
  });
});

// POST: Ghi đè TẤT CẢ luật hoa hồng cho MỘT nhân viên
app.post('/api/staff/:id/commission-rules', (req, res) => {
  const staffId = req.params.id;
  const newRulesForStaff = req.body; // Mảng các luật mới cho nhân viên này

  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);

    // 1. Xóa tất cả các luật cũ của nhân viên này
    const otherStaffRules = (db.commissionRules || []).filter(r => r.staffId !== staffId);

    // 2. Gán hoặc đảm bảo mỗi luật mới có một ID duy nhất
    const rulesWithIds = newRulesForStaff.map(rule => {
      // Nếu luật đã có ID (ví dụ: từ một lần tải và lưu trước đó), giữ nguyên.
      // Nếu không, tạo một ID mới.
      return rule.id ? rule : { ...rule, id: `RULE${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    });

    // 3. Gộp các luật của các nhân viên khác với luật mới đã có ID của nhân viên này
    db.commissionRules = [...otherStaffRules, ...rulesWithIds];

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error('Lỗi khi ghi cơ sở dữ liệu:', err);
        return res.status(500).send('Lỗi server');
      }
      res.status(200).send('Cập nhật hoa hồng thành công');
    });
  });
});
app.put('/api/staff/:staffId/commission-rules/:ruleId', (req, res) => {
  const staffId = req.params.staffId;
  const ruleId = req.params.ruleId;
  const updatedRuleData = req.body; // Dữ liệu cập nhật cho luật hoa hồng

  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Lỗi đọc cơ sở dữ liệu:', err);
      return res.status(500).send('Lỗi server');
    }
    let db = JSON.parse(data);

    let ruleFound = false;
    // Sử dụng map để tạo mảng mới đã cập nhật
    db.commissionRules = (db.commissionRules || []).map(rule => {
      // Chuyển đổi ID sang chuỗi để so sánh chính xác, tránh lỗi kiểu dữ liệu
      if (String(rule.staffId) === String(staffId) && String(rule.id) === String(ruleId)) {
        ruleFound = true;
        // Gộp dữ liệu cũ với dữ liệu mới cập nhật
        return { ...rule, ...updatedRuleData };
      }
      return rule;
    });

    if (!ruleFound) {
      return res.status(404).send('Không tìm thấy luật hoa hồng hoặc nhân viên tương ứng.');
    }

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error('Lỗi ghi cơ sở dữ liệu:', err);
        return res.status(500).send('Lỗi server');
      }
      res.status(200).send('Cập nhật luật hoa hồng thành công.');
    });
  });
});

// DELETE: Xóa một luật hoa hồng CỤ THỂ cho một nhân viên
app.delete('/api/staff/:staffId/commission-rules/:ruleId', (req, res) => {
  const staffId = req.params.staffId;
  const ruleId = req.params.ruleId;

  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Lỗi đọc cơ sở dữ liệu:', err);
      return res.status(500).send('Lỗi server');
    }
    let db = JSON.parse(data);

    // Lọc ra luật cần xóa. Đảm bảo so sánh đúng kiểu dữ liệu.
    const initialLength = (db.commissionRules || []).length;
    db.commissionRules = (db.commissionRules || []).filter(rule => {
      return !(String(rule.staffId) === String(staffId) && String(rule.id) === String(ruleId));
    });

    if (db.commissionRules.length === initialLength) {
      return res.status(404).send('Không tìm thấy luật hoa hồng hoặc nhân viên tương ứng để xóa.');
    }

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error('Lỗi ghi cơ sở dữ liệu:', err);
        return res.status(500).send('Lỗi server');
      }
      res.status(200).send('Xóa luật hoa hồng thành công.');
    });
  });
});


// ===================================
// API BÁO CÁO & THỐNG KÊ
// ===================================
app.get('/api/payments', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        res.json(JSON.parse(data).payments || []);
    });
});

app.get('/api/stats', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const today = new Date().toISOString().slice(0, 10);
        const revenueToday = (db.payments || [])
            .filter(p => p.createdAt.slice(0, 10) === today)
            .reduce((sum, p) => sum + p.amount, 0);
        const stats = {
            customerCount: db.customers.length,
            productCount: db.products.length,
            invoiceCountToday: (db.invoices || []).filter(inv => inv.createdAt.slice(0, 10) === today).length,
            revenueToday: revenueToday,
        };
        res.json(stats);
    });
});

app.get('/api/reports/commissions-summary', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const summary = {};
        (db.commissions || []).forEach(commission => {
            const staffId = commission.staffId;
            if (!summary[staffId]) {
                const staffInfo = db.staff.find(s => s.id === staffId);
                summary[staffId] = { staffId: staffId, staffName: staffInfo ? staffInfo.name : 'Không xác định', totalCommission: 0, transactionCount: 0, };
            }
            summary[staffId].totalCommission += commission.commissionAmount;
            summary[staffId].transactionCount += 1;
        });
        res.json(Object.values(summary));
    });
});
//==============================
// GET: Lấy danh sách các gói dịch vụ mà một khách hàng sở hữu
app.get('/api/customers/:id/packages', (req, res) => {
  const customerId = req.params.id;
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);

    // Lọc ra các gói của khách hàng
    const ownedPackages = db.customerPackages.filter(p => p.customerId === customerId);

    // Gắn thêm thông tin chi tiết của gói dịch vụ
    const populatedOwnedPackages = ownedPackages.map(op => {
      const packageDetails = db.servicePackages.find(sp => sp.id === op.packageId);
      return {
        ...op,
        packageName: packageDetails ? packageDetails.name : 'Gói không xác định',
        serviceId: packageDetails ? packageDetails.serviceId : null
      };
    });

    res.json(populatedOwnedPackages);
  });
});
// GET: Lấy tất cả các phiếu thanh toán (có lọc theo ngày)
app.get('/api/payments', (req, res) => {
  const { startDate, endDate } = req.query;

  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    
    const db = JSON.parse(data);
    let payments = db.payments || [];

    // Lọc theo khoảng thời gian nếu được cung cấp
    if (startDate && endDate) {
      payments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
      });
    }

    // Gắn thêm thông tin khách hàng vào mỗi phiếu thu để báo cáo chi tiết hơn
    const populatedPayments = payments.map(payment => {
        const invoice = db.invoices.find(inv => inv.id === payment.invoiceId);
        if(invoice) {
            const customer = db.customers.find(c => c.id === invoice.customerId);
            return { ...payment, customerName: customer ? customer.name : 'Khách vãng lai' };
        }
        return { ...payment, customerName: 'Không rõ' };
    });

    res.json(populatedPayments);
  });
});
// ===================================
// API CHO THƯỞNG/PHẠT (SALARY ADJUSTMENTS)
// ===================================

// GET: Lấy danh sách thưởng/phạt
app.get('/api/salary-adjustments', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    // Gắn thêm tên nhân viên
    const populated = (db.salaryAdjustments || []).map(adj => {
        const staff = db.staff.find(s => s.id === adj.staffId);
        return {...adj, staffName: staff ? staff.name : 'N/A'};
    });
    res.json(populated.sort((a,b) => new Date(b.date) - new Date(a.date)));
  });
});

// POST: Tạo một khoản thưởng/phạt mới
app.post('/api/salary-adjustments', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    const newAdjustment = { id: `ADJ${Date.now()}`, ...req.body };
    db.salaryAdjustments.push(newAdjustment);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.status(201).json(newAdjustment);
    });
  });
});

// DELETE: Xóa một khoản thưởng/phạt
app.delete('/api/salary-adjustments/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Lỗi server');
    const db = JSON.parse(data);
    db.salaryAdjustments = db.salaryAdjustments.filter(adj => adj.id !== req.params.id);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).send('Lỗi server');
      res.status(200).send('Xóa thành công');
    });
  });
});
// GET: Báo cáo tổng hợp hoa hồng theo nhân viên (kèm chi tiết)
app.get('/api/reports/commissions-summary', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Lỗi server');
        const db = JSON.parse(data);
        const summary = {};
        (db.commissions || []).forEach(commission => {
            const staffId = commission.staffId;
            if (!summary[staffId]) {
                const staffInfo = db.staff.find(s => s.id === staffId);
                summary[staffId] = {
                    staffId: staffId,
                    staffName: staffInfo ? staffInfo.name : 'Không xác định',
                    totalCommission: 0,
                    transactions: [],
                };
            }
            const service = db.products.find(p => p.id === commission.serviceId);
            summary[staffId].totalCommission += commission.commissionAmount;
            summary[staffId].transactions.push({
                ...commission,
                serviceName: service ? service.name : 'N/A',
            });
        });
        res.json(Object.values(summary));
    });
});

// ===================================
// KHỞI ĐỘNG SERVER
// ===================================
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});