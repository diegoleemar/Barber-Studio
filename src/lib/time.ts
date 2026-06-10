export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
] as const;

export const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
] as const;

export const pad = (n: number) => n.toString().padStart(2, '0');

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const minutesToTime = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const formatHora12 = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${period}`;
};

export const formatFechaLarga = (date: Date) =>
  `${DIAS_SEMANA[date.getDay()]}, ${date.getDate()} de ${MESES[date.getMonth()]}`;

export const generateSlots = (
  inicio: string,
  fin: string,
  intervalo: number
): string[] => {
  const start = timeToMinutes(inicio);
  const end = timeToMinutes(fin);
  const slots: string[] = [];
  for (let t = start; t + intervalo <= end; t += intervalo) {
    slots.push(minutesToTime(t));
  }
  return slots;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
