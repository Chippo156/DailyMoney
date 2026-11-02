import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Trash2,
  Edit2
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatVND } from '../utils/formatters';

export default function BudgetSection({
  budgets = [],
  categories = [],
  currentMonth,
  onMonthChange,
  onSaveBudget,
  onDeleteBudget
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Tổng ngân sách & Tổng đã chi
  const totalBudget = budgets.reduce((acc, b) => acc + (b.budget_amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent_amount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleOpenAdd = (b = null) => {
    if (b) {
      setEditingBudget(b);
      setSelectedCategory(b.category_id);
      setAmount(String(b.budget_amount));
    } else {
      setEditingBudget(null);
      // Chọn category chưa có budget nếu có
      const unusedCat = expenseCategories.find(
        (c) => !budgets.some((b) => Number(b.category_id) === Number(c.id))
      );
      setSelectedCategory(unusedCat ? unusedCat.id : expenseCategories[0]?.id || '');
      setAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !amount || Number(amount) <= 0) return;

    await onSaveBudget({
      category_id: Number(selectedCategory),
      month: currentMonth,
      amount: Number(amount)
    });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all mb-6">
      
      {/* HEADER & CHỌN THÁNG */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hạn Mức Ngân Sách Chi Tiêu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm soát và cảnh báo vượt hạn mức chi tiêu hàng tháng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Bộ chọn tháng YYYY-MM */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Đặt ngân sách
          </button>
        </div>
      </div>

      {/* TỔNG KẾT NGÂN SÁCH THÁNG */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Tổng hạn mức</span>
          <div className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
            {formatVND(totalBudget)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Đã chi tiêu</span>
          <div className="text-xl font-extrabold text-rose-900 dark:text-rose-100 mt-1">
            {formatVND(totalSpent)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Còn lại khả dụng</span>
          <div className={`text-xl font-extrabold mt-1 ${totalRemaining >= 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-600'}`}>
            {formatVND(totalRemaining)}
          </div>
        </div>
      </div>

      {/* DANH SÁCH CÁC NGÂN SÁCH ĐÃ ĐẶT */}
      {budgets.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có hạn mức ngân sách nào được thiết lập cho tháng {currentMonth}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Nhấn nút "Đặt ngân sách" để bắt đầu kiểm soát chi tiêu cho từng danh mục.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const isOver = b.spent_amount > b.budget_amount;
            const percentage = b.percentage || 0;
            const color = b.category_color || '#3B82F6';

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      <CategoryIcon name={b.category_icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {b.category_name}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        Hạn mức: <span className="font-semibold">{formatVND(b.budget_amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatVND(b.spent_amount)}
                      </div>
                      <div className={`text-[11px] font-bold ${
                        isOver ? 'text-rose-600' : percentage > 80 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {isOver ? `Vượt ${formatVND(b.spent_amount - b.budget_amount)} ⚠️` : `Còn ${formatVND(b.remaining)}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAdd(b)}
                      title="Sửa ngân sách"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      title="Xóa ngân sách"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Thanh tiến độ ngân sách */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : percentage > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400 font-semibold">
                  <span>Tiến độ: {percentage}%</span>
                  <span>{isOver ? 'Cảnh báo chi tiêu quá mức!' : 'Trong tầm kiểm soát'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THIẾT LẬP NGÂN SÁCH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">
              {editingBudget ? 'Sửa Hạn Mức Ngân Sách' : 'Thiết Lập Ngân Sách Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Danh mục chi tiêu
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!!editingBudget}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Hạn mức cho tháng {currentMonth} (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="VD: 5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-lg border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {amount && Number(amount) > 0 && (
                  <div className="text-xs font-bold text-indigo-600 mt-1">
                    = {formatVND(Number(amount))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25"
                >
                  Lưu ngân sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
