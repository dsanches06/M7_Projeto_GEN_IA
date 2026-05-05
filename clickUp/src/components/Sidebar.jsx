export function Sidebar() {
  return (
    <aside className="bg-[#1a1a1a] border-r border-[#333333] w-64 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">ESPAÇOS</h2>
        <nav className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
            📊 Meu Espaço
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
            👥 Times
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
            ⭐ Favoritos
          </button>
        </nav>

        <div className="mt-6 border-t border-[#333333] pt-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">PROJETOS</h2>
          <nav className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
              📁 Frontend
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
              📁 Backend
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition">
              📁 Design
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
