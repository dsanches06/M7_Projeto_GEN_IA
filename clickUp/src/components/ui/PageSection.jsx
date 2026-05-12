export function PageSection({ title, description }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-main mb-2">{title}</h2>
        <p className="text-muted">{description}</p>
      </div>

      <div className="bg-surface-2 border border-surface rounded-lg p-8 shadow-sm">
        <p className="text-main text-lg">
          Página de <span className="font-semibold">{title}</span>. Conteúdo específico será adicionado em breve.
        </p>
      </div>
    </div>
  );
}
