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
} from "firebase/firestore";
import {
  ITransactionRepository,
  PaginatedTransactions,
  TransactionFilters,
} from "../../domain/repositories/ITransactionRepository";
import { db } from "../../firebase/config";
import { Transaction, TransactionInput } from "../../types/transaction";

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
      description: data.description ?? "",
      amount: Math.abs(rawAmount),
      type: rawAmount >= 0 ? "income" : "expense",
      category: data.category ?? "outros",
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

export class FirebaseTransactionRepository implements ITransactionRepository {
  private baseCollection(userId: string) {
    return collection(db, "users", userId, "transactions");
  }

  private buildConstraints(
    filters: TransactionFilters = {},
    afterDoc?: DocumentSnapshot | null,
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [orderBy("date", "desc")];

    if (filters.type && filters.type !== "all") {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters.startDate) {
      constraints.push(where("date", ">=", filters.startDate.toISOString()));
    }
    if (filters.endDate) {
      constraints.push(where("date", "<=", filters.endDate.toISOString()));
    }
    if (afterDoc) {
      constraints.push(startAfter(afterDoc));
    }
    constraints.push(limit(PAGE_SIZE));
    return constraints;
  }

  async getTransactions(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedTransactions> {
    const constraints = this.buildConstraints(
      filters,
      filters?.lastDocId as any,
    );
    const q = query(this.baseCollection(userId), ...constraints);
    const snapshot = await getDocs(q);

    const transactions = snapshot.docs.map((d) =>
      normalizeTransaction(d.id, d.data()),
    );

    return {
      transactions,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  }

  async addTransaction(
    userId: string,
    data: TransactionInput,
  ): Promise<Transaction> {
    const docRef = await addDoc(this.baseCollection(userId), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...data, createdAt: new Date().toISOString() };
  }

  async updateTransaction(
    userId: string,
    id: string,
    data: Partial<TransactionInput>,
  ): Promise<void> {
    const docRef = doc(db, "users", userId, "transactions", id);
    await updateDoc(docRef, data as any);
  }

  async deleteTransaction(userId: string, id: string): Promise<void> {
    const docRef = doc(db, "users", userId, "transactions", id);
    await deleteDoc(docRef);
  }
}
