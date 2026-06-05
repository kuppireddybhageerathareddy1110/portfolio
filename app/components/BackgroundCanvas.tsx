"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(72, Math.max(32, Math.floor(width / 18)));
      particles = Array.from({ length: count }, (_, index) => {
        const seed = Math.sin(index * 99.7) * 10000;
        const rand = seed - Math.floor(seed);
        return {
          x: (index / count) * width,
          y: rand * height,
          vx: 0.18 + rand * 0.32,
          vy: (rand - 0.5) * 0.18,
          size: 1 + rand * 1.7,
        };
      });
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(63, 185, 80, 0.35)";
      ctx.strokeStyle = "rgba(88, 166, 255, 0.11)";

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(Date.now() * 0.0006 + index) * 0.05;

        if (particle.x > width + 20) particle.x = -20;
        if (particle.y > height + 20) particle.y = -20;
        if (particle.y < -20) particle.y = height + 20;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);

          if (distance < 105) {
            ctx.globalAlpha = 1 - distance / 105;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />;
}
