import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Calendar, Activity, BarChart2 } from 'lucide-react';
import { formatVND, formatCompactVND, formatDate } from '../utils/formatters';

export default function TrendChart({ trendData = [], periodLabel = '' }) {
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'bar'

  if (!trendData || trendData.length === 0) {
    return null;
  }

  // Định dạng ngày hiển thị trục hoành
  const formattedData = trendData.map((d) => {
    let label = d.period;
    if (d.period.includes('-')) {
      const parts = d.period.split('-');
      if (parts.length === 3) {
        label = `${parts[2]}/${parts[1]}`; // DD/MM
      } else if (parts.length === 2) {
        label = `T${parts[1]}/${parts[0].slice(2)}`; // Thang
      }
    }
    return {
      ...d,
      displayLabel: label,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
      const balance = income - expense;

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-slate-300 mb-1.5 pb-1 border-b border-slate-700">
            Ngày: {label}
          </div>
          <div className="flex justify-between gap-4 text-emerald-400 font-semibold mb-1">
            <span>Thu nhập:</span>
            <span>+{formatVND(income)}</span>
          </div>
          <div className="flex justify-between gap-4 text-rose-400 font-semibold mb-1">
            <span>Chi tiêu:</span>
            <span>-{formatVND(expense)}</span>
          </div>
          <div className="flex justify-between gap-4 text-blue-300 font-bold pt-1 border-t border-slate-800">
            <span>Chênh lệch:</span>
            <span>{balance >= 0 ? '+' : ''}{formatVND(balance)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Biến Động Thu Nhập & Chi Tiêu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xu hướng dòng tiền theo thời gian ({periodLabel})
              </p>
            </div>
          </div>
        </div>

        {/* Chuyển kiểu biểu đồ */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setChartMode('area')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              chartMode === 'area'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Biểu đồ miền
          </button>
          <button
            onClick={() => setChartMode('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              chartMode === 'bar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Biểu đồ cột
          </button>
        </div>
      </div>

      {/* Recharts chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => formatCompactVND(v)}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                name="Thu nhập"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Chi tiêu"
                stroke="#EF4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => formatCompactVND(v)}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300">Thu nhập</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-300">Chi tiêu</span>
        </div>
      </div>
    </div>
  );
}
