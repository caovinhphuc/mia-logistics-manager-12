import { ViewList, ViewModule } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React from 'react';

// ViewIcons Component
export const ViewIcons = ({
  viewMode = 'grid',
  onViewModeChange,
  ...props
}) => {
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      onViewModeChange?.(newViewMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleViewModeChange}
      size="small"
      {...props}
    >
      <ToggleButton value="grid">
        <Tooltip title="Xem dạng lưới">
          <ViewModule />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="table">
        <Tooltip title="Xem dạng bảng">
          <ViewList />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewIcons;
