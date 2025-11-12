const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  active: 'Hoạt động',
  inactive: 'Tạm dừng',
};

export const getStatusLabel = (status?: string): string => {
  if (!status) return 'Không xác định';
  return STATUS_LABELS[status] || status;
};
