import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfirmationModal } from '../../src/components/ConfirmationModal';
import { Toast } from '../../src/components/Toast';
import { ReceiptFile, TransactionForm, TransactionFormData } from '../../src/components/TransactionForm';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTransactionMutations, useTransactionsQuery } from '../../src/application/hooks/useTransactionsQuery';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useUploadReceipt } from '../../src/hooks/useUploadReceipt';

export default function ManageTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { bgColor, textMain, borderColor } = useThemeColors();
  
  const { data } = useTransactionsQuery();
  const getTransactionById = React.useCallback((txId: string) => {
    if (!data) return undefined;
    for (const page of data.pages) {
      const tx = page.transactions.find(t => t.id === txId);
      if (tx) return tx;
    }
    return undefined;
  }, [data]);

  const tx = id ? getTransactionById(id) : undefined;
  const isEdit = !!tx;

  const { 
    addTransaction, 
    updateTransaction,
    deleteTransaction,
    isAdding,
    isUpdating,
    isDeleting
  } = useTransactionMutations();
  const { upload, uploading, progress } = useUploadReceipt();

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleSave = async (formData: TransactionFormData, receiptFile: ReceiptFile | null) => {
    if (!user) return;

    try {
      let finalReceiptUrl = formData.receiptUrl || null;

      if (receiptFile) {
        const uploadResult = await upload(receiptFile.uri, user.uid, receiptFile.name);
        finalReceiptUrl = uploadResult.url;
      }

      const transactionData = {
        ...formData,
        receiptUrl: finalReceiptUrl,
      };

      if (isEdit && id) {
        await updateTransaction({ id, data: transactionData });
        showToast('Transação atualizada!', 'success');
      } else {
        await addTransaction(transactionData);
        showToast('Transação salva!', 'success');
      }

      setTimeout(() => router.push('/(tabs)/transactions'), 1000);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar transação', 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor }]}>
            <ArrowLeft size={24} color={textMain} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textMain }]}>
            {isEdit ? 'Editar Transação' : 'Nova Transação'}
          </Text>
        </View>

        <TransactionForm 
          initialData={tx} 
          onSubmit={handleSave} 
          uploading={uploading} 
          isSaving={isAdding || isUpdating} 
          uploadProgress={progress}
        />

        {isEdit && (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            style={[styles.deleteBtn, { borderColor }, isDeleting && { opacity: 0.6 }]}
          >
            {isDeleting ? <ActivityIndicator color="#ef4444" /> : <Trash2 size={20} color="#ef4444" />}
            <Text style={styles.deleteBtnText}>Excluir Transação</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Excluir Transação?"
        description="Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Excluir"
        cancelLabel="Voltar"
        onConfirm={async () => {
          try {
            if (!id) throw new Error('ID da transação não encontrado.');
            await deleteTransaction(id);
            
            setShowDeleteConfirm(false);
            showToast('Transação excluída!', 'success');
            setTimeout(() => router.push('/(tabs)/transactions'), 1000);
          } catch (e: any) {
            setShowDeleteConfirm(false);
            showToast(e.message || 'Erro ao excluir transação', 'error');
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        type="delete"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  deleteBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
