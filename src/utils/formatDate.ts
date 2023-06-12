import { format, parseISO } from 'date-fns';

export const formatDateToBR = (d: Date | null) => {
  if (!d) return '';

  return d instanceof Date
    ? format(d, 'dd/MM/yyyy')
    : format(parseISO(d), 'dd/MM/yyyy');
};
export const formatDateToUS = (d: Date | null) => {
  if (!d) return '';

  return d instanceof Date
    ? format(d, 'yyyy-MM-dd')
    : format(parseISO(d), 'yyyy-MM-dd');
};
