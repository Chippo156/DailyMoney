import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import OverviewCards from './components/OverviewCards';
import CategoryStats from './components/CategoryStats';
import TrendChart from './components/TrendChart';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import BudgetSection from './components/BudgetSection';
import CategoryManagerModal from './components/CategoryManagerModal';
import DataToolsModal from './components/DataToolsModal';
import { api } from './services/api';
import { getDatePresets } from './utils/formatters';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const presets = getDatePresets();

  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('dailymoney_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dailymoney_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dailymoney_theme', 'light');
    }
  }, [isDark]);

  // Bộ lọc thời gian
  const [selectedPreset, setSelectedPreset] = useState('this_month');
  const [dateRange, setDateRange] = useState(() => {
    const defaultP = presets.find((p) => p.id === 'this_month') || presets[0];
    return {
      startDate: defaultP.startDate,
      endDate: defaultP.endDate,
      prevStartDate: defaultP.prevStartDate,
      prevEndDate: defaultP.prevEndDate,
      label: defaultP.label
    };
  });

  // Tab điều hướng: 'dashboard' | 'transactions' | 'budgets'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dữ liệu ứng dụng
  const [overviewStats, setOverviewStats] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Tháng ngân sách đang xem (YYYY-MM)
  const [budgetMonth, setBudgetMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Bộ lọc danh mục khi bấm vào thống kê
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const p = presets.find((item) => item.id === presetId);
    if (p) {
      setDateRange({
        startDate: p.startDate,
        endDate: p.endDate,
        prevStartDate: p.prevStartDate,
        prevEndDate: p.prevEndDate,
        label: p.label
      });
    }
  };

  const loadAllData = useCallback(async () => {
    try {
      const statsParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        prevStartDate: dateRange.prevStartDate,
        prevEndDate: dateRange.prevEndDate
      };

      const [
        overviewRes,
        expenseCatRes,
        incomeCatRes,
        trendRes,
        txRes,
        catRes,
        budgetRes
      ] = await Promise.all([
        api.getOverviewStats(statsParams),
        api.getCategoryStats({ ...statsParams, type: 'expense' }),
        api.getCategoryStats({ ...statsParams, type: 'income' }),
        api.getTrendStats({ ...statsParams, groupBy: 'day' }),
        api.getTransactions({ startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 200 }),
        api.getCategories(),
        api.getBudgets(budgetMonth)
      ]);

      if (overviewRes.success) setOverviewStats(overviewRes.data);
      if (expenseCatRes.success) setExpenseCategories(expenseCatRes.data || []);
      if (incomeCatRes.success) setIncomeCategories(incomeCatRes.data || []);
      if (trendRes.success) setTrendData(trendRes.data || []);
      if (txRes.success) setTransactions(txRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (budgetRes.success) setBudgets(budgetRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  }, [dateRange, budgetMonth]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveTransaction = async (txData) => {
    if (txData.id) {
      await api.updateTransaction(txData.id, txData);
      showToast('Đã cập nhật giao dịch!');
    } else {
      await api.createTransaction(txData);
      showToast('Đã thêm giao dịch thành công!');
    }
    loadAllData();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      try {
        await api.deleteTransaction(id);
        showToast('Đã xóa giao dịch.');
        loadAllData();
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa', 'error');
      }
    }
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      await api.saveBudget(budgetData);
      showToast('Đã lưu hạn mức ngân sách!');
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu', 'error');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hạn mức này?')) {
      try {
        await api.deleteBudget(id);
        showToast('Đã xóa ngân sách.');
        loadAllData();
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa', 'error');
      }
    }
  };

  const handleCreateCategory = async (catData) => {
    await api.createCategory(catData);
    showToast(`Đã thêm danh mục "${catData.name}"!`);
    loadAllData();
  };

  const handleDeleteCategory = async (catId) => {
    await api.deleteCategory(catId);
    showToast('Đã xóa danh mục.');
    loadAllData();
  };

  const handleSelectCategoryFromStats = (catId) => {
    setCategoryFilter(String(catId));
    setActiveTab('transactions');
    showToast('Đã lọc theo danh mục.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700 animate-in slide-in-from-top-4">
          {toast.type === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR TRÊN CÙNG */}
      <Navbar
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      />

      {/* CONTAINER CHÍNH (Đệm dưới pb-24 để không bị thanh BottomNav che) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 pb-24 sm:pb-12">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* THẺ TỔNG QUAN 2x2 TRÊN MOBILE */}
            <OverviewCards
              stats={overviewStats}
              periodLabel={dateRange.label}
            />

            {/* THỐNG KÊ MỖI LOẠI TIỀN TIÊU & TỔNG THU NHẬP */}
            <CategoryStats
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              totalExpense={overviewStats?.totalExpense || 0}
              totalIncome={overviewStats?.totalIncome || 0}
              periodLabel={dateRange.label}
              onSelectCategoryFilter={handleSelectCategoryFromStats}
            />

            {/* BIỂU ĐỒ BIẾN ĐỘNG THU CHI */}
            <TrendChart
              trendData={trendData}
              periodLabel={dateRange.label}
            />

            {/* GIAO DỊCH GẦN ĐÂY */}
            <TransactionList
              transactions={transactions.slice(0, 15)}
              categories={categories}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
          </div>
        )}

        {/* TAB 2: SỔ GIAO DỊCH */}
        {activeTab === 'transactions' && (
          <div className="animate-in fade-in duration-200">
            <TransactionList
              transactions={transactions}
              categories={categories}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
          </div>
        )}

        {/* TAB 3: NGÂN SÁCH */}
        {activeTab === 'budgets' && (
          <div className="animate-in fade-in duration-200">
            <BudgetSection
              budgets={budgets}
              categories={categories}
              currentMonth={budgetMonth}
              onMonthChange={setBudgetMonth}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>
        )}

      </main>

      {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY DÀNH CHO MOBILE */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* MODALS */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <DataToolsModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataRefreshed={loadAllData}
      />

    </div>
  );
}
