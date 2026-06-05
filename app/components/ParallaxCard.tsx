"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ParallaxCardProps {
  src: string;
  alt: string;
}

export default function ParallaxCard({ src, alt }: ParallaxCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate relative mouse position from -0.5 to 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const touch = e.touches[0];
    
    const x = Math.max(-0.5, Math.min(0.5, (touch.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (touch.clientY - rect.top) / rect.height - 0.5));
    
    setCoords({ x, y });
  };

  // Auto-float effect on mobile when not touched (subtle rotation)
  const [mobileFloat, setMobileFloat] = useState(0);
  useEffect(() => {
    let animFrame: number;
    const animate = (time: number) => {
      setMobileFloat(Math.sin(time * 0.0015) * 0.08);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const rotateX = isHovered ? -coords.y * 22 : mobileFloat * 4 + (-coords.y * 12);
  const rotateY = isHovered ? coords.x * 22 : mobileFloat * 15 + (coords.x * 12);
  
  const transformStyle = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  return (
    <div 
      className="parallax-card-container h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className="parallax-card h-full w-full"
        style={{
          transform: transformStyle,
        }}
      >
        {/* Background layer */}
        <div 
          className="parallax-bg"
          style={{
            transform: `scale(1.15) translateX(${-coords.x * 8}px) translateY(${-coords.y * 8}px)`,
            transition: isHovered ? "none" : "transform 0.5s ease",
          }}
        >
          <Image 
            src={src} 
            alt={alt} 
            fill 
            className="object-cover" 
            sizes="(max-width: 900px) 100vw, 60vw"
            priority
          />
        </div>
        
        {/* Overlay highlights / glare effect */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${(coords.x + 0.5) * 100}% ${(coords.y + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            opacity: isHovered ? 0.5 : 0.1,
          }}
        />
      </div>
    </div>
  );
}
