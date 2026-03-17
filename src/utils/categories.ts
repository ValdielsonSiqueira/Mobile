export interface Category {
  label: string;
  value: string;
  type: 'income' | 'expense' | 'both';
  color: string;
}

export const CATEGORIES: Category[] = [
  { label: 'Alimentação',    value: 'alimentacao',    type: 'expense', color: '#f97316' },
  { label: 'Saúde',          value: 'saude',          type: 'expense', color: '#ef4444' },
  { label: 'Transporte',     value: 'transporte',     type: 'expense', color: '#8b5cf6' },
  { label: 'Lazer',          value: 'lazer',          type: 'expense', color: '#ec4899' },
  { label: 'Moradia',        value: 'moradia',        type: 'expense', color: '#06b6d4' },
  { label: 'Educação',       value: 'educacao',       type: 'expense', color: '#3b82f6' },
  { label: 'Vestuário',      value: 'vestuario',      type: 'expense', color: '#a855f7' },
  { label: 'Tecnologia',     value: 'tecnologia',     type: 'expense', color: '#6366f1' },
  { label: 'Salário',        value: 'salario',        type: 'income',  color: '#22c55e' },
  { label: 'Freelance',      value: 'freelance',      type: 'income',  color: '#16a34a' },
  { label: 'Investimentos',  value: 'investimentos',  type: 'income',  color: '#15803d' },
  { label: 'Outros',         value: 'outros',         type: 'both',    color: '#64748b' },
];

export const getCategoryByValue = (value: string): Category | undefined =>
  CATEGORIES.find((c) => c.value === value);

export const getCategoryColor = (value: string): string =>
  getCategoryByValue(value)?.color ?? '#64748b';

export const getCategoryLabel = (value: string): string =>
  getCategoryByValue(value)?.label ?? value;
