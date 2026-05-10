export const STATUS_COLUMNS = [
  'CREATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
  'ARCHIVED',
];

export const STATUS_COLOR = {
  CREATED:     '#185FA5',
  ASSIGNED:    '#1D9E75',
  IN_PROGRESS: '#BA7517',
  BLOCKED:     '#A32D2D',
  COMPLETED:   '#3B6D11',
  ARCHIVED:    '#5F5E5A',
};

function seedFromValue(value) {
  const str = `${value}`;
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function toHSL(seed) {
  const hue = Math.floor((seed * 137.508) % 360);
  const saturation = 55 + ((seed >> 4) % 30); // 55-84%
  const lightness = 48 + ((seed >> 10) % 22); // 48-69%
  return { hue, saturation, lightness };
}

export function getPalette(id) {
  const seed = seedFromValue(`${id}`);
  const { hue, saturation, lightness } = toHSL(seed);
  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const tx = lightness > 58 ? '#111827' : '#F8FAFC';

  return { bg, tx };
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
