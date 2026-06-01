"use client";

import { motion } from "framer-motion";
import { Button } from "./button";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(4,14,26,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-navy-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "Background Paths",
}: {
  title?: string;
}) {
  const words = title.split(" ");

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-navy-950 rounded-[2rem] lg:rounded-[3rem]">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 sm:py-28 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="inline-block mr-4 last:mr-0"
              >
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay:
                        wordIndex * 0.1 +
                        letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text
                    bg-gradient-to-r from-white to-white/70"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-lg leading-8 text-steel-400 max-w-2xl mx-auto">
            首版先建立高质量栏目框架，后续可以持续扩展成 SEO 文章、检查清单、术语库和案例复盘库。
          </p>

          <div className="mt-10 inline-block group relative bg-gradient-to-b from-white/10 to-white/10 p-px rounded-2xl backdrop-blur-lg
            overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <a
              href="#top"
              className="inline-flex items-center rounded-[1.15rem] px-8 py-4 text-lg font-semibold backdrop-blur-md
              bg-white/5 hover:bg-white/10 border border-white/20 hover:border-orange-safety/50
              text-white transition-all duration-300
              group-hover:-translate-y-0.5"
            >
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                回到顶部
              </span>
              <span
                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5
                transition-all duration-300"
              >
                →
              </span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Blend gradient to seamlessly transition to the cards below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-950/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}