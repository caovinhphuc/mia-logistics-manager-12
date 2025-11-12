// src/features/carriers/hooks/useCarriers.ts
import { Carrier, CarriersService } from '../googleSheets/carriersService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const carriersService = new CarriersService();

export function useCarriers() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: () => carriersService.getCarriers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useActiveCarriers() {
  return useQuery({
    queryKey: ['carriers', 'active'],
    queryFn: () => carriersService.getActiveCarriers(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCarrierById(carrierId: string) {
  return useQuery({
    queryKey: ['carriers', carrierId],
    queryFn: () => carriersService.getCarrierById(carrierId),
    enabled: !!carrierId,
  });
}

export function useAddCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      carrierData: Omit<Carrier, 'carrierId' | 'createdAt' | 'updatedAt'>
    ) => carriersService.addCarrier(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });
}

export function useUpdateCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carrierId,
      updates,
    }: {
      carrierId: string;
      updates: Partial<Carrier>;
    }) => carriersService.updateCarrier(carrierId, updates),
    onSuccess: (updatedCarrier, variables) => {
      // Optimistically update only the changed fields, but prefer server payload when available
      queryClient.setQueryData(
        ['carriers'],
        (oldData: Carrier[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((carrier) =>
            carrier.carrierId === variables.carrierId
              ? { ...carrier, ...updatedCarrier }
              : carrier
          );
        }
      );

      // Ensure active list is synced
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      queryClient.invalidateQueries({ queryKey: ['carriers', 'active'] });
    },
  });
}

export function useDeleteCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carrierId: string) => carriersService.deleteCarrier(carrierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });
}

export function useCalculateShippingCost() {
  return useMutation({
    mutationFn: async ({
      carrierId,
      distance,
      volume,
      weight,
    }: {
      carrierId: string;
      distance: number;
      volume: number;
      weight: number;
    }) => {
      const carrier = await carriersService.getCarrierById(carrierId);
      if (!carrier) {
        throw new Error('Carrier not found');
      }
      return carriersService.calculateShippingCost(
        carrier,
        distance,
        volume,
        weight
      );
    },
  });
}
