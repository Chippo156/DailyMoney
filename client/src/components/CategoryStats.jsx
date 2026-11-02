import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatVND, formatCompactVND } from '../utils/formatters';

const DEFAULT_COLORS = [
  '#F97316', '#EC4899', '#6366F1', '#EAB308', '#3B82F6',
  '#8B5CF6', '#EF4444', '#14B8A6', '#06B6D4', '#10B981',
  '#F59E0B', '#84CC16', '#A855F7', '#64748B'
];

export default function CategoryStats({
  expenseCategories = [],
  incomeCategories = [],
  totalExpense = 0,
  totalIncome = 0,
  periodLabel = 'Kỳ này',
  onSelectCategoryFilter
}) {
  const [activeType, setActiveType] = useState('expense'); // 'expense' | 'income'
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'bar'
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = activeType === 'expense' ? expenseCategories : incomeCategories;
  const currentTotal = activeType === 'expense' ? totalExpense : totalIncome;

  const chartData = categories.map((cat, idx) => ({
    name: cat.category_name,
    value: cat.total_amount,
    percentage: cat.percentage,
    color: cat.category_color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    icon: cat.category_icon,
    count: cat.transaction_count,
    id: cat.category_id
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs z-50">
          <div className="flex items-center gap-1.5 mb-1 font-bold">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </div>
          <div className="flex justify-between gap-3 text-slate-300">
            <span>Tiền:</span>
            <span className="font-bold text-white">{formatVND(data.value)}</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-300">
            <span>Tỷ trọng:</span>
            <span className="font-bold text-emerald-400">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-4 sm:mb-6 transition-all">
      
      {/* HEADER: TIÊU ĐỀ & NÚT CHUYỂN ĐỔI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${
              activeType === 'expense'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              {activeType === 'expense' ? <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeType === 'expense' ? 'Thống Kê Chi Tiêu Theo Loại' : 'Thống Kê Nguồn Thu Nhập'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Tỷ trọng từng danh mục ({periodLabel})
              </p>
            </div>
          </div>
        </div>

        {/* Nút điều khiển: Thu/Chi & Dạng biểu đồ */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
          
          {/* Chuyển Chi tiêu / Thu nhập */}
          <div className="flex p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveType('expense')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                activeType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Chi tiêu ({expenseCategories.length})
            </button>
            <button
              onClick={() => setActiveType('income')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                activeType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Thu nhập ({incomeCategories.length})
            </button>
          </div>

          {/* Chuyển dạng biểu đồ Donut / Bar */}
          <div className="flex p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setChartType('donut')}
              title="Biểu đồ tròn"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'donut'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Biểu đồ cột"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      {categories.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có giao dịch {activeType === 'expense' ? 'chi tiêu' : 'thu nhập'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nhấn nút "+" ở dưới để thêm giao dịch đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 pt-4 sm:pt-6 items-center">
          
          {/* CỘT TRÁI: BIỂU ĐỒ TRỰC QUAN */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full h-56 sm:h-80 relative flex items-center justify-center">
              
              {chartType === 'donut' ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, index) => setHoveredCategory(chartData[index])}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Tâm biểu đồ tròn */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                    {hoveredCategory ? (
                      <>
                        <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">
                          {hoveredCategory.name}
                        </span>
                        <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatVND(hoveredCategory.value)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                          {hoveredCategory.percentage}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {activeType === 'expense' ? 'Tổng Chi' : 'Tổng Thu'}
                        </span>
                        <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatVND(currentTotal)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {categories.length} loại
                        </span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                    <XAxis
                      type="number"
                      tickFormatter={(val) => formatCompactVND(val)}
                      fontSize={10}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={85}
                      fontSize={10}
                      stroke="#94a3b8"
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

          {/* CỘT PHẢI: BẢNG XẾP HẠNG & CHI TIẾT TỪNG LOẠI */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span>Hạng & Loại tiền</span>
              <div className="flex gap-6 sm:gap-8">
                <span>Tỷ trọng</span>
                <span>Số tiền</span>
              </div>
            </div>

            {/* Danh sách các danh mục */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {categories.map((cat, idx) => {
                const color = cat.category_color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
                const isHovered = hoveredCategory?.name === cat.category_name;

                return (
                  <div
                    key={cat.category_id || idx}
                    onMouseEnter={() => setHoveredCategory({
                      name: cat.category_name,
                      value: cat.total_amount,
                      percentage: cat.percentage
                    })}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(cat.category_id)}
                    className={`group p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      
                      {/* Xếp hạng & Tên danh mục & Icon */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-4 text-center text-xs font-black ${
                          idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>

                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: `${color}18`, color }}
                        >
                          <CategoryIcon name={cat.category_icon} className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                            {cat.category_name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cat.transaction_count} gd
                          </div>
                        </div>
                      </div>

                      {/* Tỷ lệ % & Số tiền VND */}
                      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 text-right">
                        <span
                          className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {cat.percentage}%
                        </span>

                        <div className="font-black text-xs sm:text-base text-slate-900 dark:text-white">
                          {formatVND(cat.total_amount)}
                        </div>
                      </div>

                    </div>

                    {/* Thanh tiến độ trực quan */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-1 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(2, cat.percentage)}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2.5 text-center text-[10px] text-slate-400">
              * Chạm vào danh mục để lọc các giao dịch tương ứng
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
