# DỰ ÁN WEBSITE ĐẶT PHÒNG KHÁCH SẠN ÁNH DƯƠNG (ANH DUONG LUXURY HOTEL 5*)
**Mã môn học:** SD21301_SOF3033 - Kế hoạch kiểm thử dự án phần mềm  
**Đơn vị đào tạo:** FPT Polytechnic  
**Nhóm thực hiện (Nhóm 2):**
- **Thẩm Anh Minh** (Trưởng nhóm / Quản trị hệ thống - Admin)
- **Nguyễn Ngọc Anh** (Lễ tân trưởng - Receptionist)
- **Trần Hoàng Long** (Khách hàng trải nghiệm - Customer)
- **Thành viên:** Nguyễn Hữu Nghĩa, Nguyễn Tiến Bách, Vì Đức Nghĩa, Vũ Tiến Nam, Đào Văn Sơn

---

## 🌟 TÍNH NĂNG NỔI BẬT & ĐÁP ỨNG YÊU CẦU CỐT LÕI

1. **Khả năng chạy 100% qua Live Server (Không cần cài đặt phức tạp):**
   - Mở trực tiếp file `index.html` bằng tiện ích **Live Server** trên VS Code (cổng `5500`) hoặc mở trực tiếp trên trình duyệt.
   - Giao diện hiển thị đầy đủ, không bị lỗi màn hình trắng, không bị lỗi MIME type, không phụ thuộc vào `npm run dev` hay bundler.
   - **Kiến trúc dữ liệu kép (Dual-Mode):** Tự động chuyển đổi sang LocalStorage nếu chưa bật Backend, và tự động đồng bộ API REST khi Backend Express hoạt động.

2. **Backend Express.js hoàn chỉnh (`server/server.js`):**
   - Khởi chạy trên cổng `5000` (`npm start` hoặc `node server/server.js`).
   - Mở CORS cho mọi nguồn (`*`), cho phép Live Server cổng 5500/5501 gọi API trực tiếp.
   - Cơ sở dữ liệu JSON bền vững lưu tại `server/db_data.json`.
   - Đầy đủ API: Kiểm tra phòng trống thời gian thực, Khóa phòng 15 phút, Đặt cọc 30%, Xuất hóa đơn VietQR, Đổi lịch, Hủy phòng giải phóng tức thì, Check-in, Check-out, Thống kê doanh thu, Gửi email UTF-8.

3. **Khắc phục triệt để 30 trường hợp lỗi trong Tài liệu Test Plan:**
   - **BUG-CR-01 & BUG-MA-06:** Chống đặt trùng phòng bằng cơ chế khóa phòng 15 phút (Countdown Room Locking) và kiểm tra lại trạng thái trước khi nhận cọc.
   - **BUG-CR-02 & BUG-MI-01:** Chặn chọn ngày quá khứ, chặn ngày trả phòng nhỏ hơn hoặc bằng ngày nhận phòng, báo lỗi đỏ rõ ràng.
   - **BUG-CR-03:** Trạng thái phòng trên Sơ đồ phòng (Room Rack) cập nhật đồng bộ ngay khi đặt cọc thành công (chuyển sang 'reserved' hoặc 'occupied').
   - **BUG-CR-04:** Tạo mã đặt phòng duy nhất dạng `AD-2026-XXXX`, bật modal hóa đơn điện tử kèm mã VietQR tự động, hỗ trợ in PDF chuẩn.
   - **BUG-CR-05:** Khi khách hủy phòng, phòng được giải phóng ngay lập tức về trạng thái "available" (Trống) để khách khác đặt được ngay.
   - **BUG-MA-01 & BUG-MA-02:** Kiểm tra trùng ngày theo công thức chuẩn (`newIn < bOut && newOut > bIn`).
   - **BUG-MA-03:** Kiểm tra sức chứa tối đa theo từng hạng phòng (`guests > maxAdults`).
   - **BUG-MA-04 & BUG-MA-05:** Tính đúng số đêm lưu trú, tính đúng đơn giá, không lệch giá giữa các màn hình.
   - **BUG-MA-07:** Đổi lịch phòng (Reschedule) kiểm tra xung đột ngày trước khi xác nhận.
   - **BUG-MA-08:** Admin chuyển đổi trạng thái phòng giữa "Bảo trì" và "Trống" cập nhật tức thì trên website.
   - **BUG-MA-09:** Áp dụng Voucher hợp lệ tự động trừ tiền và tính lại 30% tiền cọc ngay lập tức.
   - **BUG-MI-04:** Kiểm tra định dạng số điện thoại Việt Nam (10 chữ số).
   - **BUG-MI-07:** Email thông báo hiển thị tiếng Việt chuẩn UTF-8, không lỗi font.
   - **BUG-LO-01 đến BUG-LO-06:** Định dạng tiền tệ `1.500.000 VNĐ`, chuẩn hóa giao diện màu vàng gold hoàng gia 5 sao, tương thích di động không tràn viền.

