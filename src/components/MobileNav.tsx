"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "#library", label: "知识库" },
  { href: "#cases", label: "事故案例" },
  { href: "#route", label: "运输流程" },
  { href: "#risk", label: "风险矩阵" },
  { href: "#safety-report", label: "安全检查和培训" },
  { href: "/exam", label: "安全考试" },
];

const menuVariants = {
  closed: { x: "100%" },
  open: { x: 0 },
};

const itemVariants = {
  closed: { x: 40, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.06, type: "spring", stiffness: 120, damping: 20 },
  }),
};

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative z-50 ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur transition hover:border-orange-safety/50 hover:bg-orange-safety/10 md:hidden"
        aria-label="打开导航菜单"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-white/10 bg-navy-950/95 backdrop-blur-2xl md:hidden"
              aria-label="移动端导航"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <span className="font-display text-sm font-bold tracking-[0.16em] text-white">
                  导航
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-steel-400 transition hover:border-orange-safety/50 hover:text-orange-safety"
                  aria-label="关闭导航菜单"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <ul className="flex flex-col gap-1 px-4 pt-6">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    custom={i}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <a
                      href={link.href}
                      onClick={handleClick}
                      className="group flex items-center gap-4 rounded-xl px-4 py-3.5 text-base text-steel-300 transition hover:bg-orange-safety/10 hover:text-orange-safety"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-[10px] text-steel-500 group-hover:border-orange-safety/40 group-hover:text-orange-safety">
                        0{i + 1}
                      </span>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Drawer footer */}
              <div className="mt-auto border-t border-white/10 px-6 py-5">
                <a
                  href="/exam"
                  onClick={handleClick}
                  className="flex items-center justify-center rounded-full bg-orange-safety px-5 py-2.5 text-sm font-bold text-navy-950 shadow-lg shadow-orange-safety/25 transition hover:bg-orange-safetyLight"
                >
                  开始考试
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}