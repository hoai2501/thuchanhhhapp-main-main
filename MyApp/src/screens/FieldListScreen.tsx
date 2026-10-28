import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActionButton,
  FieldCard,
  PitchMark,
  Screen,
  SpringPressable,
} from '../components/FieldUI';
import { colors } from '../theme/colors';
import type { Booking, Field, RootStackParamList } from '../types/field';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FieldList'>;
type Filter = 'Tất cả' | 'Hoạt động' | 'Bảo trì';

export function FieldListScreen({
  fields,
  bookings,
  navigation,
  onDeleteField,
}: {
  fields: Field[];
  bookings: Booking[];
  navigation: Navigation;
  onDeleteField: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Tất cả');
  const activeCount = fields.filter(field => field.status === 'Hoạt động').length;
  const todayKey = new Date();
  const today = `${String(todayKey.getDate()).padStart(2, '0')}/${String(
    todayKey.getMonth() + 1,
  ).padStart(2, '0')}/${todayKey.getFullYear()}`;
  const todaysBookings = bookings.filter(booking => booking.date === today).length;
  const bookingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach(booking => {
      counts.set(booking.fieldId, (counts.get(booking.fieldId) ?? 0) + 1);
    });
    return counts;
  }, [bookings]);

  const filteredFields = useMemo(
    () =>
      fields.filter(field => {
        const matchesQuery = `${field.name} ${field.type}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return (
          matchesQuery && (filter === 'Tất cả' || field.status === filter)
        );
      }),
    [fields, filter, query],
  );

  const confirmDelete = useCallback((field: Field) => {
    if (bookings.some(booking => booking.fieldId === field.id)) {
      Alert.alert(
        'Sân đang có lịch đặt',
        'Hãy hủy các lịch đặt của sân trước khi xóa để không mất thông tin khách hàng.',
      );
      return;
    }
    Alert.alert('Xóa sân?', `Bạn có chắc muốn xóa ${field.name} không?`, [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xóa sân',
        style: 'destructive',
        onPress: () => onDeleteField(field.id),
      },
    ]);
  }, [bookings, onDeleteField]);

  const openField = useCallback(
    (fieldId: string) => navigation.navigate('FieldDetail', { fieldId }),
    [navigation],
  );
  const editField = useCallback(
    (fieldId: string) => navigation.navigate('FieldForm', { fieldId }),
    [navigation],
  );
  const renderField = useCallback(
    ({ item }: { item: Field }) => (
      <FieldCard
        field={item}
        bookingCount={bookingCounts.get(item.id) ?? 0}
        onOpenField={openField}
        onEditField={editField}
        onDeleteField={confirmDelete}
      />
    ),
    [bookingCounts, confirmDelete, editField, openField],
  );

  return (
    <Screen>
      <FlatList
        data={filteredFields}
        keyExtractor={field => field.id}
        renderItem={renderField}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={35}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <View style={styles.brandMark}>
                <PitchMark width={30} height={22} color={colors.lime} />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandTitle}>SÂN CỎ</Text>
                <Text style={styles.brandSubtitle}>FIELD MANAGER</Text>
              </View>
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>ĐANG MỞ</Text>
              </View>
            </View>
            <View style={styles.hero}>
              <View style={styles.heroCircleOne} />
              <View style={styles.heroCircleTwo} />
              <Text style={styles.heroEyebrow}>QUẢN LÝ CỤM SÂN · HÔM NAY</Text>
              <Text style={styles.heroTitle}>Trận hay{'\n'}bắt đầu từ đây.</Text>
              <Text style={styles.heroHint}>
                Sắp xếp lịch đá dễ dàng, giữ nhịp sân luôn sôi động.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroValue}>{activeCount}<Text style={styles.heroTotal}>/{fields.length}</Text></Text>
                  <Text style={styles.heroLabel}>SÂN HOẠT ĐỘNG</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroValue}>{todaysBookings}</Text>
                  <Text style={styles.heroLabel}>LỊCH HÔM NAY</Text>
                </View>
              </View>
              <View style={styles.heroBall}>
                <PitchMark width={49} height={36} color={colors.lime} />
              </View>
            </View>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Danh sách sân</Text>
                <Text style={styles.sectionSubtitle}>
                  {fields.length} sân · {activeCount} đang sẵn sàng
                </Text>
              </View>
              <SpringPressable
                onPress={() => navigation.navigate('FieldForm')}
                style={styles.addSmall}
              >
                <Text style={styles.addSmallText}>＋ Thêm sân</Text>
              </SpringPressable>
            </View>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm tên sân..."
                placeholderTextColor="#9AA69C"
                style={styles.searchInput}
                returnKeyType="search"
                accessibilityLabel="Tìm sân"
              />
              {query.length > 0 ? (
                <SpringPressable onPress={() => setQuery('')} hitSlop={8}>
                  <Text style={styles.clearSearch}>×</Text>
                </SpringPressable>
              ) : null}
            </View>
            <View style={styles.filters}>
              {(['Tất cả', 'Hoạt động', 'Bảo trì'] as Filter[]).map(item => (
                <SpringPressable
                  key={item}
                  onPress={() => setFilter(item)}
                  accessibilityState={{ selected: filter === item }}
                  style={[
                    styles.filterChip,
                    filter === item && styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item && styles.filterTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </SpringPressable>
              ))}
            </View>
            {filteredFields.length > 0 ? (
              <Text style={styles.resultsText}>
                ĐANG HIỂN THỊ {filteredFields.length} SÂN
              </Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>
              {fields.length === 0 ? 'Chưa có sân nào' : 'Không tìm thấy sân'}
            </Text>
            <Text style={styles.emptyMessage}>
              {fields.length === 0
                ? 'Thêm sân đầu tiên để bắt đầu quản lý lịch đặt.'
                : 'Thử từ khóa khác hoặc đổi bộ lọc nhé.'}
            </Text>
            {fields.length === 0 ? (
              <ActionButton
                onPress={() => navigation.navigate('FieldForm')}
                style={styles.emptyButton}
              >
                <Text style={styles.addButtonText}>＋  Thêm sân mới</Text>
              </ActionButton>
            ) : null}
          </View>
        }
        ListFooterComponent={<View style={styles.bottomSpace} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, paddingBottom: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 9, paddingBottom: 17 },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { marginLeft: 10, flex: 1 },
  brandTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', letterSpacing: 1.3 },
  brandSubtitle: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 3 },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: colors.primarySoft,
  },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 },
  openText: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  hero: {
    height: 246,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
    padding: 21,
    overflow: 'hidden',
    marginBottom: 23,
  },
  heroCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    right: -49,
    top: -63,
  },
  heroCircleTwo: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    right: -74,
    top: -85,
  },
  heroEyebrow: { color: '#D5E8DA', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { color: colors.surface, fontSize: 27, fontWeight: '900', lineHeight: 33, marginTop: 9 },
  heroHint: { color: '#D5E8DA', fontSize: 12, fontWeight: '500', lineHeight: 17, marginTop: 6, maxWidth: '73%' },
  heroStats: {
    position: 'absolute',
    bottom: 17,
    left: 21,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: { minWidth: 91 },
  heroValue: { color: colors.lime, fontSize: 25, fontWeight: '900' },
  heroTotal: { color: '#D5E8DA', fontSize: 16, fontWeight: '800' },
  heroLabel: { color: '#E0EEE4', fontSize: 10, fontWeight: '900', letterSpacing: 0.6, marginTop: 3 },
  heroStatDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.22)', marginHorizontal: 12 },
  heroBall: {
    width: 88,
    height: 88,
    position: 'absolute',
    right: 21,
    bottom: 25,
    borderRadius: 42,
    backgroundColor: 'rgba(200,241,105,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,241,105,0.25)',
  },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: colors.ink, fontSize: 23, fontWeight: '900' },
  sectionSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: '600' },
  addSmall: { marginLeft: 'auto', backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 },
  addSmallText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  searchBox: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchIcon: { color: colors.muted, fontSize: 24, marginRight: 9, marginTop: -4 },
  searchInput: { flex: 1, padding: 0, color: colors.ink, fontSize: 16 },
  clearSearch: { color: colors.muted, fontSize: 22, paddingHorizontal: 4 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 17 },
  filterChip: { borderRadius: 20, backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: colors.line },
  filterChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  filterTextSelected: { color: colors.surface },
  resultsText: { color: colors.muted, fontSize: 11, letterSpacing: 0.8, fontWeight: '900', marginBottom: 11 },
  empty: { alignItems: 'center', backgroundColor: colors.surface, padding: 27, borderRadius: 22, marginTop: 5, borderWidth: 1, borderColor: colors.line },
  emptyIcon: { color: colors.primary, backgroundColor: colors.primarySoft, overflow: 'hidden', borderRadius: 18, width: 52, height: 52, textAlign: 'center', textAlignVertical: 'center', fontSize: 29 },
  emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 14 },
  emptyMessage: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  emptyButton: { marginTop: 17, minHeight: 44 },
  addButtonText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  bottomSpace: { height: 10 },
});
