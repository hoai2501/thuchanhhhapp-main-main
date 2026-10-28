QUY ĐỊNH CHUNG
•	Tạo project bằng React Native CLI (không dùng Expo):
npx @react-native-community/cli init FootballFieldApp
•	Chạy ứng dụng bằng npx react-native run-android (hoặc run-ios) trên máy ảo hoặc thiết bị thật.
•	Thư viện được phép dùng:
–	@react-navigation/native, @react-navigation/native-stack, react-native-screens, react-native-safe-area-context
–	@react-native-async-storage/async-storage
–	react-native-vector-icons (không bắt buộc)
•	Không dùng thư viện UI dựng sẵn (NativeBase, React Native Paper, UI Kitten…). Không sao chép code của bạn khác.
•	Mọi thao tác xoá phải hỏi xác nhận bằng Alert.
•	Nộp bài: nén thư mục project, bỏ các thư mục node_modules, android/build, android/app/build, ios/Pods; đặt tên HoTen_MSSV_DeX.zip.
MÔ TẢ BÀI TOÁN
Chủ một cụm sân bóng đá mini cần ứng dụng để quản lý sân và lịch đặt sân của khách. Mỗi Sân có các thông tin sau:
Trường	Kiểu	Ghi chú
id	string	Tự sinh
name	string	Tên sân (ví dụ "Sân A1"), bắt buộc, không trùng
type	string	"5 người" hoặc "7 người"
pricePerHour	number	Giá thuê mỗi giờ (VNĐ), > 0
status	string	"Hoạt động" hoặc "Bảo trì"

Mỗi Lượt đặt sân có các thông tin sau:
Trường	Kiểu	Ghi chú
id	string	Tự sinh
fieldId	string	Sân được đặt
customerName	string	Tên khách, bắt buộc
phone	string	10 chữ số, bắt đầu bằng 0
date	string	Định dạng dd/mm/yyyy
startHour	number	Giờ bắt đầu, từ 6 đến 22
hours	number	Số giờ thuê, từ 1 đến 3

Lần chạy đầu tiên phải khởi tạo sẵn ít nhất 4 sân và 3 lượt đặt mẫu.
YÊU CẦU
Câu 1 – Màn hình Danh sách sân (1,5 điểm)
•	Hiển thị danh sách bằng FlatList. Mỗi dòng gồm tên sân, loại sân, giá thuê (định dạng 300.000 đ/giờ).
•	Trạng thái hiển thị bằng nhãn màu: xanh cho Hoạt động, cam cho Bảo trì.
•	Đầu màn hình hiển thị số sân đang hoạt động trên tổng số sân, ví dụ "3/4 sân hoạt động".
Câu 2 – Thêm / Sửa sân (1,5 điểm)
•	Có nút "+ Thêm sân" mở màn hình form (dùng Stack Navigation).
•	Cùng một form dùng cho cả thêm và sửa; khi sửa, các ô được điền sẵn dữ liệu cũ.
•	Chọn loại sân và trạng thái bằng nút bấm (không bắt buộc dùng Picker).
•	Kiểm tra dữ liệu: tên không trống và không trùng tên sân khác; giá thuê là số > 0. Thông báo lỗi hiển thị ngay dưới ô nhập.
Câu 3 – Xoá sân (1 điểm)
•	Có nút xoá trên mỗi dòng, hỏi xác nhận trước khi xoá.
•	Không cho xoá sân đang có lượt đặt, báo lỗi bằng Alert.
Câu 4 – Chi tiết sân và Đặt sân (1,5 điểm)
•	Nhấn vào một sân để mở màn hình Chi tiết: thông tin sân và danh sách các lượt đặt của sân đó.
•	Nút "Đặt sân" mở Modal để nhập thông tin đặt sân.
•	Thành tiền (pricePerHour × hours) được tính và hiển thị ngay khi nhập số giờ.
•	Không cho đặt sân đang Bảo trì: nút bị vô hiệu hoá.
Câu 5 – Kiểm tra trùng lịch (1,5 điểm)
•	Kiểm tra số điện thoại và khung giờ hợp lệ (giờ kết thúc không quá 23h).
•	Không cho đặt trùng lịch: cùng sân, cùng ngày và khung giờ giao nhau với lượt đặt đã có. Ví dụ: đã có lượt 17h–19h thì không được đặt 18h–20h, nhưng được đặt 19h–20h.
•	Có thể huỷ một lượt đặt, có hỏi xác nhận.
Câu 6 – Lưu trữ (1 điểm)
•	Lưu cả danh sách sân và lượt đặt bằng AsyncStorage; tắt rồi mở lại ứng dụng dữ liệu vẫn còn.
Câu 7 – Giao diện (2 điểm)
Chấm theo tiêu chí ở bảng dưới đây.
TIÊU CHÍ CHẤM GIAO DIỆN – CÂU 7 (2 điểm)
Tiêu chí	Điểm	Yêu cầu
Thống nhất	0,5	Có bảng màu chung (khai báo trong một file theme/colors); font và cỡ chữ nhất quán giữa các màn hình. Dùng StyleSheet.create, hạn chế style inline.
Bố cục	0,5	Khoảng cách (padding, margin) đều; mỗi dòng danh sách trình bày dạng thẻ (card) có bo góc, đổ bóng (elevation/shadow); thông tin chính nổi bật hơn thông tin phụ.
Phản hồi thao tác	0,5	Nút có hiệu ứng khi nhấn; nút bị vô hiệu hoá trông khác biệt; có trạng thái danh sách rỗng; ô nhập sai có viền đỏ.
Trải nghiệm	0,5	Bàn phím không che ô nhập (KeyboardAvoidingView/ScrollView); dùng đúng loại bàn phím (numeric, phone-pad); hiển thị đúng trong vùng an toàn (tai thỏ, thanh trạng thái).
THANG ĐIỂM
Câu	Nội dung	Điểm
1	Danh sách	1,5
2	Thêm / Sửa	1,5
3	Xoá	1,0
4	Chi tiết và nghiệp vụ	1,5
5	Kiểm tra trùng lịch	1,5
6	Lưu trữ AsyncStorage	1,0
7	Giao diện	2,0
    Tổng	10

Trừ điểm:
•	Ứng dụng bị crash khi thao tác: trừ 1 điểm mỗi lỗi, tối đa 2 điểm.
•	Toàn bộ code trong một file, không tách component/màn hình: trừ 0,5 điểm.
•	Không chạy được bằng React Native CLI (ví dụ dùng Expo): không chấm bài.



