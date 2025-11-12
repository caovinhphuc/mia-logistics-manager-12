//VolumeCalculator.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Calculate as CalcIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { ModernPageLayout } from '../../../components/layout/ModernPageLayout';
import { DataTable } from '../../../components/ui';
import { DataTableColumn } from '../../../components/ui/DataTable';

type VolumeRule = {
  id: string; // Khóa duy nhất (ví dụ: S, M, L, BAG_S,...)
  name: string; // Tên quy cách
  unitVolume: number; // 1 kiện = khối (m3)
  description?: string; // Diễn giải
};

const STORAGE_KEY = 'volume_rules_v1';
const SHEET_ID = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';

const defaultRules: VolumeRule[] = [
  { id: 'S', name: 'Size S', unitVolume: 0, description: '' },
  { id: 'M', name: 'Size M', unitVolume: 0, description: '' },
  { id: 'L', name: 'Size L', unitVolume: 0, description: '' },
  { id: 'BAG_S', name: 'Bao nhỏ', unitVolume: 0, description: '' },
  { id: 'BAG_M', name: 'Bao trung', unitVolume: 0, description: '' },
  { id: 'BAG_L', name: 'Bao lớn', unitVolume: 0, description: '' },
  { id: 'OTHER', name: 'Khác', unitVolume: 0, description: '' },
];

const permissionMapping: Record<string, Record<string, string>> = {
  shipments: {
    view: 'read:transport',
    update: 'write:transport',
    delete: 'write:transport',
  },
};

