import { useState, useEffect } from "react";
import { getBackendUrl } from "@/services/BaseService.js";
import { STATUS_ID_TO_NAME } from "@/services/taskService.js";
import TrophySpin from "@/components/ui/TrophySpin";
import UserCard from "@/components/users/UserCard.jsx";
import UserDashboard from "@/components/users/UserDashboard.jsx";
import ModalConfirm from "@/components/ui/ModalConfirm.jsx";
import usersIcon    from "@/assets/users.png";
import activeIcon   from "@/assets/active.png";
import inactiveIcon from "@/assets/inactive.png";
import filterIcon   from "@/assets/filter.png";
import percentIcon  from "@/assets/percentagem.png";

const BACKEND_URL = getBackendUrl();

function enrichUser(raw, tasksForUser = []) {
  return {
    ...raw,
    role:   raw.role_id === 1 ? "Admin" : raw.role_id === 2 ? "Member" : "Viewer",
    active: raw.active === true || raw.active === 1,
    tasks:  tasksForUser,
  };
}

// ── Stat Card atom ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, filter, currentFilter, onFilter, className = "" }) {
  const isSelected = filter && currentFilter === filter;
  return (
    <button
      type="button"
      onClick={() => filter && onFilter(filter)}
      className={[
        "flex items-center gap-3 rounded-2xl sm:rounded-3xl p-2 text-left transition-all",
        filter ? "cursor-pointer hover:bg-surface-2 active:scale-95" : "cursor-default",
        isSelected ? "bg-surface-2 border border-surface" : "bg-surface",
        className,
      ].join(" ")}
    >
      <img src={icon} alt={label} className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-[0.06em] leading-tight">{label}</p>
        <p className="text-base font-semibold text-main">{value}</p>
      </div>
    </button>
  );
}

