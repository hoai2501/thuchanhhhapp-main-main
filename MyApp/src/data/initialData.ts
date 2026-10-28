import type { Booking, Field } from '../types/field';

const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;
};

export const initialFields: Field[] = [
  {
    id: 'field-a1',
    name: 'Sân A1',
    type: '5 người',
    pricePerHour: 300000,
    status: 'Hoạt động',
  },
  {
    id: 'field-a2',
    name: 'Sân A2',
    type: '7 người',
    pricePerHour: 450000,
    status: 'Hoạt động',
  },
  {
    id: 'field-b1',
    name: 'Sân B1',
    type: '5 người',
    pricePerHour: 280000,
    status: 'Bảo trì',
  },
  {
    id: 'field-b2',
    name: 'Sân B2',
    type: '7 người',
    pricePerHour: 500000,
    status: 'Hoạt động',
  },
];

export const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    fieldId: 'field-a1',
    customerName: 'Nguyễn Minh Khang',
    phone: '0912345678',
    date: dateOffset(1),
    startHour: 17,
    hours: 2,
  },
  {
    id: 'booking-2',
    fieldId: 'field-a2',
    customerName: 'Trần Quốc Bảo',
    phone: '0987654321',
    date: dateOffset(1),
    startHour: 19,
    hours: 2,
  },
  {
    id: 'booking-3',
    fieldId: 'field-b2',
    customerName: 'Lê Hoàng Nam',
    phone: '0909876543',
    date: dateOffset(2),
    startHour: 18,
    hours: 1,
  },
];
