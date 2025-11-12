import { useCallback, useState } from 'react';

type DistanceMap = Record<string, number>;

export const useDistanceCalculation = () => {
  const [distances, setDistances] = useState<DistanceMap>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStopDistances = useCallback(
    async (
      pickupLocation: string | undefined,
      selectedStopPoints: Set<string>,
      stopPoints: Record<string, unknown>,
      locations: unknown[]
    ) => {
      setIsCalculating(true);
      setError(null);

      try {
        const result: DistanceMap = {};

        Array.from(selectedStopPoints).forEach((stopKey, index) => {
          // Placeholder: tạo khoảng cách giả định theo thứ tự điểm dừng.
          // TODO: Tích hợp API tính khoảng cách thực tế (Google Maps / Distance Matrix).
          result[stopKey] = (index + 1) * 5;
        });

        setDistances(result);
        return { distances: result };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Không thể tính khoảng cách';
        setError(message);
        return { distances: {}, error: message };
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  const getDistancePayload = useCallback(
    (
      selectedStopPoints: Set<string>,
      currentDistances: DistanceMap
    ): Record<string, number> => {
      const payload: Record<string, number> = {};
      Array.from(selectedStopPoints).forEach((stopKey) => {
        payload[`stop_distance_${stopKey}`] = currentDistances[stopKey] || 0;
      });
      return payload;
    },
    []
  );

  return {
    distances,
    isCalculating,
    error,
    calculateStopDistances,
    getDistancePayload,
  };
};
