import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '@/services/BaseService.js';

const BACKEND_URL = getBackendUrl();

// ── Helpers ──────────────────────────────────────────────────────────────────

const ERROR_TYPE_CONFIG = {
  bug:         { label: 'Bug',          bg: '#FFF1F2', color: '#EF4444' },
  feature:     { label: 'Feature',      bg: '#EFF6FF', color: '#3B82F6' },
  improvement: { label: 'Improvement',  bg: '#F0FDF4', color: '#22C55E' },
  performance: { label: 'Performance',  bg: '#FFF7ED', color: '#F97316' },
  security:    { label: 'Segurança',    bg: '#FDF4FF', color: '#A855F7' },
  other:       { label: 'Outro',        bg: '#F9FAFB', color: '#6B7280' },
};

const STATUS_CONFIG = {
  open:       { label: 'Aberto',     bg: '#FFF1F2', color: '#EF4444' },
  in_progress:{ label: 'Em curso',   bg: '#FFF7ED', color: '#F97316' },
  resolved:   { label: 'Resolvido',  bg: '#F0FDF4', color: '#22C55E' },
  closed:     { label: 'Fechado',    bg: '#F9FAFB', color: '#6B7280' },
};

function getSeverityStyle(sev) {
  if (sev >= 8) return { color: '#DC2626', bg: '#FEE2E2', label: 'Crítica' };
  if (sev >= 5) return { color: '#D97706', bg: '#FEF3C7', label: 'Alta' };
  if (sev >= 3) return { color: '#2563EB', bg: '#DBEAFE', label: 'Média' };
  return         { color: '#16A34A', bg: '#DCFCE7', label: 'Baixa' };
}

