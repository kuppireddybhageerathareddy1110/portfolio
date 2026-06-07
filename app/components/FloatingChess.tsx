"use client";

import { useMemo } from "react";

interface FloatingChessProps {
  theme?: "chess" | "knight" | "poet" | "king";
}

interface Piece {
  char: string;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  blur: number;
}

export default function FloatingChess({ theme = "chess" }: FloatingChessProps) {
  const pieces = useMemo<Piece[]>(() => {
    const getPieceSet = () => {
      switch (theme) {
        case "knight":
          return ["♞", "⚔", "🛡", "♘", "♞", "⚔", "♘", "🗡"];
        case "poet":
          return ["✒", "📜", "✎", "🪶", "℘", "✍", "📖", "🖋", "α", "β", "Ω", "∞"];
        case "king":
          return ["♔", "♕", "👑", "♚", "♛", "💎", "⚜", "♔"];
        case "chess":
        default:
          return ["♔", "♕", "♗", "♘", "♖", "♙", "♚", "♛", "♝", "♞", "♜", "♟"];
      }
    };

    const chars = getPieceSet();
    const generated: Piece[] = [];

    for (let i = 0; i < 24; i++) {
      const char = chars[i % chars.length];
      // Deterministic-ish but varied positioning
      const left = ((i * 41 + 7) % 100);
      const duration = 22 + (i * 3.1 % 18);
      const delay = -(i * 2.7 % 16);
      const size = 16 + (i * 2.9 % 22);
      // More visible than before but still subtle
      const opacity = 0.04 + (i * 0.012 % 0.07);
      const blur = i % 5 === 0 ? 1 : 0.3;

      generated.push({ char, left, size, opacity, duration, delay, blur });
    }

    return generated;
  }, [theme]);

  return (
    <div className="floating-chess-container" aria-hidden="true">
      {pieces.map((piece, i) => (
        <div
          key={`${theme}-${i}`}
          className="floating-chess-piece"
          style={{
            left: `${piece.left}%`,
            fontSize: `${piece.size}px`,
            opacity: piece.opacity,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            filter: `blur(${piece.blur}px)`,
          }}
        >
          {piece.char}
        </div>
      ))}
    </div>
  );
}
