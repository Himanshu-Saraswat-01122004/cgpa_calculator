'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
      style={{
        borderColor: 'rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <Sun
        className="h-4 w-4 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        style={{ color: '#f59e0b' }}
      />
      <Moon
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        style={{ color: '#818cf8' }}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
