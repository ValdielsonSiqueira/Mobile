import { Transaction, TransactionInput } from "../../types/transaction";

export interface TransactionFilters {
  type?: "income" | "expense" | "all";
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  lastDocId?: string | null;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  lastDoc: any;
  hasMore: boolean;
}

export interface ITransactionRepository {
  getTransactions(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedTransactions>;
  addTransaction(userId: string, data: TransactionInput): Promise<Transaction>;
  updateTransaction(
    userId: string,
    id: string,
    data: Partial<TransactionInput>,
  ): Promise<void>;
  deleteTransaction(userId: string, id: string): Promise<void>;
}
