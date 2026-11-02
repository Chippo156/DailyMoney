import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CalendarDays
} from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function OverviewCards({ stats, periodLabel }) {
  if (!stats) return null;

  const {
    totalIncome = 0,
    totalExpense = 0,
    netBalance = 0,
    savingsRate = 0,
    dailyAvgExpense = 0,
    incomeCount = 0,
    expenseCount = 0,
    prevStats
  } = stats;

  const isNetPositive = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. TỔNG THU NHẬP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tổng Thu Nhập
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        
        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatVND(totalIncome)}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span>{incomeCount} khoản thu ({periodLabel})</span>
          {prevStats && prevStats.incomeChange !== undefined && (
            <span className={`inline-flex items-center font-semibold ${prevStats.incomeChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {prevStats.incomeChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(prevStats.incomeChange).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* 2. TỔNG CHI TIÊU */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tổng Chi Tiêu
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        
        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
          {formatVND(totalExpense)}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span>{expenseCount} khoản chi</span>
          {prevStats && prevStats.expenseChange !== undefined && (
            <span className={`inline-flex items-center font-semibold ${prevStats.expenseChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {prevStats.expenseChange > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(prevStats.expenseChange).toFixed(1)}% so kỳ trước
            </span>
          )}
        </div>
      </div>

      {/* 3. SỐ DƯ RÒNG */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Số Dư / Tiết Kiệm Ròng
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isNetPositive
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        
        <div className={`text-2xl font-extrabold tracking-tight ${
          isNetPositive ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
        }`}>
          {isNetPositive ? '+' : ''}{formatVND(netBalance)}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className={`font-semibold ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {isNetPositive ? 'Thu lớn hơn chi ✓' : 'Chi vượt quá thu ⚠️'}
          </span>
          <span>{totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(0)}% thu nhập` : ''}</span>
        </div>
      </div>

      {/* 4. TỶ LỆ TIẾT KIỆM & TB NGÀY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tỷ Lệ Tiết Kiệm
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {savingsRate}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            (TB: {formatVND(dailyAvgExpense)}/ngày)
          </span>
        </div>

        {/* Thanh tiến độ tiết kiệm */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                savingsRate >= 30
                  ? 'bg-emerald-500'
                  : savingsRate >= 10
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
            <span>Mục tiêu: ≥20%</span>
            <span>{savingsRate >= 20 ? 'Đạt chuẩn ⭐' : 'Cần tối ưu'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
