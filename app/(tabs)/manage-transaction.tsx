import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTransactions } from '../../src/contexts/TransactionContext';
import { useUploadReceipt } from '../../src/hooks/useUploadReceipt';
import { CATEGORIES } from '../../src/utils/categories';
import { Toast } from '../../src/components/Toast';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Camera, 
  FileText, 
  Check, 
  X,
  Plus,
  Trash2
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useColorScheme } from 'nativewind';

const transactionSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Selecione uma categoria'),
  date: z.string(), // Mais flexível que .datetime()
  receiptUrl: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function ManageTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  
  const { getTransactionById, addTransaction, updateTransaction } = useTransactions();
  const { upload, uploading, progress } = useUploadReceipt();

  const [isEdit, setIsEdit] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [receiptFile, setReceiptFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString(),
      category: '',
    },
  });

  const currentType = watch('type');
  const currentDate = new Date(watch('date'));
  const currentCategoryLabel = CATEGORIES.find(c => c.value === watch('category'))?.label ?? 'Selecione';

  useEffect(() => {
    if (id) {
      const tx = getTransactionById(id);
      if (tx) {
        setIsEdit(true);
        reset({
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          receiptUrl: tx.receiptUrl,
        });
      }
    }
  }, [id, getTransactionById, reset]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setReceiptFile({
        uri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setReceiptFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/pdf',
      });
    }
  };

  const handleSave = async (data: TransactionFormData) => {
    if (!user) return;

    try {
      let finalReceiptUrl = data.receiptUrl;

      // Se houver um novo arquivo de recibo, faz o upload
      if (receiptFile) {
        const uploadResult = await upload(receiptFile.uri, user.uid, receiptFile.name);
        finalReceiptUrl = uploadResult.url;
      }

      const transactionData = {
        ...data,
        receiptUrl: finalReceiptUrl,
      };

      if (isEdit && id) {
        await updateTransaction(id, transactionData);
        showToast('Transação atualizada!', 'success');
      } else {
        await addTransaction(transactionData);
        showToast('Transação salva!', 'success');
      }

      // Redireciona para o Histórico após 1s
      setTimeout(() => router.push('/(tabs)/transactions'), 1000);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar transação', 'error');
    }
  };

  const onValidationError = () => {
    showToast('Verifique os campos obrigatórios!', 'warning');
  };

  const bgColor = dark ? '#0f172a' : '#f8fafc';
  const cardBg = dark ? '#1e293b' : '#ffffff';
  const textMain = dark ? '#f1f5f9' : '#0f172a';
  const textSub = dark ? '#94a3b8' : '#64748b';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor }]}>
            <ArrowLeft size={24} color={textMain} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textMain }]}>
            {isEdit ? 'Editar Transação' : 'Nova Transação'}
          </Text>
        </View>

        {/* Tipo Toggle */}
        <View style={[styles.typeContainer, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity 
            onPress={() => setValue('type', 'expense')}
            style={[styles.typeTab, currentType === 'expense' && styles.typeTabExpense]}
          >
            <Text style={[styles.typeText, currentType === 'expense' ? styles.typeTextActive : { color: textSub }]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setValue('type', 'income')}
            style={[styles.typeTab, currentType === 'income' && styles.typeTabIncome]}
          >
            <Text style={[styles.typeText, currentType === 'income' ? styles.typeTextActive : { color: textSub }]}>Receita</Text>
          </TouchableOpacity>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Valor */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textSub }]}>Valor</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View style={styles.amountContainer}>
                  <Text style={[styles.currency, { color: textMain }]}>R$</Text>
                  <TextInput
                    style={[styles.amountInput, { color: textMain }]}
                    placeholder="0,00"
                    placeholderTextColor={textSub}
                    keyboardType="numeric"
                    value={value ? String(value) : ''}
                    onChangeText={(text) => {
                      const normalized = text.replace(',', '.');
                      onChange(normalized);
                    }}
                  />
                </View>
              )}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textSub }]}>Descrição</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: cardBg, borderColor, color: textMain }]}
                  placeholder="Ex: Aluguel, Supermercado..."
                  placeholderTextColor={textSub}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
          </View>

          <View style={styles.row}>
            {/* Categoria */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: textSub }]}>Categoria</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(true)}
                style={[styles.pickerBtn, { backgroundColor: cardBg, borderColor }]}
              >
                <Text style={{ color: watch('category') ? textMain : textSub }}>
                  {currentCategoryLabel}
                </Text>
                <Plus size={18} color={textSub} />
              </TouchableOpacity>
              {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
            </View>

            {/* Data */}
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: textSub }]}>Data</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.pickerBtn, { backgroundColor: cardBg, borderColor }]}
              >
                <Text style={{ color: textMain }}>
                  {format(currentDate, 'dd/MM/yyyy')}
                </Text>
                <CalendarIcon size={18} color={textSub} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Upload de Recibo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textSub }]}>Recibo (Opcional)</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity 
                onPress={pickImage}
                style={[styles.uploadBtn, { backgroundColor: cardBg, borderColor }]}
              >
                <Camera size={20} color={textSub} />
                <Text style={[styles.uploadBtnText, { color: textSub }]}>Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickDocument}
                style={[styles.uploadBtn, { backgroundColor: cardBg, borderColor }]}
              >
                <FileText size={20} color={textSub} />
                <Text style={[styles.uploadBtnText, { color: textSub }]}>PDF</Text>
              </TouchableOpacity>
            </View>
            
            {(receiptFile || watch('receiptUrl')) && (
              <View style={[styles.receiptPreview, { backgroundColor: cardBg, borderColor }]}>
                <Check size={18} color="#22c55e" />
                <Text style={[styles.receiptName, { color: textMain }]} numberOfLines={1}>
                  {receiptFile ? receiptFile.name : 'Recibo Anexado'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setReceiptFile(null);
                  setValue('receiptUrl', '');
                }}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            {uploading && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                <Text style={styles.progressText}>Fazendo upload... {progress}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleSubmit(handleSave, onValidationError)}
          disabled={isSubmitting || uploading}
          style={[
            styles.saveBtn,
            { backgroundColor: currentType === 'income' ? '#22c55e' : '#ef4444' },
            (isSubmitting || uploading) && { opacity: 0.6 }
          ]}
        >
          {isSubmitting || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Atualizar Transação' : 'Salvar Transação'}
            </Text>
          )}
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Excluir Transação',
                'Tem certeza que deseja excluir esta transação?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteTransaction(id!);
                        showToast('Transação excluída!', 'success');
                        setTimeout(() => router.back(), 1500);
                      } catch (e: any) {
                        showToast(e.message, 'error');
                      }
                    }
                  }
                ]
              );
            }}
            style={[styles.deleteBtn, { borderColor }]}
          >
            <Trash2 size={20} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Excluir Transação</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modais / Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setValue('date', selectedDate.toISOString());
            }
          }}
        />
      )}

      {showCategoryPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setShowCategoryPicker(false)} />
          <View style={[styles.categoryModal, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textMain }]}>Escolha a Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <X size={24} color={textSub} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {CATEGORIES.filter(c => c.type === currentType || c.type === 'both').map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoryOption, { borderBottomColor: borderColor }]}
                  onPress={() => {
                    setValue('category', cat.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                    <Text style={{ color: cat.color, fontWeight: 'bold' }}>{cat.label[0]}</Text>
                  </View>
                  <Text style={[styles.categoryLabel, { color: textMain }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
  typeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeTabExpense: {
    backgroundColor: '#ef4444',
  },
  typeTabIncome: {
    backgroundColor: '#22c55e',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#fff',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currency: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    flex: 1,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  pickerBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    fontWeight: '700',
  },
  receiptPreview: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  receiptName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '600',
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
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
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalClose: {
    flex: 1,
  },
  categoryModal: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  categoryList: {
    marginBottom: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