4. **Thanh Chuyển Nhanh Vai Trò (Quick Role Switcher) & Phân quyền RBAC:**
   - Tích hợp thanh công cụ trực quan ngay đầu website cho phép chuyển đổi 1-click giữa 3 vai trò đại diện cho Nhóm 2:
     - 👤 **Khách hàng (Trần Hoàng Long):** Tự động điền form đặt phòng, tra cứu đơn cá nhân (AD-2026-1003), xem VietQR.
     - 🛎️ **Lễ tân trưởng (Nguyễn Ngọc Anh):** Quản lý Room Rack, thực hiện Check-in / Check-out cho khách lưu trú, xem email.
     - 👑 **Admin (Thẩm Anh Minh):** Toàn quyền quản trị, chuyển đổi trạng thái phòng (Bảo trì <-> Trống), xem báo cáo doanh thu & tỷ lệ lấp đầy.
   - **Bảo mật phân quyền chặt chẽ:** Chỉ Admin mới có quyền chuyển phòng sang bảo trì; Khách hàng không được truy cập trái phép bảng điều khiển nhân viên.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY

### Cách 1: Chạy trực tiếp với Live Server (Khuyến nghị)
1. Mở thư mục dự án trong VS Code.
2. Click chuột phải vào file `index.html` -> Chọn **"Open with Live Server"** (Cổng `http://127.0.0.1:5500`).
3. Website sẽ mở ngay lập tức trên trình duyệt với đầy đủ chức năng đặt phòng, sơ đồ phòng Room Rack và tra cứu.

### Cách 2: Chạy Backend Express song song
1. Cài đặt dependencies (nếu chưa có):
   ```bash
   npm install
   ```
2. Khởi động server backend:
   ```bash
   node server/server.js
   # Hoặc: npm start
   ```
   Server sẽ lắng nghe tại: `http://localhost:5000`
3. Mở `index.html` qua Live Server, hệ thống sẽ tự động nhận diện huy hiệu xanh **"API Backend Port 5000 (Online)"**.

---

## 🔑 TÀI KHOẢN TRẢI NGHIỆM HỆ THỐNG

| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin` | `admin123` | Thẩm Anh Minh (Leader) |
| **Lễ Tân Trưởng (Receptionist)** | `letan` | `letan123` | Nguyễn Ngọc Anh |
| **Khách Hàng (Customer)** | `khachhang` | `123456` | Trần Hoàng Long |

### Danh sách Mã giảm giá (Vouchers):
- `ANHDUONG10`: Giảm 10% (tối đa 500.000 VNĐ)
- `HE2026`: Giảm 15% (tối đa 800.000 VNĐ)
- `POLYTECH`: Giảm 20% (dành cho sinh viên FPT Polytechnic)
- `VIP50K`: Giảm trực tiếp 50.000 VNĐ
