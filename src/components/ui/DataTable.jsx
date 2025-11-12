import {
  Box, Paper, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, Typography
} from '@mui/material';
import React from 'react';

// DataTable Component
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ fontWeight: 'bold' }}>
                {column.label}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id || index}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {onEdit && (
                      <Typography
                        variant="button"
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                      >
                        Sửa
                      </Typography>
                    )}
                    {onDelete && (
                      <Typography
                        variant="button"
                        color="error"
                        sx={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                      >
                        Xóa
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
