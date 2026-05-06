import { Outlet, Link } from "react-router";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import expenseLogo from "../assets/expense.png";
import "../styles/MainLayout.css";

// Layout principal da aplicação
// Contém a barra lateral de navegação, o botão de alternar tema,
// e o espaço principal onde as páginas são renderizadas através do Outlet
const MainLayout = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app ${theme}`}>
      <div className={`layout-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="sidebar-trigger" />
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="logo-container">
            <Link to="/" className="logo-link" onClick={() => setSidebarOpen(false)}>
              <img
                className="nav-logo"
                src={expenseLogo}
                alt="logotipo do app"
              />
            </Link>
          </div>

          <nav className="sidebar-nav">
            <Link to="/" onClick={() => setSidebarOpen(false)}>Painel Dashboard</Link>
            <Link to="/adicionar" onClick={() => setSidebarOpen(false)}>Nova Transação</Link>
            <Link to="/historico" onClick={() => setSidebarOpen(false)}>Histórico</Link>
            <Link to="/estatisticas" onClick={() => setSidebarOpen(false)}>Estatisticas</Link>
            <Link to="/definicoes" onClick={() => setSidebarOpen(false)}>Definições</Link>
          </nav>
        </aside>

        <div className="main-content">
          <header className="app-header">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Menu"
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title="Alternar tema"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </header>

          <main>
            <Outlet /> {/* ← as páginas renderizam aqui */}
          </main>

          <footer>
            <p>Desenvolvido por Abel Pinto e Danilson Sanches.</p>
            <p>M6: Frontend: React &amp; Next.js</p>
            <p>Front End + AI - UPSKILL 2025 - 2026</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
