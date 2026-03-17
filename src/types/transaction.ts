export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;           // sempre positivo; o type define se é receita ou despesa
  type: TransactionType;
  category: string;         // valor de CATEGORIES[n].value
  date: string;             // ISO string
  receiptUrl?: string;      // URL do Firebase Storage (opcional)
  createdAt?: string;       // ISO string
}

/** Dados usados ao criar/editar uma transação (sem id) */
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
