import React, { useState } from 'react';
import {
  X,
  Download,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function DataToolsModal({
  isOpen,
  onClose,
  onDataRefreshed
}) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    window.open(api.getExportUrl(), '_blank');
  };

  const handleSeedSample = async () => {
    if (window.confirm('Bạn có muốn nạp thêm các giao dịch và ngân sách mẫu để trải nghiệm website?')) {
      setLoadingAction('seed');
      setMessage('');
      try {
        await api.seedSampleData();
        setMessage('Đã nạp dữ liệu mẫu thành công!');
        onDataRefreshed();
      } catch (err) {
        alert(err.message || 'Lỗi khi nạp dữ liệu mẫu');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleClearTransactions = async () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ lịch sử giao dịch thu chi. Bạn có chắc chắn không?')) {
      setLoadingAction('clear');
      setMessage('');
      try {
        await api.clearTransactions();
        setMessage('Đã xóa toàn bộ lịch sử giao dịch.');
        onDataRefreshed();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa dữ liệu');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Dữ Liệu & Sao Lưu
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {message}
          </div>
        )}

        <div className="space-y-3.5 my-5">
          {/* 1. Xuất dữ liệu */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Xuất file sao lưu (JSON)
              </span>
              <span className="text-xs text-slate-500">
                Tải về toàn bộ giao dịch, danh mục và ngân sách
              </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Tải về
            </button>
          </div>

          {/* 2. Nạp dữ liệu mẫu */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Nạp dữ liệu mẫu trực quan
              </span>
              <span className="text-xs text-slate-500">
                Thêm các khoản thu chi & ngân sách mẫu của tháng
              </span>
            </div>
            <button
              onClick={handleSeedSample}
              disabled={loadingAction === 'seed'}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              {loadingAction === 'seed' ? 'Đang nạp...' : 'Nạp mẫu'}
            </button>
          </div>

          {/* 3. Xóa dữ liệu */}
          <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-rose-700 dark:text-rose-400 block">
                Xóa tất cả giao dịch
              </span>
              <span className="text-xs text-rose-500">
                Bắt đầu lại từ đầu với sổ thu chi hoàn toàn trống
              </span>
            </div>
            <button
              onClick={handleClearTransactions}
              disabled={loadingAction === 'clear'}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loadingAction === 'clear' ? 'Đang xóa...' : 'Xóa sổ'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
