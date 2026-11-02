import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đảm bảo thư mục data tồn tại
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dailymoney.sqlite');
export const db = new DatabaseSync(dbPath);

// Bật Foreign Keys & WAL mode để tối ưu hiệu năng
db.exec('PRAGMA foreign_keys = ON;');

// Khởi tạo bảng dữ liệu
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      icon TEXT NOT NULL DEFAULT 'Tag',
      color TEXT NOT NULL DEFAULT '#3B82F6',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      amount REAL NOT NULL CHECK(amount > 0),
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'Tiền mặt',
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      month TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, month),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);

  // Kiểm tra và khởi tạo danh mục mặc định nếu chưa có
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  const count = countStmt.get().count;

  if (count === 0) {
    seedDefaultCategories();
  }
}

export function seedDefaultCategories() {
  const defaultCategories = [
    // Chi tiêu
    { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#F97316', is_default: 1 },
    { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', is_default: 1 },
    { name: 'Nhà cửa & Tiền thuê', type: 'expense', icon: 'Home', color: '#6366F1', is_default: 1 },
    { name: 'Hóa đơn & Điện nước', type: 'expense', icon: 'Zap', color: '#EAB308', is_default: 1 },
    { name: 'Đi lại & Xăng xe', type: 'expense', icon: 'Car', color: '#3B82F6', is_default: 1 },
    { name: 'Giải trí & Phim ảnh', type: 'expense', icon: 'Film', color: '#8B5CF6', is_default: 1 },
    { name: 'Sức khỏe & Y tế', type: 'expense', icon: 'HeartPulse', color: '#EF4444', is_default: 1 },
    { name: 'Giáo dục & Học tập', type: 'expense', icon: 'GraduationCap', color: '#14B8A6', is_default: 1 },
    { name: 'Gia đình & Con cái', type: 'expense', icon: 'Users', color: '#06B6D4', is_default: 1 },
    { name: 'Tiết kiệm & Đầu tư', type: 'expense', icon: 'PiggyBank', color: '#10B981', is_default: 1 },
    { name: 'Chi tiêu khác', type: 'expense', icon: 'MoreHorizontal', color: '#6B7280', is_default: 1 },

    // Thu nhập
    { name: 'Lương cố định', type: 'income', icon: 'Briefcase', color: '#10B981', is_default: 1 },
    { name: 'Thưởng & Phụ cấp', type: 'income', icon: 'Award', color: '#3B82F6', is_default: 1 },
    { name: 'Làm thêm & Freelance', type: 'income', icon: 'Laptop', color: '#8B5CF6', is_default: 1 },
    { name: 'Đầu tư & Cổ tức', type: 'income', icon: 'TrendingUp', color: '#F59E0B', is_default: 1 },
    { name: 'Tiền lãi ngân hàng', type: 'income', icon: 'Landmark', color: '#06B6D4', is_default: 1 },
    { name: 'Quà tặng & Được biếu', type: 'income', icon: 'Gift', color: '#EC4899', is_default: 1 },
    { name: 'Thu nhập khác', type: 'income', icon: 'PlusCircle', color: '#6B7280', is_default: 1 },
  ];

  const insert = db.prepare(`
    INSERT INTO categories (name, type, icon, color, is_default)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const cat of defaultCategories) {
    insert.run(cat.name, cat.type, cat.icon, cat.color, cat.is_default);
  }
}

// Hàm thêm dữ liệu mẫu trực quan cho người dùng thử nghiệm ngay
export function seedSampleData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Lấy id của các category
  const cats = db.prepare('SELECT id, name, type FROM categories').all();
  const catMap = {};
  for (const c of cats) {
    catMap[c.name] = c.id;
  }

  const sampleTx = [
    // Thu nhập
    { type: 'income', cat: 'Lương cố định', amount: 20000000, day: 5, method: 'Chuyển khoản / Thẻ', note: 'Nhận lương tháng' },
    { type: 'income', cat: 'Làm thêm & Freelance', amount: 4500000, day: 12, method: 'Chuyển khoản / Thẻ', note: 'Dự án website freelance' },
    { type: 'income', cat: 'Thưởng & Phụ cấp', amount: 2000000, day: 15, method: 'Chuyển khoản / Thẻ', note: 'Thưởng KPI' },
    { type: 'income', cat: 'Tiền lãi ngân hàng', amount: 350000, day: 20, method: 'Chuyển khoản / Thẻ', note: 'Lãi tiết kiệm online' },

    // Chi tiêu
    { type: 'expense', cat: 'Nhà cửa & Tiền thuê', amount: 4500000, day: 6, method: 'Chuyển khoản / Thẻ', note: 'Tiền thuê căn hộ' },
    { type: 'expense', cat: 'Hóa đơn & Điện nước', amount: 850000, day: 8, method: 'Ví điện tử', note: 'Hóa đơn tiền điện & nước' },
    { type: 'expense', cat: 'Hóa đơn & Điện nước', amount: 250000, day: 9, method: 'Ví điện tử', note: 'Cước internet cáp quang' },
    { type: 'expense', cat: 'Ăn uống', amount: 150000, day: 1, method: 'Tiền mặt', note: 'Ăn trưa bún bò & cà phê' },
    { type: 'expense', cat: 'Ăn uống', amount: 320000, day: 3, method: 'Ví điện tử', note: 'Đi siêu thị mua thực phẩm tuần' },
    { type: 'expense', cat: 'Ăn uống', amount: 450000, day: 7, method: 'Chuyển khoản / Thẻ', note: 'Ăn tối liên hoan bạn bè' },
    { type: 'expense', cat: 'Đi lại & Xăng xe', amount: 100000, day: 4, method: 'Tiền mặt', note: 'Đổ xăng xe máy' },
    { type: 'expense', cat: 'Đi lại & Xăng xe', amount: 120000, day: 11, method: 'Ví điện tử', note: 'Grab đi gặp khách hàng' },
    { type: 'expense', cat: 'Mua sắm', amount: 650000, day: 10, method: 'Chuyển khoản / Thẻ', note: 'Mua áo sơ mi công sở' },
    { type: 'expense', cat: 'Mua sắm', amount: 280000, day: 14, method: 'Ví điện tử', note: 'Mua đồ gia dụng mini' },
    { type: 'expense', cat: 'Giải trí & Phim ảnh', amount: 240000, day: 13, method: 'Ví điện tử', note: 'Vé xem phim cuối tuần' },
    { type: 'expense', cat: 'Sức khỏe & Y tế', amount: 180000, day: 15, method: 'Tiền mặt', note: 'Mua vitamin C & thuốc ho' },
    { type: 'expense', cat: 'Giáo dục & Học tập', amount: 499000, day: 16, method: 'Chuyển khoản / Thẻ', note: 'Khóa học lập trình trực tuyến' },
    { type: 'expense', cat: 'Tiết kiệm & Đầu tư', amount: 5000000, day: 6, method: 'Chuyển khoản / Thẻ', note: 'Chuyển vào quỹ tiết kiệm' },
    { type: 'expense', cat: 'Ăn uống', amount: 75000, day: Math.min(today.getDate(), 28), method: 'Tiền mặt', note: 'Cơm trưa văn phòng' },
  ];

  const insertTx = db.prepare(`
    INSERT INTO transactions (type, amount, category_id, date, payment_method, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const tx of sampleTx) {
    const catId = catMap[tx.cat];
    if (catId) {
      const dayStr = String(tx.day).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      insertTx.run(tx.type, tx.amount, catId, dateStr, tx.method, tx.note);
    }
  }

  // Thêm ngân sách mẫu cho tháng hiện tại
  const currentMonthStr = `${year}-${month}`;
  const insertBudget = db.prepare(`
    INSERT OR REPLACE INTO budgets (category_id, month, amount)
    VALUES (?, ?, ?)
  `);

  if (catMap['Ăn uống']) insertBudget.run(catMap['Ăn uống'], currentMonthStr, 5000000);
  if (catMap['Nhà cửa & Tiền thuê']) insertBudget.run(catMap['Nhà cửa & Tiền thuê'], currentMonthStr, 5000000);
  if (catMap['Mua sắm']) insertBudget.run(catMap['Mua sắm'], currentMonthStr, 2000000);
  if (catMap['Đi lại & Xăng xe']) insertBudget.run(catMap['Đi lại & Xăng xe'], currentMonthStr, 1000000);
  if (catMap['Giải trí & Phim ảnh']) insertBudget.run(catMap['Giải trí & Phim ảnh'], currentMonthStr, 1000000);
}
