import { Button } from '@mui/material';
import React from 'react';

// ActionButton Component
export const ActionButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
