'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    toggleTheme();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative w-[72px] h-9 rounded-full p-1 overflow-hidden transition-all duration-500 flex items-center shrink-0 border ${
        isDark ? 'bg-[#1e293b] border-slate-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]' : 'bg-[#5ea5d3] border-sky-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]'
      }`}
      aria-label="Toggle theme"
    >
      {/* Background Elements Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        
        {/* LIGHT MODE BACKGROUND (Sky & Clouds) */}
        <motion.div
          animate={{ opacity: isDark ? 0 : 1, y: isDark ? 10 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {/* Layered concentric sky circles */}
          <div className="absolute top-[-10px] left-[-5px] w-12 h-12 rounded-full bg-white/10" />
          <div className="absolute top-[-5px] left-[5px] w-14 h-14 rounded-full bg-white/10" />
          
          {/* Fluffy Clouds */}
          <div className="absolute -bottom-2 right-1 w-6 h-6 rounded-full bg-white shadow-sm" />
          <div className="absolute -bottom-1 right-5 w-5 h-5 rounded-full bg-white shadow-sm" />
          <div className="absolute -bottom-3 right-8 w-7 h-7 rounded-full bg-white shadow-sm" />
          <div className="absolute -bottom-2 right-12 w-4 h-4 rounded-full bg-white shadow-sm" />
        </motion.div>
        
        {/* DARK MODE BACKGROUND (Space & Stars) */}
        <motion.div
          animate={{ opacity: isDark ? 1 : 0, y: isDark ? 0 : -10 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {/* Deep space gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
          
          {/* Stars (cross shapes) */}
          <div className="absolute top-[10px] left-[12px] w-1 h-1 bg-white rounded-full shadow-[0_0_4px_2px_rgba(255,255,255,0.4)]" />
          <div className="absolute top-[16px] left-[22px] w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_1px_rgba(255,255,255,0.4)]" />
          <div className="absolute top-[8px] left-[32px] w-1 h-1 bg-white rounded-full shadow-[0_0_3px_1px_rgba(255,255,255,0.4)]" />
          <div className="absolute top-[18px] left-[42px] w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_1px_rgba(255,255,255,0.4)]" />
        </motion.div>
      </div>

      {/* The Slider (Sun / Moon) */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 600, damping: 25 }}
        className={`relative z-10 w-7 h-7 rounded-full shadow-md flex items-center justify-center overflow-hidden ${
          isDark 
            ? 'bg-[#cbd5e1] ml-auto' // Moon
            : 'bg-[#facc15] mr-auto' // Sun
        }`}
        style={{
          boxShadow: isDark 
            ? 'inset -2px -2px 4px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.6)' 
            : 'inset -2px -2px 4px rgba(200,100,0,0.4), 0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        <motion.div
          animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {/* Moon Craters */}
          <div className="absolute top-[4px] left-[6px] w-2 h-2 rounded-full bg-slate-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
          <div className="absolute bottom-[4px] right-[6px] w-3 h-3 rounded-full bg-slate-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
          <div className="absolute top-[10px] right-[3px] w-1.5 h-1.5 rounded-full bg-slate-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
        </motion.div>
      </motion.div>
    </button>
  );
}
