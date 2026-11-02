import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Plus,
  Check
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatVND, formatDateISO } from '../utils/formatters';

const QUICK_AMOUNTS = [
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+200k', value: 200000 },
  { label: '+500k', value: 500000 },
  { label: '+1Tr', value: 1000000 },
  { label: '+2Tr', value: 2000000 },
  { label: '+5Tr', value: 5000000 },
];

const PAYMENT_METHODS = [
  'Tiền mặt',
  'Chuyển khoản / Thẻ',
  'Ví điện tử',
  'Khác'
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  editingTransaction = null
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(formatDateISO(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Điền dữ liệu khi sửa giao dịch
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.payment_method || 'Tiền mặt');
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setDate(formatDateISO(new Date()));
      setPaymentMethod('Tiền mặt');
      setNote('');
      // Chọn category đầu tiên phù hợp với type
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    }
    setError('');
  }, [editingTransaction, isOpen, categories]);

  // Cập nhật category khi đổi type
  const handleTypeChange = (newType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setCategoryId(firstCat.id);
    }
  };

  const handleQuickAddAmount = (addVal) => {
    const current = Number(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn một danh mục');
      return;
    }
    if (!date) {
      setError('Vui lòng chọn ngày giao dịch');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingTransaction?.id,
        type,
        amount: numericAmount,
        category_id: Number(categoryId),
        date,
        payment_method: paymentMethod,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCat = categories.find((c) => Number(c.id) === Number(categoryId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              type === 'expense'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
            }`}>
              {type === 'expense' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {editingTransaction ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* 1. CHỌN LOẠI THU / CHI */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Chi Tiêu
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Thu Nhập
            </button>
          </div>

          {/* 2. SỐ TIỀN & ĐỊNH DẠNG */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Nhập số tiền..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full text-2xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₫
              </span>
            </div>

            {/* Hiển thị số tiền format VND ngay bên dưới */}
            {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
              <div className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                = {formatVND(Number(amount))}
              </div>
            )}

            {/* Các nút bấm nhanh số tiền */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handleQuickAddAmount(item.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. CHỌN DANH MỤC */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Danh mục {type === 'expense' ? 'chi tiêu' : 'thu nhập'} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = Number(categoryId) === Number(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 shadow-xs"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. NGÀY & PHƯƠNG THỨC THANH TOÁN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Phương thức
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. GHI CHÚ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Ghi chú chi tiết (Không bắt buộc)
            </label>
            <textarea
              placeholder="VD: Cơm trưa văn phòng, Mua tại Co.opmart, v.v..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* NÚT LƯU & HỦY */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Đang lưu...' : editingTransaction ? 'Cập Nhật' : 'Lưu Giao Dịch'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
