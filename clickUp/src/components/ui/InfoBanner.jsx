export function InfoBanner({ message, type = 'info', isVisible = true }) {
  const typeClass = `banner--${type}`;
  const visibleClass = isVisible ? 'banner--visible' : '';

  return (
    <div className={`banner ${typeClass} ${visibleClass}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
