// Định dạng tiền tệ Việt Nam Đồng (VND)
export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Định dạng rút gọn: 1.5M, 500K
export function formatCompactVND(amount) {
  if (!amount || isNaN(amount)) return '0 ₫';
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' Tỷ';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' Tr';
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' K';
  }
  return formatVND(amount);
}

// Định dạng ngày DD/MM/YYYY
export function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Nhãn ngày thông minh (Hôm nay, Hôm qua, Thứ...)
export function getRelativeDayLabel(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffDays = Math.round((todayDate - targetDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays === -1) return 'Ngày mai';

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = daysOfWeek[targetDate.getDay()];
  
  return `${dayOfWeek}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

// Lấy các khoảng thời gian thông dụng
export function getDatePresets() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = formatDateISO(now);

  // Đầu tháng & cuối tháng này
  const firstDayThisMonth = new Date(year, month, 1);
  const lastDayThisMonth = new Date(year, month + 1, 0);

  // Đầu tháng & cuối tháng trước
  const firstDayLastMonth = new Date(year, month - 1, 1);
  const lastDayLastMonth = new Date(year, month, 0);

  // 7 ngày qua
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  // 30 ngày qua
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);

  // Đầu năm & cuối năm
  const firstDayYear = new Date(year, 0, 1);
  const lastDayYear = new Date(year, 11, 31);

  return [
    {
      id: 'this_month',
      label: 'Tháng này',
      startDate: formatDateISO(firstDayThisMonth),
      endDate: formatDateISO(lastDayThisMonth),
      prevStartDate: formatDateISO(firstDayLastMonth),
      prevEndDate: formatDateISO(lastDayLastMonth),
    },
    {
      id: 'today',
      label: 'Hôm nay',
      startDate: todayStr,
      endDate: todayStr,
      prevStartDate: formatDateISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
      prevEndDate: formatDateISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
    },
    {
      id: 'last_7_days',
      label: '7 ngày qua',
      startDate: formatDateISO(sevenDaysAgo),
      endDate: todayStr,
    },
    {
      id: 'last_30_days',
      label: '30 ngày qua',
      startDate: formatDateISO(thirtyDaysAgo),
      endDate: todayStr,
    },
    {
      id: 'last_month',
      label: 'Tháng trước',
      startDate: formatDateISO(firstDayLastMonth),
      endDate: formatDateISO(lastDayLastMonth),
    },
    {
      id: 'this_year',
      label: 'Năm nay',
      startDate: formatDateISO(firstDayYear),
      endDate: formatDateISO(lastDayYear),
    },
    {
      id: 'all_time',
      label: 'Toàn bộ',
      startDate: '',
      endDate: '',
    }
  ];
}

export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
