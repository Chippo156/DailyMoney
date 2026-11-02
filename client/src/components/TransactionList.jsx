import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
  FileText,
  X,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatVND, getRelativeDayLabel } from '../utils/formatters';

export default function TransactionList({
  transactions = [],
  categories = [],
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  categoryFilter,
  onCategoryFilterChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [methodFilter, setMethodFilter] = useState('all');

  // Lọc giao dịch
  const filteredTransactions = transactions.filter((tx) => {
    // Lọc theo loại
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    // Lọc theo danh mục
    if (categoryFilter && String(tx.category_id) !== String(categoryFilter)) return false;
    // Lọc theo phương thức
    if (methodFilter !== 'all' && tx.payment_method !== methodFilter) return false;
    // Tìm kiếm ghi chú hoặc tên danh mục
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchNote = tx.note && tx.note.toLowerCase().includes(q);
      const matchCategory = tx.category_name && tx.category_name.toLowerCase().includes(q);
      if (!matchNote && !matchCategory) return false;
    }
    return true;
  });

  // Nhóm theo ngày (YYYY-MM-DD)
  const groupedByDate = filteredTransactions.reduce((groups, tx) => {
    const dateKey = tx.date;
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        transactions: [],
        dayExpense: 0,
        dayIncome: 0
      };
    }
    groups[dateKey].transactions.push(tx);
    if (tx.type === 'expense') {
      groups[dateKey].dayExpense += tx.amount;
    } else {
      groups[dateKey].dayIncome += tx.amount;
    }
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all mb-6">
      
      {/* HEADER & THANH TÌM KIẾM / LỌC */}
      <div className="flex flex-col gap-4 mb-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Lịch Sử Giao Dịch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng số {filteredTransactions.length} giao dịch được hiển thị
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="self-start sm:self-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
          
          {/* Ô tìm kiếm */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Lọc loại: Tất cả / Chi tiêu / Thu nhập */}
          <div className="sm:col-span-3">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold h-full items-center">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'expense'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                Chi tiêu
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'income'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Lọc theo danh mục */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter || ''}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              aria-label="Lọc theo danh mục giao dịch"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'expense' ? 'Chi' : 'Thu'})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo phương thức thanh toán */}
          <div className="sm:col-span-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              aria-label="Lọc theo phương thức thanh toán"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Mọi phương thức</option>
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản / Thẻ">Chuyển khoản / Thẻ</option>
              <option value="Ví điện tử">Ví điện tử</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

        </div>

        {/* Thẻ đang lọc đang kích hoạt nếu có */}
        {(categoryFilter || searchTerm || typeFilter !== 'all' || methodFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Đang lọc:</span>
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                Danh mục: {categories.find((c) => String(c.id) === String(categoryFilter))?.name}
                <button onClick={() => onCategoryFilterChange('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                Loại: {typeFilter === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                <button onClick={() => setTypeFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                Từ khóa: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setMethodFilter('all');
                onCategoryFilterChange('');
              }}
              className="text-xs text-rose-500 hover:underline font-semibold ml-1"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

      </div>

      {/* DANH SÁCH GIAO DỊCH NHÓM THEO NGÀY */}
      {sortedDates.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Receipt className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy giao dịch nào phù hợp
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc ngày.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const group = groupedByDate[dateKey];
            const dayLabel = getRelativeDayLabel(dateKey);

            return (
              <div key={dateKey} className="border-b border-slate-100 dark:border-slate-800/80 pb-5 last:border-0 last:pb-0">
                
                {/* TIÊU ĐỀ NGÀY & TỔNG THU/CHI TRONG NGÀY */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {dayLabel}
                    </span>
                    <span className="text-xs text-slate-400">({dateKey})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    {group.dayIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatVND(group.dayIncome)}
                      </span>
                    )}
                    {group.dayExpense > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatVND(group.dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* CÁC GIAO DỊCH TRONG NGÀY */}
                <div className="space-y-2">
                  {group.transactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const color = tx.category_color || (isExpense ? '#EF4444' : '#10B981');

                    return (
                      <div
                        key={tx.id}
                        className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all"
                      >
                        {/* Cột trái: Icon danh mục & Chi tiết */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            <CategoryIcon name={tx.category_icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {tx.category_name}
                              </span>
                              {tx.payment_method && (
                                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                                  {tx.payment_method}
                                </span>
                              )}
                            </div>
                            {tx.note && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cột phải: Số tiền & Nút hành động */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`font-extrabold text-sm sm:text-base tracking-tight ${
                            isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isExpense ? '-' : '+'}{formatVND(tx.amount)}
                          </div>

                          {/* Nút sửa / xóa (hover hiện rõ) */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              title="Sửa giao dịch"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              title="Xóa giao dịch"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
