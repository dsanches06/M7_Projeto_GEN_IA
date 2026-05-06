import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
    { id: 'projetos', path: '/projetos', label: 'Projetos' },
    { id: 'equipas', path: '/equipas', label: 'Equipas' },
    { id: 'sprints', path: '/sprints', label: 'Sprints' },
    { id: 'utilizadores', path: '/utilizadores', label: 'Utilizadores' },
    { id: 'tags', path: '/tags', label: 'Tags' },
    { id: 'tarefas', path: '/tarefas', label: 'Tarefas' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-2.5 backdrop-blur-sm transition-colors ${
      isDark 
        ? 'bg-[rgba(13,13,13,0.8)] shadow-[0_2px_4px_rgba(0,0,0,0.4)]' 
        : 'bg-[rgba(248,250,252,0.8)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]'
    }`}>
      {/* Logo */}
      <div className="flex-shrink-0">
        <h1 className={`text-2xl font-bold tracking-tight ${
          isDark
            ? 'text-white'
            : 'text-slate-900'
        }`}>
          ClickUp
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex justify-center">
        <ul className="flex gap-4 items-center">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  font-semibold transition-all duration-300 px-3 py-1.5 rounded-md
                  ${isActive
                    ? isDark
                      ? 'bg-white text-slate-900 transform scale-105'
                      : 'bg-slate-900 text-white transform scale-105'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-200'
                  }
                `}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right Actions */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
          isDark
            ? 'bg-slate-700 border border-slate-600 text-gray-300 hover:border-cyan-400'
            : 'bg-gray-200 border border-gray-300 text-gray-600 hover:border-blue-400'
        }`}>
          U
        </div>
      </div>
    </header>
  );
}

