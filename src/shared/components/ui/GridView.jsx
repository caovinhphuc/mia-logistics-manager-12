import { ViewList, ViewModule } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import React from 'react';

// GridView Component
export const GridView = ({ items = [], onItemClick, onEdit, onDelete, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
      {items.map((item) => (
        <Card key={item.id} sx={{ cursor: 'pointer' }} onClick={() => onItemClick?.(item)}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {item.avatar ? (
                <Avatar src={item.avatar} sx={{ mr: 2 }} />
              ) : (
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {item.avatarText || item.title?.[0]?.toUpperCase()}
                </Avatar>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" noWrap>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>

            {item.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {item.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {onEdit && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                  <ViewList />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
                  <ViewModule />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GridView;
