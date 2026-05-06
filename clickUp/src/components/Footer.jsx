import { useTheme } from '../context/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t border-surface py-4 ${isDark ? 'bg-surface' : 'bg-surface-2'}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-secondary">
        <span>ClickUp Clone • {new Date().getFullYear()}</span>
        <span>{isDark ? 'Tema Escuro' : 'Tema Claro'} ativado</span>
      </div>
    </footer>
  );
}
