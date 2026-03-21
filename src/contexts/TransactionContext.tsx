import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../firebase/config';
import { Transaction, TransactionInput } from '../types/transaction';
import { useAuth } from './AuthContext';

const PAGE_SIZE = 20;

function normalizeTransaction(id: string, data: any): Transaction {
  const safeAmount = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

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
  totalIncome: number;
  totalExpense: number;
  balance: number;
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (currentFilters.search) {
        const term = currentFilters.search.toLowerCase();
        const matchesSearch = t.description.toLowerCase().includes(term) || 
                            t.category.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      if (currentFilters.type && currentFilters.type !== 'all') {
        if (t.type !== currentFilters.type) return false;
      }
      if (currentFilters.category) {
        if (t.category !== currentFilters.category) return false;
      }

      if (currentFilters.startDate) {
        const txDate = new Date(t.date);
        if (txDate < currentFilters.startDate) return false;
      }
      if (currentFilters.endDate) {
        const txDate = new Date(t.date);
        const endOfSelectedContent = new Date(currentFilters.endDate);
        endOfSelectedContent.setHours(23, 59, 59, 999);
        if (txDate > endOfSelectedContent) return false;
      }

      return true;
    });
  }, [
    transactions, 
    currentFilters.search, 
    currentFilters.type, 
    currentFilters.category, 
    currentFilters.startDate, 
    currentFilters.endDate
  ]);

  const totalIncome = transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc),
    0
  );
  const totalExpense = transactions.reduce(
    (acc, t) => (t.type === 'expense' ? acc + t.amount : acc),
    0
  );
  const balance = totalIncome - totalExpense;

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

  const fetchTransactions = useCallback(
    async (filters: TransactionFilters = {}) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      try {
        const constraints = buildConstraints(filters);
        const q = query(baseCollection(), ...constraints);
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((d) => normalizeTransaction(d.id, d.data()));
        
        setTransactions(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (e: any) {
        if (e.message?.includes('requires an index')) {
          setError('Esta consulta precisa de um índice no Firebase. Verifique o console do terminal para o link de criação.');
        } else {
          setError(e.message ?? 'Erro ao carregar transações.');
        }
      } finally {
        setLoading(false);
      }
    },
    [user, baseCollection]
  );

  const fetchMore = useCallback(async () => {
    if (!user || !hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const constraints = buildConstraints(currentFilters, lastDoc);
      const q = query(baseCollection(), ...constraints);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => normalizeTransaction(d.id, d.data()));
      setTransactions((prev) => [...prev, ...docs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (e: any) {
      if (e.message?.includes('requires an index')) {
        setError('Erro de índice na paginação. Verifique o console.');
      } else {
        setError(e.message ?? 'Erro ao carregar mais transações.');
      }
    } finally {
      setLoadingMore(false);
    }
  }, [user, hasMore, loadingMore, lastDoc, currentFilters, baseCollection]);

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
