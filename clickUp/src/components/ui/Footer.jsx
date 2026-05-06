import { useTheme } from '@/context/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t border-surface py-4 ${isDark ? 'bg-surface' : 'bg-surface-2'}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-2 text-sm text-secondary text-center">
        <div className="space-y-1">
          <p>Desenvolvido por Danilson Sanches.</p>
          <p>M7: Introdução a GenAI & GenAI no Browser</p>
          <p>Front End + AI - UPSKILL 2025 - 2026</p>
        </div>
      </div>
    </footer>
  );
}
