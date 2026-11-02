import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  X,
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter && String(tx.category_id) !== String(categoryFilter)) return false;
    if (methodFilter !== 'all' && tx.payment_method !== methodFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchNote = tx.note && tx.note.toLowerCase().includes(q);
      const matchCategory = tx.category_name && tx.category_name.toLowerCase().includes(q);
      if (!matchNote && !matchCategory) return false;
    }
    return true;
  });

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all mb-4 sm:mb-6">
      
      {/* HEADER & TÌM KIẾM */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              Lịch Sử Giao Dịch
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {filteredTransactions.length} giao dịch
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          
          {/* Ô tìm kiếm */}
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Lọc loại: Tất cả / Chi / Thu */}
          <div className="sm:col-span-3">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold h-full items-center">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'expense'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Chi
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  typeFilter === 'income'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Thu
              </button>
            </div>
          </div>

          {/* Lọc theo danh mục */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter || ''}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              aria-label="Lọc theo danh mục"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'expense' ? 'Chi' : 'Thu'})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Thẻ lọc đang áp dụng */}
        {(categoryFilter || searchTerm || typeFilter !== 'all' || methodFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Lọc:</span>
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                {categories.find((c) => String(c.id) === String(categoryFilter))?.name}
                <button onClick={() => onCategoryFilterChange('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setMethodFilter('all');
                onCategoryFilterChange('');
              }}
              className="text-[11px] text-rose-500 hover:underline font-bold"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

      </div>

      {/* DANH SÁCH GIAO DỊCH */}
      {sortedDates.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs font-bold text-slate-500">
            Không tìm thấy giao dịch nào
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {sortedDates.map((dateKey) => {
            const group = groupedByDate[dateKey];
            const dayLabel = getRelativeDayLabel(dateKey);

            return (
              <div key={dateKey} className="border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-0 last:pb-0">
                
                {/* TIÊU ĐỀ NGÀY */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {dayLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">({dateKey})</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black">
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
                <div className="space-y-1.5 sm:space-y-2">
                  {group.transactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const color = tx.category_color || (isExpense ? '#EF4444' : '#10B981');

                    return (
                      <div
                        key={tx.id}
                        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all"
                      >
                        {/* Cột trái */}
                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            <CategoryIcon name={tx.category_icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {tx.category_name}
                              </span>
                              {tx.payment_method && (
                                <span className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-500">
                                  {tx.payment_method}
                                </span>
                              )}
                            </div>
                            {tx.note && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cột phải: Số tiền & Nút sửa/xóa (hiển thị rõ cho mobile touch) */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className={`font-black text-xs sm:text-base tracking-tight ${
                            isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isExpense ? '-' : '+'}{formatVND(tx.amount)}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              title="Sửa"
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                            >
                              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              title="Xóa"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
