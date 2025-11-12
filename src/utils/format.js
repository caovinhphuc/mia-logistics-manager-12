// Format utilities for MIA Logistics Manager

export const formatCurrency = (amount, currency = 'VND') => {
  if (isNaN(amount)) return '0 ₫';

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  if (isNaN(number)) return '0';

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d)) return '';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'dd/MM/yyyy HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return d.toLocaleDateString('vi-VN');
  }
};

export const formatTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d)) return '';

  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatDistance = (distance, unit = 'km') => {
  if (isNaN(distance)) return '0 km';

  if (unit === 'km') {
    return `${formatNumber(distance, 1)} km`;
  } else {
    return `${formatNumber(distance, 0)} m`;
  }
};

export const formatWeight = (weight, unit = 'kg') => {
  if (isNaN(weight)) return '0 kg';

  if (weight >= 1000 && unit === 'kg') {
    return `${formatNumber(weight / 1000, 1)} tấn`;
  }

  return `${formatNumber(weight, 1)} ${unit}`;
};

export const formatVolume = (volume, unit = 'm³') => {
  if (isNaN(volume)) return `0 ${unit}`;

  return `${formatNumber(volume, 2)} ${unit}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\\D/g, '');

  // Format Vietnamese phone numbers
  if (cleaned.startsWith('84')) {
    // +84 format
    const number = cleaned.substring(2);
    if (number.length === 9) {
      return `+84 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Domestic format
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }

  return phone;
};

export const formatLicensePlate = (plate) => {
  if (!plate) return '';

  // Format Vietnamese license plate
  const cleaned = plate.replace(/[^A-Z0-9]/g, '');

  if (cleaned.length >= 7) {
    const area = cleaned.substring(0, 2);
    const letter = cleaned.substring(2, 3);
    const number = cleaned.substring(3);

    if (number.length === 4) {
      return `${area}${letter}-${number.substring(0, 3)}.${number.substring(3)}`;
    } else if (number.length === 5) {
      return `${area}${letter}-${number}`;
    }
  }

  return plate;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${formatNumber(bytes / Math.pow(k, i), 1)} ${sizes[i]}`;
};

export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatPercent = (value, decimals = 1) => {
  if (isNaN(value)) return '0%';

  return `${formatNumber(value * 100, decimals)}%`;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatAddress = (address) => {
  if (!address) return '';

  // Format Vietnamese address
  const parts = address.split(',').map((part) => part.trim());
  return parts.join(', ');
};
