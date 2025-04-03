'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-secondary-foreground" />
      ) : (
        <Moon size={20} className="text-secondary-foreground" />
      )}
    </button>
  );
}