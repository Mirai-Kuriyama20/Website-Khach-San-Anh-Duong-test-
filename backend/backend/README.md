# 🚀 BACKEND - KHÁCH SẠN ÁNH DƯƠNG (EXPRESS.JS REST API)

Thư mục chứa toàn bộ mã nguồn Backend của hệ thống Website Đặt Phòng Khách Sạn Ánh Dương (SOF3033).

---

## 📂 Cấu Trúc Thư Mục Backend
```text
backend/
├── server.js        # Express API Server (Cổng 5000, CORS *, 30+ endpoints)
├── db_data.json     # Cơ sở dữ liệu JSON lưu trữ bền vững
└── package.json     # Cấu hình npm & dependencies độc lập của backend
```

---

## 🛠️ Hướng Dẫn Khởi Chạy Backend

### 1. Cài đặt thư viện (nếu cài riêng trong backend)
```bash
cd backend
npm install
```

### 2. Khởi động máy chủ API
```bash
node server.js
# Hoặc:
npm start
```
Server sẽ chạy tại: **`http://localhost:5000`**

### 3. Khởi động từ thư mục gốc dự án:
```bash
npm run backend
```

---

## 📡 Danh Sách API Chính (Port 5000)
- `GET /api/hotel-info` - Lấy thông tin khách sạn Ánh Dương 5 sao
- `GET /api/room-types` - Danh mục 6 hạng phòng cao cấp
- `GET /api/rooms` - Danh sách phòng vật lý & sơ đồ phòng Room Rack
- `POST /api/check-availability` - Kiểm tra phòng trống thời gian thực & chống trùng lịch
- `POST /api/lock-room` - Khóa giữ phòng 15 phút (Room Lock countdown)
- `POST /api/bookings` - Tạo đơn đặt phòng & tính cọc 30%
- `POST /api/vouchers/apply` - Xác thực & áp dụng mã giảm giá
- `POST /api/bookings/:id/check-in` - Thực hiện thủ tục nhận phòng
- `POST /api/bookings/:id/check-out` - Thực hiện thủ tục trả phòng
- `POST /api/bookings/:id/cancel` - Hủy phòng & nhả phòng trống ngay lập tức
- `POST /api/bookings/:id/reschedule` - Đổi lịch phòng có kiểm tra xung đột ngày
- `POST /api/rooms/:id/toggle-maintenance` - Admin đổi trạng thái bảo trì
- `GET /api/reports/revenue` - Báo cáo thống kê doanh thu & công suất phòng
