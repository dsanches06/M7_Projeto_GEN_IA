import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/services/BaseService.js';
import UserCard from './UserCard.jsx';
import UserDashboard from './UserDashboard.jsx';

const BACKEND_URL = getBackendUrl();

/**
 * Builds mock tasks for a user if the backend user object has none.
 * Real tasks come from the /task_assignees or /tasks endpoint —
 * here we just render whatever the backend sends (users.tasks array).
 */
function enrichUser(raw) {
  return {
    ...raw,
    role:   raw.role_id === 1 ? 'Admin' : raw.role_id === 2 ? 'Member' : 'Viewer',
    active: raw.active === true || raw.active === 1,
    tasks:  Array.isArray(raw.tasks) ? raw.tasks : [],
  };
}

export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeDash, setActiveDash] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/users`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data.map(enrichUser));
      } catch (err) {
        console.error('Erro ao carregar utilizadores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleActive(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    // Optimistically patch backend
    const user = users.find((u) => u.id === id);
    if (user) {
      fetch(`${BACKEND_URL}/users/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ active: !user.active }),
      }).catch(console.error);
    }
  }

  function deleteUser(id) {
    if (!window.confirm('Remover este utilizador?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    fetch(`${BACKEND_URL}/users/${id}`, { method: 'DELETE' }).catch(console.error);
  }

  // ── Dashboard view ──────────────────────────────────────────────────────
  if (activeDash) {
    const liveUser = users.find((u) => u.id === activeDash.id) || activeDash;
    return <UserDashboard user={liveUser} onBack={() => setActiveDash(null)} />;
  }

  // ── Stats ───────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Todos',     value: users.length },
    { label: 'Ativos',    value: users.filter((u) => u.active).length },
    { label: 'Inativos',  value: users.filter((u) => !u.active).length },
    { label: 'Filtrados', value: filtered.length },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-main">Gestão de Utilizadores</h2>
          <p className="text-xs text-muted mt-0.5">
            {users.length} utilizadores · {users.filter((u) => u.active).length} ativos
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {showSearch && (
            <input
              autoFocus
              className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] w-48 transition-all"
              placeholder="Procurar utilizador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <button
            title="Pesquisar"
            onClick={() => { setShowSearch((s) => !s); setSearch(''); }}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors"
          >
            ⌕
          </button>
          <button
            title="Adicionar utilizador"
            className="w-8 h-8 rounded-lg border border-[#b5d4f4] bg-[#E6F1FB] text-[#185FA5] flex items-center justify-center hover:bg-[#d0e8f8] transition-colors text-base"
          >
            ＋
          </button>
          <button
            title="Ordenar"
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors"
          >
            ⇅
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value }) => (
          <div key={label} className="bg-surface-2 rounded-xl p-4 border border-surface">
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className="text-2xl font-semibold text-main">{value}</p>
          </div>
        ))}
      </div>

      {/* Loading / Error / Grid */}
      {loading && (
        <div className="text-center py-16 text-muted text-sm">A carregar utilizadores…</div>
      )}

      {error && !loading && (
        <div className="text-center py-10 text-[#A32D2D] text-sm">
          Erro ao carregar utilizadores: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onDashboard={setActiveDash}
              onToggle={toggleActive}
              onDelete={deleteUser}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center py-16 text-muted text-sm">
              Nenhum utilizador encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
