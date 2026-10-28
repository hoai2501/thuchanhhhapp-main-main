import React, { ReactNode } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import type { Field } from '../types/field';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpringPressable({
  children,
  onPress,
  disabled,
  style,
  ...props
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
} & Omit<
  PressableProps,
  | 'children'
  | 'style'
  | 'onPress'
  | 'disabled'
  | 'onPressIn'
  | 'onPressOut'
>) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      speed: 28,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: Boolean(disabled),
      }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(disabled ? 1 : 0.975)}
      onPressOut={() => animateTo(1)}
      android_ripple={{ color: 'rgba(23,107,70,0.12)' }}
      style={[
        style,
        { transform: [{ scale }] },
        disabled && styles.pressableDisabled,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return (
    <SafeAreaView
      style={[styles.safe, style]}
      edges={['top', 'right', 'bottom', 'left']}
    >
      {children}
    </SafeAreaView>
  );
}

export function PitchMark({
  width = 28,
  height = 20,
  color = colors.primary,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.pitchMark,
        { width, height, borderColor: color },
      ]}
    >
      <View style={[styles.pitchCenterLine, { backgroundColor: color }]} />
      <View
        style={[
          styles.pitchCenterCircle,
          { borderColor: color, width: height * 0.72, height: height * 0.72, borderRadius: height * 0.36 },
        ]}
      />
      <View style={[styles.pitchBox, styles.pitchLeftBox, { borderColor: color }]} />
      <View style={[styles.pitchBox, styles.pitchRightBox, { borderColor: color }]} />
    </View>
  );
}

export function Header({
  title,
  eyebrow,
  onBack,
  right,
}: {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <SpringPressable
          accessibilityLabel="Quay lại"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </SpringPressable>
      ) : null}
      <View style={styles.headerText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function ActionButton({
  children,
  onPress,
  disabled,
  secondary = false,
  style,
  ...props
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <SpringPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={props.accessibilityLabel}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {children}
    </SpringPressable>
  );
}

export function StatusPill({ status }: { status: Field['status'] }) {
  const active = status === 'Hoạt động';
  return (
    <View style={[styles.statusPill, active ? styles.activePill : styles.maintenancePill]}>
      <View style={[styles.statusDot, active ? styles.activeDot : styles.maintenanceDot]} />
      <Text style={[styles.statusText, active ? styles.activeText : styles.maintenanceText]}>
        {status}
      </Text>
    </View>
  );
}

export const FieldCard = React.memo(function MemoizedFieldCard({
  field,
  bookingCount,
  onOpenField,
  onEditField,
  onDeleteField,
}: {
  field: Field;
  bookingCount: number;
  onOpenField: (fieldId: string) => void;
  onEditField: (fieldId: string) => void;
  onDeleteField: (field: Field) => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onOpenField(field.id)}
        android_ripple={{ color: 'rgba(23,107,70,0.08)' }}
        style={({ pressed }) => [
          styles.cardMain,
          pressed && styles.cardMainPressed,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.fieldIcon}>
            <PitchMark width={32} height={24} color={colors.primary} />
          </View>
          <View style={styles.fieldNameBlock}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Text style={styles.fieldType}>Sân {field.type}</Text>
          </View>
          <StatusPill status={field.status} />
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardCaption}>GIÁ THUÊ</Text>
            <Text style={styles.price}>
              {field.pricePerHour.toLocaleString('vi-VN')}
              <Text style={styles.priceSuffix}> đ/giờ</Text>
            </Text>
          </View>
          <View style={styles.bookingCount}>
            <Text style={styles.bookingCountIcon}>▦</Text>
            <Text style={styles.bookingCountText}>{bookingCount} lịch đặt</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
      <View style={styles.cardActions}>
        <Pressable
          onPress={() => onEditField(field.id)}
          android_ripple={{ color: 'rgba(23,107,70,0.10)' }}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionIcon}>✎</Text>
          <Text style={styles.actionText}>Chỉnh sửa</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable
          onPress={() => onDeleteField(field)}
          android_ripple={{ color: 'rgba(201,75,75,0.10)' }}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={[styles.actionIcon, styles.deleteIcon]}>⌫</Text>
          <Text style={[styles.actionText, styles.deleteText]}>Xóa sân</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pitchMark: {
    borderWidth: 1.4,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pitchCenterLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  pitchCenterCircle: {
    position: 'absolute',
    borderWidth: 1,
  },
  pitchBox: {
    position: 'absolute',
    top: '25%',
    bottom: '25%',
    width: '13%',
    borderWidth: 1,
  },
  pitchLeftBox: { left: 0 },
  pitchRightBox: { right: 0 },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  headerTitle: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  backIcon: { color: colors.ink, fontSize: 31, lineHeight: 34, marginTop: -4 },
  button: {
    minHeight: 52,
    paddingHorizontal: 19,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonDisabled: { backgroundColor: '#B7C2BA' },
  pressableDisabled: { opacity: 0.62 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 30,
    gap: 5,
  },
  activePill: { backgroundColor: colors.primarySoft },
  maintenancePill: { backgroundColor: colors.amberSoft },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: colors.primary },
  maintenanceDot: { backgroundColor: colors.amber },
  statusText: { fontSize: 12, fontWeight: '800' },
  activeText: { color: colors.primary },
  maintenanceText: { color: '#A96818' },
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginBottom: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDE7',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },
  cardMain: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 },
  cardMainPressed: { opacity: 0.9 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  fieldIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginRight: 12,
  },
  fieldNameBlock: { flex: 1 },
  fieldName: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  fieldType: { color: colors.muted, fontSize: 14, marginTop: 4, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: colors.line, marginTop: 14, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end' },
  cardCaption: { color: colors.muted, fontSize: 11, letterSpacing: 0.8, fontWeight: '900' },
  price: { color: colors.primaryDark, fontSize: 19, fontWeight: '900', marginTop: 4 },
  priceSuffix: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  bookingCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 8,
    gap: 5,
    paddingBottom: 2,
  },
  bookingCountIcon: { color: colors.primary, fontSize: 15 },
  bookingCountText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  chevron: { color: '#A7B2A9', fontSize: 24, lineHeight: 25 },
  cardActions: {
    height: 50,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  actionPressed: { opacity: 0.72 },
  actionDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  actionIcon: { color: colors.primary, fontSize: 21, fontWeight: '800' },
  actionText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  deleteIcon: { color: colors.red },
  deleteText: { color: colors.red },
});
