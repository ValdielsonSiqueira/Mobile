import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { TransactionFilters } from "../../domain/repositories/ITransactionRepository";
import { FirebaseTransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";
import { TransactionInput } from "../../types/transaction";

const repository = new FirebaseTransactionRepository();

export const QUERY_KEYS = {
  transactions: (userId: string, filters?: TransactionFilters) => [
    "transactions",
    userId,
    filters,
  ],
  transactionStats: (userId: string) => ["transactionStats", userId],
};

export function useTransactionsQuery(filters?: TransactionFilters) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.transactions(user?.uid || "", filters),
    queryFn: async ({ pageParam }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const currentFilters = { ...filters, lastDocId: pageParam };
      return repository.getTransactions(user.uid, currentFilters);
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.lastDoc;
    },
    enabled: !!user,
  });
}

export function useTransactionMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: TransactionInput) => {
      if (!user) throw new Error("Usuário não autenticado");
      return repository.addTransaction(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.uid] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TransactionInput>;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");
      return repository.updateTransaction(user.uid, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      return repository.deleteTransaction(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.uid] });
    },
  });

  return {
    addTransaction: addMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
