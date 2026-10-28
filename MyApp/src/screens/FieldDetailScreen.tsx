import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  StatusPill,
} from '../components/FieldUI';
import { colors } from '../theme/colors';
import type { Booking, Field, RootStackParamList } from '../types/field';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FieldDetail'>;
type BookingErrors = {
  customerName?: string;
  phone?: string;
  date?: string;
  startHour?: string;
};

function todayString() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;
}

function isValidDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return false;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function formatTime(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function BookingModal({
  visible,
  field,
  allBookings,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  field: Field;
  allBookings: Booking[];
  onClose: () => void;
  onSubmit: (booking: Booking) => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(todayString());
  const [startHour, setStartHour] = useState(18);
  const [hours, setHours] = useState(1);
  const [errors, setErrors] = useState<BookingErrors>({});
  const total = field.pricePerHour * hours;

  const updateDate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted =
      digits.length <= 2
        ? digits
        : digits.length <= 4
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    setDate(formatted);
    if (errors.date) {
      setErrors(current => ({ ...current, date: undefined }));
    }
  };

  const createBooking = () => {
    const nextErrors: BookingErrors = {};
    if (!customerName.trim()) {
      nextErrors.customerName = 'Vui lòng nhập tên khách hàng.';
    }
    if (!/^0\d{9}$/.test(phone)) {
      nextErrors.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.';
    }
    if (!isValidDate(date)) {
      nextErrors.date = 'Ngày không hợp lệ. Nhập theo định dạng dd/mm/yyyy.';
    }
    if (!Number.isInteger(startHour) || startHour < 6 || startHour > 22) {
      nextErrors.startHour = 'Giờ bắt đầu phải từ 06:00 đến 22:00.';
    } else if (startHour + hours > 23) {
      nextErrors.startHour = 'Giờ kết thúc không được vượt quá 23:00.';
    }

    const conflict =
      isValidDate(date) &&
      allBookings.some(booking => {
        if (booking.fieldId !== field.id || booking.date !== date) {
          return false;
        }
        const newEnd = startHour + hours;
        const existingEnd = booking.startHour + booking.hours;
        return startHour < existingEnd && newEnd > booking.startHour;
      });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    if (conflict) {
      Alert.alert(
        'Khung giờ đã được đặt',
        'Sân này đã có lịch giao nhau trong ngày bạn chọn. Vui lòng chọn giờ khác.',
      );
      return;
    }

    onSubmit({
      id: `booking-${Date.now()}`,
      fieldId: field.id,
      customerName: customerName.trim(),
      phone,
      date,
      startHour,
      hours,
    });
    setCustomerName('');
    setPhone('');
    setDate(todayString());
    setStartHour(18);
    setHours(1);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          style={styles.modalKeyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>ĐẶT LỊCH MỚI</Text>
                <Text style={styles.modalTitle}>{field.name}</Text>
              </View>
              <SpringPressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                <Text style={styles.closeButtonText}>×</Text>
              </SpringPressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Tên khách hàng</Text>
              <TextInput
                value={customerName}
                onChangeText={value => {
                  setCustomerName(value);
                  if (errors.customerName) {
                    setErrors(current => ({ ...current, customerName: undefined }));
                  }
                }}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#A0AAA2"
                style={[styles.input, errors.customerName && styles.inputError]}
                returnKeyType="next"
                accessibilityLabel="Tên khách hàng"
              />
              {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}

              <Text style={[styles.label, styles.fieldGap]}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={value => {
                  setPhone(value.replace(/\D/g, '').slice(0, 10));
                  if (errors.phone) {
                    setErrors(current => ({ ...current, phone: undefined }));
                  }
                }}
                placeholder="09xx xxx xxx"
                placeholderTextColor="#A0AAA2"
                style={[styles.input, errors.phone && styles.inputError]}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
                accessibilityLabel="Số điện thoại"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

              <Text style={[styles.label, styles.fieldGap]}>Ngày đặt sân</Text>
              <TextInput
                value={date}
                onChangeText={updateDate}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#A0AAA2"
                style={[styles.input, errors.date && styles.inputError]}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
                accessibilityLabel="Ngày đặt sân"
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

              <View style={styles.timeHeading}>
                <Text style={styles.label}>Giờ bắt đầu</Text>
                <Text style={styles.timeRange}>06:00 – 22:00</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourOptions}
              >
                {Array.from({ length: 17 }, (_, index) => index + 6).map(hour => (
                  <SpringPressable
                    key={hour}
                    onPress={() => {
                      setStartHour(hour);
                      setErrors(current => ({ ...current, startHour: undefined }));
                    }}
                    accessibilityState={{ selected: startHour === hour }}
                    style={[
                      styles.hourOption,
                      startHour === hour && styles.hourOptionSelected,
                    ]}
                  >
                    <Text style={[styles.hourText, startHour === hour && styles.hourTextSelected]}>
                      {formatTime(hour)}
                    </Text>
                  </SpringPressable>
                ))}
              </ScrollView>
              {errors.startHour ? <Text style={styles.errorText}>{errors.startHour}</Text> : null}

              <View style={styles.durationHeading}>
                <Text style={styles.label}>Thời lượng thuê</Text>
                <View style={styles.durationControl}>
                  <SpringPressable
                    onPress={() => {
                      setHours(current => Math.max(1, current - 1));
                      setErrors(current => ({ ...current, startHour: undefined }));
                    }}
                    style={styles.stepButton}
                    accessibilityLabel="Giảm số giờ"
                  >
                    <Text style={styles.stepText}>−</Text>
                  </SpringPressable>
                  <Text style={styles.durationValue}>{hours} giờ</Text>
                  <SpringPressable
                    onPress={() => {
                      setHours(current => Math.min(3, current + 1));
                      setErrors(current => ({ ...current, startHour: undefined }));
                    }}
                    style={styles.stepButton}
                    accessibilityLabel="Tăng số giờ"
                  >
                    <Text style={styles.stepText}>＋</Text>
                  </SpringPressable>
                </View>
              </View>

              <View style={styles.totalCard}>
                <View>
                  <Text style={styles.totalLabel}>TẠM TÍNH</Text>
                  <Text style={styles.totalHint}>
                    {field.pricePerHour.toLocaleString('vi-VN')} đ × {hours} giờ
                  </Text>
                </View>
                <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} đ</Text>
              </View>
              <ActionButton onPress={createBooking} style={styles.submitButton}>
                <Text style={styles.submitText}>Xác nhận đặt sân  ›</Text>
              </ActionButton>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function FieldDetailScreen({
  field,
  bookings,
  allBookings,
  navigation,
  onAddBooking,
  onCancelBooking,
}: {
  field?: Field;
  bookings: Booking[];
  allBookings: Booking[];
  navigation: Navigation;
  onAddBooking: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}) {
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  if (!field) {
    return (
      <Screen>
        <Header title="Sân không tồn tại" onBack={() => navigation.goBack()} />
        <View style={styles.missing}>
          <Text style={styles.emptyText}>Không tìm thấy sân bóng này.</Text>
        </View>
      </Screen>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateOrder = a.date.split('/').reverse().join('').localeCompare(
      b.date.split('/').reverse().join(''),
    );
    return dateOrder || a.startHour - b.startHour;
  });
  const confirmCancel = (booking: Booking) => {
    Alert.alert(
      'Hủy lịch đặt?',
      `Lịch của ${booking.customerName} vào ${booking.date}, ${formatTime(
        booking.startHour,
      )} sẽ bị xóa.`,
      [
        { text: 'Giữ lịch', style: 'cancel' },
        {
          text: 'Hủy đặt sân',
          style: 'destructive',
          onPress: () => onCancelBooking(booking.id),
        },
      ],
    );
  };

  return (
    <Screen>
      <Header
        title="Chi tiết sân"
        eyebrow="THÔNG TIN SÂN BÓNG"
        onBack={() => navigation.goBack()}
        right={
          <SpringPressable
            onPress={() => navigation.navigate('FieldForm', { fieldId: field.id })}
            style={styles.editHeaderButton}
          >
            <Text style={styles.editHeaderText}>✎  Sửa</Text>
          </SpringPressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldHero}>
          <View style={styles.pitchLines}>
            <View style={styles.pitchCircle} />
            <View style={styles.pitchLine} />
          </View>
          <View style={styles.fieldHeroTop}>
            <View style={styles.largeBall}>
              <PitchMark width={36} height={27} color={colors.lime} />
            </View>
            <StatusPill status={field.status} />
          </View>
          <Text style={styles.fieldHeroName}>{field.name}</Text>
          <Text style={styles.fieldHeroType}>Sân bóng đá mini · {field.type}</Text>
          <View style={styles.fieldHeroPriceRow}>
            <Text style={styles.fieldHeroPrice}>
              {field.pricePerHour.toLocaleString('vi-VN')}
              <Text style={styles.fieldHeroUnit}> đ</Text>
            </Text>
            <Text style={styles.fieldHeroPer}>/ giờ</Text>
          </View>
          <View style={styles.fieldHeroBottom}>
            <Text style={styles.fieldHeroMeta}>SẴN SÀNG CHO TRẬN ĐẤU</Text>
            <Text style={styles.fieldHeroMeta}>#{field.id.slice(-4).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>▦</Text>
            <Text style={styles.quickStatValue}>{bookings.length}</Text>
            <Text style={styles.quickStatLabel}>LỊCH ĐẶT</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>◷</Text>
            <Text style={styles.quickStatValue}>{bookings.reduce((sum, item) => sum + item.hours, 0)}</Text>
            <Text style={styles.quickStatLabel}>GIỜ ĐÃ ĐẶT</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>◈</Text>
            <Text style={styles.quickStatValue}>{field.type.split(' ')[0]}</Text>
            <Text style={styles.quickStatLabel}>NGƯỜI / ĐỘI</Text>
          </View>
        </View>

        <View style={styles.bookingHeading}>
          <View>
            <Text style={styles.sectionTitle}>Lịch đặt sân</Text>
            <Text style={styles.sectionSubtitle}>Các khung giờ khách đã đặt</Text>
          </View>
          <View style={styles.bookingBadge}>
            <Text style={styles.bookingBadgeText}>{bookings.length} lịch</Text>
          </View>
        </View>

        {sortedBookings.length > 0 ? (
          sortedBookings.map(booking => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingDateBox}>
                <Text style={styles.bookingDateDay}>{booking.date.slice(0, 2)}</Text>
                <Text style={styles.bookingDateMonth}>
                  TH {booking.date.slice(3, 5)}
                </Text>
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.customerName}>{booking.customerName}</Text>
                <Text style={styles.customerPhone}>{booking.phone}</Text>
                <View style={styles.bookingTimeRow}>
                  <Text style={styles.bookingTime}>
                    {formatTime(booking.startHour)} – {formatTime(booking.startHour + booking.hours)}
                  </Text>
                  <Text style={styles.bookingDuration}> · {booking.hours} giờ</Text>
                </View>
              </View>
              <SpringPressable
                accessibilityLabel={`Hủy lịch của ${booking.customerName}`}
                onPress={() => confirmCancel(booking)}
                style={styles.cancelBooking}
              >
                <Text style={styles.cancelBookingText}>×</Text>
              </SpringPressable>
            </View>
          ))
        ) : (
          <View style={styles.emptyBookings}>
            <Text style={styles.emptyBookingIcon}>◷</Text>
            <Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>
            <Text style={styles.emptyHint}>Lịch mới sẽ hiển thị tại đây.</Text>
          </View>
        )}
        <View style={styles.bottomGap} />
      </ScrollView>
      <View style={styles.bottomBar}>
        {field.status === 'Hoạt động' ? (
          <ActionButton onPress={() => setBookingModalVisible(true)} style={styles.bookButton}>
            <Text style={styles.bookButtonText}>＋  Đặt sân này</Text>
          </ActionButton>
        ) : (
          <ActionButton disabled onPress={() => undefined} style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đang bảo trì · Không nhận đặt</Text>
          </ActionButton>
        )}
      </View>
      <BookingModal
        key={field.id}
        visible={bookingModalVisible}
        field={field}
        allBookings={allBookings}
        onClose={() => setBookingModalVisible(false)}
        onSubmit={onAddBooking}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  detailContent: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 18 },
  editHeaderButton: { backgroundColor: colors.primarySoft, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13 },
  editHeaderText: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  fieldHero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 24,
    minHeight: 242,
    padding: 22,
    overflow: 'hidden',
  },
  pitchLines: { position: 'absolute', top: 0, right: -9, bottom: 0, width: 138, borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  pitchCircle: { position: 'absolute', width: 112, height: 112, borderWidth: 1, borderRadius: 56, borderColor: 'rgba(255,255,255,0.12)', top: 54, left: -56 },
  pitchLine: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.12)', left: 0 },
  fieldHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  largeBall: { width: 58, height: 58, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },
  fieldHeroName: { color: colors.surface, fontSize: 33, fontWeight: '900', marginTop: 18 },
  fieldHeroType: { color: '#D5E8DA', fontSize: 15, marginTop: 4, fontWeight: '600' },
  fieldHeroPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 11 },
  fieldHeroPrice: { color: colors.lime, fontSize: 27, fontWeight: '900' },
  fieldHeroUnit: { fontSize: 16 },
  fieldHeroPer: { color: '#D5E8DA', fontSize: 14, marginLeft: 5, fontWeight: '700' },
  fieldHeroBottom: { marginTop: 17, paddingTop: 13, borderTopColor: 'rgba(255,255,255,0.15)', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  fieldHeroMeta: { color: '#D5E8DA', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  quickStats: { marginTop: 14, marginBottom: 25, backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatIcon: { color: colors.primary, fontSize: 23 },
  quickStatValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 },
  quickStatLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.3, marginTop: 4 },
  quickStatDivider: { height: 35, width: 1, backgroundColor: colors.line },
  bookingHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  sectionSubtitle: { color: colors.muted, fontSize: 13, marginTop: 5, fontWeight: '600' },
  bookingBadge: { marginLeft: 'auto', borderRadius: 20, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8 },
  bookingBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  bookingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 17, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  bookingDateBox: { width: 53, height: 58, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bookingDateDay: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  bookingDateMonth: { color: '#527C60', fontSize: 10, fontWeight: '900', marginTop: 2 },
  bookingInfo: { flex: 1 },
  customerName: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  customerPhone: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: '600' },
  bookingTimeRow: { flexDirection: 'row', marginTop: 7, alignItems: 'center', flexWrap: 'wrap' },
  bookingTime: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  bookingDuration: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  cancelBooking: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center', marginLeft: 7 },
  cancelBookingText: { color: colors.red, fontSize: 27, lineHeight: 30, marginTop: -2 },
  emptyBookings: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 22, borderWidth: 1, borderColor: colors.line },
  emptyBookingIcon: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', color: colors.primary, backgroundColor: colors.primarySoft, fontSize: 26 },
  emptyText: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 9 },
  emptyHint: { color: colors.muted, fontSize: 13, marginTop: 5 },
  bottomGap: { height: 4 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 11, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.background },
  bookButton: { minHeight: 54 },
  bookButtonText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(12,28,18,0.56)' },
  modalKeyboard: { maxHeight: '94%' },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 22 : 14 },
  modalHandle: { width: 38, height: 4, backgroundColor: '#CAD3CB', borderRadius: 3, alignSelf: 'center', marginBottom: 13 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 15 },
  modalEyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1, fontWeight: '900' },
  modalTitle: { color: colors.ink, fontSize: 24, fontWeight: '900', marginTop: 4 },
  closeButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginLeft: 'auto' },
  closeButtonText: { color: colors.muted, fontSize: 28, lineHeight: 32 },
  modalScroll: { flexGrow: 0 },
  modalContent: { paddingBottom: 12 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '900', marginBottom: 8 },
  fieldGap: { marginTop: 14 },
  input: { height: 50, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.ink, fontSize: 15 },
  inputError: { borderColor: colors.red, backgroundColor: '#FFF9F9' },
  errorText: { color: colors.red, fontSize: 12, fontWeight: '700', marginTop: 6 },
  timeHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17 },
  timeRange: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  hourOptions: { gap: 7, paddingBottom: 2 },
  hourOption: { height: 42, minWidth: 62, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  hourOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  hourText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  hourTextSelected: { color: colors.surface },
  durationHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  durationControl: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 7 },
  stepButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primary, fontSize: 20, fontWeight: '900', lineHeight: 24 },
  durationValue: { color: colors.ink, fontSize: 14, fontWeight: '900', minWidth: 48, textAlign: 'center' },
  totalCard: { borderRadius: 15, backgroundColor: colors.primaryDark, paddingHorizontal: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17 },
  totalLabel: { color: '#D5E8DA', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  totalHint: { color: '#E1EEE4', fontSize: 12, marginTop: 4 },
  totalValue: { color: colors.lime, fontSize: 20, fontWeight: '900' },
  submitButton: { marginTop: 14 },
  submitText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  missing: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
