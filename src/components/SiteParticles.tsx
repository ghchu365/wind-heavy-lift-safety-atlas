"use client";
import React from "react";
import { SparklesCore } from "./ui/SparklesCore";

export function SiteParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
      <SparklesCore
        id="site-particles"
        background="transparent"
        minSize={0.4}
        maxSize={1.2}
        particleDensity={35}
        className="h-full w-full"
        particleColor="#22D3EE"
        speed={0.3}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-transparent to-navy-950/60" />
    </div>
  );
}