import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Calendar, Check, RotateCcw, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { CATEGORIES } from '../utils/categories';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { category?: string; startDate?: Date; endDate?: Date }) => void;
  initialFilters: { category?: string; startDate?: Date; endDate?: Date };
}

export function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialFilters.category);
  const [startDate, setStartDate] = useState<Date | undefined>(initialFilters.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialFilters.endDate);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [shouldRender, setShouldRender] = useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const textSub = dark ? '#94a3b8' : '#64748b';
  const bgColor = dark ? '#1e293b' : '#ffffff';
  const textMain = dark ? '#f1f5f9' : '#0f172a';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  const handleReset = () => {
    setSelectedCategory(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      startDate,
      endDate
    });
    onClose();
  };

  if (!shouldRender && !visible) return null;

  return (
    <Modal 
      transparent 
      visible={visible || shouldRender} 
      animationType="none" 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn.duration(200)} 
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1}
          onPress={onClose} 
        />
        
        {visible && (
          <Animated.View 
            entering={SlideInDown.springify().damping(28).stiffness(250).mass(0.7)} 
            exiting={SlideOutDown.duration(200)}
            style={[styles.container, { backgroundColor: bgColor }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: textMain }]}>Filtros Avançados</Text>
              <TouchableOpacity onPress={onClose} haptic-feedback="light" style={styles.closeBtn}>
                <X size={24} color={textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textMain }]}>Categoria</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setSelectedCategory(selectedCategory === cat.value ? undefined : cat.value)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: selectedCategory === cat.value ? cat.color : undefined }
                      ]}
                      className={selectedCategory !== cat.value ? "bg-surface-secondary" : ""}
                    >
                      <Text style={styles.categoryText} className={selectedCategory === cat.value ? "text-white" : "text-text-sub"}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textMain }]}>Período</Text>
                <View style={styles.dateRow}>
                  <TouchableOpacity 
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                    style={[styles.datePicker, { backgroundColor: dark ? '#334155' : '#f1f5f9', borderColor }]}
                  >
                    <Calendar size={18} color={textSub} />
                    <Text style={[styles.dateText, { color: startDate ? textMain : textSub }]}>
                      {startDate ? format(startDate, 'dd/MM/yyyy') : 'Início'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                    style={[styles.datePicker, { backgroundColor: dark ? '#334155' : '#f1f5f9', borderColor }]}
                  >
                    <Calendar size={18} color={textSub} />
                    <Text style={[styles.dateText, { color: endDate ? textMain : textSub }]}>
                      {endDate ? format(endDate, 'dd/MM/yyyy') : 'Fim'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: borderColor }]}>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <RotateCcw size={20} color={textSub} />
                <Text style={[styles.resetText, { color: textSub }]}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleApply} style={styles.applyBtn} className="bg-primary">
                <Check size={20} color="#fff" />
                <Text style={styles.applyText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        )}
      </Animated.View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePicker: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    gap: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
