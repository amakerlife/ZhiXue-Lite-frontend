import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // 初始化时设置值
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // 创建监听器
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // 添加监听器
    media.addEventListener('change', listener);

    // 清理监听器
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
