import { useState } from "react";
import { getPalette, getInitials } from "../../utils/userUtils.js";
import man1 from "../../assets/man-1.png";
import man2 from "../../assets/man-2.png";
import man3 from "../../assets/man-3.png";
import man4 from "../../assets/man-4.png";
import woman1 from "../../assets/woman-1.png";
import woman2 from "../../assets/woman-2.png";
import woman3 from "../../assets/woman-3.png";
import woman4 from "../../assets/woman-4.png";

// Conjunto de avatares disponíveis para distribuição pelos utilizadores
const AVATARS = [man1, woman1, man2, woman2, man3, woman3, man4, woman4];

// Cartão de utilizador com efeito de flip (frente/verso) ao clicar
export default function UserCard({ user, onDashboard, onToggle, onDelete, delay = 0 }) {
  // Controla se o cartão está virado (verso visível)
  const [flipped, setFlipped] = useState(false);
  // Controla o efeito de escala ao passar o rato
  const [hovered, setHovered] = useState(false);
  // Paleta de cores determinística baseada no ID do utilizador
  const c = getPalette(user.id);
  // Avatar: usa o fornecido ou selecciona um da lista por ID
  const avatar = user.avatar || AVATARS[(user.id - 1) % AVATARS.length];
  // Número de tarefas pendentes (excluindo concluídas e arquivadas)
  const pending = (user.tasks || []).filter(
    (t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED",
  ).length;

  return (
    <div
      className="relative w-full animate-fadeInUp"
      style={{
        height: 220,
        perspective: 900,
        cursor: "pointer",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        animationDelay: `${delay}ms`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered
          ? "0 20px 40px rgba(0,0,0,0.18)"
          : "0 14px 30px rgba(0,0,0,0.12)",
      }}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRENTE: avatar, nome, papel e estado ── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundColor: c.bg,
            color: c.tx,
            boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
          }}
          className="absolute inset-0 rounded-xl border border-surface flex flex-col items-center justify-center gap-2 px-4 py-4 overflow-hidden"
        >
          {/* Imagem do avatar com opacidade reduzida */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10 shadow-lg">
            <img
              src={avatar}
              alt={user.name}
              className="w-full h-full object-contain opacity-40"
              style={{ filter: "brightness(0.9)" }}
            />
          </div>

          <div className="text-center">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: c.tx }}
            >
              {user.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: c.tx }}>
              {user.role}
            </p>
          </div>

          {/* Badge de estado activo/inactivo */}
          <span
            className={`inline-flex items-center gap-1 text-xs px-3 py-0.5 rounded-full font-medium ${
              user.active
                ? "bg-[#EAF3DE] text-[#3B6D11]"
                : "bg-[#FCEBEB] text-[#A32D2D]"
            }`}
          >
            ● {user.active ? "Ativo" : "Inativo"}
          </span>

          {/* Contador de tarefas pendentes (oculto se zero) */}
          {pending > 0 && (
            <p className="text-xs text-muted">
              {pending} tarefa{pending !== 1 ? "s" : ""} pendente
              {pending !== 1 ? "s" : ""}
            </p>
          )}

          <p className="text-[10px] text-muted/60 mt-auto">
            ↻ clique para detalhes
          </p>
        </div>

        {/* ── VERSO: detalhes e acções ── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 rounded-xl border border-surface bg-surface-2 flex flex-col gap-1 p-3 overflow-hidden"
        >
          {/* Cabeçalho do verso com iniciais e email */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: c.bg, color: c.tx }}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-main truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Lista de detalhes do utilizador */}
          <ul className="flex flex-col gap-1 text-xs">
            {[
              { label: "ID", value: `#${user.id}` },
              { label: "Telemóvel", value: user.phone },
              { label: "Papel", value: user.role },
              { label: "Tarefas", value: (user.tasks || []).length },
            ].map(({ label, value }) => (
              <li
                key={label}
                className="flex items-center justify-between text-muted"
              >
                <span>{label}</span>
                <strong className="text-main font-medium">{value}</strong>
              </li>
            ))}
            <li className="flex items-center justify-between text-muted">
              <span>Estado</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  user.active
                    ? "bg-[#EAF3DE] text-[#3B6D11]"
                    : "bg-[#FCEBEB] text-[#A32D2D]"
                }`}
              >
                {user.active ? "Ativo" : "Inativo"}
              </span>
            </li>
          </ul>

          {/* Botões de acção: dashboard, activar/desactivar, eliminar */}
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-surface">
            {[
              {
                iconClass: "fas fa-tachometer-alt",
                title: "Ver dashboard",
                colorHover: "hover:bg-[#E6F1FB] hover:text-[#185FA5]",
                iconColor: "currentColor",
                onClick: () => onDashboard && onDashboard(user),
              },
              {
                iconClass: user.active
                  ? "fas fa-toggle-on"
                  : "fas fa-toggle-off",
                title: user.active ? "Desativar" : "Ativar",
                colorHover: "hover:bg-[#FAEEDA] hover:text-[#854F0B]",
                iconColor: c.tx,
                onClick: () => onToggle && onToggle(user.id),
              },
              {
                iconClass: "fas fa-trash",
                title: "Remover",
                colorHover: "hover:bg-[#FCEBEB] hover:text-[#A32D2D]",
                iconColor: "#A32D2D",
                onClick: () => onDelete && onDelete(user.id),
              },
            ].map(({ iconClass, title, colorHover, iconColor, onClick }) => (
              <button
                key={title}
                title={title}
                className={`w-8 h-8 rounded-md border border-surface bg-surface flex items-center justify-center text-sm text-muted transition-colors ${colorHover}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <i
                  className={iconClass}
                  aria-hidden="true"
                  style={{ color: iconColor }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
