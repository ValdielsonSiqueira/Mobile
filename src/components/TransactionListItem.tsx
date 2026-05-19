import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "expo-router"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useThemeColors } from "../hooks/useThemeColors"
import { Transaction } from "../types/transaction"
import { CategoryBadge } from "./CategoryBadge"

interface TransactionListItemProps {
  transaction: Transaction
  hideValues?: boolean
}

export function TransactionListItem({
  transaction,
  hideValues,
}: TransactionListItemProps) {
  const router = useRouter()
  const { cardBg, textMain, textSub, borderColor, palette } = useThemeColors()
  const isIncome = transaction.type === "income"

  return (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: cardBg, borderColor }]}
      onPress={() =>
        router.push({
          pathname: "./manage-transaction",
          params: { id: transaction.id },
        })
      }
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isIncome
              ? palette.success.transparent
              : palette.danger.transparent,
          },
        ]}
      >
        {isIncome ? (
          <ArrowUpRight size={20} color={palette.success.DEFAULT} />
        ) : (
          <ArrowDownLeft size={20} color={palette.danger.DEFAULT} />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text
          style={[styles.description, { color: textMain }]}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <View style={styles.subDetails}>
          <CategoryBadge category={transaction.category} />
          <Text style={[styles.dot, { color: textSub }]}>•</Text>
          <Text style={[styles.date, { color: textSub }]}>
            {format(new Date(transaction.date), "dd MMM", { locale: ptBR })}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          {
            color: isIncome ? palette.success.DEFAULT : palette.danger.DEFAULT,
          },
        ]}
      >
        {hideValues
          ? "••••••••"
          : `${isIncome ? "+" : "-"} ${transaction.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
  },
})