export default function UsersPage({ refreshKey = 0, openUserId = null, onUserViewing = () => {} }) {
  const [users,              setUsers]               = useState([]);
  const [loading,            setLoading]             = useState(true);
  const [error,              setError]               = useState(null);
  const [search,             setSearch]              = useState("");
  const [showSearch,         setShowSearch]          = useState(false);
  const [statusFilter,       setStatusFilter]        = useState("ALL");
  const [sortDirection,      setSortDirection]       = useState("NONE");
  const [activeDash,         setActiveDash]          = useState(null);
  const [confirmDeleteUserId,setConfirmDeleteUserId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, tasksRes] = await Promise.all([
        fetch(`${BACKEND_URL}/users`),
        fetch(`${BACKEND_URL}/tasks`),
      ]);
      if (!usersRes.ok) throw new Error(`HTTP ${usersRes.status}`);
      const rawUsers = await usersRes.json();
      const allTasks = tasksRes.ok ? await tasksRes.json() : [];
      const userTasksMap = {};
      allTasks.forEach((task) => {
        if (!task.assigned_to) return;
        if (!userTasksMap[task.assigned_to]) userTasksMap[task.assigned_to] = [];
        userTasksMap[task.assigned_to].push({
          ...task,
          status: STATUS_ID_TO_NAME[task.status_id] || "CREATED",
        });
      });
      setUsers(rawUsers.map((u) => enrichUser(u, userTasksMap[u.id] || [])));
    } catch (err) {
      setError(err.message || "Falha ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    if (!openUserId || users.length === 0) return;
    const targetUser = users.find((u) => u.id === openUserId);
    if (targetUser) {
      setActiveDash(targetUser);
    }
  }, [openUserId, users]);

  // Refresh user dashboard tasks when viewing a user
  const refreshUserTasks = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${BACKEND_URL}/tasks`);
      if (!response.ok) throw new Error("Falha ao carregar tarefas");
      const allTasks = await response.json();
      const userTasks = allTasks
        .filter((task) => task.assigned_to === userId)
        .map((task) => ({
          ...task,
          status: STATUS_ID_TO_NAME[task.status_id] || "CREATED",
        }));
      
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tasks: userTasks } : u))
      );
    } catch (err) {
      console.error("[UsersPage] refreshUserTasks:", err?.message);
    }
  };

  // Trigger refresh when refreshKey changes and user is being viewed
  useEffect(() => {
    if (refreshKey > 0 && activeDash) {
      refreshUserTasks(activeDash.id);
    }
  }, [refreshKey, activeDash]);

  // Keep parent aware of which user dashboard is open
  useEffect(() => {
    onUserViewing(activeDash ? activeDash.id : null);
    return () => onUserViewing(null);
  }, [activeDash, onUserViewing]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fadeInUp">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-1">Utilizadores</h2>
          <p className="text-muted text-sm">Gerencie a equipa e os seus membros ativos.</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-surface bg-surface-2 p-6 text-center max-w-md mx-auto">
          <TrophySpin message="A carregar utilizadores..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fadeInUp">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-1">Utilizadores</h2>
          <p className="text-muted text-sm">Gerencie a equipa e os seus membros ativos.</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-surface bg-surface-2 p-6 text-center max-w-md mx-auto">
          <TrophySpin message="Servidor indisponível" />
          <button type="button" onClick={loadUsers}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
            ↺ Recarregar
          </button>
        </div>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const lower = search.toLowerCase();
    const matchesText   = u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower);
    const matchesStatus =
      statusFilter === "ALL"      ? true :
      statusFilter === "ACTIVE"   ? u.active :
      statusFilter === "INACTIVE" ? !u.active : true;
    return matchesText && matchesStatus;
  });

  const sortedUsers = [...filtered].sort((a, b) => {
    if (sortDirection === "ASC")  return a.name.localeCompare(b.name);
    if (sortDirection === "DESC") return b.name.localeCompare(a.name);
    return 0;
  });

  function toggleActive(id) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u));
    const user = users.find((u) => u.id === id);
    if (user) {
      fetch(`${BACKEND_URL}/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      }).catch(console.error);
    }
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    fetch(`${BACKEND_URL}/users/${id}`, { method: "DELETE" }).catch(console.error);
    setConfirmDeleteUserId(null);
  }

  const activePercentage = users.length > 0
    ? ((users.filter((u) => u.active).length / users.length) * 100).toFixed(2)
    : "0.00";

  // 5 stat cards
  const statCards = [
    { label: "Utilizadores", value: users.length,                           icon: usersIcon,    filter: "ALL"      },
    { label: "Ativos",        value: users.filter((u) => u.active).length,   icon: activeIcon,   filter: "ACTIVE"   },
    { label: "Inativos",      value: users.filter((u) => !u.active).length,  icon: inactiveIcon, filter: "INACTIVE" },
    { label: "Filtrados",     value: filtered.length,                         icon: filterIcon,   filter: null       },
    { label: "Ativos %",      value: `${activePercentage}%`,                  icon: percentIcon,  filter: null       },
  ];

  const filterLabel =
    statusFilter === "ALL"      ? "Todos" :
    statusFilter === "ACTIVE"   ? "Ativos" : "Inativos";

  const confirmDeleteUser = confirmDeleteUserId !== null
    ? users.find((u) => u.id === confirmDeleteUserId)
    : null;

  if (activeDash) {
    const liveUser = users.find((u) => u.id === activeDash.id) || activeDash;

    return (
      <UserDashboard 
        user={liveUser} 
        onBack={() => {
          setActiveDash(null);
          onUserViewing(null);
        }}
        refreshKey={refreshKey}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fadeInUp">
      <h2 className="text-2xl sm:text-3xl font-bold text-main mb-4 sm:mb-6">
        Gestão de Utilizadores
      </h2>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-5">

        {/* ── MOBILE stat layout: 2 + 2 + 1 (full width) ── */}
        <div className="sm:hidden space-y-2">
          {/* Row 1: 2 cards */}
          <div className="grid grid-cols-2 gap-2">
            {statCards.slice(0, 2).map((c) => (
              <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} />
            ))}
          </div>
          {/* Row 2: 2 cards */}
          <div className="grid grid-cols-2 gap-2">
            {statCards.slice(2, 4).map((c) => (
              <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} />
            ))}
          </div>
          {/* Row 3: 1 card full width */}
          <div>
            <StatCard
              {...statCards[4]}
              currentFilter={statusFilter}
              onFilter={setStatusFilter}
              className="w-full justify-center sm:justify-start"
            />
          </div>
        </div>

        {/* ── DESKTOP: all 5 in one row ── */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-2">
          {statCards.map((c) => (
            <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} />
          ))}
        </div>

        {/* Filter controls */}
        <div className="ml-auto flex items-center gap-2">
          {showSearch && (
            <input autoFocus
              className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] flex-1 min-w-0 sm:w-48 sm:flex-none"
              placeholder="Procurar utilizador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <span className="hidden sm:inline-flex text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2">
            Filtro: {filterLabel}
          </span>
          <button
            type="button"
            onClick={() => { setShowSearch((s) => !s); setSearch(""); }}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 cursor-pointer"
          >⌕</button>
          <button
            type="button"
            onClick={() => setSortDirection((c) => c === "NONE" ? "ASC" : c === "ASC" ? "DESC" : "NONE")}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 cursor-pointer"
          >
            {sortDirection === "ASC" ? "⬆" : sortDirection === "DESC" ? "⬇" : "⇅"}
          </button>
        </div>
      </div>

      {/* User cards grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedUsers.map((u, index) => (
            <UserCard
              key={u.id}
              user={u}
              onDashboard={setActiveDash}
              onToggle={toggleActive}
              onDelete={(id) => setConfirmDeleteUserId(id)}
              delay={index * 70}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center py-16 text-muted text-sm">
              Nenhum utilizador encontrado.
            </p>
          )}
        </div>
      )}

      {confirmDeleteUserId !== null && (
        <ModalConfirm
          title="Remover utilizador"
          message={`Tem certeza que deseja remover o utilizador ${confirmDeleteUser?.name || "este utilizador"} (${confirmDeleteUser?.email || "sem e-mail"})? Esta ação não pode ser desfeita.`}
          cancel={() => setConfirmDeleteUserId(null)}
          confirm={() => deleteUser(confirmDeleteUserId)}
        />
      )}
    </div>
  );
}
