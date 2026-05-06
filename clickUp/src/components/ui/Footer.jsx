import { useTheme } from '@/context/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t border-surface py-4 ${isDark ? 'bg-surface' : 'bg-surface-2'}`}>
    </footer>
  );
}
