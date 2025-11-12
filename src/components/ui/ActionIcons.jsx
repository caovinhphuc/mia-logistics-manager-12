import { Delete, Edit, MoreVert, Visibility } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

// ActionIcons Component
export const ActionIcons = ({
  onEdit,
  onDelete,
  onView,
  onMore,
  size = 'small',
  ...props
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onView && (
        <Tooltip title="Xem">
          <IconButton size={size} onClick={onView} {...props}>
            <Visibility />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Sửa">
          <IconButton size={size} onClick={onEdit} {...props}>
            <Edit />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Xóa">
          <IconButton size={size} onClick={onDelete} color="error" {...props}>
            <Delete />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title="Thêm">
          <IconButton size={size} onClick={onMore} {...props}>
            <MoreVert />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionIcons;
