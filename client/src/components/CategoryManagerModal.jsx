import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  TrendingDown,
  TrendingUp,
  Check
} from 'lucide-react';
import CategoryIcon, { availableIcons } from './CategoryIcon';

const PRESET_COLORS = [
  '#F97316', '#EC4899', '#6366F1', '#EAB308', '#3B82F6',
  '#8B5CF6', '#EF4444', '#14B8A6', '#06B6D4', '#10B981',
  '#F59E0B', '#84CC16', '#A855F7', '#64748B'
];

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories = [],
  onCreateCategory,
  onDeleteCategory
}) {
  const [activeTab, setActiveTab] = useState('expense');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: name.trim(),
        type: activeTab,
        icon: selectedIcon,
        color: selectedColor
      });
      setName('');
      setSelectedIcon('Tag');
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.is_default) {
      alert('Không thể xóa danh mục mặc định của hệ thống.');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      try {
        await onDeleteCategory(cat.id);
      } catch (err) {
        alert(err.message || 'Không thể xóa danh mục');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Quản Lý Danh Mục
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS EXPENSE / INCOME */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Danh mục Chi Tiêu ({categories.filter((c) => c.type === 'expense').length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Danh mục Thu Nhập ({categories.filter((c) => c.type === 'income').length})
            </button>
          </div>
        </div>

        {/* NỘI DUNG: FORM THÊM MỚI & DANH SÁCH HIỆN CÓ */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* FORM THÊM DANH MỤC */}
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              + Thêm danh mục mới ({activeTab === 'expense' ? 'Chi tiêu' : 'Thu nhập'})
            </h4>

            {error && (
              <div className="text-xs text-rose-600 font-semibold">{error}</div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên danh mục (VD: Thú cưng, Cà phê...)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {/* Chọn màu sắc */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Màu sắc:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedColor === col ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Chọn biểu tượng */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Biểu tượng:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                {availableIcons.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      selectedIcon === ic
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600'
                        : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* DANH SÁCH DANH MỤC HIỆN CÓ */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Danh sách hiện có ({currentCategories.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                      {cat.is_default ? (
                        <span className="block text-[10px] text-slate-400">Hệ thống</span>
                      ) : (
                        <span className="block text-[10px] text-blue-500">Tự tạo</span>
                      )}
                    </div>
                  </div>

                  {!cat.is_default && (
                    <button
                      onClick={() => handleDelete(cat)}
                      title="Xóa danh mục"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
