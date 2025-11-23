import { useState, useEffect, useRef } from "react";

/**
 * 数字增长动画 hook
 * @param end 目标值
 * @param duration 动画时长（毫秒），默认 1000ms
 * @returns 当前动画值
 */
export const useCountUp = (end: number, duration: number = 1000): number => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // 如果目标值为 0，直接返回
    if (end === 0) {
      setCount(0);
      return;
    }

    // 重置开始时间
    startTimeRef.current = null;

    // easeOutQuad 缓动函数：开始快，结束慢
    const easeOutQuad = (t: number): number => t * (2 - t);

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const currentValue = Math.floor(easedProgress * end);

      setCount(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // 确保最终值准确
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration]);

  return count;
};
