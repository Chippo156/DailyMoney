import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { initDb, seedSampleData, db } from './db.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo Database SQLite
initDb();

// Tự động nạp dữ liệu mẫu ban đầu nếu bảng giao dịch đang trống
const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
if (txCount === 0) {
  console.log('Chưa có giao dịch, tự động nạp dữ liệu mẫu trực quan...');
  seedSampleData();
}

// API Routes
app.use('/api', apiRoutes);

// Phục vụ frontend tĩnh đã build (nếu có)
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Khởi động server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Website Quản lý Chi tiêu DailyMoney đã sẵn sàng!`);
  console.log(`🌐 Truy cập website tại: http://localhost:${PORT}`);
  console.log(`📊 API Backend tại: http://localhost:${PORT}/api/transactions`);
  console.log(`======================================================\n`);
});
