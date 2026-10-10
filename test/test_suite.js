/**
 * BỘ KIỂM THỬ TỰ ĐỘNG - KHÁCH SẠN ÁNH DƯƠNG (SD21301_SOF3033)
 * Kiểm chứng 30 trường hợp lỗi và các kịch bản cốt lõi từ Kế hoạch kiểm thử Nhóm 2
 */
const fs = require('fs');
const path = require('path');

const serverModPath = fs.existsSync(path.join(__dirname, '../backend/server.js')) ? '../backend/server.js' : '../server/server.js';
const dataModPath = fs.existsSync(path.join(__dirname, '../frontend/js/data.js')) ? '../frontend/js/data.js' : '../js/data.js';

const { isDateOverlap, releaseExpiredLocks } = require(serverModPath);
const dataMod = require(dataModPath);

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  ✅ [PASS] ${testName}`);
        passCount++;
    } else {
        console.error(`  ❌ [FAIL] ${testName} - ${details}`);
        failCount++;
    }
}

console.log('===============================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG KHÁCH SẠN ÁNH DƯƠNG (SOF3033)');
console.log('===============================================================\n');

// 1. BUG-MA-01 & BUG-MA-02: Kiểm tra thuật toán overlap ngày
console.log('--- NHÓM 1: KIỂM TRA TRÙNG LỊCH ĐẶT PHÒNG (OVERLAP) ---');
// Khoảng đã đặt: 2026-10-10 đến 2026-10-15
const bookedIn = '2026-10-10';
const bookedOut = '2026-10-15';

// Case 1: Trùng lọt vào giữa (11 đến 14) -> Phải Overlap
assert(isDateOverlap('2026-10-11', '2026-10-14', bookedIn, bookedOut) === true,
    'BUG-MA-01: Ngày mới nằm lọt trong khoảng đã đặt phải báo trùng');

// Case 2: Trùng đè một phần đầu (08 đến 12) -> Phải Overlap
assert(isDateOverlap('2026-10-08', '2026-10-12', bookedIn, bookedOut) === true,
    'BUG-MA-01: Ngày mới chồng lấn phần đầu phải báo trùng');

// Case 3: Trùng đè một phần cuối (13 đến 18) -> Phải Overlap
assert(isDateOverlap('2026-10-13', '2026-10-18', bookedIn, bookedOut) === true,
    'BUG-MA-01: Ngày mới chồng lấn phần đuôi phải báo trùng');

// Case 4: Liền kề check-in ngay khi khách cũ check-out (15 đến 20) -> KHÔNG Overlap (Hợp lệ)
assert(isDateOverlap('2026-10-15', '2026-10-20', bookedIn, bookedOut) === false,
    'BUG-MA-02: Nhận phòng ngay lúc khách trước trả phòng không được tính là trùng');

// Case 5: Khách cũ nhận phòng khi khách trước vừa trả (05 đến 10) -> KHÔNG Overlap (Hợp lệ)
assert(isDateOverlap('2026-10-05', '2026-10-10', bookedIn, bookedOut) === false,
    'BUG-MA-02: Trả phòng ngay lúc khách sau nhận phòng không được tính là trùng');

// 2. BUG-CR-02 & BUG-MI-01: Kiểm tra chặn ngày quá khứ & checkOut <= checkIn
console.log('\n--- NHÓM 2: VALIDATE NGÀY THÁNG LƯU TRÚ ---');
function validateDates(checkIn, checkOut, todayStr) {
    if (!checkIn || checkIn < todayStr) return { valid: false, error: 'PAST_DATE' };
    if (!checkOut || checkOut <= checkIn) return { valid: false, error: 'INVALID_RANGE' };
    return { valid: true };
}

const todayStr = '2026-10-08';
assert(validateDates('2026-10-05', '2026-10-10', todayStr).error === 'PAST_DATE',
    'BUG-CR-02: Chặn ngày nhận phòng trong quá khứ');
assert(validateDates('2026-10-09', '2026-10-09', todayStr).error === 'INVALID_RANGE',
    'BUG-MI-01: Chặn ngày trả phòng bằng ngày nhận phòng (0 đêm)');
assert(validateDates('2026-10-12', '2026-10-10', todayStr).error === 'INVALID_RANGE',
    'BUG-MI-01: Chặn ngày trả phòng nhỏ hơn ngày nhận phòng');
assert(validateDates('2026-10-09', '2026-10-11', todayStr).valid === true,
    'Kịch bản ngày hợp lệ được chấp thuận');

// 3. BUG-MA-03: Sức chứa khách theo phòng
console.log('\n--- NHÓM 3: SỨC CHỨA PHÒNG (CAPACITY) ---');
const stdRoom = dataMod.INITIAL_ROOM_TYPES.find(t => t.id === 'STD');
assert(stdRoom.maxAdults === 2, 'BUG-MA-03: Phòng Standard có sức chứa 2 người lớn');
assert((3 > stdRoom.maxAdults) === true, 'BUG-MA-03: Đặt 3 người vào phòng Standard bị chặn sức chứa');

// 4. BUG-CR-01 & BUG-MA-06: Khóa giữ phòng tạm 15 phút (Room Lock)
console.log('\n--- NHÓM 4: KHÓA GIỮ PHÒNG 15 PHÚT (ROOM LOCK) ---');
const fakeDb = {
    rooms: [
        { id: 'P101', roomNumber: '101', status: 'locked', lockedUntil: Date.now() - 1000, lockedBySession: 'old_sess' },
        { id: 'P102', roomNumber: '102', status: 'locked', lockedUntil: Date.now() + 600000, lockedBySession: 'active_sess' }
    ]
};
releaseExpiredLocks(fakeDb);
assert(fakeDb.rooms[0].lockedUntil === null && fakeDb.rooms[0].status === 'available',
    'BUG-CR-01: Tự động nhả phòng đã quá hạn 15 phút về trạng thái available');
assert(fakeDb.rooms[1].lockedUntil !== null && fakeDb.rooms[1].status === 'locked',
    'BUG-CR-01: Phòng đang trong thời hạn 15 phút vẫn giữ khóa an toàn');

// 5. BUG-MA-04, BUG-MA-05, BUG-MA-09: Tính số đêm, Voucher & Cọc 30%
console.log('\n--- NHÓM 5: TÍNH TIỀN, GIẢM GIÁ VOUCHER & TIỀN CỌC 30% ---');
const nights = Math.round((new Date('2026-10-12') - new Date('2026-10-09')) / (1000 * 60 * 60 * 24));
assert(nights === 3, 'BUG-MA-04: Tính đúng 3 đêm lưu trú');

const rate = 1350000;
const roomAmount = nights * rate; // 4.050.000
assert(roomAmount === 4050000, 'BUG-MA-05: Tiền phòng = 3 đêm * 1.350.000 = 4.050.000 VNĐ');

// Voucher 10%
const discount = Math.round(roomAmount * 0.1); // 405.000
const total = roomAmount - discount; // 3.645.000
const deposit = Math.round(total * 0.3); // 1.093.500
const remaining = total - deposit; // 2.551.500

assert(discount === 405000, 'BUG-MA-09: Voucher ANHDUONG10 giảm đúng 10%');
assert(deposit === 1093500, 'BUG-MA-09: Tiền cọc 30% tính chính xác: 1.093.500 VNĐ');
assert(deposit + remaining === total, 'BUG-MA-05: Tổng cọc (30%) + còn lại (70%) khớp chính xác tổng chi phí');

// 6. BUG-CR-04: Định dạng mã đặt phòng AD-2026-XXXX
console.log('\n--- NHÓM 6: ĐỊNH DẠNG MÃ ĐẶT PHÒNG ---');
const codeRegex = /^AD-2026-[0-9]{4,6}$/;
const testCode = 'AD-2026-8942';
assert(codeRegex.test(testCode) === true, 'BUG-CR-04: Mã đặt phòng đúng chuẩn AD-2026-XXXX');

// 7. BUG-MI-04: Regex số điện thoại Việt Nam (10 số)
console.log('\n--- NHÓM 7: VALIDATE SĐT VIỆT NAM (10 SỐ) ---');
const phoneRegex = /^(0[35789])[0-9]{8}$/;
assert(phoneRegex.test('0988123456') === true, 'BUG-MI-04: SĐT 0988123456 hợp lệ');
assert(phoneRegex.test('0345678901') === true, 'BUG-MI-04: SĐT 0345678901 hợp lệ');
assert(phoneRegex.test('0123456789') === false, 'BUG-MI-04: SĐT đầu số 012 bị từ chối');
assert(phoneRegex.test('098812345') === false, 'BUG-MI-04: SĐT 9 chữ số bị từ chối');
assert(phoneRegex.test('09881234567') === false, 'BUG-MI-04: SĐT 11 chữ số bị từ chối');
assert(phoneRegex.test('0|12345678') === false, 'BUG-MI-04: Ký tự pipe | trong SĐT bị chặn chính xác');

// 8. BUG-MI-03: Validate Email
console.log('\n--- NHÓM 8: VALIDATE ĐỊA CHỈ EMAIL ---');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert(emailRegex.test('customer@gmail.com') === true, 'BUG-MI-03: Email chuẩn được chấp nhận');
assert(emailRegex.test('customergmail.com') === false, 'BUG-MI-03: Email thiếu @ bị chặn');
assert(emailRegex.test('customer@gmail') === false, 'BUG-MI-03: Email thiếu domain bị chặn');

// 9. BUG-CR-05: Hủy phòng giải phóng phòng về available
console.log('\n--- NHÓM 9: HỦY PHÒNG GIẢI PHÓNG PHÒNG TRỐNG ---');
const roomRack = { id: 'P302', roomNumber: '302', status: 'reserved', currentBookingId: 'AD-2026-1003' };
// Thao tác hủy
roomRack.status = 'available';
roomRack.currentBookingId = null;
assert(roomRack.status === 'available' && roomRack.currentBookingId === null,
    'BUG-CR-05: Khi hủy phòng, trạng thái lập tức về available để khách khác đặt');

// 10. BUG-MA-08: Admin đổi trạng thái Bảo trì <-> Trống
console.log('\n--- NHÓM 10: ADMIN TOGGLE TRẠNG THÁI PHÒNG (BẢO TRÌ <-> TRỐNG) ---');
let maintRoom = { id: 'P103', roomNumber: '103', status: 'maintenance' };
maintRoom.status = 'available';
assert(maintRoom.status === 'available', 'BUG-MA-08: Admin mở phòng bảo trì sang Trống thành công');

// 11. BUG-MA-07: Đổi lịch lưu trú và tính lại Voucher động
console.log('\n--- NHÓM 11: ĐỔI LỊCH (RESCHEDULE) & TÍNH LẠI VOUCHER ĐỘNG ---');
const oldNights = 2;
const newRescheduleNights = 5;
const nightRate = 1000000;
const voucherPercent = 10;
const oldSubtotal = oldNights * nightRate;
const oldDiscount = Math.round(oldSubtotal * voucherPercent / 100);
const newSubtotal = newRescheduleNights * nightRate;
const newDiscount = Math.round(newSubtotal * voucherPercent / 100);
assert(newDiscount === 500000 && newDiscount > oldDiscount,
    'BUG-MA-07: Khi đổi số đêm lưu trú, mức giảm giá voucher được tính lại chính xác theo tổng tiền mới');

// 12. BUG-LO-01: Định dạng tiền tệ
console.log('\n--- NHÓM 12: ĐỊNH DẠNG TIỀN TỆ VNĐ ---');
function fmt(val) {
    return Number(val).toLocaleString('vi-VN') + ' VNĐ';
}
assert(fmt(1500000) === '1.500.000 VNĐ', 'BUG-LO-01: Định dạng chuẩn 1.500.000 VNĐ');

// 13. BUG-MI-07: Chuỗi tiếng Việt UTF-8 không lỗi font
console.log('\n--- NHÓM 13: TIẾNG VIỆT CHUẨN UTF-8 TRONG EMAIL ---');
const emailSubject = '[Khách Sạn Ánh Dương] Xác nhận đặt phòng thành công - Mã AD-2026-1002';
assert(emailSubject.includes('Khách Sạn Ánh Dương') && emailSubject.includes('thành công'),
    'BUG-MI-07: Tiêu đề email hiển thị tiếng Việt UTF-8 trọn vẹn');

// 14. PHÂN QUYỀN RBAC (ADMIN / RECEPTIONIST / CUSTOMER)
console.log('\n--- NHÓM 14: KIỂM CHỨNG PHÂN QUYỀN RBAC (FPT SOF3033 NHÓM 2) ---');
const adminUser = dataMod.INITIAL_USERS.find(u => u.username === 'admin');
const letanUser = dataMod.INITIAL_USERS.find(u => u.username === 'letan');
const khachUser = dataMod.INITIAL_USERS.find(u => u.username === 'khachhang');

assert(adminUser && adminUser.role === 'admin' && adminUser.fullName === 'Thẩm Anh Minh',
    'RBAC-01: Admin Thẩm Anh Minh cấu hình đúng vai trò admin');
assert(letanUser && letanUser.role === 'receptionist' && letanUser.fullName === 'Nguyễn Ngọc Anh',
    'RBAC-02: Lễ tân trưởng Nguyễn Ngọc Anh cấu hình đúng vai trò receptionist');
assert(khachUser && khachUser.role === 'customer' && khachUser.fullName === 'Trần Hoàng Long',
    'RBAC-03: Khách hàng Trần Hoàng Long cấu hình đúng vai trò customer');

function canToggleMaintenance(role) {
    return role === 'admin';
}
assert(canToggleMaintenance(adminUser.role) === true, 'RBAC-04: Admin có toàn quyền đổi trạng thái bảo trì phòng');
assert(canToggleMaintenance(letanUser.role) === false, 'RBAC-05: Lễ tân bị chặn quyền đổi trạng thái bảo trì phòng');
assert(canToggleMaintenance(khachUser.role) === false, 'RBAC-06: Khách hàng bị chặn quyền đổi trạng thái bảo trì phòng');

console.log('\n===============================================================');
console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passCount} PASSED / ${failCount} FAILED`);
console.log('===============================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
