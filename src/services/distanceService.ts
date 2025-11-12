export const DistanceService = {
  async testConnectivity(): Promise<boolean> {
    console.warn(
      '[DistanceService] Sử dụng stub mặc định - cần thay thế bằng API thực tế.'
    );
    return true;
  },
};
