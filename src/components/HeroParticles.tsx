"use client";
import React from "react";
import { SparklesCore } from "./ui/SparklesCore";

export function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
      <SparklesCore
        id="wind-hero-particles"
        background="transparent"
        minSize={0.8}
        maxSize={2.2}
        particleDensity={60}
        className="h-full w-full"
        particleColor="#22D3EE"
        speed={0.6}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/30 via-transparent to-navy-950/80" />
    </div>
  );
}