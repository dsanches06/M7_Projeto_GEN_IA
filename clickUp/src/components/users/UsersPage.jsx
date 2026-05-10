import { useState, useEffect } from "react";
import { getBackendUrl } from "@/services/BaseService.js";
import { STATUS_ID_TO_NAME } from "@/services/taskService.js";
import UserCard from "./UserCard.jsx";
import UserDashboard from "./UserDashboard.jsx";
import ModalConfirm from "../ui/ModalConfirm.jsx";
import usersIcon   from "../../assets/users.png";
import activeIcon  from "../../assets/active.png";
import inactiveIcon from "../../assets/inactive.png";
import filterIcon  from "../../assets/filter.png";
import percentIcon from "../../assets/percentagem.png";

const BACKEND_URL = getBackendUrl();

function enrichUser(raw, tasksForUser = []) {
  return {
    ...raw,
    role:   raw.role_id === 1 ? "Admin" : raw.role_id === 2 ? "Member" : "Viewer",
    active: raw.active === true || raw.active === 1,
    tasks:  tasksForUser,
  };
}

export default function UsersPage() {
  const [users,              setUsers]              = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);
  const [search,             setSearch]             = useState("");
  const [showSearch,         setShowSearch]         = useState(false);
  const [statusFilter,       setStatusFilter]       = useState("ALL");
  const [sortDirection,      setSortDirection]      = useState("NONE");
  const [activeDash,         setActiveDash]         = useState(null);
  const [confirmDeleteUserId,setConfirmDeleteUserId]= useState(null);

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
      console.error("Erro ao carregar utilizadores:", err);
      setError(err.message || "Falha ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const lower = search.toLowerCase();
    const matchesText =
      u.name.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE"   && u.active) ||
      (statusFilter === "INACTIVE" && !u.active);
    return matchesText && matchesStatus;
  });

  const sortedUsers = [...filtered].sort((a, b) => {
    if (sortDirection === "ASC")  return a.name.localeCompare(b.name);
    if (sortDirection === "DESC") return b.name.localeCompare(a.name);
    return 0;
  });

  const cycleSortDirection = () => {
    setSortDirection((c) => c === "NONE" ? "ASC" : c === "ASC" ? "DESC" : "NONE");
  };

  function toggleActive(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    const user = users.find((u) => u.id === id);
    if (user) {
      fetch(`${BACKEND_URL}/users/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !user.active }),
      }).catch(console.error);
    }
  }

  function requestDeleteUser(id) { setConfirmDeleteUserId(id); }
  function cancelDelete()         { setConfirmDeleteUserId(null); }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    fetch(`${BACKEND_URL}/users/${id}`, { method: "DELETE" }).catch(console.error);
    setConfirmDeleteUserId(null);
  }

  /** Propagate kanban status change back to the users array */
  function handleTaskStatusChange(taskId, newStatus) {
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        tasks: u.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      }))
    );
    if (activeDash) {
      setActiveDash((prev) => ({
        ...prev,
        tasks: (prev.tasks || []).map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      }));
    }
  }

  // ── Stats ───────────────────────────────────────────────────────────────
  const activePercentage =
    users.length > 0
      ? ((users.filter((u) => u.active).length / users.length) * 100).toFixed(2)
      : "0.00";

  const statCards = [
    { label: "Utilizadores", value: users.length,                          icon: usersIcon,    filter: "ALL"      },
    { label: "Ativos",        value: users.filter((u) => u.active).length,  icon: activeIcon,   filter: "ACTIVE"   },
    { label: "Inativos",      value: users.filter((u) => !u.active).length, icon: inactiveIcon, filter: "INACTIVE" },
    { label: "Filtrados",     value: filtered.length,                        icon: filterIcon,   filter: null       },
    { label: "Ativos %",      value: `${activePercentage}%`,                 icon: percentIcon,  filter: null       },
  ];

  const filterLabel =
    statusFilter === "ALL"      ? "Todos" :
    statusFilter === "ACTIVE"   ? "Ativos" : "Inativos";

  const confirmDeleteUser =
    confirmDeleteUserId !== null
      ? users.find((u) => u.id === confirmDeleteUserId)
      : null;

  // ── Dashboard view ──────────────────────────────────────────────────────
  if (activeDash) {
    const liveUser = users.find((u) => u.id === activeDash.id) || activeDash;
    return (
      <UserDashboard
        user={liveUser}
        onBack={() => setActiveDash(null)}
        onTaskStatusChange={handleTaskStatusChange}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      <h2 className="text-3xl font-bold text-main mb-6">Gestão de Utilizadores</h2>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statCards.map(({ label, value, icon, filter }) => {
            const isSelected = filter && statusFilter === filter;
            const btnClass = filter ? "cursor-pointer hover:bg-surface/60" : "cursor-default";
            return (
              <button
                key={label}
                type="button"
                onClick={() => filter && setStatusFilter(filter)}
                className={`flex items-center gap-4 rounded-3xl p-2 text-left transition-colors ${btnClass} ${
                  isSelected ? "bg-surface-2 border border-surface" : "bg-surface"
                }`}
              >
                <img src={icon} alt={label} className="w-8 h-8 object-contain" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted uppercase tracking-[0.08em]">{label}</p>
                  <p className="text-base font-semibold text-main">{value}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
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
          <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2 hidden sm:inline-flex">
            Filtro: {filterLabel}
          </span>
          <button
            title="Pesquisar"
            onClick={() => { setShowSearch((s) => !s); setSearch(""); }}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
          >
            ⌕
          </button>
          <button
            title="Ordenar por nome"
            onClick={cycleSortDirection}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {sortDirection === "ASC" ? "⬆" : sortDirection === "DESC" ? "⬇" : "⇅"}
          </button>
        </div>
      </div>

      {/* Loading / Error / Grid */}
      {loading && (
        <div className="text-center py-16 text-muted text-sm">A carregar utilizadores…</div>
      )}

      {error && !loading && (
        <div className="text-center py-10">
          <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-red-600/20 bg-red-600/5 p-8 mx-auto max-w-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10 text-red-600 animate-pulse text-2xl">⚠️</div>
            <div>
              <p className="text-lg font-semibold text-red-100">Servidor indisponível</p>
              <p className="mt-1 text-sm text-red-200">Erro ao carregar utilizadores: {error}</p>
            </div>
            <button type="button" onClick={loadUsers}
              className="rounded-full border border-red-500 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20">
              Recarregar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedUsers.map((u, index) => (
            <UserCard
              key={u.id}
              user={u}
              onDashboard={setActiveDash}
              onToggle={toggleActive}
              onDelete={requestDeleteUser}
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
          message={`Tem certeza que deseja remover o utilizador ${
            confirmDeleteUser?.name || "este utilizador"
          } (${confirmDeleteUser?.email || "sem e-mail"})? Esta ação não pode ser desfeita.`}
          cancel={cancelDelete}
          confirm={() => deleteUser(confirmDeleteUserId)}
        />
      )}
    </div>
  );
}
