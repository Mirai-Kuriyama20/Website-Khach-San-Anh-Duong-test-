/**
 * BACKEND SERVER - KHÁCH SẠN ÁNH DƯƠNG (EXPRESS.JS REST API)
 * Port: 5000 | Mở CORS cho mọi nguồn (*) để Live Server (port 5500, v.v.) gọi trực tiếp
 * Lưu trữ bền vững vào server/db_data.json
 * Đáp ứng đầy đủ 30 trường hợp kiểm thử trong tài liệu Test Plan SOF3033
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db_data.json');

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Tải dữ liệu ban đầu từ js/data.js nếu db_data.json chưa tồn tại
function getInitialData() {
    try {
        const dataPath = path.join(__dirname, '../js/data.js');
        if (fs.existsSync(dataPath)) {
            const dataMod = require(dataPath);
            return {
                hotelInfo: dataMod.INITIAL_HOTEL_INFO,
                roomTypes: dataMod.INITIAL_ROOM_TYPES,
                rooms: dataMod.INITIAL_ROOMS,
                services: dataMod.INITIAL_SERVICES,
                vouchers: dataMod.INITIAL_VOUCHERS,
                users: dataMod.INITIAL_USERS,
                bookings: dataMod.INITIAL_BOOKINGS,
                reviews: dataMod.INITIAL_REVIEWS,
                notifications: []
            };
        }
    } catch (e) {
        console.error("Lỗi khi load data.js:", e.message);
    }
    return {
        hotelInfo: {},
        roomTypes: [],
        rooms: [],
        services: [],
        vouchers: [],
        users: [],
        bookings: [],
        reviews: [],
        notifications: []
    };
}

// Đọc Database từ JSON
function readDb() {
    if (!fs.existsSync(DB_FILE)) {
        const initData = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initData, null, 2), 'utf-8');
        return initData;
    }
    try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error("Lỗi đọc db_data.json:", err.message);
        const initData = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initData, null, 2), 'utf-8');
        return initData;
    }
}

// Ghi Database vào JSON
function writeDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error("Lỗi ghi db_data.json:", err.message);
        return false;
    }
}

// Tự động giải phóng các phòng đã hết hạn khóa giữ 15 phút (BUG-CR-01)
function releaseExpiredLocks(db) {
    const now = Date.now();
    let changed = false;
    db.rooms.forEach(room => {
        if (room.lockedUntil && room.lockedUntil < now) {
            room.lockedUntil = null;
            room.lockedBySession = null;
            room.lockedCheckIn = null;
            room.lockedCheckOut = null;
            if (room.status === 'locked') {
                room.status = 'available';
            }
            changed = true;
        }
    });
    if (changed) {
        writeDb(db);
    }
}

// Middleware dọn dẹp lock mỗi request
app.use((req, res, next) => {
    const db = readDb();
    releaseExpiredLocks(db);
    next();
});

// Helper kiểm tra trùng khoảng ngày (BUG-MA-01 & BUG-MA-02)
// newIn < bOut && newOut > bIn
function isDateOverlap(startA, endA, startB, endB) {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();
    return sA < eB && eA > sB;
}

// ==================== REST API ENDPOINTS ====================

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        hotel: 'Khách Sạn Ánh Dương (Anh Duong Luxury Hotel 5*)',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// 2. Thông tin khách sạn
app.get('/api/hotel-info', (req, res) => {
    const db = readDb();
    res.json(db.hotelInfo);
});

// 3. Danh mục hạng phòng
app.get('/api/room-types', (req, res) => {
    const db = readDb();
    res.json(db.roomTypes);
});

// 4. Danh sách phòng vật lý (Room Rack)
app.get('/api/rooms', (req, res) => {
    const db = readDb();
    res.json(db.rooms);
});

// 5. Kiểm tra phòng trống theo thời gian thực (Check-in, Check-out, Hạng phòng, Số người)
// BUG-CR-01, BUG-CR-02, BUG-MA-01, BUG-MA-02, BUG-MA-03, BUG-MI-01
app.get('/api/rooms/check-availability', (req, res) => {
    const { checkIn, checkOut, roomTypeId, guests } = req.query;
    const db = readDb();
    const todayStr = new Date().toISOString().split('T')[0];

    // BUG-CR-02 & BUG-MI-01: Chặn chọn ngày quá khứ
    if (!checkIn || checkIn < todayStr) {
        return res.status(400).json({
            success: false,
            message: 'Ngày nhận phòng không hợp lệ hoặc nằm trong quá khứ! (Check-in phải từ hôm nay)'
        });
    }

    // BUG-CR-02 & BUG-MI-01: Chặn checkOut <= checkIn
    if (!checkOut || checkOut <= checkIn) {
        return res.status(400).json({
            success: false,
            message: 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!'
        });
    }

    const guestCount = parseInt(guests) || 1;

    // Tìm phòng phù hợp
    const availableRooms = db.rooms.filter(room => {
        // Kiểm tra bảo trì (BUG-MA-08)
        if (room.status === 'maintenance') return false;

        // Lọc theo loại phòng nếu có yêu cầu
        if (roomTypeId && room.typeId !== roomTypeId) return false;

        // Lấy thông tin loại phòng để kiểm tra sức chứa (BUG-MA-03)
        const typeInfo = db.roomTypes.find(t => t.id === room.typeId);
        if (typeInfo && guestCount > typeInfo.maxAdults) {
            return false;
        }

        // Kiểm tra xem phòng có đang bị khóa giữ chỗ không (BUG-CR-01)
        if (room.lockedUntil && room.lockedUntil > Date.now()) {
            // Nếu bị khóa trong cùng khoảng ngày
            if (room.lockedCheckIn && room.lockedCheckOut) {
                if (isDateOverlap(checkIn, checkOut, room.lockedCheckIn, room.lockedCheckOut)) {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Kiểm tra trùng lịch đặt phòng thực tế (BUG-MA-01 & BUG-MA-02)
        const conflictingBooking = db.bookings.find(b => 
            b.roomId === room.id &&
            b.status !== 'cancelled' &&
            isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
        );

        return !conflictingBooking;
    });

    res.json({
        success: true,
        checkIn,
        checkOut,
        guests: guestCount,
        totalAvailable: availableRooms.length,
        rooms: availableRooms
    });
});

// 6. Khóa giữ phòng tạm thời 15 phút (BUG-CR-01, BUG-MA-06)
app.post('/api/rooms/lock', (req, res) => {
    const { roomId, sessionId, checkIn, checkOut } = req.body;
    if (!roomId || !sessionId || !checkIn || !checkOut) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin phòng, session hoặc khoảng ngày đặt!'
        });
    }

    const db = readDb();
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng!' });
    }

    if (room.status === 'maintenance') {
        return res.status(400).json({ success: false, message: 'Phòng đang trong trạng thái bảo trì!' });
    }

    const now = Date.now();

    // Nếu phòng đang bị khóa bởi người khác
    if (room.lockedUntil && room.lockedUntil > now && room.lockedBySession !== sessionId) {
        const remainingSeconds = Math.round((room.lockedUntil - now) / 1000);
        return res.status(409).json({
            success: false,
            message: `Phòng ${room.roomNumber} đang được giữ chỗ bởi khách hàng khác. Vui lòng chọn phòng khác hoặc đợi ${Math.ceil(remainingSeconds / 60)} phút nữa!`
        });
    }

    // Kiểm tra trùng lịch với booking đã thanh toán
    const overlapBooking = db.bookings.find(b =>
        b.roomId === room.id &&
        b.status !== 'cancelled' &&
        isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
    );

    if (overlapBooking) {
        return res.status(409).json({
            success: false,
            message: `Phòng ${room.roomNumber} đã có khách đặt từ ${overlapBooking.checkIn} đến ${overlapBooking.checkOut}!`
        });
    }

    // Khóa phòng 15 phút (900 giây)
    const lockDuration = 15 * 60 * 1000;
    room.lockedUntil = now + lockDuration;
    room.lockedBySession = sessionId;
    room.lockedCheckIn = checkIn;
    room.lockedCheckOut = checkOut;

    writeDb(db);

    res.json({
        success: true,
        message: `Đã giữ chỗ thành công phòng ${room.roomNumber} trong 15 phút.`,
        lockedUntil: room.lockedUntil,
        timeoutSeconds: 900
    });
});

// 7. Giải phóng khóa phòng (Unlock)
app.post('/api/rooms/unlock', (req, res) => {
    const { roomId, sessionId } = req.body;
    const db = readDb();
    const room = db.rooms.find(r => r.id === roomId);
    if (room && (room.lockedBySession === sessionId || !sessionId)) {
        room.lockedUntil = null;
        room.lockedBySession = null;
        room.lockedCheckIn = null;
        room.lockedCheckOut = null;
        writeDb(db);
        return res.json({ success: true, message: 'Đã giải phóng khóa phòng.' });
    }
    res.json({ success: true, message: 'Không có khóa cần giải phóng.' });
});

// 8. Đặt phòng mới & Xuất hóa đơn điện tử (BUG-CR-01, 02, 03, 04, BUG-MA-01->06, 09, BUG-MI-01->04, 07)
app.post('/api/bookings', (req, res) => {
    const {
        roomId,
        checkIn,
        checkOut,
        customerName,
        phone,
        email,
        guests,
        services = [],
        voucherCode = "",
        sessionId = "",
        notes = ""
    } = req.body;

    const db = readDb();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Validate ngày (BUG-CR-02 & BUG-MI-01)
    if (!checkIn || checkIn < todayStr) {
        return res.status(400).json({ success: false, message: 'Ngày nhận phòng không hợp lệ hoặc trong quá khứ!' });
    }
    if (!checkOut || checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!' });
    }

    // 2. Validate thông tin khách (BUG-MI-02, BUG-MI-03, BUG-MI-04)
    if (!customerName || customerName.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập họ và tên khách hàng hợp lệ (tối thiểu 2 ký tự)!' });
    }

    // Regex SĐT Việt Nam: 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09 (BUG-MI-04)
    const phoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không đúng định dạng Việt Nam! (Gồm 10 chữ số, ví dụ 0988123456)' });
    }

    // Regex Email (BUG-MI-03)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Địa chỉ Email không đúng định dạng! (Ví dụ: name@example.com)' });
    }

    // 3. Tìm phòng và hạng phòng
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Phòng không tồn tại!' });
    }
    if (room.status === 'maintenance') {
        return res.status(400).json({ success: false, message: 'Phòng đang bảo trì, không thể nhận khách!' });
    }

    const roomType = db.roomTypes.find(t => t.id === room.typeId);
    if (!roomType) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin hạng phòng!' });
    }

    // 4. Validate sức chứa (BUG-MA-03)
    const guestCount = parseInt(guests) || 1;
    if (guestCount > roomType.maxAdults) {
        return res.status(400).json({
            success: false,
            message: `Hạng phòng ${roomType.name} chỉ chứa tối đa ${roomType.maxAdults} người lớn. Bạn đang chọn ${guestCount} người!`
        });
    }

    // 5. Kiểm tra Race Condition / Khóa phòng (BUG-CR-01, BUG-MA-06)
    const now = Date.now();
    if (room.lockedUntil && room.lockedUntil > now && room.lockedBySession && room.lockedBySession !== sessionId) {
        return res.status(409).json({
            success: false,
            message: `Phòng ${room.roomNumber} đang được giữ chỗ bởi khách hàng khác!`
        });
    }

    // 6. Kiểm tra xung đột lịch đặt (BUG-MA-01, BUG-MA-02)
    const conflict = db.bookings.find(b =>
        b.roomId === room.id &&
        b.status !== 'cancelled' &&
        isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
    );
    if (conflict) {
        return res.status(409).json({
            success: false,
            message: `Phòng ${room.roomNumber} đã có khách đặt từ ${conflict.checkIn} đến ${conflict.checkOut}!`
        });
    }

    // 7. Tính số đêm và tiền phòng (BUG-MA-04, BUG-MA-05)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const roomRate = roomType.pricePerNight;
    const roomAmount = nights * roomRate;

    // 8. Tính tiền dịch vụ đi kèm
    let servicesAmount = 0;
    const selectedServiceDetails = [];
    if (Array.isArray(services)) {
        services.forEach(srvId => {
            const srv = db.services.find(s => s.id === srvId);
            if (srv) {
                // Nếu là buffet tính theo số người x số đêm
                let itemTotal = srv.price;
                if (srv.id === 'SRV_BUFFET') {
                    itemTotal = srv.price * guestCount * nights;
                }
                servicesAmount += itemTotal;
                selectedServiceDetails.push({
                    id: srv.id,
                    name: srv.name,
                    price: srv.price,
                    unit: srv.unit,
                    amount: itemTotal
                });
            }
        });
    }

    // 9. Tính giảm giá Voucher (BUG-MA-09)
    let discountAmount = 0;
    let appliedVoucher = null;
    const subtotal = roomAmount + servicesAmount;

    if (voucherCode && voucherCode.trim()) {
        const voucher = db.vouchers.find(v => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
        if (voucher) {
            if (subtotal >= voucher.minSpend) {
                if (voucher.discountType === 'percent') {
                    discountAmount = Math.round((subtotal * voucher.value) / 100);
                    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                        discountAmount = voucher.maxDiscount;
                    }
                } else if (voucher.discountType === 'fixed') {
                    discountAmount = voucher.value;
                }
                appliedVoucher = voucher.code;
            }
        }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    // Tiền cọc 30% (BUG-MA-09)
    const depositAmount = Math.round(totalAmount * 0.3);
    const remainingAmount = totalAmount - depositAmount;

    // 10. Tạo mã đặt phòng duy nhất dạng AD-2026-XXXX (BUG-CR-04)
    let bookingCode = '';
    do {
        const rand = Math.floor(1000 + Math.random() * 9000);
        bookingCode = `AD-2026-${rand}`;
    } while (db.bookings.some(b => b.bookingCode === bookingCode));

    // 11. Tạo hóa đơn & Booking
    const newBooking = {
        id: bookingCode,
        bookingCode,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomTypeId: roomType.id,
        roomTypeName: roomType.vietnameseName,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        checkIn,
        checkOut,
        nights,
        guests: guestCount,
        services: services,
        serviceDetails: selectedServiceDetails,
        roomRate,
        roomAmount,
        servicesAmount,
        voucherCode: appliedVoucher || "",
        discountAmount,
        totalAmount,
        depositAmount,
        remainingAmount,
        notes,
        status: "confirmed", // Đặt thành công chuyển sang confirmed
        paymentStatus: "deposited", // Đã đặt cọc 30%
        createdAt: new Date().toISOString()
    };

    // 12. Cập nhật trạng thái Room Rack (BUG-CR-03)
    // Nếu ngày nhận phòng là hôm nay -> occupied, nếu tương lai -> reserved
    room.status = (checkIn === todayStr) ? 'occupied' : 'reserved';
    room.currentBookingId = bookingCode;
    room.lockedUntil = null;
    room.lockedBySession = null;
    room.lockedCheckIn = null;
    room.lockedCheckOut = null;

    db.bookings.push(newBooking);

    // 13. Gửi Email thông báo chuẩn UTF-8 (BUG-MI-07)
    const notification = {
        id: `NOTIF_${Date.now()}`,
        bookingCode,
        recipientEmail: email.trim(),
        recipientName: customerName.trim(),
        subject: `[Khách Sạn Ánh Dương] Xác nhận đặt phòng thành công - Mã ${bookingCode}`,
        body: `Kính gửi Quý khách ${customerName.trim()},\n\nKhách Sạn Ánh Dương xin chân thành cảm ơn Quý khách đã tin tưởng lựa chọn dịch vụ của chúng tôi.\nThông tin đặt phòng:\n- Mã đặt phòng: ${bookingCode}\n- Phòng: ${room.roomNumber} (${roomType.vietnameseName})\n- Thời gian lưu trú: Từ ngày ${checkIn} đến ngày ${checkOut} (${nights} đêm)\n- Tổng chi phí: ${totalAmount.toLocaleString('vi-VN')} VNĐ\n- Số tiền đã đặt cọc (30%): ${depositAmount.toLocaleString('vi-VN')} VNĐ\n- Số tiền thanh toán tại quầy lễ tân: ${remainingAmount.toLocaleString('vi-VN')} VNĐ\n\nChúc Quý khách có kỳ nghỉ tuyệt vời và tràn ngập niềm vui tại Khách Sạn Ánh Dương!`,
        sentAt: new Date().toISOString(),
        status: "sent"
    };
    db.notifications.unshift(notification);

    writeDb(db);

    res.status(201).json({
        success: true,
        message: 'Đặt phòng và thanh toán đặt cọc thành công!',
        booking: newBooking
    });
});

// 9. Tra cứu đặt phòng theo Mã đặt phòng hoặc SĐT
app.get('/api/bookings/lookup', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đặt phòng hoặc số điện thoại!' });
    }

    const q = query.trim().toUpperCase();
    const db = readDb();
    const results = db.bookings.filter(b => 
        b.bookingCode.toUpperCase() === q ||
        b.phone.includes(query.trim())
    );

    if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đặt phòng nào phù hợp!' });
    }

    res.json({ success: true, count: results.length, bookings: results });
});

// 10. Hủy đặt phòng - Giải phóng phòng trống ngay lập tức (BUG-CR-05)
app.post('/api/bookings/:id/cancel', (req, res) => {
    const bookingId = req.params.id;
    const { reason = "Khách hàng yêu cầu hủy" } = req.body;
    const db = readDb();

    const booking = db.bookings.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt phòng!' });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Đơn đặt phòng này đã bị hủy trước đó!' });
    }

    booking.status = 'cancelled';
    booking.cancelReason = reason;
    booking.cancelledAt = new Date().toISOString();

    // BUG-CR-05: Giải phóng phòng vật lý ngay lập tức về 'available'
    const room = db.rooms.find(r => r.id === booking.roomId);
    if (room) {
        // Kiểm tra xem phòng có booking nào khác đang active hôm nay không
        const todayStr = new Date().toISOString().split('T')[0];
        const otherActiveToday = db.bookings.find(b =>
            b.id !== booking.id &&
            b.roomId === room.id &&
            b.status !== 'cancelled' &&
            b.checkIn <= todayStr &&
            b.checkOut > todayStr
        );

        if (otherActiveToday) {
            room.status = (otherActiveToday.status === 'checked-in') ? 'occupied' : 'reserved';
            room.currentBookingId = otherActiveToday.bookingCode;
        } else {
            room.status = 'available';
            room.currentBookingId = null;
        }
    }

    // Gửi thông báo email hủy phòng chuẩn UTF-8
    const notification = {
        id: `NOTIF_${Date.now()}`,
        bookingCode: booking.bookingCode,
        recipientEmail: booking.email,
        recipientName: booking.customerName,
        subject: `[Khách Sạn Ánh Dương] Xác nhận hủy đặt phòng - Mã ${booking.bookingCode}`,
        body: `Kính gửi Quý khách ${booking.customerName},\n\nYêu cầu hủy đơn đặt phòng ${booking.bookingCode} của Quý khách đã được xử lý thành công.\nPhòng ${booking.roomNumber} đã được giải phóng. Số tiền hoàn cọc (nếu đủ điều kiện chính sách hủy phòng) sẽ được hoàn về tài khoản trong 2-3 ngày làm việc.\n\nTrân trọng cảm ơn Quý khách!`,
        sentAt: new Date().toISOString(),
        status: "sent"
    };
    db.notifications.unshift(notification);

    writeDb(db);

    res.json({
        success: true,
        message: 'Đã hủy đặt phòng thành công. Phòng đã được giải phóng sang trạng thái Trống!',
        booking
    });
});

// 11. Đổi lịch đặt phòng (Reschedule) có kiểm tra xung đột ngày (BUG-MA-07)
app.post('/api/bookings/:id/reschedule', (req, res) => {
    const bookingId = req.params.id;
    const { newCheckIn, newCheckOut } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    if (!newCheckIn || newCheckIn < todayStr) {
        return res.status(400).json({ success: false, message: 'Ngày nhận phòng mới không hợp lệ hoặc nằm trong quá khứ!' });
    }
    if (!newCheckOut || newCheckOut <= newCheckIn) {
        return res.status(400).json({ success: false, message: 'Ngày trả phòng mới phải sau ngày nhận phòng ít nhất 1 đêm!' });
    }

    const db = readDb();
    const booking = db.bookings.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt phòng!' });
    }
    if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Không thể đổi lịch cho đơn đã hủy!' });
    }

    // BUG-MA-07: Kiểm tra xung đột ngày với các booking khác của cùng phòng
    const conflict = db.bookings.find(b =>
        b.id !== booking.id &&
        b.roomId === booking.roomId &&
        b.status !== 'cancelled' &&
        isDateOverlap(newCheckIn, newCheckOut, b.checkIn, b.checkOut)
    );

    if (conflict) {
        return res.status(409).json({
            success: false,
            message: `Không thể đổi lịch sang khoảng ngày này vì phòng đã có khách đặt từ ${conflict.checkIn} đến ${conflict.checkOut}!`
        });
    }

    // Tính lại số đêm và giá
    const inDate = new Date(newCheckIn);
    const outDate = new Date(newCheckOut);
    const newNights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    
    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.nights = newNights;
    // Tính lại tổng tiền và giảm giá voucher nếu có (BUG-MA-09)
    const subtotal = booking.roomAmount + (booking.servicesAmount || 0);
    let discountAmount = 0;
    if (booking.voucherCode) {
        const voucher = db.vouchers.find(v => v.code.toUpperCase() === booking.voucherCode.trim().toUpperCase());
        if (voucher && subtotal >= voucher.minSpend) {
            if (voucher.discountType === 'percent') {
                discountAmount = Math.round((subtotal * voucher.value) / 100);
                if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                    discountAmount = voucher.maxDiscount;
                }
            } else if (voucher.discountType === 'fixed') {
                discountAmount = voucher.value;
            }
        }
        booking.discountAmount = discountAmount;
    } else {
        discountAmount = booking.discountAmount || 0;
    }

    booking.totalAmount = Math.max(0, subtotal - discountAmount);
    booking.depositAmount = Math.round(booking.totalAmount * 0.3);
    booking.remainingAmount = booking.totalAmount - booking.depositAmount;
    booking.rescheduledAt = new Date().toISOString();

    writeDb(db);

    res.json({
        success: true,
        message: 'Đổi lịch lưu trú thành công!',
        booking
    });
});

// 12. Check-in phòng (Lễ tân)
app.post('/api/bookings/:id/checkin', (req, res) => {
    const bookingId = req.params.id;
    const db = readDb();
    const booking = db.bookings.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt phòng!' });
    }

    booking.status = 'checked-in';
    booking.checkedInAt = new Date().toISOString();

    // Cập nhật trạng thái phòng sang 'occupied'
    const room = db.rooms.find(r => r.id === booking.roomId);
    if (room) {
        room.status = 'occupied';
        room.currentBookingId = booking.bookingCode;
    }

    writeDb(db);
    res.json({ success: true, message: `Đã check-in thành công cho khách ${booking.customerName}!`, booking });
});

// 13. Check-out phòng (Lễ tân)
app.post('/api/bookings/:id/checkout', (req, res) => {
    const bookingId = req.params.id;
    const db = readDb();
    const booking = db.bookings.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt phòng!' });
    }

    booking.status = 'completed';
    booking.paymentStatus = 'paid_full';
    booking.checkedOutAt = new Date().toISOString();

    // Cập nhật phòng về 'available'
    const room = db.rooms.find(r => r.id === booking.roomId);
    if (room) {
        room.status = 'available';
        room.currentBookingId = null;
    }

    writeDb(db);
    res.json({ success: true, message: `Đã hoàn tất check-out và thanh toán đầy đủ cho phòng ${booking.roomNumber}!`, booking });
});

// 14. Admin cập nhật trạng thái phòng vật lý (Bảo trì <-> Trống) (BUG-MA-08)
app.post('/api/rooms/:id/status', (req, res) => {
    const roomId = req.params.id;
    const { status, reason = "" } = req.body;
    const validStatuses = ['available', 'maintenance', 'reserved', 'occupied'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái phòng không hợp lệ!' });
    }

    const db = readDb();
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng!' });
    }

    room.status = status;
    if (status === 'maintenance') {
        room.maintenanceReason = reason || "Bảo dưỡng kỹ thuật";
    } else {
        delete room.maintenanceReason;
    }

    writeDb(db);
    res.json({
        success: true,
        message: `Đã cập nhật trạng thái phòng ${room.roomNumber} sang '${status}'!`,
        room
    });
});

// 15. Áp dụng Voucher (BUG-MA-09)
app.post('/api/vouchers/apply', (req, res) => {
    const { code, amount } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá!' });
    }

    const subtotal = Number(amount) || 0;
    const db = readDb();
    const voucher = db.vouchers.find(v => v.code.toUpperCase() === code.trim().toUpperCase());

    if (!voucher) {
        return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn!' });
    }

    if (subtotal < voucher.minSpend) {
        return res.status(400).json({
            success: false,
            message: `Mã ${voucher.code} chỉ áp dụng cho đơn từ ${voucher.minSpend.toLocaleString('vi-VN')} VNĐ trở lên!`
        });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
        discountAmount = Math.round((subtotal * voucher.value) / 100);
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
            discountAmount = voucher.maxDiscount;
        }
    } else {
        discountAmount = voucher.value;
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);
    const newDeposit = Math.round(finalAmount * 0.3);

    res.json({
        success: true,
        voucherCode: voucher.code,
        discountAmount,
        finalAmount,
        newDeposit,
        description: voucher.description
    });
});

// 16. Báo cáo thống kê doanh thu & Tỷ lệ lấp đầy
app.get('/api/reports', (req, res) => {
    const db = readDb();
    const totalRooms = db.rooms.length;
    const occupiedOrReserved = db.rooms.filter(r => r.status === 'occupied' || r.status === 'reserved').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedOrReserved / totalRooms) * 100) : 0;

    let totalRevenue = 0;
    let actualDeposited = 0;
    let activeBookingsCount = 0;

    db.bookings.forEach(b => {
        if (b.status !== 'cancelled') {
            activeBookingsCount++;
            totalRevenue += (b.totalAmount || 0);
            actualDeposited += (b.depositAmount || 0);
        }
    });

    res.json({
        totalRooms,
        occupancyRate,
        totalBookings: db.bookings.length,
        activeBookings: activeBookingsCount,
        totalRevenue,
        actualDeposited,
        maintenanceRooms: db.rooms.filter(r => r.status === 'maintenance').length,
        availableRooms: db.rooms.filter(r => r.status === 'available').length
    });
});

// 17. Danh sách Email Thông báo UTF-8 (BUG-MI-07)
app.get('/api/notifications', (req, res) => {
    const db = readDb();
    res.json(db.notifications || []);
});

// 18. Đánh giá (Reviews)
app.get('/api/reviews', (req, res) => {
    const db = readDb();
    res.json(db.reviews || []);
});

app.post('/api/reviews', (req, res) => {
    const { customerName, rating, roomTypeId, comment } = req.body;
    if (!customerName || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, số sao và nhận xét!' });
    }

    const db = readDb();
    const newReview = {
        id: `REV_${Date.now()}`,
        customerName: customerName.trim(),
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
        roomTypeId: roomTypeId || "STD",
        comment: comment.trim(),
        date: new Date().toISOString().split('T')[0]
    };

    db.reviews.unshift(newReview);
    writeDb(db);

    res.status(201).json({ success: true, review: newReview });
});

// 18b. Danh sách người dùng hệ thống (không lộ password)
app.get('/api/users', (req, res) => {
    const db = readDb();
    const safeUsers = (db.users || []).map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        phone: u.phone,
        email: u.email
    }));
    res.json(safeUsers);
});

// 19. Đăng nhập phân quyền (Admin / Receptionist / Customer)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            email: user.email
        }
    });
});

// Phục vụ tĩnh thư mục gốc (phòng trường hợp người dùng mở server port 5000)
app.use(express.static(path.join(__dirname, '..')));

// Khởi động server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏨 KHÁCH SẠN ÁNH DƯƠNG - BACKEND SERVER ĐANG CHẠY`);
        console.log(`🌐 Cổng API: http://localhost:${PORT}`);
        console.log(`📂 Database: ${DB_FILE}`);
        console.log(`⚡ CORS mở cho Live Server (*)`);
        console.log(`=======================================================`);
    });
}

module.exports = { app, readDb, writeDb, releaseExpiredLocks, isDateOverlap };
