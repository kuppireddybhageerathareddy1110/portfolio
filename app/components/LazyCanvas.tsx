"use client";

import { useEffect, useRef, useState } from "react";

interface LazyCanvasProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export default function LazyCanvas({ children, className = "", fallback }: LazyCanvasProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { rootMargin: "250px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? children : (fallback || <div className="w-full h-full bg-[#05070a] rounded-xl animate-pulse" />)}
    </div>
  );
}
