import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initialBookings, initialFields } from './src/data/initialData';
import { FieldDetailScreen } from './src/screens/FieldDetailScreen';
import { FieldFormScreen } from './src/screens/FieldFormScreen';
import { FieldListScreen } from './src/screens/FieldListScreen';
import { colors } from './src/theme/colors';
import type { Booking, Field, RootStackParamList } from './src/types/field';

const Stack = createNativeStackNavigator<RootStackParamList>();
const STORAGE_KEY = '@football-field-manager/state-v1';

type PersistedAppState = {
  fields: Field[];
  bookings: Booking[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function isPersistedAppState(value: unknown): value is PersistedAppState {
  if (!isRecord(value) || !Array.isArray(value.fields) || !Array.isArray(value.bookings)) {
    return false;
  }
  const fieldsAreValid = value.fields.every(
    field =>
      isRecord(field) &&
      typeof field.id === 'string' &&
      typeof field.name === 'string' &&
      field.name.trim().length > 0 &&
      (field.type === '5 người' || field.type === '7 người') &&
      typeof field.pricePerHour === 'number' &&
      Number.isFinite(field.pricePerHour) &&
      field.pricePerHour > 0 &&
      (field.status === 'Hoạt động' || field.status === 'Bảo trì'),
  );
  const bookingsAreValid = value.bookings.every(
    booking =>
      isRecord(booking) &&
      typeof booking.id === 'string' &&
      typeof booking.fieldId === 'string' &&
      typeof booking.customerName === 'string' &&
      booking.customerName.trim().length > 0 &&
      typeof booking.phone === 'string' &&
      /^0\d{9}$/.test(booking.phone) &&
      typeof booking.date === 'string' &&
      /^\d{2}\/\d{2}\/\d{4}$/.test(booking.date) &&
      typeof booking.startHour === 'number' &&
      Number.isInteger(booking.startHour) &&
      booking.startHour >= 6 &&
      booking.startHour <= 22 &&
      typeof booking.hours === 'number' &&
      Number.isInteger(booking.hours) &&
      booking.hours >= 1 &&
      booking.hours <= 3 &&
      booking.startHour + booking.hours <= 23,
  );
  const fieldIds = new Set(
    value.fields.filter(isRecord).map(field => field.id),
  );
  const bookingsReferenceFields = value.bookings.every(
    booking => isRecord(booking) && fieldIds.has(booking.fieldId),
  );
  return fieldsAreValid && bookingsAreValid && bookingsReferenceFields;
}

export default function App() {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedValue === null) {
          return;
        }
        const parsed: unknown = JSON.parse(storedValue);
        if (!isPersistedAppState(parsed)) {
          throw new Error('Dữ liệu đã lưu không đúng định dạng.');
        }
        setFields(parsed.fields);
        setBookings(parsed.bookings);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        Alert.alert(
          'Không thể khôi phục dữ liệu',
          `Ứng dụng sẽ dùng dữ liệu mẫu. Chi tiết: ${reason}`,
        );
      } finally {
        setIsHydrated(true);
      }
    };
    restoreState();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const persistState = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ fields, bookings }),
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        Alert.alert(
          'Không thể lưu dữ liệu',
          `Thay đổi hiện tại chưa được lưu trên thiết bị. Chi tiết: ${reason}`,
        );
      }
    };
    persistState();
  }, [bookings, fields, isHydrated]);

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu sân bóng...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="FieldList"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="FieldList">
            {({ navigation }) => (
              <FieldListScreen
                fields={fields}
                bookings={bookings}
                navigation={navigation}
                onDeleteField={fieldId =>
                  setFields(current =>
                    current.filter(field => field.id !== fieldId),
                  )
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="FieldForm">
            {({ route, navigation }) => (
              <FieldFormScreen
                field={fields.find(item => item.id === route.params?.fieldId)}
                fields={fields}
                navigation={navigation}
                onSave={field =>
                  setFields(current =>
                    current.some(item => item.id === field.id)
                      ? current.map(item =>
                          item.id === field.id ? field : item,
                        )
                      : [field, ...current],
                  )
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="FieldDetail">
            {({ route, navigation }) => (
              <FieldDetailScreen
                field={fields.find(item => item.id === route.params.fieldId)}
                bookings={bookings.filter(
                  item => item.fieldId === route.params.fieldId,
                )}
                allBookings={bookings}
                navigation={navigation}
                onAddBooking={booking =>
                  setBookings(current => [...current, booking])
                }
                onCancelBooking={bookingId =>
                  setBookings(current =>
                    current.filter(booking => booking.id !== bookingId),
                  )
                }
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 12,
    fontWeight: '600',
  },
});
