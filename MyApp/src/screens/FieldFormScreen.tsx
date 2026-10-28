import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActionButton,
  Header,
  PitchMark,
  Screen,
  SpringPressable,
} from '../components/FieldUI';
import { colors } from '../theme/colors';
import type {
  Field,
  FieldStatus,
  FieldType,
  RootStackParamList,
} from '../types/field';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FieldForm'>;

export function FieldFormScreen({
  field,
  fields,
  navigation,
  onSave,
}: {
  field?: Field;
  fields: Field[];
  navigation: Navigation;
  onSave: (field: Field) => void;
}) {
  const [name, setName] = useState(field?.name ?? '');
  const [type, setType] = useState<FieldType>(field?.type ?? '5 người');
  const [price, setPrice] = useState(
    field ? String(field.pricePerHour) : '',
  );
  const [status, setStatus] = useState<FieldStatus>(
    field?.status ?? 'Hoạt động',
  );
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const submit = () => {
    const nextErrors: { name?: string; price?: string } = {};
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      nextErrors.name = 'Vui lòng nhập tên sân.';
    } else if (
      fields.some(
        item =>
          item.id !== field?.id &&
          item.name.trim().toLocaleLowerCase('vi-VN') ===
            trimmedName.toLocaleLowerCase('vi-VN'),
      )
    ) {
      nextErrors.name = 'Tên sân này đã được sử dụng.';
    }

    if (!price.trim()) {
      nextErrors.price = 'Vui lòng nhập giá thuê.';
    } else if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'Giá thuê phải là số lớn hơn 0.';
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.price) {
      return;
    }

    onSave({
      id: field?.id ?? `field-${Date.now()}`,
      name: trimmedName,
      type,
      pricePerHour: parsedPrice,
      status,
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <Header
        title={field ? 'Chỉnh sửa sân' : 'Thêm sân mới'}
        eyebrow="THÔNG TIN SÂN"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <PitchMark width={34} height={25} color={colors.lime} />
            </View>
            <View style={styles.introText}>
              <Text style={styles.introTitle}>
                {field ? 'Cập nhật sân bóng' : 'Tạo sân bóng mới'}
              </Text>
              <Text style={styles.introSubtitle}>
                Điền thông tin để khách hàng dễ dàng đặt sân.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Tên sân <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={name}
              onChangeText={value => {
                setName(value);
                if (errors.name) {
                  setErrors(current => ({ ...current, name: undefined }));
                }
              }}
              placeholder="Ví dụ: Sân A1"
              placeholderTextColor="#A0AAA2"
              style={[styles.input, errors.name && styles.inputError]}
              maxLength={40}
              returnKeyType="next"
              accessibilityLabel="Tên sân"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <Text style={[styles.label, styles.spacedLabel]}>Loại sân</Text>
            <View style={styles.optionRow}>
              {(['5 người', '7 người'] as FieldType[]).map(option => {
                const selected = type === option;
                return (
                  <SpringPressable
                    key={option}
                    onPress={() => setType(option)}
                    accessibilityState={{ selected }}
                    style={[styles.typeOption, selected && styles.optionSelected]}
                  >
                    <View style={[styles.typeBall, selected && styles.typeBallSelected]}>
                      <Text style={[styles.typeBallText, selected && styles.typeBallTextSelected]}>
                        {option === '5 người' ? '5' : '7'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                        {option}
                      </Text>
                      <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>
                        {option === '5 người' ? 'Sân mini' : 'Sân tiêu chuẩn'}
                      </Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </SpringPressable>
                );
              })}
            </View>

            <Text style={[styles.label, styles.spacedLabel]}>
              Giá thuê mỗi giờ <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.priceInputWrap, errors.price && styles.inputError]}>
              <TextInput
                value={price}
                onChangeText={value => {
                  setPrice(value.replace(/\D/g, ''));
                  if (errors.price) {
                    setErrors(current => ({ ...current, price: undefined }));
                  }
                }}
                placeholder="300000"
                placeholderTextColor="#A0AAA2"
                style={styles.priceInput}
                keyboardType="numeric"
                returnKeyType="done"
                accessibilityLabel="Giá thuê mỗi giờ"
              />
              <Text style={styles.currency}>VNĐ / GIỜ</Text>
            </View>
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            {price && Number(price) > 0 ? (
              <Text style={styles.priceHelper}>
                ≈ {Number(price).toLocaleString('vi-VN')} đ mỗi giờ
              </Text>
            ) : null}

            <Text style={[styles.label, styles.spacedLabel]}>Trạng thái sân</Text>
            <View style={styles.statusRow}>
              {(['Hoạt động', 'Bảo trì'] as FieldStatus[]).map(option => {
                const selected = status === option;
                const isActive = option === 'Hoạt động';
                return (
                  <SpringPressable
                    key={option}
                    onPress={() => setStatus(option)}
                    accessibilityState={{ selected }}
                    style={[
                      styles.statusOption,
                      selected && (isActive ? styles.statusActiveSelected : styles.statusMaintenanceSelected),
                    ]}
                  >
                    <View
                      style={[
                        styles.statusIconBox,
                        isActive ? styles.statusIconActive : styles.statusIconMaintenance,
                      ]}
                    >
                      <Text style={styles.statusIcon}>{isActive ? '✓' : '⚒'}</Text>
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        selected && (isActive ? styles.statusTextActive : styles.statusTextMaintenance),
                      ]}
                    >
                      {option}
                    </Text>
                  </SpringPressable>
                );
              })}
            </View>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteIcon}>i</Text>
            <Text style={styles.noteText}>
              Tên sân phải là duy nhất. Sân đang bảo trì sẽ tạm thời không nhận đặt lịch.
            </Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <ActionButton onPress={submit}>
            <Text style={styles.submitText}>{field ? 'Lưu thay đổi' : 'Tạo sân ngay'}  ›</Text>
          </ActionButton>
          <SpringPressable
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </SpringPressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 7, paddingBottom: 22 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
  },
  introIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  introText: { flex: 1, marginLeft: 13 },
  introTitle: { color: colors.surface, fontSize: 18, fontWeight: '900' },
  introSubtitle: { color: '#D5E8DA', fontSize: 13, lineHeight: 19, marginTop: 5 },
  formCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 21, borderWidth: 1, borderColor: colors.line },
  label: { color: colors.ink, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  required: { color: colors.red },
  input: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFA', paddingHorizontal: 15, color: colors.ink, fontSize: 16 },
  inputError: { borderColor: colors.red, backgroundColor: '#FFF9F9' },
  errorText: { color: colors.red, fontSize: 13, fontWeight: '700', marginTop: 7 },
  spacedLabel: { marginTop: 21 },
  optionRow: { gap: 9 },
  typeOption: { minHeight: 72, borderRadius: 15, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#F3F9F4' },
  typeBall: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#F0F3EF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  typeBallSelected: { backgroundColor: colors.primary },
  typeBallText: { color: colors.muted, fontSize: 16, fontWeight: '900' },
  typeBallTextSelected: { color: colors.surface },
  optionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  optionTitleSelected: { color: colors.primaryDark },
  optionSub: { color: colors.muted, fontSize: 12, marginTop: 4, fontWeight: '600' },
  optionSubSelected: { color: '#688371' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#C7D0C8', marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  priceInputWrap: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFA', paddingLeft: 15, paddingRight: 13, flexDirection: 'row', alignItems: 'center' },
  priceInput: { flex: 1, padding: 0, color: colors.ink, fontSize: 17, fontWeight: '800' },
  currency: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  priceHelper: { color: colors.primary, fontSize: 13, fontWeight: '800', marginTop: 7 },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusOption: { flex: 1, minHeight: 62, borderRadius: 14, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8 },
  statusActiveSelected: { borderColor: colors.primary, backgroundColor: '#F3F9F4' },
  statusMaintenanceSelected: { borderColor: colors.amber, backgroundColor: '#FFFAF1' },
  statusIconBox: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statusIconActive: { backgroundColor: colors.primarySoft },
  statusIconMaintenance: { backgroundColor: colors.amberSoft },
  statusIcon: { color: colors.primaryDark, fontSize: 14, fontWeight: '900' },
  statusOptionText: { color: colors.muted, fontSize: 13, fontWeight: '800', flexShrink: 1 },
  statusTextActive: { color: colors.primary },
  statusTextMaintenance: { color: '#A96818' },
  note: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14, paddingHorizontal: 3 },
  noteIcon: { width: 16, height: 16, borderRadius: 8, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', backgroundColor: '#E8EEE7', color: colors.muted, fontSize: 10, fontWeight: '900', marginRight: 8 },
  noteText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingTop: 11, paddingBottom: 8, backgroundColor: colors.background },
  submitText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  cancelButton: { alignItems: 'center', paddingVertical: 11 },
  cancelText: { color: colors.muted, fontSize: 14, fontWeight: '800' },
});
