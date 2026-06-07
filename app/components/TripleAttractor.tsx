"use client";

import React from "react";

export default function TripleAttractor() {
  return (
    <div className="triple-attractor-container" style={{ width: "100%", height: "500px", position: "relative" }}>
      <iframe
        src="/triple_attractor_flower_sim.html"
        style={{ border: "none", width: "100%", height: "100%" }}
        title="Triple Attractor Simulation"
      />
    </div>
  );
}
