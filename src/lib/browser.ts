/**
 * 浏览器检测工具
 */

export interface BrowserInfo {
  name: string; // 浏览器名称
  version: number; // 主版本号
  isSupported: boolean; // 是否支持
}

/**
 * 检测浏览器类型和版本
 * @returns 浏览器信息对象
 */
export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;

  let name = "Unknown";
  let version = 0;

  if (ua.includes("Chrome/")) {
    name = "Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (ua.includes("Firefox/")) {
    name = "Firefox";
    const match = ua.match(/Firefox\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    name = "Safari";
    const match = ua.match(/Version\/(\d+)\.(\d+)/);
    version = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
  }

  const isSupported = checkBrowserSupport(name, version);

  return { name, version, isSupported };
}

/**
 * 检查浏览器是否支持
 * Chrome 111+, Firefox 113+, Safari 15+
 *
 * @param name 浏览器名称
 * @param version 浏览器版本
 * @returns 是否支持
 */
function checkBrowserSupport(name: string, version: number): boolean {
  const minVersions: Record<string, number> = {
    Chrome: 111,
    Firefox: 113,
    Safari: 15,
  };

  const minVersion = minVersions[name];
  if (minVersion === undefined) {
    // 未知浏览器，返回 false
    return false;
  }

  return version >= minVersion;
}
