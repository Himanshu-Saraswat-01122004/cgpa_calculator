'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const ref = React.useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleToggle = async () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    // Skip animation if View Transitions not supported or user prefers reduced motion
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(newTheme);
      return;
    }

    // Get the position of the toggle button for the circle origin
    const button = ref.current;
    if (!button) { setTheme(newTheme); return; }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    // Calculate the largest radius needed to cover the entire viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Start the view transition — flushSync ensures React commits synchronously
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    // Wait for the transition to be ready, then animate with clip-path
    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  if (!mounted) return null;

  return (
    <button
      ref={ref}
      id="theme-toggle"
      onClick={handleToggle}
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
