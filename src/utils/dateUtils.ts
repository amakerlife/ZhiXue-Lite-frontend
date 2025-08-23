/**
 * 日期时间工具函数
 * 
 * 后端存储UTC时间但isoformat()返回不带时区标识的ISO字符串
 * 需要手动处理时区转换
 */

/**
 * 解析后端返回的ISO时间字符串（UTC时间）为本地时间
 * @param isoString - 后端返回的ISO字符串（实际是UTC时间，但没有Z标识）
 * @returns Date对象（本地时间）
 */
export const parseUTCIsoString = (isoString: string): Date => {
  // 后端返回的是UTC时间但没有Z标识，需要手动添加Z来明确指定UTC
  return new Date(isoString + 'Z');
};

/**
 * 格式化UTC ISO字符串为本地时间显示（显示到秒）
 * @param isoString - 后端返回的ISO字符串
 * @returns 格式化的本地时间字符串
 */
export const formatUTCIsoToLocal = (isoString: string): string => {
  const date = parseUTCIsoString(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 格式化UTC ISO字符串为本地日期显示（仅日期）
 * @param isoString - 后端返回的ISO字符串
 * @returns 格式化的本地日期字符串
 */
export const formatUTCIsoToLocalDate = (isoString: string): string => {
  const date = parseUTCIsoString(isoString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 格式化毫秒时间戳为本地日期显示（仅日期）
 * @param timestamp - 毫秒时间戳
 * @returns 格式化的本地日期字符串
 */
export const formatTimestampToLocalDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};