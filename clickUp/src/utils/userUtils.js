// Colunas de status para uso em tabelas ou listas
export const STATUS_COLUMNS = [
  'CREATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
  'ARCHIVED',
];

// Cores associadas a cada status para uso em badges, etiquetas, etc.
export const STATUS_COLOR = {
  CREATED:     '#185FA5',
  ASSIGNED:    '#1D9E75',
  IN_PROGRESS: '#BA7517',
  BLOCKED:     '#A32D2D',
  COMPLETED:   '#3B6D11',
  ARCHIVED:    '#5F5E5A',
};

// Gera um número inteiro a partir de uma string, para uso como semente de cor
function seedFromValue(value) {
  const str = `${value}`;
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Converte um número em uma cor HSL, garantindo variedade e legibilidade
function toHSL(seed) {
  const hue = Math.floor((seed * 137.508) % 360);
  const saturation = 55 + ((seed >> 4) % 30); // 55-84%
  const lightness = 48 + ((seed >> 10) % 22); // 48-69%
  return { hue, saturation, lightness };
}

// Gera uma paleta de cores consistente a partir de um ID (ex: user_id, project_id)
export function getPalette(id) {
  const seed = seedFromValue(`${id}`);
  const { hue, saturation, lightness } = toHSL(seed);
  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  // Texto escuro ou claro consoante a luminosidade do fundo
  const tx = lightness > 58 ? '#111827' : '#F8FAFC';

  return { bg, tx };
}

/* Gera as iniciais de um nome para uso em avatares ou badges */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