const VolumeCalculator: React.FC = () => {
  const { hasPermission: checkPermission } = useAuth();
  const hasPermission = React.useCallback(
    (resource: string, action: string) => {
      const permission =
        permissionMapping[resource]?.[action] || 'read:transport';
      return checkPermission(permission);
    },
    [checkPermission]
  );

  const [editMode, setEditMode] = useState(false);
  const parseLocaleNumber = (v: unknown): number => {
    const s = String(v ?? '').trim();
    if (!s) return 0;
    // Pattern like 1.234,56 → remove thousands dots, replace comma with dot
    if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(s)) {
      const normalized = s.replace(/\./g, '').replace(',', '.');
      const n = Number(normalized);
      return Number.isFinite(n) ? n : 0;
    }
    // General case: replace single comma with dot
    const normalized = s.replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  };
  const [rules, setRules] = useState<VolumeRule[]>(defaultRules);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VolumeRule[];
        if (Array.isArray(parsed) && parsed.length > 0) setRules(parsed);
      }
    } catch {
      // ignore local storage parse error
    }
  }, []);

  // Load from server (Google Sheets) on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/settings/volume-rules?spreadsheetId=${encodeURIComponent(
            SHEET_ID
          )}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as Array<Record<string, unknown>>;
        const mapped: VolumeRule[] = data.map((r) => ({
          id: String(r.id || ''),
          name: String(r.name || ''),
          unitVolume: parseLocaleNumber(r.unitVolume),
          description: String(r.description || ''),
        }));
        setRules(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      } catch {
        // ignore network errors
      }
    })();
  }, []);

  const handleRuleChange = (
    index: number,
    field: keyof VolumeRule,
    value: string
  ) => {
    setRules((prev) => {
      const next = [...prev];
      if (field === 'unitVolume') {
        next[index] = { ...next[index], unitVolume: Number(value) || 0 };
      } else if (field === 'id') {
        next[index] = { ...next[index], id: value };
      } else if (field === 'name') {
        next[index] = { ...next[index], name: value };
      } else if (field === 'description') {
        next[index] = { ...next[index], description: value };
      }
      return next;
    });
  };

  const addRow = () => {
    setRules((prev) => [
      ...prev,
      {
        id: `R${Date.now()}`,
        name: 'Quy cách mới',
        unitVolume: 0,
        description: '',
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const saveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
      setSnackbar({
        open: true,
        message: 'Đã lưu cấu hình bảng tính khối',
        severity: 'success',
      });
    } catch {
      setSnackbar({ open: true, message: 'Lưu thất bại', severity: 'error' });
    }
  };

  const saveAndOverwriteSheet = async () => {
    try {
      const res = await fetch(
        `/api/settings/volume-rules?spreadsheetId=${encodeURIComponent(
          SHEET_ID
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules }),
        }
      );
      if (!res.ok) throw new Error('Sync failed');
      await refreshFromSheet();
      setSnackbar({
        open: true,
        message: 'Đã ghi đè lên Google Sheet',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Ghi đè thất bại',
        severity: 'error',
      });
    }
  };

  const refreshFromSheet = async () => {
    try {
      const res = await fetch(
        `/api/settings/volume-rules?spreadsheetId=${encodeURIComponent(
          SHEET_ID
        )}`
      );
      if (!res.ok) throw new Error('reload failed');
      const data = (await res.json()) as Array<Record<string, unknown>>;
      const mapped: VolumeRule[] = data.map((r) => ({
        id: String(r.id || ''),
        name: String(r.name || ''),
        unitVolume: parseLocaleNumber(r.unitVolume),
        description: String(r.description || ''),
      }));
      setRules(mapped);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      setSnackbar({
        open: true,
        message: 'Đã làm mới từ Google Sheet',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Không kết nối được Sheet',
        severity: 'error',
      });
    }
  };

  const cancelEdit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VolumeRule[];
        if (Array.isArray(parsed) && parsed.length > 0) setRules(parsed);
      }
    } catch {
      // ignore
    }
    setEditMode(false);
  };

  const totalVolume = useMemo(() => {
    return rules.reduce(
      (sum, r) => sum + (counts[r.id] || 0) * (r.unitVolume || 0),
      0
    );
  }, [rules, counts]);

  const columns: DataTableColumn<VolumeRule>[] = useMemo(
    () => [
      {
        id: 'id' as keyof VolumeRule,
        label: 'ID',
        width: 160,
        render: (row: VolumeRule) => (
          <TextField
            fullWidth
            size="small"
            value={row.id}
            disabled={!editMode || !hasPermission('shipments', 'update')}
            onChange={(e) =>
              handleRuleChange(
                rules.findIndex((r) => r.id === row.id),
                'id',
                e.target.value
              )
            }
            sx={{
              '& .MuiInputBase-root.Mui-disabled': {
                backgroundColor: '#fafafa',
                color: 'text.secondary',
              },
            }}
          />
        ),
      },
      {
        id: 'name' as keyof VolumeRule,
        label: 'Tên',
        render: (row: VolumeRule) => (
          <TextField
            fullWidth
            size="small"
            value={row.name}
            disabled={!editMode || !hasPermission('shipments', 'update')}
            onChange={(e) =>
              handleRuleChange(
                rules.findIndex((r) => r.id === row.id),
                'name',
                e.target.value
              )
            }
            sx={{
              '& .MuiInputBase-root.Mui-disabled': {
                backgroundColor: '#fafafa',
                color: 'text.secondary',
              },
            }}
          />
        ),
      },
      {
        id: 'unitVolume' as keyof VolumeRule,
        label: '1 kiện = khối (m3)',
        width: 160,
        align: 'left' as const,
        render: (row: VolumeRule) => (
          <TextField
            fullWidth
            size="small"
            type="number"
            inputProps={{ step: '0.001' }}
            value={row.unitVolume}
            disabled={!editMode || !hasPermission('shipments', 'update')}
            onChange={(e) =>
              handleRuleChange(
                rules.findIndex((r) => r.id === row.id),
                'unitVolume',
                e.target.value
              )
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">m3</InputAdornment>,
            }}
            sx={{
              '& input': { textAlign: 'right' },
              'MuiInputBase-root.Mui-disabled': {
                backgroundColor: '#fafafa',
                color: 'text.secondary',
              },
            }}
          />
        ),
      },
      {
        id: 'description' as keyof VolumeRule,
        label: 'Diễn giải',
        render: (row: VolumeRule) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={row.description || ''}
              disabled={!editMode || !hasPermission('shipments', 'update')}
              onChange={(e) =>
                handleRuleChange(
                  rules.findIndex((r) => r.id === row.id),
                  'description',
                  e.target.value
                )
              }
              sx={{
                '& .MuiInputBase-root.Mui-disabled': {
                  backgroundColor: '#fafafa',
                  color: 'text.secondary',
                },
              }}
            />
            {editMode && hasPermission('shipments', 'delete') && (
              <Tooltip title="Xóa dòng">
                <IconButton
                  color="error"
                  onClick={() =>
                    deleteRow(rules.findIndex((r) => r.id === row.id))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [editMode, rules]
  );

  return (
    <ModernPageLayout
      title="BẢNG TÍNH KHỐI"
      subtitle="Quy tắc quy đổi khối lượng vận chuyển"
    >
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {hasPermission('shipments', 'view') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refreshFromSheet}
          >
            Làm mới
          </Button>
        )}
        {!editMode ? (
          hasPermission('shipments', 'update') && (
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Sửa
            </Button>
          )
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CloseIcon />}
              onClick={cancelEdit}
            >
              Hủy
            </Button>
            {hasPermission('shipments', 'update') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                onClick={saveConfig}
              >
                Lưu cục bộ
              </Button>
            )}
            {hasPermission('shipments', 'update') && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => {
                  saveAndOverwriteSheet();
                  setEditMode(false);
                }}
              >
                Lưu & ghi đè Sheet
              </Button>
            )}
          </>
        )}
      </Stack>
      <Grid container spacing={3}>
        {/* Quy tắc khối lượng */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <InventoryIcon color="primary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quy tắc quy đổi khối lượng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Định nghĩa khối lượng cho từng loại kiện hàng
                </Typography>
              </Box>
            </Stack>

            {hasPermission('shipments', 'view') && (
              <DataTable
                columns={columns}
                data={rules}
                rowsPerPageOptions={[5, 10, 25]}
                defaultRowsPerPage={10}
                emptyMessage={
                  editMode
                    ? 'Chưa có quy tắc nào. Thêm dòng để bắt đầu.'
                    : 'Không có dữ liệu'
                }
                getRowId={(row) => row.id}
              />
            )}
            {editMode && hasPermission('shipments', 'update') && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addRow}
                  sx={{
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Thêm dòng
                </Button>
              </Box>
            )}
            {!hasPermission('shipments', 'view') && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bạn không có quyền xem cài đặt này
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Máy tính khối lượng */}
        {hasPermission('shipments', 'view') && (
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 3 }}
              >
                <CalcIcon color="success" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Máy tính khối lượng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tính tổng khối lượng vận chuyển
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                {rules.map((r) => (
                  <TextField
                    key={r.id}
                    fullWidth
                    size="small"
                    type="number"
                    label={r.name}
                    placeholder="0"
                    value={counts[r.id] || 0}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [r.id]: Number(e.target.value) || 0,
                      }))
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Chip
                            label={`${r.unitVolume} m³`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'success.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.200',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: 'success.main' }}
                  >
                    Tổng khối lượng
                  </Typography>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    {totalVolume.toFixed(3)} m³
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ModernPageLayout>
  );
};

export default VolumeCalculator;
