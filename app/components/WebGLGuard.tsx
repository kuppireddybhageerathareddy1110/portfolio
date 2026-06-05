"use client";

import { useEffect, useState } from "react";

export function useWebGLAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    queueMicrotask(() => setAvailable(Boolean(context)));
  }, []);

  return available;
}

export function SceneFallback({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="scene-fallback">
      <div className="scene-fallback-orb" />
      <div>
        <div className="section-tag">{label}</div>
        <p>{detail}</p>
      </div>
    </div>
  );
}
