import { ProcessCategoryItem } from '../types';

export interface CategoryColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorOption> = {
  sky: { id: 'sky', name: 'Himmelblau', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  emerald: { id: 'emerald', name: 'Smaragdgrün', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  amber: { id: 'amber', name: 'Bernstein / Gelb', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  indigo: { id: 'indigo', name: 'Indigo / Blau', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  violet: { id: 'violet', name: 'Violett / Lila', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  red: { id: 'red', name: 'Rot', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  orange: { id: 'orange', name: 'Orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  cyan: { id: 'cyan', name: 'Cyan / Türkis', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  rose: { id: 'rose', name: 'Rosa / Pink', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  slate: { id: 'slate', name: 'Schiefer / Grau', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-500' },
  teal: { id: 'teal', name: 'Petrol / Teal', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  fuchsia: { id: 'fuchsia', name: 'Fuchsia / Magenta', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500' },
};

export function getCategoryBadgeStyle(colorKey: string = 'slate'): CategoryColorOption {
  return CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.slate;
}

export function findCategory(categories: ProcessCategoryItem[], catIdOrName: string): ProcessCategoryItem {
  const match = categories.find(c => c.id === catIdOrName || c.name.toLowerCase() === catIdOrName.toLowerCase());
  return match || {
    id: catIdOrName,
    name: catIdOrName || 'Allgemein',
    color: 'slate',
  };
}
