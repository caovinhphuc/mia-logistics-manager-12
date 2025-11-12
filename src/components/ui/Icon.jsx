import { SvgIcon } from '@mui/material';
import React from 'react';

// Icon Component - Wrapper cho các icon
export const Icon = ({
  name,
  size = 24,
  color = 'inherit',
  ...props
}) => {
  // Có thể mở rộng để support nhiều icon sets
  return (
    <SvgIcon
      sx={{ fontSize: size, color }}
      {...props}
    >
      {/* Placeholder - có thể thay thế bằng icon thực tế */}
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </SvgIcon>
  );
};

export default Icon;
