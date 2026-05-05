import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function Header({ currentPage = 'dashboard', onPageChange = () => {}, onChatOpen = () => {} }) {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { 
      id: 'projetos', 
      label: 'Projetos', 
      icon: '📂',
      submenu: [
        { label: 'Equipas', id: 'equipas', icon: '👥' },
        { label: 'Sprints', id: 'sprints', icon: '🚩' }
      ]
    },
    { id: 'utilizadores', label: 'Utilizadores', icon: '👤' },
    { id: 'tags', label: 'Tags', icon: '🏷️' },
    { id: 'tarefas', label: 'Tarefas', icon: '📋' }
  ];

  return (
    <header className="bg-[#111111] text-white px-6 py-2 sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between h-12">
        
        {/* Lado Esquerdo: Logo e Subtítulo */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight leading-none">ClickUp</h1>
          <p className="text-[14px] text-gray-500 font-medium">Project Management</p>
        </div>

        {/* Centro: Menu de Navegação Estilo "Pílula" */}
        <nav className="flex items-center bg-[#2a2a2a] rounded-md p-1 border border-white/5 shadow-inner">
          {menuItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onPageChange(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-medium transition-all
                  ${currentPage === item.id || (item.id === 'projetos' && item.submenu)
                    ? 'bg-[#353535] text-[#82b39b] shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-[#353535]/50'
                  }
                `}
              >
                <span className="text-[14px]">{item.icon}</span>
                {item.label}
                {item.submenu && <span className="text-[10px] opacity-30 ml-0.5">▼</span>}
              </button>

              {/* Dropdown - Projetos */}
              {item.submenu && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-44 bg-[#1e1e1e] border border-white/10 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 overflow-hidden">
                  {item.submenu.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => onPageChange(sub.id)}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-[#82b39b] hover:text-[#111] transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <span>{sub.icon}</span>
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          
          <button
            onClick={onChatOpen}
            className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold px-4 py-2 rounded uppercase tracking-wider transition-colors"
          >
            CHATBOT
          </button>

          <div className="w-8 h-8 bg-[#2a2a2a] border border-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 hover:border-[#82b39b] cursor-pointer transition-all">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
