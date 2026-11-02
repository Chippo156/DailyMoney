import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatVND, formatCompactVND } from '../utils/formatters';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      
      {/* 1. TỔNG THU NHẬP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tổng Thu Nhập
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
          {formatVND(totalIncome)}
        </div>

        <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="truncate">{incomeCount} khoản thu</span>
          {prevStats && prevStats.incomeChange !== undefined && (
            <span className={`inline-flex items-center font-bold shrink-0 ${prevStats.incomeChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {prevStats.incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(prevStats.incomeChange).toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* 2. TỔNG CHI TIÊU */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tổng Chi Tiêu
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight truncate">
          {formatVND(totalExpense)}
        </div>

        <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="truncate">{expenseCount} khoản chi</span>
          <span className="text-slate-400 truncate hidden sm:inline">
            TB: {formatCompactVND(dailyAvgExpense)}/ngày
          </span>
        </div>
      </div>

      {/* 3. SỐ DƯ RÒNG */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Số Dư Ròng
          </span>
          <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isNetPositive
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className={`text-base sm:text-2xl font-black tracking-tight truncate ${
          isNetPositive ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
        }`}>
          {isNetPositive ? '+' : ''}{formatVND(netBalance)}
        </div>

        <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className={`font-bold ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {isNetPositive ? 'Dương số dư' : 'Thâm hụt ⚠️'}
          </span>
          <span className="truncate">{totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(0)}%` : ''}</span>
        </div>
      </div>

      {/* 4. TỶ LỆ TIẾT KIỆM */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tiết Kiệm
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
          {savingsRate}%
        </div>

        <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
        </div>
      </div>

    </div>
  );
}
