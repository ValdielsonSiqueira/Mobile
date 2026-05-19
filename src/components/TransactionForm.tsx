import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Calendar as CalendarIcon, Camera, Check, Eye, FileText, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import { useThemeColors } from '../hooks/useThemeColors';
import { CATEGORIES } from '../utils/categories';
import { TransactionTypeSelector } from './TransactionTypeSelector';

export const transactionSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Selecione uma categoria'),
  date: z.string(), 
  receiptUrl: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type ReceiptFile = { uri: string; name: string; type: string };

interface TransactionFormProps {
  initialData?: any; // any to avoid circular import if needed, or Transaction
  onSubmit: (data: TransactionFormData, receiptFile: ReceiptFile | null) => Promise<void>;
  uploading: boolean;
  isSaving: boolean;
  uploadProgress?: number;
}

export function TransactionForm({ initialData, onSubmit, uploading, isSaving, uploadProgress }: TransactionFormProps) {
  const { cardBg, textMain, textSub, borderColor, palette } = useThemeColors();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [receiptFile, setReceiptFile] = useState<ReceiptFile | null>(null);
  
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

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
  const currentDate = new Date(watch('date') || new Date().toISOString());
  const currentCategoryLabel = CATEGORIES.find(c => c.value === watch('category'))?.label ?? 'Selecione';

  useEffect(() => {
    if (initialData) {
      reset({
        description: initialData.description,
        amount: initialData.amount,
        type: initialData.type,
        category: initialData.category,
        date: initialData.date,
        receiptUrl: initialData.receiptUrl,
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date().toISOString(),
        receiptUrl: '',
      });
      setReceiptFile(null);
    }
  }, [initialData, reset]);

  const handleViewReceipt = async () => {
    const url = receiptFile?.uri || watch('receiptUrl');
    if (!url) return;

    const isPdf = receiptFile 
      ? receiptFile.type === 'application/pdf'
      : url.toLowerCase().includes('.pdf');

    if (isPdf) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        // failed silently or handle via parent
      }
    } else {
      setViewerUri(url);
      setShowReceiptViewer(true);
    }
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

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data, receiptFile);
  };

  const isButtonDisabled = isSubmitting || uploading || isSaving;

  return (
    <View style={styles.formContainer}>
      <TransactionTypeSelector 
        currentType={currentType} 
        onChange={(type) => setValue('type', type)} 
      />

      <View style={styles.form}>
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
          {errors.amount && <Text style={[styles.errorText, { color: palette.danger.DEFAULT }]}>{errors.amount.message}</Text>}
        </View>

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
          {errors.description && <Text style={[styles.errorText, { color: palette.danger.DEFAULT }]}>{errors.description.message}</Text>}
        </View>

        <View style={styles.row}>
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
            {errors.category && <Text style={[styles.errorText, { color: palette.danger.DEFAULT }]}>{errors.category.message}</Text>}
          </View>

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
              <Check size={18} color={palette.success.DEFAULT} />
              <TouchableOpacity onPress={handleViewReceipt} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.receiptName, { color: textMain }]} numberOfLines={1}>
                  {receiptFile ? receiptFile.name : 'Recibo Anexado'}
                </Text>
                <Eye size={18} color={textSub} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setReceiptFile(null);
                setValue('receiptUrl', '');
              }}>
                <Trash2 size={18} color={palette.danger.DEFAULT} />
              </TouchableOpacity>
            </View>
          )}

          {uploading && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress || 0}%`, backgroundColor: palette.primary.DEFAULT }]} />
              <Text style={[styles.progressText, { color: palette.primary.DEFAULT }]}>Fazendo upload... {uploadProgress || 0}%</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isButtonDisabled}
        style={[
          styles.saveBtn,
          { backgroundColor: currentType === 'income' ? palette.success.DEFAULT : palette.danger.DEFAULT },
          isButtonDisabled && { opacity: 0.6 }
        ]}
      >
        {isButtonDisabled ? (
          <ActivityIndicator color={palette.white} />
        ) : (
          <Text style={[styles.saveBtnText, { color: palette.white }]}>
            {initialData ? 'Atualizar Transação' : 'Nova Transação'}
          </Text>
        )}
      </TouchableOpacity>

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
    
      <Modal
        visible={showReceiptViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReceiptViewer(false)}
      >
        <View style={styles.viewerOverlay}>
          <TouchableOpacity 
            style={styles.viewerCloseBtn} 
            onPress={() => setShowReceiptViewer(false)}
          >
            <X size={28} color={palette.white} />
          </TouchableOpacity>
          {viewerUri && (
            <Image 
              source={{ uri: viewerUri }} 
              style={styles.viewerImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
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
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
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
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  viewerImage: {
    width: '100%',
    height: '80%',
  },
});
