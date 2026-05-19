import { palette } from '../assets/tokens/colors';

export interface Category {
  label: string;
  value: string;
  type: 'income' | 'expense' | 'both';
  color: string;
}

export const CATEGORIES: Category[] = [
  { label: 'Alimentação',    value: 'alimentacao',    type: 'expense', color: palette.categories.orange },
  { label: 'Saúde',          value: 'saude',          type: 'expense', color: palette.danger.DEFAULT },
  { label: 'Transporte',     value: 'transporte',     type: 'expense', color: palette.categories.violet },
  { label: 'Lazer',          value: 'lazer',          type: 'expense', color: palette.categories.pink },
  { label: 'Moradia',        value: 'moradia',        type: 'expense', color: palette.categories.cyan },
  { label: 'Educação',       value: 'educacao',       type: 'expense', color: palette.primary.DEFAULT },
  { label: 'Vestuário',      value: 'vestuario',      type: 'expense', color: palette.categories.purple },
  { label: 'Tecnologia',     value: 'tecnologia',     type: 'expense', color: palette.categories.indigo },
  { label: 'Salário',        value: 'salario',        type: 'income',  color: palette.success.DEFAULT },
  { label: 'Freelance',      value: 'freelance',      type: 'income',  color: palette.categories.green600 },
  { label: 'Investimentos',  value: 'investimentos',  type: 'income',  color: palette.categories.green700 },
  { label: 'Outros',         value: 'outros',         type: 'both',    color: palette.slate[500] },
];

export const getCategoryByValue = (value: string): Category | undefined =>
  CATEGORIES.find((c) => c.value === value);

export const getCategoryColor = (value: string): string =>
  getCategoryByValue(value)?.color ?? palette.slate[500];

export const getCategoryLabel = (value: string): string =>
  getCategoryByValue(value)?.label ?? value;
