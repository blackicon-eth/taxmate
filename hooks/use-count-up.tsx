import { useState, useEffect, useRef } from "react";

export function useCountUp(end: number, duration: number = 1000, start: number = 0) {
  const [count, setCount] = useState<number>(start);
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number | null>(null);
  const targetRef = useRef<number>(end);

  useEffect(() => {
    if (count === end) return;
    targetRef.current = end;
    startTime.current = 0;

    const animate = (currentTime: number) => {
      if (!startTime.current) startTime.current = currentTime;
      const elapsed = currentTime - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      const currentCount = Number((count + (end - count) * progress).toFixed(2));
      setCount(currentCount);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [end, duration]);

  return count;
}
