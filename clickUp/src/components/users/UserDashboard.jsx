import { useState } from 'react';
import { STATUS_COLUMNS, STATUS_COLOR, getPalette, getInitials } from '../../utils/userUtils.js';
import taskIcon from '../../assets/tarefa.png';
import pendingIcon from '../../assets/pendente.png';
import completedIcon from '../../assets/tarefa-concluida.png';

export default function UserDashboard({ user, onBack }) {
  const [search, setSearch] = useState('');

  const tasks = (user.tasks || []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = Object.fromEntries(
    STATUS_COLUMNS.map((s) => [s, tasks.filter((t) => t.status === s)])
  );

  const stats = [
    { label: 'Total',     value: (user.tasks || []).length, icon: taskIcon },
    {
      label: 'Pendentes',
      value: (user.tasks || []).filter(
        (t) => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED'
      ).length,
      icon: pendingIcon,
    },
    { label: 'Concluídas', value: (user.tasks || []).filter((t) => t.status === 'COMPLETED').length, icon: completedIcon },
    { label: 'Bloqueadas', value: (user.tasks || []).filter((t) => t.status === 'BLOCKED').length, icon: taskIcon },
  ];

  const c = getPalette(user.id);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface flex-wrap">
        <button
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted bg-surface border border-surface rounded-lg px-3 py-1.5 hover:bg-surface-2 transition-colors whitespace-nowrap"
          onClick={onBack}
        >
          ← Voltar
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            style={{ background: c.bg, color: c.tx }}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-main leading-tight">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <span
          className={`ml-auto text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
            user.active
              ? 'bg-[#EAF3DE] text-[#3B6D11]'
              : 'bg-[#FCEBEB] text-[#A32D2D]'
          }`}
        >
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="bg-surface-2 rounded-xl p-4 border border-surface flex flex-col items-center gap-3 text-center">
            {icon && <img src={icon} alt={label} className="w-10 h-10 object-contain" />}
            <p className="text-xs text-muted uppercase tracking-[0.08em]">{label}</p>
            <p className="text-2xl font-semibold text-main">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted text-lg">⌕</span>
        <input
          className="flex-1 h-9 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)]"
          placeholder="Procurar tarefa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Kanban */}
      {(user.tasks || []).length === 0 ? (
        <p className="text-center py-10 text-muted text-sm">
          Sem tarefas atribuídas a este utilizador.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {STATUS_COLUMNS.map((s) => (
            <div
              key={s}
              className="flex-none w-44 bg-surface rounded-xl p-3 border border-surface"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface">
                <span
                  className="text-[10px] font-semibold tracking-wide uppercase"
                  style={{ color: STATUS_COLOR[s] }}
                >
                  {s.replace('_', ' ')}
                </span>
                <span className="text-[10px] bg-surface-2 border border-surface rounded-full px-1.5 py-0.5 text-muted">
                  {byStatus[s].length}
                </span>
              </div>

              {byStatus[s].length === 0 && (
                <p className="text-[11px] text-muted/50 text-center py-3">—</p>
              )}

              {byStatus[s].map((t) => (
                <div
                  key={t.id}
                  className="bg-surface-2 border border-surface rounded-md px-2.5 py-2 mb-2 cursor-pointer hover:border-surface-strong transition-colors"
                >
                  <p className="text-xs font-medium text-main leading-snug">{t.title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{t.sprint}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