function formatDate(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

// ── Ticket card ───────────────────────────────────────────────────────────────

function TicketCard({ ticket, onSelect, delay = 0 }) {
  const sevStyle  = getSeverityStyle(ticket.severity || 5);
  const errCfg    = ERROR_TYPE_CONFIG[(ticket.error_type || '').toLowerCase()] || ERROR_TYPE_CONFIG.other;
  const statCfg   = STATUS_CONFIG[(ticket.status || 'open').toLowerCase()] || STATUS_CONFIG.open;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer group transition-all animate-fadeIn"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', animationDelay: `${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
      onClick={() => onSelect(ticket)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: errCfg.bg, color: errCfg.color }}>
            {errCfg.label}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: statCfg.bg, color: statCfg.color }}>
            {statCfg.label}
          </span>
        </div>
      </div>

      {/* Report */}
      <p className="text-sm font-medium text-gray-800 leading-snug mb-3 line-clamp-3">
        {ticket.user_report || '(sem descrição)'}
      </p>

      {/* Severity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Severidade</span>
          <span className="text-[11px] font-bold" style={{ color: sevStyle.color }}>
            {ticket.severity || 0}/10 · {sevStyle.label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${((ticket.severity || 0) / 10) * 100}%`,
              backgroundColor: sevStyle.color,
            }}
          />
        </div>
      </div>

      {/* Fix suggestion preview */}
      {ticket.fix_suggestion && (
        <p className="text-[11px] text-gray-400 italic line-clamp-2 mb-3 border-l-2 border-gray-200 pl-2">
          {ticket.fix_suggestion}
        </p>
      )}

      {/* Date */}
      <p className="text-[10px] text-gray-400">{formatDate(ticket.created_at)}</p>
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function TicketModal({ ticket, onClose, onStatusChange }) {
  const sevStyle = getSeverityStyle(ticket.severity || 5);
  const errCfg   = ERROR_TYPE_CONFIG[(ticket.error_type || '').toLowerCase()] || ERROR_TYPE_CONFIG.other;
  const [status, setStatus] = useState(ticket.status || 'open');
  const [saving, setSaving] = useState(false);

  const handleStatus = async (newStatus) => {
    setSaving(true);
    try {
      await fetch(`${BACKEND_URL}/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      onStatusChange(ticket.id, newStatus);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-fadeInUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-gray-400">Ticket #{ticket.id}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg transition-colors">✕</button>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: errCfg.bg, color: errCfg.color }}>
              {errCfg.label}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: sevStyle.bg, color: sevStyle.color }}>
              Severidade {ticket.severity}/10 · {sevStyle.label}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-800 mb-2">Relato</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{ticket.user_report}</p>

          {ticket.fix_suggestion && (
            <>
              <h3 className="text-base font-bold text-gray-800 mb-2">Sugestão de correção</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 bg-gray-50 rounded-xl p-3">
                {ticket.fix_suggestion}
              </p>
            </>
          )}

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full" style={{ width: `${(ticket.severity/10)*100}%`, backgroundColor: sevStyle.color }} />
          </div>

          <p className="text-xs text-gray-400 mb-5">{formatDate(ticket.created_at)}</p>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Alterar Estado</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                disabled={saving}
                onClick={() => handleStatus(key)}
                className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all disabled:opacity-60"
                style={{
                  background: status === key ? cfg.bg : '#F9FAFB',
                  color: status === key ? cfg.color : '#6B7280',
                  borderColor: status === key ? cfg.color : '#E5E7EB',
                }}
              >
                {status === key ? '✓ ' : ''}{cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const [tickets,      setTickets]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSev,    setFilterSev]    = useState('all');
  const [selected,     setSelected]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tickets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTickets(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // ── Stats ──
  const stats = [
    { label: 'Total',           value: tickets.length,                                              color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Abertos',         value: tickets.filter(t => t.status === 'open').length,             color: '#EF4444', bg: '#FFF1F2' },
    { label: 'Alta severidade', value: tickets.filter(t => (t.severity || 0) >= 7).length,         color: '#D97706', bg: '#FFF7ED' },
    { label: 'Resolvidos',      value: tickets.filter(t => t.status === 'resolved').length,        color: '#16A34A', bg: '#F0FDF4' },
  ];

  // ── Filters ──
  const filtered = tickets.filter(t => {
    const matchSearch = !search || (t.user_report || '').toLowerCase().includes(search.toLowerCase()) || (t.error_type || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSev    = filterSev === 'all'
      || (filterSev === 'critical' && (t.severity || 0) >= 8)
      || (filterSev === 'high'     && (t.severity || 0) >= 5 && (t.severity || 0) < 8)
      || (filterSev === 'medium'   && (t.severity || 0) >= 3 && (t.severity || 0) < 5)
      || (filterSev === 'low'      && (t.severity || 0) < 3);
    return matchSearch && matchStatus && matchSev;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">

      {/* ── Title ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-main">Tickets</h2>
        <p className="text-xs text-muted mt-0.5">Gestão de tickets criados via ChatBot ou manualmente</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl p-5 shadow-sm border border-transparent" style={{ backgroundColor: bg }}>
            <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color }}>{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm flex-1 min-w-[180px]">
          <span className="text-gray-400 text-sm">⌕</span>
          <input
            className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none flex-1"
            placeholder="Pesquisar ticket..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-9 bg-white border border-gray-200 rounded-lg px-2.5 text-sm text-gray-600 focus:outline-none shadow-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos os estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <select
          className="h-9 bg-white border border-gray-200 rounded-lg px-2.5 text-sm text-gray-600 focus:outline-none shadow-sm"
          value={filterSev}
          onChange={e => setFilterSev(e.target.value)}
        >
          <option value="all">Toda severidade</option>
          <option value="critical">Crítica (8-10)</option>
          <option value="high">Alta (5-7)</option>
          <option value="medium">Média (3-4)</option>
          <option value="low">Baixa (1-2)</option>
        </select>

        <button
          onClick={load}
          className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
          title="Recarregar"
        >
          ↺
        </button>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">A carregar tickets…</div>
      )}

      {error && !loading && (
        <div className="text-center py-10">
          <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-red-600/20 bg-red-600/5 p-8 mx-auto max-w-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10 text-red-600 animate-pulse text-2xl">
              ⚠️
            </div>
            <div>
              <p className="text-lg font-semibold text-red-600">Servidor indisponível</p>
              <p className="mt-1 text-sm text-red-500">Erro ao carregar tickets: {error}</p>
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-red-500 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">🎟️</p>
          <p className="text-gray-400 text-sm">
            {tickets.length === 0
              ? 'Nenhum ticket ainda. Cria um via ChatBot!'
              : 'Nenhum ticket corresponde aos filtros.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-3">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} onSelect={setSelected} delay={index * 60} />
            ))}
          </div>
        </>
      )}

      {/* ── Detail modal ── */}
      {selected && (
        <TicketModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
