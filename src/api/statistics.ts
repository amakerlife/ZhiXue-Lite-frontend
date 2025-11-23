import { api } from "./client";
import type { Statistics, ApiResponse } from "@/types/api";

/**
 * 获取系统统计信息
 */
export const getStatistics = async (): Promise<
  ApiResponse & { statistics: Statistics }
> => {
  const response = await api.get<ApiResponse & { statistics: Statistics }>(
    "/statistics",
  );
  return response.data;
};

export const statisticsAPI = {
  getStatistics,
};
