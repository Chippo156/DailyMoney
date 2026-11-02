import { Router } from 'express';
import { db, seedSampleData, seedDefaultCategories } from '../db.js';

const router = Router();

// ==========================================
// 1. GIAO DỊCH (TRANSACTIONS)
// ==========================================

// Lấy danh sách giao dịch có lọc, tìm kiếm và phân trang
router.get('/transactions', (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      categoryId,
      paymentMethod,
      search,
      limit = 100,
      offset = 0
    } = req.query;

    let query = `
      SELECT 
        t.id, t.type, t.amount, t.category_id, t.date, 
        t.payment_method, t.note, t.created_at, t.updated_at,
        c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ` AND t.date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND t.date <= ?`;
      params.push(endDate);
    }
    if (type && type !== 'all') {
      query += ` AND t.type = ?`;
      params.push(type);
    }
    if (categoryId) {
      query += ` AND t.category_id = ?`;
      params.push(Number(categoryId));
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query += ` AND t.payment_method = ?`;
      params.push(paymentMethod);
    }
    if (search && search.trim() !== '') {
      query += ` AND (t.note LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Đếm tổng số
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countStmt = db.prepare(countQuery);
    const totalCount = countStmt.get(...params)?.total || 0;

    // Sắp xếp theo ngày giảm dần, id giảm dần
    query += ` ORDER BY t.date DESC, t.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    res.json({
      success: true,
      data: rows,
      total: totalCount,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Lỗi khi lấy giao dịch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm giao dịch mới
router.post('/transactions', (req, res) => {
  try {
    const { type, amount, category_id, date, payment_method, note } = req.body;

    if (!type || !['expense', 'income'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại giao dịch không hợp lệ' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền phải lớn hơn 0' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày giao dịch' });
    }

    const stmt = db.prepare(`
      INSERT INTO transactions (type, amount, category_id, date, payment_method, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      type,
      Number(amount),
      Number(category_id),
      date,
      payment_method || 'Tiền mặt',
      note ? note.trim() : ''
    );

    const newTx = db.prepare(`
      SELECT 
        t.id, t.type, t.amount, t.category_id, t.date, 
        t.payment_method, t.note, t.created_at,
        c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newTx, message: 'Thêm giao dịch thành công' });
  } catch (error) {
    console.error('Lỗi khi thêm giao dịch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật giao dịch
router.put('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category_id, date, payment_method, note } = req.body;

    const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    const stmt = db.prepare(`
      UPDATE transactions 
      SET type = ?, amount = ?, category_id = ?, date = ?, payment_method = ?, note = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      type,
      Number(amount),
      Number(category_id),
      date,
      payment_method || 'Tiền mặt',
      note ? note.trim() : '',
      id
    );

    const updated = db.prepare(`
      SELECT 
        t.id, t.type, t.amount, t.category_id, t.date, 
        t.payment_method, t.note, t.updated_at,
        c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(id);

    res.json({ success: true, data: updated, message: 'Cập nhật giao dịch thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật giao dịch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa giao dịch
router.delete('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ success: true, message: 'Đã xóa giao dịch thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa giao dịch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. DANH MỤC (CATEGORIES)
// ==========================================

router.get('/categories', (req, res) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT 
        c.*,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
    `;
    const params = [];

    if (type) {
      query += ` WHERE c.type = ?`;
      params.push(type);
    }

    query += ` GROUP BY c.id ORDER BY c.type, c.id ASC`;

    const categories = db.prepare(query).all(...params);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }
    if (!type || !['expense', 'income'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại danh mục không hợp lệ' });
    }

    const stmt = db.prepare(`
      INSERT INTO categories (name, type, icon, color, is_default)
      VALUES (?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      name.trim(),
      type,
      icon || 'Tag',
      color || '#3B82F6'
    );

    const newCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newCat, message: 'Thêm danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    db.prepare(`
      UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?
    `).run(name.trim(), icon, color, id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    // Kiểm tra xem có giao dịch nào đang dùng danh mục này không
    const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ?').get(id)?.count || 0;
    if (txCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì đang có ${txCount} giao dịch liên kết.`
      });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. THỐNG KÊ & BÁO CÁO (ANALYTICS & STATS)
// ==========================================

// Tổng quan: Tổng thu, tổng chi, số dư, tỷ lệ tiết kiệm, so sánh kỳ trước
router.get('/stats/overview', (req, res) => {
  try {
    const { startDate, endDate, prevStartDate, prevEndDate } = req.query;

    let whereClause = '1=1';
    const params = [];
    if (startDate) {
      whereClause += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND date <= ?`;
      params.push(endDate);
    }

    // Tính kỳ hiện tại
    const incomeResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
      FROM transactions WHERE type = 'income' AND ${whereClause}
    `).get(...params);

    const expenseResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
      FROM transactions WHERE type = 'expense' AND ${whereClause}
    `).get(...params);

    const totalIncome = incomeResult.total;
    const totalExpense = expenseResult.total;
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

    // Tính số ngày trong khoảng để tính trung bình mỗi ngày
    let daysDiff = 30;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      daysDiff = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
    const dailyAvgExpense = totalExpense / daysDiff;

    // Kỳ trước nếu có
    let prevStats = null;
    if (prevStartDate && prevEndDate) {
      const prevIncome = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions WHERE type = 'income' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate)?.total || 0;

      const prevExpense = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions WHERE type = 'expense' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate)?.total || 0;

      const incomeChange = prevIncome > 0 ? (((totalIncome - prevIncome) / prevIncome) * 100) : 0;
      const expenseChange = prevExpense > 0 ? (((totalExpense - prevExpense) / prevExpense) * 100) : 0;

      prevStats = {
        prevIncome,
        prevExpense,
        incomeChange,
        expenseChange
      };
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate: Number(savingsRate.toFixed(1)),
        dailyAvgExpense: Math.round(dailyAvgExpense),
        totalTransactions: incomeResult.count + expenseResult.count,
        incomeCount: incomeResult.count,
        expenseCount: expenseResult.count,
        prevStats
      }
    });
  } catch (error) {
    console.error('Lỗi stats overview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thống kê chi tiết theo danh mục (cho Biểu đồ tròn và danh sách loại tiền tiêu)
router.get('/stats/by-category', (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;

    let whereClause = `t.type = ?`;
    const params = [type];

    if (startDate) {
      whereClause += ` AND t.date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND t.date <= ?`;
      params.push(endDate);
    }

    // Tổng tiền của loại (để tính %)
    const totalAmount = db.prepare(`
      SELECT COALESCE(SUM(t.amount), 0) as total 
      FROM transactions t WHERE ${whereClause}
    `).get(...params)?.total || 0;

    const query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id) as transaction_count
      FROM categories c
      INNER JOIN transactions t ON c.id = t.category_id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY total_amount DESC
    `;

    const rows = db.prepare(query).all(...params);

    const dataWithPercentage = rows.map(r => ({
      ...r,
      percentage: totalAmount > 0 ? Number(((r.total_amount / totalAmount) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      totalAmount,
      data: dataWithPercentage
    });
  } catch (error) {
    console.error('Lỗi stats by-category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Biểu đồ xu hướng theo ngày/tháng (Income vs Expense Trend)
router.get('/stats/trend', (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    let whereClause = '1=1';
    const params = [];

    if (startDate) {
      whereClause += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND date <= ?`;
      params.push(endDate);
    }

    const query = `
      SELECT 
        strftime('${dateFormat}', date) as period,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `;

    const rows = db.prepare(query).all(...params);

    const trendData = rows.map(r => ({
      period: r.period,
      income: r.income || 0,
      expense: r.expense || 0,
      balance: (r.income || 0) - (r.expense || 0)
    }));

    res.json({ success: true, data: trendData });
  } catch (error) {
    console.error('Lỗi stats trend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thống kê theo phương thức thanh toán
router.get('/stats/payment-methods', (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    let whereClause = `type = ?`;
    const params = [type];

    if (startDate) {
      whereClause += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND date <= ?`;
      params.push(endDate);
    }

    const rows = db.prepare(`
      SELECT 
        payment_method,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM transactions
      WHERE ${whereClause}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `).all(...params);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. NGÂN SÁCH (BUDGETS)
// ==========================================

router.get('/budgets', (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số tháng (month=YYYY-MM)' });
    }

    const budgets = db.prepare(`
      SELECT 
        b.id, b.category_id, b.month, b.amount as budget_amount,
        c.name as category_name, c.icon as category_icon, c.color as category_color,
        COALESCE(SUM(t.amount), 0) as spent_amount
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.type = 'expense' 
        AND strftime('%Y-%m', t.date) = b.month
      WHERE b.month = ?
      GROUP BY b.id
    `).all(month);

    const data = budgets.map(b => {
      const percentage = b.budget_amount > 0 ? Number(((b.spent_amount / b.budget_amount) * 100).toFixed(1)) : 0;
      return {
        ...b,
        percentage,
        remaining: b.budget_amount - b.spent_amount,
        is_over: b.spent_amount > b.budget_amount
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/budgets', (req, res) => {
  try {
    const { category_id, month, amount } = req.body;
    if (!category_id || !month || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu ngân sách không hợp lệ' });
    }

    const stmt = db.prepare(`
      INSERT INTO budgets (category_id, month, amount)
      VALUES (?, ?, ?)
      ON CONFLICT(category_id, month) DO UPDATE SET amount = excluded.amount
    `);

    stmt.run(category_id, month, Number(amount));
    res.json({ success: true, message: 'Cập nhật ngân sách thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/budgets/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    res.json({ success: true, message: 'Đã xóa ngân sách' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. QUẢN LÝ DỮ LIỆU (SEED, CLEAR, BACKUP)
// ==========================================

// Nạp dữ liệu mẫu
router.post('/data/seed-sample', (req, res) => {
  try {
    seedSampleData();
    res.json({ success: true, message: 'Đã nạp dữ liệu mẫu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa tất cả giao dịch (cho người dùng muốn bắt đầu từ đầu)
router.post('/data/clear-transactions', (req, res) => {
  try {
    db.prepare('DELETE FROM transactions').run();
    res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử giao dịch.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xuất toàn bộ dữ liệu dưới dạng JSON
router.get('/data/export', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    const transactions = db.prepare('SELECT * FROM transactions').all();
    const budgets = db.prepare('SELECT * FROM budgets').all();

    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      transactions,
      budgets
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=DailyMoney_Backup.json');
    res.json(backup);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
