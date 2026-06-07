"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";

const Hero3DScene = dynamic(
  () => import("@/components/public/Hero3DScene").then((m) => m.Hero3DScene),
  { ssr: false, loading: () => <div className="h-full w-full bg-gradient-to-br from-primary/5 to-accent/5" /> }
);

type PageHeroProps = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  backgroundImageUrl?: string | null;
};

export function AnimatedHero({ title, subtitle, description, backgroundImageUrl }: PageHeroProps) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden hero-gradient">
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      <div className="absolute inset-0 opacity-40">
        <Suspense fallback={null}>
          <Hero3DScene />
        </Suspense>
      </div>

      {/* Floating Bengali letters */}
      {["ক", "ব", "ি", "ত", "া"].map((letter, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute select-none font-serif text-4xl text-primary/10 md:text-6xl"
          style={{ left: `${10 + i * 18}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {letter}
        </motion.span>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm font-medium uppercase tracking-widest text-primary"
        >
          {subtitle || "পথিক কবি"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl gradient-text"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted md:text-xl"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
