import React from 'react';
import {
  Wallet,
  PlusCircle,
  Calendar,
  Moon,
  Sun,
  Tag,
  PieChart as PieIcon,
  Receipt,
  PiggyBank,
  Database
} from 'lucide-react';
import { getDatePresets } from '../utils/formatters';

export default function Navbar({
  selectedPreset,
  onSelectPreset,
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenCategoryModal,
  onOpenDataModal,
  isDark,
  onToggleDark
}) {
  const presets = getDatePresets();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                DailyMoney
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Sổ Thu Chi
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm font-medium">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieIcon className="w-4 h-4" />
              Tổng quan
            </button>
            <button
              onClick={() => onTabChange('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Sổ giao dịch
            </button>
            <button
              onClick={() => onTabChange('budgets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'budgets'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              Hạn mức ngân sách
            </button>
          </nav>

          {/* Actions & Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Bộ chọn thời gian */}
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={(e) => onSelectPreset(e.target.value)}
                aria-label="Chọn khoảng thời gian thống kê"
                className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold py-1.5 sm:py-2 pl-7 sm:pl-8 pr-6 sm:pr-8 rounded-xl border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors max-w-[125px] sm:max-w-none truncate"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>

            {/* Desktop Add Button (Ẩn trên mobile vì đã có FAB nổi ở thanh bottom) */}
            <button
              onClick={onOpenAddModal}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm thu / chi</span>
            </button>

            {/* Icon buttons */}
            <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-1.5 gap-0.5 sm:gap-1">
              <button
                onClick={onOpenCategoryModal}
                title="Quản lý danh mục"
                className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Tag className="w-4 h-4" />
              </button>
              
              <button
                onClick={onOpenDataModal}
                title="Dữ liệu & Sao lưu"
                className="hidden sm:inline-flex p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleDark}
                title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}
