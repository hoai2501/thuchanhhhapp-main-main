# Sân Cỏ — Football Field Manager

Ứng dụng React Native CLI giúp chủ cụm sân bóng mini quản lý sân và lịch đặt sân.

## Tính năng

- Theo dõi số sân hoạt động, lịch đặt trong ngày; tìm kiếm và lọc sân theo trạng thái.
- Thêm, chỉnh sửa và xóa sân; kiểm tra tên sân trùng và giá thuê không hợp lệ.
- Xem chi tiết sân, loại sân, trạng thái, giá thuê và các lịch đã đặt.
- Tạo/hủy lịch đặt; kiểm tra số điện thoại, ngày giờ, giờ kết thúc và khung giờ bị trùng.
- Tự tính thành tiền theo giá thuê và số giờ; sân bảo trì không nhận đặt lịch.
- Lưu danh sách sân và lịch đặt bằng AsyncStorage, khởi tạo dữ liệu mẫu ở lần mở đầu tiên.

## Chạy ứng dụng

Mở Terminal tại thư mục dự án:

```sh
cd MyApp
npm install
npm run android
# hoặc
npm run ios
```

Các lệnh `android` và `ios` tự mở Metro trong Terminal.app trên macOS. Nếu muốn tự chạy Metro:

```sh
npm start
```

Sau đó mở terminal thứ hai tại `MyApp` và chạy `npx react-native run-android --no-packager` hoặc `npx react-native run-ios --no-packager`.

## Kiểm tra

```sh
npx tsc --noEmit --project tsconfig.json
npx jest --runInBand
npx eslint App.tsx src/components/FieldUI.tsx src/screens/FieldListScreen.tsx src/screens/FieldFormScreen.tsx src/screens/FieldDetailScreen.tsx
```

Giao diện được dựng bằng React Native cơ bản; điều hướng dùng React Navigation và dữ liệu được lưu cục bộ trên thiết bị.
