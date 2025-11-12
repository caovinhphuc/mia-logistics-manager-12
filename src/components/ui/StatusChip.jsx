import React from 'react';
import { Chip } from '@mui/material';

const colorMap = {
  active: 'success',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'primary',
  default: 'default',
};

const StatusChip = ({ label, status = 'default', ...rest }) => {
  const color = colorMap[status] || 'default';
  const variant = color === 'default' ? 'outlined' : 'filled';

  return <Chip label={label} color={color} variant={variant} {...rest} />;
};

export default StatusChip;
