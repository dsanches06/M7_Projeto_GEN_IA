import { useState } from 'react';
import { getPalette, getInitials } from '../../utils/userUtils.js';

export default function UserCard({ user, onDashboard, onToggle, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const c = getPalette(user.id);
  const pending = (user.tasks || []).filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED'
  ).length;

  return (
    <div
      className="relative w-full"
      style={{ height: 260, perspective: 900, cursor: 'pointer' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-xl border border-surface bg-surface-2 flex flex-col items-center justify-center gap-3 px-5 py-6 overflow-hidden"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium flex-shrink-0"
            style={{ background: c.bg, color: c.tx }}
          >
            {getInitials(user.name)}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-main leading-tight">{user.name}</p>
            <p className="text-xs text-muted mt-0.5">{user.role}</p>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs px-3 py-0.5 rounded-full font-medium ${
              user.active
                ? 'bg-[#EAF3DE] text-[#3B6D11]'
                : 'bg-[#FCEBEB] text-[#A32D2D]'
            }`}
          >
            ● {user.active ? 'Ativo' : 'Inativo'}
          </span>

          {pending > 0 && (
            <p className="text-xs text-muted">
              {pending} tarefa{pending !== 1 ? 's' : ''} pendente{pending !== 1 ? 's' : ''}
            </p>
          )}

          <p className="text-[10px] text-muted/60 mt-auto">↻ clique para detalhes</p>
        </div>

        {/* ── BACK ── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 rounded-xl border border-surface bg-surface-2 flex flex-col gap-1.5 p-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back header */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: c.bg, color: c.tx }}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-main truncate">{user.name}</p>
              <p className="text-[10px] text-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Details */}
          <ul className="flex flex-col gap-1 text-xs">
            {[
              { label: 'ID',       value: `#${user.id}` },
              { label: 'Telemóvel', value: user.phone },
              { label: 'Papel',    value: user.role },
              { label: 'Tarefas',  value: (user.tasks || []).length },
            ].map(({ label, value }) => (
              <li key={label} className="flex items-center justify-between text-muted">
                <span>{label}</span>
                <strong className="text-main font-medium">{value}</strong>
              </li>
            ))}
            <li className="flex items-center justify-between text-muted">
              <span>Estado</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  user.active
                    ? 'bg-[#EAF3DE] text-[#3B6D11]'
                    : 'bg-[#FCEBEB] text-[#A32D2D]'
                }`}
              >
                {user.active ? 'Ativo' : 'Inativo'}
              </span>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-surface">
            {[
              {
                icon: '⊞', title: 'Ver dashboard', colorHover: 'hover:bg-[#E6F1FB] hover:text-[#185FA5]',
                onClick: () => onDashboard && onDashboard(user),
              },
              {
                icon: '✎', title: 'Editar', colorHover: 'hover:bg-[#E6F1FB] hover:text-[#185FA5]',
                onClick: () => {},
              },
              {
                icon: '◉', title: 'Detalhes', colorHover: 'hover:bg-surface-3',
                onClick: () => {},
              },
              {
                icon: '＋', title: 'Atribuir tarefa', colorHover: 'hover:bg-[#EAF3DE] hover:text-[#3B6D11]',
                onClick: () => {},
              },
              {
                icon: user.active ? '⏻' : '⏼',
                title: user.active ? 'Desativar' : 'Ativar',
                colorHover: 'hover:bg-[#FAEEDA] hover:text-[#854F0B]',
                onClick: () => onToggle && onToggle(user.id),
              },
              {
                icon: '✕', title: 'Remover', colorHover: 'hover:bg-[#FCEBEB] hover:text-[#A32D2D]',
                onClick: () => onDelete && onDelete(user.id),
              },
            ].map(({ icon, title, colorHover, onClick }) => (
              <button
                key={title}
                title={title}
                className={`w-8 h-8 rounded-md border border-surface bg-surface flex items-center justify-center text-sm text-muted transition-colors ${colorHover}`}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
