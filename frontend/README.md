# 💻 FRONTEND - KHÁCH SẠN ÁNH DƯƠNG 5 SAO

Thư mục chứa toàn bộ mã nguồn Frontend độc lập, chạy 100% bằng Live Server hoặc bất kỳ Web Server tĩnh nào mà không cần build tool.

---

## 📂 Cấu Trúc Thư Mục Frontend
```text
frontend/
├── index.html       # Giao diện chính Single Page Application chuẩn 5 sao
├── css/
│   └── style.css    # Hiệu ứng vàng kim hoàng gia, animation, in hóa đơn VietQR
├── js/
│   ├── data.js      # Dữ liệu khởi tạo (6 hạng phòng, 12 phòng vật lý, voucher, dịch vụ)
│   └── app.js       # Toàn bộ logic giao diện, chuyển trang không tạo tab mới, đồng bộ LocalStorage/API
└── README.md        # Hướng dẫn chi tiết
```

---

## 🚀 Hướng Dẫn Mở Bằng Live Server
1. Mở VS Code trong thư mục dự án hoặc trực tiếp thư mục `frontend/`.
2. Click chuột phải vào file **`frontend/index.html`**.
3. Chọn **"Open with Live Server"** (thường mở tại `http://127.0.0.1:5500/frontend/index.html`).
4. Giao diện tải ngay tức thì, phông chữ Montserrat & Playfair Display đồng bộ, hỗ trợ đặt phòng, Room Rack và thanh chuyển nhanh vai trò.
5. **Chế độ Dual-Mode**: Nếu Backend chưa mở, hệ thống tự động hoạt động mượt mà bằng LocalStorage; nếu Backend `http://localhost:5000` đang chạy, frontend tự động đồng bộ API.
