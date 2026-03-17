import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  DocumentSnapshot,
  startAfter,
  limit,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { Transaction, TransactionInput } from '../types/transaction';

const PAGE_SIZE = 20;

/**
 * Normaliza um documento do Firestore para o formato Transaction.
 * Compatível com dados legados que usam amount+/- sem campo `type`.
 */
function normalizeTransaction(id: string, data: any): Transaction {
  const safeAmount = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Dados legados: sem campo `type`, amount pode ser negativo
  if (!data.type) {
    const rawAmount = safeAmount(data.amount);
    return {
      id,
      description: data.description ?? '',
      amount: Math.abs(rawAmount),
      type: rawAmount >= 0 ? 'income' : 'expense',
      category: data.category ?? 'outros',
      date: data.date ?? new Date().toISOString(),
      receiptUrl: data.receiptUrl,
      createdAt: data.createdAt,
    };
  }
  // Dados novos: com campo `type`
  return {
    id,
    ...data,
    amount: Math.abs(safeAmount(data.amount)),
  } as Transaction;
}


interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;

  /** Totais calculados */
  totalIncome: number;
  totalExpense: number;
  balance: number;

  /** Ações */
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchMore: () => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<string>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  refresh: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionProvider');
  return ctx;
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({});

  // ─── Totais derivados ────────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    if (!currentFilters.search) return transactions;
    const term = currentFilters.search.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(term) || 
      t.category.toLowerCase().includes(term)
    );
  }, [transactions, currentFilters.search]);

  const totalIncome = transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc),
    0
  );
  const totalExpense = transactions.reduce(
    (acc, t) => (t.type === 'expense' ? acc + t.amount : acc),
    0
  );
  const balance = totalIncome - totalExpense;

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const baseCollection = useCallback(
    () => collection(db, 'users', user!.uid, 'transactions'),
    [user]
  );

  const buildConstraints = (filters: TransactionFilters, afterDoc?: DocumentSnapshot | null): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];

    if (filters.type && filters.type !== 'all') {
      constraints.push(where('type', '==', filters.type));
    }
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.startDate) {
      constraints.push(where('date', '>=', filters.startDate.toISOString()));
    }
    if (filters.endDate) {
      constraints.push(where('date', '<=', filters.endDate.toISOString()));
    }
    if (afterDoc) {
      constraints.push(startAfter(afterDoc));
    }
    constraints.push(limit(PAGE_SIZE));
    return constraints;
  };

  // ─── Fetch (primeira página) ──────────────────────────────────────────────────
  const fetchTransactions = useCallback(
    async (filters: TransactionFilters = {}) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      try {
        const q = query(baseCollection(), ...buildConstraints(filters));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((d) => normalizeTransaction(d.id, d.data()));
        setTransactions(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (e: any) {
        setError(e.message ?? 'Erro ao carregar transações.');
      } finally {
        setLoading(false);
      }
    },
    [user, baseCollection]
  );

  // ─── Fetch mais (paginação) ───────────────────────────────────────────────────
  const fetchMore = useCallback(async () => {
    if (!user || !hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const q = query(baseCollection(), ...buildConstraints(currentFilters, lastDoc));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => normalizeTransaction(d.id, d.data()));
      setTransactions((prev) => [...prev, ...docs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar mais transações.');
    } finally {
      setLoadingMore(false);
    }
  }, [user, hasMore, loadingMore, lastDoc, currentFilters, baseCollection]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────────
  const addTransaction = useCallback(
    async (data: TransactionInput): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');
      const docRef = await addDoc(baseCollection(), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      const newTx: Transaction = { id: docRef.id, ...data, createdAt: new Date().toISOString() };
      setTransactions((prev) => [newTx, ...prev]);
      return docRef.id;
    },
    [user, baseCollection]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<TransactionInput>) => {
      if (!user) throw new Error('Usuário não autenticado.');
      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), data as any);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado.');
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [user]
  );

  const getTransactionById = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions]
  );

  const refresh = useCallback(() => fetchTransactions(currentFilters), [fetchTransactions, currentFilters]);

  // ─── Auto-fetch quando user loga ──────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLastDoc(null);
    }
  }, [user]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        loading,
        loadingMore,
        hasMore,
        error,
        totalIncome,
        totalExpense,
        balance,
        fetchTransactions,
        fetchMore,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionById,
        refresh,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
