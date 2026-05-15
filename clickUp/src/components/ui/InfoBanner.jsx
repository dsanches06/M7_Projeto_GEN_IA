// Banner informativo acessível com suporte a tipos (info, erro, aviso, etc.)
export function InfoBanner({ message, type = 'info', isVisible = true }) {
  // Classe de tipo para estilização via CSS (ex: banner--info, banner--error)
  const typeClass = `banner--${type}`;
  // Classe de visibilidade para animar entrada/saída
  const visibleClass = isVisible ? 'banner--visible' : '';

  return (
    <div className={`banner ${typeClass} ${visibleClass}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
