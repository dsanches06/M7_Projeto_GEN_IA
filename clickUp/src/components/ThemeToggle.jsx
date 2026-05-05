import { useState } from 'react';

/**
 * ThemeToggle - Botão para alternar entre tema dark e light
 * Integrado com ThemeContext
 */
export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#2a2a2a] transition"
      title={`Alternar para ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <span className="text-xl">☀️</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </button>
  );
}
