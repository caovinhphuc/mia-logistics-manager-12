import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  FormControlLabel,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useAddCarrier, useUpdateCarrier } from '../hooks/useCarriers';
import { Checkbox } from '../../../components/ui';
import type { Carrier } from '../../googleSheets/carriersService';

type CreateCarrierDialogProps = {
  open: boolean;
  onClose: () => void;
  carrier?: Partial<Carrier> & { carrierId?: string };
  onSuccess?: () => void;
};

type FormValues = {
  name: string;
  avatarUrl?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceAreas?: string;
  pricingMethod: 'PER_KM' | 'PER_M3' | 'PER_TRIP' | 'PER_KG';
  baseRate?: number;
  perKmRate?: number;
  perM3Rate?: number;
  perTripRate?: number;
  fuelSurcharge?: number;
  remoteAreaFee?: number;
  insuranceRate?: number;
  vehicleTypes?: string;
  maxWeight?: number;
  maxVolume?: number;
  operatingHours?: string;
  isActive: boolean;
};

const defaultValues: FormValues = {
  name: '',
  avatarUrl: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  serviceAreas: '',
  pricingMethod: 'PER_KM',
  baseRate: 0,
  perKmRate: 0,
  perM3Rate: 0,
  perTripRate: 0,
  fuelSurcharge: 0,
  remoteAreaFee: 0,
  insuranceRate: 0,
  vehicleTypes: '',
  maxWeight: 0,
  maxVolume: 0,
  operatingHours: '',
  isActive: true,
};

const CreateCarrierDialog: React.FC<CreateCarrierDialogProps> = ({
  open,
  onClose,
  carrier,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: 'onChange',
  });
  const addCarrier = useAddCarrier();
  const updateCarrier = useUpdateCarrier();
  const isSubmitting = addCarrier.isPending || updateCarrier.isPending;

  React.useEffect(() => {
    if (open) {
      if (carrier && carrier.carrierId) {
        const {
          name,
          avatarUrl,
          contactPerson,
          email,
          phone,
          address,
          serviceAreas,
          pricingMethod,
          baseRate,
          perKmRate,
          perM3Rate,
          perTripRate,
          fuelSurcharge,
          remoteAreaFee,
          insuranceRate,
          vehicleTypes,
          maxWeight,
          maxVolume,
          operatingHours,
          isActive,
        } = carrier as Carrier;
        reset({
          name: name || '',
          avatarUrl: avatarUrl || '',
          contactPerson: contactPerson || '',
          email: email || '',
          phone: phone || '',
          address: address || '',
          serviceAreas: serviceAreas || '',
          pricingMethod: (pricingMethod as any) || 'PER_KM',
          baseRate: Number(baseRate || 0),
          perKmRate: Number(perKmRate || 0),
          perM3Rate: Number(perM3Rate || 0),
          perTripRate: Number(perTripRate || 0),
          fuelSurcharge: Number(fuelSurcharge || 0),
          remoteAreaFee: Number(remoteAreaFee || 0),
          insuranceRate: Number(insuranceRate || 0),
          vehicleTypes: vehicleTypes || '',
          maxWeight: Number(maxWeight || 0),
          maxVolume: Number(maxVolume || 0),
          operatingHours: operatingHours || '',
          isActive: Boolean((isActive as any) === 'true' || isActive === true),
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, carrier, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (carrier && carrier.carrierId) {
        await updateCarrier.mutateAsync({
          carrierId: carrier.carrierId,
          updates: values as any,
        });
      } else {
        await addCarrier.mutateAsync(values as any);
      }
      reset(defaultValues);
      onClose();
      onSuccess?.(); // Call onSuccess callback if provided
    } catch (error) {
      console.error('Error saving carrier:', error);
      // You can add error notification here
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {carrier && carrier.carrierId
          ? 'Sửa nhà vận chuyển'
          : 'Thêm nhà vận chuyển'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="avatarUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Avatar URL (tùy chọn)"
                    fullWidth
                    placeholder="https://..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Vui lòng nhập tên nhà vận chuyển' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Tên nhà vận chuyển"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Người liên hệ" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Số điện thoại" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Địa chỉ" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="serviceAreas"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Khu vực phục vụ" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="pricingMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Phương thức tính giá"
                    fullWidth
                  >
                    <MenuItem value="PER_KM">Theo km (PER_KM)</MenuItem>
                    <MenuItem value="PER_M3">Theo m3 (PER_M3)</MenuItem>
                    <MenuItem value="PER_TRIP">Theo chuyến (PER_TRIP)</MenuItem>
                    <MenuItem value="PER_KG">Theo kg (PER_KG)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="baseRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Base rate"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="perKmRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Giá/km"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="perM3Rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Giá/m3"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="perTripRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Giá/chuyến"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="fuelSurcharge"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Phụ phí xăng"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="remoteAreaFee"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Phí vùng xa"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="insuranceRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Bảo hiểm"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="vehicleTypes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Loại xe (VD: Van,Truck)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="maxWeight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Tải trọng tối đa (kg)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Controller
                name="maxVolume"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Thể tích tối đa (m3)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="operatingHours"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Giờ hoạt động (VD: 06:00-22:00)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Đang hoạt động"
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ mt: 1 }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? 'Đang lưu...'
                : carrier && carrier.carrierId
                  ? 'Cập nhật'
                  : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarrierDialog;
