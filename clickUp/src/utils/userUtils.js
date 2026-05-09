export const PALETTE = [
  { bg: '#EEEDFE', tx: '#3C3489' },
  { bg: '#E1F5EE', tx: '#085041' },
  { bg: '#FAECE7', tx: '#712B13' },
  { bg: '#E6F1FB', tx: '#0C447C' },
  { bg: '#EAF3DE', tx: '#27500A' },
  { bg: '#FAEEDA', tx: '#633806' },
];

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

export function getPalette(id) {
  return PALETTE[(id - 1) % PALETTE.length];
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
