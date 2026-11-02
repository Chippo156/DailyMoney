import React from 'react';
import {
  PieChart as PieIcon,
  Receipt,
  Plus,
  PiggyBank,
  Database
} from 'lucide-react';

export default function BottomNav({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenDataModal
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-lg px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around relative">
        
        {/* Tab 1: Tổng quan */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <PieIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tổng quan</span>
        </button>

        {/* Tab 2: Sổ giao dịch */}
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'transactions'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Giao dịch</span>
        </button>

        {/* Nút FAB chính giữa: THÊM THU/CHI */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenAddModal}
            aria-label="Thêm thu chi mới"
            className="w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-90 transition-transform ring-4 ring-white dark:ring-slate-900"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Ngân sách */}
        <button
          onClick={() => onTabChange('budgets')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'budgets'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <PiggyBank className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ngân sách</span>
        </button>

        {/* Tab 4: Tiện ích / Dữ liệu */}
        <button
          onClick={onOpenDataModal}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-all"
        >
          <Database className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tiện ích</span>
        </button>

      </div>
    </div>
  );
}
