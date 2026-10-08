// Main Application Script for Khách Sạn Ánh Dương
(function () {
  // State management using LocalStorage
  const STORAGE_KEYS = {
    ROOMS: 'anhduong_rooms_data',
    BOOKINGS: 'anhduong_bookings_data',
    CURRENT_SEARCH: 'anhduong_search_state'
  };

  // Helper formatting currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  // Load or initialize data
  let roomsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS)) || window.ANH_DUONG_DATA.rooms;
  let bookingsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || window.ANH_DUONG_DATA.initialBookings;

  function saveRooms() {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(roomsData));
  }

  function saveBookings() {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookingsData));
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    toastMsg.textContent = message;
    if (type === 'error') {
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center px-5 py-3 rounded-xl shadow-2xl text-white bg-rose-600 transition-all duration-300 transform translate-y-0 opacity-100';
      toastIcon.className = 'fa-solid fa-circle-exclamation mr-3 text-lg';
    } else {
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center px-5 py-3 rounded-xl shadow-2xl text-white bg-emerald-600 transition-all duration-300 transform translate-y-0 opacity-100';
      toastIcon.className = 'fa-solid fa-circle-check mr-3 text-lg';
    }

    setTimeout(() => {
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center px-5 py-3 rounded-xl shadow-2xl text-white bg-slate-800 transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none';
    }, 4000);
  }

  // 1. Render Rooms List
  function renderRooms(filterType = 'all') {
    const container = document.getElementById('rooms-container');
    if (!container) return;

    let types = window.ANH_DUONG_DATA.roomTypes;
    if (filterType !== 'all') {
      types = types.filter(t => t.id === filterType);
    }

    container.innerHTML = types.map(room => {
      const availableRoomsCount = roomsData.filter(r => r.typeId === room.id && r.status === 'available').length;
      return `
        <div class="room-card bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 flex flex-col group">
          <div class="relative overflow-hidden h-64">
            <img src="${room.images[0]}" alt="${room.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-4 left-4 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              ${room.badge}
            </span>
            <div class="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-md font-medium">
              <i class="fa-solid fa-door-open mr-1"></i> Còn ${availableRoomsCount} phòng trống
            </div>
          </div>
          
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span><i class="fa-solid fa-arrows-up-down-left-right text-amber-600 mr-1"></i>${room.size} m²</span>
                <span><i class="fa-solid fa-bed text-amber-600 mr-1"></i>${room.bed}</span>
                <span><i class="fa-solid fa-user-group text-amber-600 mr-1"></i>${room.maxAdults} người lớn</span>
              </div>

              <h3 class="text-xl font-bold font-serif text-slate-800 group-hover:text-amber-700 transition-colors mb-2">${room.name}</h3>
              <p class="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">${room.description}</p>
              
              <div class="border-t border-slate-100 pt-3 mb-4">
                <span class="text-xs font-medium text-slate-400 block mb-1.5">Tiện nghi tiêu biểu:</span>
                <div class="flex flex-wrap gap-1.5">
                  ${room.amenities.slice(0, 3).map(a => `<span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">${a}</span>`).join('')}
                  <span class="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">+${room.amenities.length - 3} tiện ích</span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-400 block">Giá mỗi đêm</span>
                <span class="text-xl font-bold text-amber-700">${formatCurrency(room.basePrice)}</span>
              </div>
              <div class="flex gap-2">
                <button onclick="window.viewRoomDetail('${room.id}')" class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-400 rounded-xl transition-all">
                  Chi tiết
                </button>
                <button onclick="window.selectRoomForBooking('${room.id}')" class="px-4 py-2 text-xs font-semibold text-white gold-gradient hover:opacity-95 rounded-xl shadow-md transition-all">
                  Đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Services
  function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;

    container.innerHTML = window.ANH_DUONG_DATA.services.map(s => `
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col group">
        <div class="h-48 overflow-hidden relative">
          <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-amber-600 shadow">
            <i class="fa-solid ${s.icon} text-lg"></i>
          </div>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-serif font-bold text-lg text-slate-800 mb-2">${s.name}</h4>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">${s.description}</p>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-400 block">Đơn giá</span>
              <span class="text-base font-bold text-amber-700">${formatCurrency(s.price)}</span>
              <span class="text-xs text-slate-500">/${s.unit}</span>
            </div>
            <button onclick="window.addServiceToBooking('${s.id}')" class="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-amber-300 hover:bg-slate-800 rounded-lg transition-colors">
              <i class="fa-solid fa-plus mr-1"></i> Đặt kèm
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 3. Room Detail Modal
  window.viewRoomDetail = function (roomId) {
    const room = window.ANH_DUONG_DATA.roomTypes.find(r => r.id === roomId);
    if (!room) return;

    const modal = document.getElementById('room-detail-modal');
    const content = document.getElementById('room-detail-content');

    content.innerHTML = `
      <div class="p-6 sm:p-8">
        <div class="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <span class="text-xs font-semibold text-amber-600 uppercase tracking-widest">${room.badge}</span>
            <h2 class="text-2xl sm:text-3xl font-bold font-serif text-slate-800">${room.name}</h2>
            <p class="text-slate-500 text-sm mt-1"><i class="fa-solid fa-location-dot text-amber-600 mr-1.5"></i>Khách sạn Ánh Dương Nha Trang • ${room.view}</p>
          </div>
          <button onclick="window.closeRoomDetail()" class="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
            &times;
          </button>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="rounded-2xl overflow-hidden h-72 shadow-md mb-3">
              <img id="detail-main-img" src="${room.images[0]}" class="w-full h-full object-cover">
            </div>
            <div class="grid grid-cols-3 gap-2">
              ${room.images.map((img, idx) => `
                <img src="${img}" class="h-20 w-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border-2 ${idx === 0 ? 'border-amber-600' : 'border-transparent'}" onclick="document.getElementById('detail-main-img').src='${img}'">
              `).join('')}
            </div>
          </div>

          <div class="flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-slate-800 text-base mb-2">Mô tả phòng</h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-4">${room.description}</p>

              <div class="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl mb-4 text-xs">
                <div><span class="text-slate-400">Diện tích:</span> <strong class="text-slate-700">${room.size} m²</strong></div>
                <div><span class="text-slate-400">Giường:</span> <strong class="text-slate-700">${room.bed}</strong></div>
                <div><span class="text-slate-400">Số khách tối đa:</span> <strong class="text-slate-700">${room.maxAdults} người lớn, ${room.maxChildren} trẻ em</strong></div>
                <div><span class="text-slate-400">Tầm nhìn:</span> <strong class="text-slate-700">${room.view}</strong></div>
              </div>

              <h3 class="font-bold text-slate-800 text-base mb-2">Tiện nghi trọn gói</h3>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-6">
                ${room.amenities.map(a => `
                  <li class="flex items-center"><i class="fa-solid fa-circle-check text-emerald-500 mr-2 text-sm"></i>${a}</li>
                `).join('')}
              </ul>
            </div>

            <div class="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div>
                <span class="text-xs text-amber-800 font-medium">Giá phòng tiêu chuẩn</span>
                <div class="text-2xl font-bold text-amber-900">${formatCurrency(room.basePrice)} <span class="text-xs font-normal">/đêm</span></div>
              </div>
              <button onclick="window.closeRoomDetail(); window.selectRoomForBooking('${room.id}')" class="px-6 py-3 gold-gradient text-white font-semibold text-sm rounded-xl shadow hover:opacity-95 transition-all">
                Đặt phòng này
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeRoomDetail = function () {
    const modal = document.getElementById('room-detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  // 4. Booking Logic
  let currentBookingState = {
    roomTypeId: 'rt-std',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 nights
    adults: 2,
    children: 0,
    services: [],
    couponCode: '',
    discountAmount: 0
  };

  function updateBookingCalculations() {
    const checkInDate = new Date(currentBookingState.checkIn);
    const checkOutDate = new Date(currentBookingState.checkOut);
    let diffDays = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (isNaN(diffDays) || diffDays < 1) diffDays = 1;

    const roomType = window.ANH_DUONG_DATA.roomTypes.find(r => r.id === currentBookingState.roomTypeId) || window.ANH_DUONG_DATA.roomTypes[0];
    const roomTotal = roomType.basePrice * diffDays;

    let servicesTotal = 0;
    currentBookingState.services.forEach(srvId => {
      const srv = window.ANH_DUONG_DATA.services.find(s => s.id === srvId);
      if (srv) servicesTotal += srv.price;
    });

    const subtotal = roomTotal + servicesTotal;
    let discount = 0;

    if (currentBookingState.couponCode) {
      const coupon = window.ANH_DUONG_DATA.coupons.find(c => c.code.toUpperCase() === currentBookingState.couponCode.toUpperCase());
      if (coupon) {
        if (coupon.discountType === 'percent') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        }
      }
    }

    currentBookingState.discountAmount = discount;
    const finalTotal = Math.max(0, subtotal - discount);
    const depositAmount = Math.round(finalTotal * 0.3); // 30% deposit

    // Update UI elements
    const elRoomName = document.getElementById('calc-room-name');
    const elNights = document.getElementById('calc-nights');
    const elRoomTotal = document.getElementById('calc-room-total');
    const elServicesTotal = document.getElementById('calc-services-total');
    const elDiscountRow = document.getElementById('calc-discount-row');
    const elDiscount = document.getElementById('calc-discount');
    const elFinalTotal = document.getElementById('calc-final-total');
    const elDepositAmount = document.getElementById('calc-deposit-amount');
    const qrImage = document.getElementById('booking-vietqr-img');

    if (elRoomName) elRoomName.textContent = roomType.name;
    if (elNights) elNights.textContent = `${diffDays} đêm`;
    if (elRoomTotal) elRoomTotal.textContent = formatCurrency(roomTotal);
    if (elServicesTotal) elServicesTotal.textContent = formatCurrency(servicesTotal);

    if (elDiscountRow && elDiscount) {
      if (discount > 0) {
        elDiscountRow.classList.remove('hidden');
        elDiscount.textContent = `-${formatCurrency(discount)}`;
      } else {
        elDiscountRow.classList.add('hidden');
      }
    }

    if (elFinalTotal) elFinalTotal.textContent = formatCurrency(finalTotal);
    if (elDepositAmount) elDepositAmount.textContent = formatCurrency(depositAmount);

    if (qrImage) {
      const transferMemo = `AD-${Date.now().toString().slice(-4)}`;
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=2026-ANHDUONG-HOTEL-${depositAmount}-${transferMemo}`;
    }

    return { diffDays, roomTotal, servicesTotal, discount, finalTotal, depositAmount, roomType };
  }

  window.selectRoomForBooking = function (roomTypeId) {
    currentBookingState.roomTypeId = roomTypeId;
    const select = document.getElementById('booking-room-type');
    if (select) select.value = roomTypeId;
    updateBookingCalculations();
    const bookingSection = document.getElementById('dat-phong');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast('Đã chọn phòng! Vui lòng hoàn tất thông tin đặt phòng.');
  };

  window.addServiceToBooking = function (serviceId) {
    if (!currentBookingState.services.includes(serviceId)) {
      currentBookingState.services.push(serviceId);
      renderBookingServiceCheckboxes();
      updateBookingCalculations();
      showToast('Đã thêm dịch vụ vào đơn đặt phòng!');
    } else {
      showToast('Dịch vụ này đã được chọn trong đơn.', 'error');
    }
    const bookingSection = document.getElementById('dat-phong');
    if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
  };

  function renderBookingServiceCheckboxes() {
    const container = document.getElementById('booking-services-checkboxes');
    if (!container) return;

    container.innerHTML = window.ANH_DUONG_DATA.services.map(s => {
      const isChecked = currentBookingState.services.includes(s.id);
      return `
        <label class="flex items-center justify-between p-3 rounded-xl border ${isChecked ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-white'} cursor-pointer hover:border-amber-400 transition-all text-xs">
          <div class="flex items-center gap-2">
            <input type="checkbox" value="${s.id}" ${isChecked ? 'checked' : ''} onchange="window.toggleBookingService('${s.id}')" class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4">
            <span class="font-medium text-slate-800">${s.name}</span>
          </div>
          <span class="font-bold text-amber-700">${formatCurrency(s.price)}</span>
        </label>
      `;
    }).join('');
  }

  window.toggleBookingService = function (serviceId) {
    const idx = currentBookingState.services.indexOf(serviceId);
    if (idx > -1) {
      currentBookingState.services.splice(idx, 1);
    } else {
      currentBookingState.services.push(serviceId);
    }
    renderBookingServiceCheckboxes();
    updateBookingCalculations();
  };

  window.applyCoupon = function () {
    const input = document.getElementById('coupon-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    const couponMsg = document.getElementById('coupon-msg');

    if (!code) {
      currentBookingState.couponCode = '';
      if (couponMsg) couponMsg.textContent = '';
      updateBookingCalculations();
      return;
    }

    const coupon = window.ANH_DUONG_DATA.coupons.find(c => c.code === code);
    if (coupon) {
      currentBookingState.couponCode = code;
      if (couponMsg) {
        couponMsg.className = 'text-xs text-emerald-600 font-medium mt-1';
        couponMsg.textContent = `Áp dụng thành công: ${coupon.description}`;
      }
      updateBookingCalculations();
      showToast('Áp dụng mã ưu đãi thành công!');
    } else {
      currentBookingState.couponCode = '';
      if (couponMsg) {
        couponMsg.className = 'text-xs text-rose-500 font-medium mt-1';
        couponMsg.textContent = 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.';
      }
      updateBookingCalculations();
      showToast('Mã voucher không tồn tại!', 'error');
    }
  };

  // Submit Booking Form
  window.handleBookingSubmit = function (event) {
    event.preventDefault();

    const fullName = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const notes = document.getElementById('cust-notes').value.trim();

    if (!fullName || !phone) {
      showToast('Vui lòng nhập họ tên và số điện thoại liên hệ!', 'error');
      return;
    }

    const calc = updateBookingCalculations();

    // Find available room
    const availableRoom = roomsData.find(r => r.typeId === currentBookingState.roomTypeId && r.status === 'available');
    const assignedRoomNumber = availableRoom ? availableRoom.roomNumber : "Theo sắp xếp lễ tân";

    // Create unique booking
    const bookingCode = `AD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      bookingCode,
      customerName: fullName,
      phone,
      email,
      roomTypeId: currentBookingState.roomTypeId,
      roomNumber: assignedRoomNumber,
      checkIn: currentBookingState.checkIn,
      checkOut: currentBookingState.checkOut,
      nights: calc.diffDays,
      adults: currentBookingState.adults,
      children: currentBookingState.children,
      services: [...currentBookingState.services],
      couponCode: currentBookingState.couponCode,
      roomTotal: calc.roomTotal,
      servicesTotal: calc.servicesTotal,
      discountAmount: calc.discount,
      finalTotal: calc.finalTotal,
      depositAmount: calc.depositAmount,
      paymentStatus: 'paid_deposit',
      bookingStatus: 'confirmed',
      createdAt: new Date().toISOString(),
      notes
    };

    // Update room status if assigned
    if (availableRoom) {
      availableRoom.status = 'reserved';
      availableRoom.guest = fullName;
      saveRooms();
    }

    bookingsData.unshift(newBooking);
    saveBookings();

    // Show Invoice / Confirmation Modal
    window.showInvoiceModal(newBooking);
    showToast(`Đặt phòng thành công! Mã đơn: ${bookingCode}`);

    // Re-render
    renderRooms();
    renderAdminRack();
    renderAdminBookings();
  };

  // 5. Invoice Modal
  window.showInvoiceModal = function (booking) {
    const modal = document.getElementById('invoice-modal');
    const container = document.getElementById('invoice-print-area');
    const roomType = window.ANH_DUONG_DATA.roomTypes.find(r => r.id === booking.roomTypeId) || {};

    const serviceNames = (booking.services || []).map(sId => {
      const s = window.ANH_DUONG_DATA.services.find(srv => srv.id === sId);
      return s ? s.name : sId;
    }).join(', ') || 'Không chọn';

    container.innerHTML = `
      <div class="border-b-2 border-amber-600 pb-4 mb-6 flex justify-between items-start">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-crown text-amber-600 text-xl"></i>
            <h2 class="text-2xl font-bold font-serif text-slate-800 tracking-wide">KHÁCH SẠN ÁNH DƯƠNG</h2>
          </div>
          <p class="text-xs text-slate-500">88 Trần Phú, Lộc Thọ, TP. Nha Trang, Khánh Hòa</p>
          <p class="text-xs text-slate-500">Hotline: 1900 888 666 • Email: reservation@khachsananhduong.vn</p>
        </div>
        <div class="text-right">
          <span class="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-1">XÁC NHẬN ĐẶT PHÒNG</span>
          <div class="text-base font-bold text-slate-800">Mã: ${booking.bookingCode}</div>
          <div class="text-xs text-slate-400">Ngày tạo: ${new Date(booking.createdAt).toLocaleDateString('vi-VN')}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-slate-50 rounded-xl">
        <div>
          <span class="text-slate-400 block mb-0.5">Khách hàng:</span>
          <strong class="text-slate-800 text-sm">${booking.customerName}</strong>
          <p class="text-slate-600 mt-0.5"><i class="fa-solid fa-phone mr-1 text-slate-400"></i>${booking.phone}</p>
          <p class="text-slate-600"><i class="fa-solid fa-envelope mr-1 text-slate-400"></i>${booking.email || 'N/A'}</p>
        </div>
        <div>
          <span class="text-slate-400 block mb-0.5">Thông tin lưu trú:</span>
          <strong class="text-slate-800 text-sm">${roomType.name || 'Phòng nghỉ'}</strong>
          <p class="text-slate-600 mt-0.5">Phòng số: <strong>${booking.roomNumber}</strong></p>
          <p class="text-slate-600">Từ: <strong>${booking.checkIn}</strong> Đến: <strong>${booking.checkOut}</strong> (${booking.nights} đêm)</p>
        </div>
      </div>

      <table class="w-full text-xs text-left mb-6 border-collapse">
        <thead>
          <tr class="border-b border-slate-200 text-slate-400 uppercase font-semibold">
            <th class="py-2">Khoản mục</th>
            <th class="py-2 text-right">Chi tiết</th>
            <th class="py-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr>
            <td class="py-3 font-medium">${roomType.name || 'Tiền phòng'}</td>
            <td class="py-3 text-right text-slate-500">${booking.nights} đêm x ${formatCurrency(roomType.basePrice || 0)}</td>
            <td class="py-3 text-right font-semibold">${formatCurrency(booking.roomTotal)}</td>
          </tr>
          ${booking.servicesTotal > 0 ? `
            <tr>
              <td class="py-3 font-medium">Dịch vụ gia tăng</td>
              <td class="py-3 text-right text-slate-500">${serviceNames}</td>
              <td class="py-3 text-right font-semibold">${formatCurrency(booking.servicesTotal)}</td>
            </tr>
          ` : ''}
          ${booking.discountAmount > 0 ? `
            <tr class="text-emerald-700">
              <td class="py-3 font-medium">Ưu đãi giảm giá (${booking.couponCode})</td>
              <td class="py-3 text-right">Khuyến mãi</td>
              <td class="py-3 text-right font-semibold">-${formatCurrency(booking.discountAmount)}</td>
            </tr>
          ` : ''}
        </tbody>
        <tfoot class="border-t-2 border-slate-200 text-slate-800">
          <tr>
            <td colspan="2" class="py-3 text-right font-bold text-sm">Tổng cộng:</td>
            <td class="py-3 text-right font-bold text-base text-amber-700">${formatCurrency(booking.finalTotal)}</td>
          </tr>
          <tr>
            <td colspan="2" class="py-1 text-right text-slate-500">Đã cọc (30%):</td>
            <td class="py-1 text-right font-semibold text-emerald-600">${formatCurrency(booking.depositAmount)}</td>
          </tr>
          <tr>
            <td colspan="2" class="py-1 text-right text-slate-500">Còn thanh toán tại lễ tân:</td>
            <td class="py-1 text-right font-semibold text-slate-800">${formatCurrency(booking.finalTotal - booking.depositAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="border-t border-dashed border-slate-200 pt-4 text-[11px] text-slate-500 flex justify-between items-center">
        <div>
          <p><i class="fa-solid fa-clock mr-1 text-amber-600"></i>Nhận phòng: 14:00 • Trả phòng: 12:00</p>
          <p>Xuất trình CMND/CCCD hoặc Hộ chiếu khi nhận phòng tại quầy Lễ tân Ánh Dương.</p>
        </div>
        <div class="text-right font-serif italic text-amber-700">
          Cảm ơn quý khách đã tin chọn Ánh Dương!
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeInvoiceModal = function () {
    const modal = document.getElementById('invoice-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  // 6. Booking Lookup
  window.searchMyBookings = function () {
    const query = document.getElementById('lookup-input').value.trim().toLowerCase();
    const resultContainer = document.getElementById('lookup-results');

    if (!query) {
      showToast('Vui lòng nhập mã đơn hoặc số điện thoại!', 'error');
      return;
    }

    const matched = bookingsData.filter(b => 
      b.bookingCode.toLowerCase().includes(query) || 
      b.phone.includes(query)
    );

    if (matched.length === 0) {
      resultContainer.innerHTML = `
        <div class="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
          <i class="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-3"></i>
          <p class="text-slate-600 font-medium">Không tìm thấy thông tin đặt phòng phù hợp!</p>
          <p class="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại mã đơn (VD: AD-2026-8910) hoặc số điện thoại đã đăng ký.</p>
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = matched.map(b => {
      const roomType = window.ANH_DUONG_DATA.roomTypes.find(r => r.id === b.roomTypeId) || {};
      const statusBadge = {
        'confirmed': '<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Đã xác nhận</span>',
        'checked_in': '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">Đang ở</span>',
        'checked_out': '<span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">Đã trả phòng</span>',
        'cancelled': '<span class="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold">Đã hủy</span>'
      }[b.bookingStatus] || b.bookingStatus;

      return `
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-2">
            <div>
              <span class="text-xs text-slate-400">Mã đặt phòng:</span>
              <strong class="text-lg font-bold text-amber-700 ml-1">${b.bookingCode}</strong>
            </div>
            <div class="flex items-center gap-2">
              ${statusBadge}
              <button onclick='window.showInvoiceModal(${JSON.stringify(b)})' class="px-3 py-1.5 text-xs bg-slate-900 text-amber-300 rounded-lg hover:bg-slate-800 transition-colors">
                <i class="fa-solid fa-receipt mr-1"></i> Xem hóa đơn
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
            <div>
              <span class="text-slate-400 block mb-0.5">Khách đặt:</span>
              <strong class="text-slate-800 text-sm">${b.customerName}</strong>
              <p class="text-slate-500 mt-0.5">${b.phone}</p>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">Hạng phòng & Số phòng:</span>
              <strong class="text-slate-800 text-sm">${roomType.name || 'Phòng khách sạn'}</strong>
              <p class="text-amber-700 font-semibold mt-0.5">Phòng số ${b.roomNumber}</p>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">Thời gian lưu trú:</span>
              <strong class="text-slate-800">${b.checkIn} ➔ ${b.checkOut}</strong>
              <p class="text-slate-500 mt-0.5">${b.nights} đêm (${b.adults} người lớn)</p>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400">Tổng tiền:</span>
              <span class="font-bold text-slate-800 text-sm ml-1">${formatCurrency(b.finalTotal)}</span>
              <span class="text-emerald-600 ml-2">(Đã cọc: ${formatCurrency(b.depositAmount)})</span>
            </div>
            ${b.bookingStatus === 'confirmed' ? `
              <button onclick="window.cancelBooking('${b.bookingCode}')" class="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors">
                <i class="fa-solid fa-ban mr-1"></i> Hủy đặt phòng
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  window.cancelBooking = function (bookingCode) {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn đặt phòng ${bookingCode} không?`)) return;

    const b = bookingsData.find(item => item.bookingCode === bookingCode);
    if (b) {
      b.bookingStatus = 'cancelled';
      // Release room
      const rm = roomsData.find(r => r.roomNumber === b.roomNumber);
      if (rm) {
        rm.status = 'available';
        delete rm.guest;
        saveRooms();
      }
      saveBookings();
      showToast(`Đã hủy thành công đơn ${bookingCode}!`);
      window.searchMyBookings();
      renderRooms();
      renderAdminRack();
      renderAdminBookings();
    }
  };

  // 7. Admin Dashboard
  function renderAdminRack() {
    const rackGrid = document.getElementById('admin-rack-grid');
    if (!rackGrid) return;

    rackGrid.innerHTML = roomsData.map(r => {
      const type = window.ANH_DUONG_DATA.roomTypes.find(t => t.id === r.typeId) || {};
      let badgeClass = 'rack-badge-available';
      let statusText = 'Phòng trống';
      if (r.status === 'occupied') {
        badgeClass = 'rack-badge-occupied';
        statusText = `Đang ở: ${r.guest || 'Khách'}`;
      } else if (r.status === 'reserved') {
        badgeClass = 'rack-badge-reserved';
        statusText = `Đã đặt: ${r.guest || 'Khách'}`;
      } else if (r.status === 'maintenance') {
        badgeClass = 'rack-badge-maintenance';
        statusText = 'Bảo trì';
      }

      return `
        <div class="p-3 rounded-xl border ${badgeClass} text-center flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.cycleRoomStatus('${r.id}')" title="Bấm để đổi trạng thái">
          <div class="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>Tầng ${r.floor}</span>
            <span>${type.code || 'STD'}</span>
          </div>
          <div class="text-xl font-bold font-serif my-1">${r.roomNumber}</div>
          <div class="text-[11px] font-semibold truncate">${statusText}</div>
        </div>
      `;
    }).join('');

    // Update stats
    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.filter(b => b.bookingStatus !== 'cancelled').reduce((acc, b) => acc + (b.finalTotal || 0), 0);
    const occupiedCount = roomsData.filter(r => r.status === 'occupied' || r.status === 'reserved').length;
    const occupancyRate = Math.round((occupiedCount / roomsData.length) * 100);
    const availableCount = roomsData.filter(r => r.status === 'available').length;

    const elStatRevenue = document.getElementById('admin-stat-revenue');
    const elStatBookings = document.getElementById('admin-stat-bookings');
    const elStatOccupancy = document.getElementById('admin-stat-occupancy');
    const elStatAvailable = document.getElementById('admin-stat-available');

    if (elStatRevenue) elStatRevenue.textContent = formatCurrency(totalRevenue);
    if (elStatBookings) elStatBookings.textContent = totalBookings;
    if (elStatOccupancy) elStatOccupancy.textContent = `${occupancyRate}%`;
    if (elStatAvailable) elStatAvailable.textContent = `${availableCount}/${roomsData.length}`;
  }

  window.cycleRoomStatus = function (roomId) {
    const rm = roomsData.find(r => r.id === roomId);
    if (!rm) return;
    const nextStatus = {
      'available': 'occupied',
      'occupied': 'maintenance',
      'maintenance': 'available',
      'reserved': 'available'
    }[rm.status] || 'available';

    rm.status = nextStatus;
    if (nextStatus === 'available') delete rm.guest;
    if (nextStatus === 'occupied' && !rm.guest) rm.guest = 'Khách vãng lai';
    saveRooms();
    renderAdminRack();
    renderRooms();
    showToast(`Đã cập nhật phòng ${rm.roomNumber} sang trạng thái: ${nextStatus}`);
  };

  function renderAdminBookings() {
    const tbody = document.getElementById('admin-bookings-table');
    if (!tbody) return;

    tbody.innerHTML = bookingsData.map(b => {
      const roomType = window.ANH_DUONG_DATA.roomTypes.find(r => r.id === b.roomTypeId) || {};
      return `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
          <td class="p-3 font-bold text-amber-700">${b.bookingCode}</td>
          <td class="p-3">
            <div class="font-semibold text-slate-800">${b.customerName}</div>
            <div class="text-slate-400 text-[11px]">${b.phone}</div>
          </td>
          <td class="p-3">
            <div>${roomType.name || 'Phòng'}</div>
            <div class="font-bold text-slate-600">Phòng ${b.roomNumber}</div>
          </td>
          <td class="p-3">${b.checkIn} ➔ ${b.checkOut}</td>
          <td class="p-3 font-semibold text-slate-800">${formatCurrency(b.finalTotal)}</td>
          <td class="p-3">
            <select onchange="window.updateBookingStatus('${b.bookingCode}', this.value)" class="text-xs bg-white border border-slate-200 rounded-lg p-1 font-medium focus:ring-amber-500">
              <option value="confirmed" ${b.bookingStatus === 'confirmed' ? 'selected' : ''}>Xác nhận</option>
              <option value="checked_in" ${b.bookingStatus === 'checked_in' ? 'selected' : ''}>Đã Check-in</option>
              <option value="checked_out" ${b.bookingStatus === 'checked_out' ? 'selected' : ''}>Đã Check-out</option>
              <option value="cancelled" ${b.bookingStatus === 'cancelled' ? 'selected' : ''}>Hủy đơn</option>
            </select>
          </td>
          <td class="p-3 text-right">
            <button onclick='window.showInvoiceModal(${JSON.stringify(b)})' class="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg" title="In phiếu">
              <i class="fa-solid fa-print"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.updateBookingStatus = function (bookingCode, newStatus) {
    const b = bookingsData.find(item => item.bookingCode === bookingCode);
    if (!b) return;

    b.bookingStatus = newStatus;
    const rm = roomsData.find(r => r.roomNumber === b.roomNumber);

    if (rm) {
      if (newStatus === 'checked_in') {
        rm.status = 'occupied';
        rm.guest = b.customerName;
      } else if (newStatus === 'checked_out' || newStatus === 'cancelled') {
        rm.status = 'available';
        delete rm.guest;
      }
      saveRooms();
    }

    saveBookings();
    renderAdminRack();
    renderAdminBookings();
    renderRooms();
    showToast(`Đã cập nhật trạng thái đơn ${bookingCode}!`);
  };

  // Quick Search Bar Handler
  window.handleQuickSearch = function (e) {
    e.preventDefault();
    const checkIn = document.getElementById('search-checkin').value;
    const checkOut = document.getElementById('search-checkout').value;
    const guests = document.getElementById('search-guests').value;
    const roomType = document.getElementById('search-type').value;

    if (checkIn) currentBookingState.checkIn = checkIn;
    if (checkOut) currentBookingState.checkOut = checkOut;
    if (guests) currentBookingState.adults = parseInt(guests) || 2;
    if (roomType && roomType !== 'all') currentBookingState.roomTypeId = roomType;

    // Sync booking form
    const bookingCheckIn = document.getElementById('cust-checkin');
    const bookingCheckOut = document.getElementById('cust-checkout');
    const bookingRoomSelect = document.getElementById('booking-room-type');
    const bookingAdults = document.getElementById('cust-adults');

    if (bookingCheckIn) bookingCheckIn.value = currentBookingState.checkIn;
    if (bookingCheckOut) bookingCheckOut.value = currentBookingState.checkOut;
    if (bookingRoomSelect && roomType !== 'all') bookingRoomSelect.value = roomType;
    if (bookingAdults) bookingAdults.value = currentBookingState.adults;

    updateBookingCalculations();
    renderRooms(roomType);

    const roomsSection = document.getElementById('phong-nghi');
    if (roomsSection) roomsSection.scrollIntoView({ behavior: 'smooth' });
    showToast('Đã lọc phòng theo thông tin bạn vừa tìm!');
  };

  // Event bindings on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const twoDaysLater = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    const elCheckIn = document.getElementById('search-checkin');
    const elCheckOut = document.getElementById('search-checkout');
    const elCustCheckIn = document.getElementById('cust-checkin');
    const elCustCheckOut = document.getElementById('cust-checkout');

    if (elCheckIn) elCheckIn.value = today;
    if (elCheckOut) elCheckOut.value = twoDaysLater;
    if (elCustCheckIn) {
      elCustCheckIn.value = today;
      elCustCheckIn.addEventListener('change', (e) => {
        currentBookingState.checkIn = e.target.value;
        updateBookingCalculations();
      });
    }
    if (elCustCheckOut) {
      elCustCheckOut.value = twoDaysLater;
      elCustCheckOut.addEventListener('change', (e) => {
        currentBookingState.checkOut = e.target.value;
        updateBookingCalculations();
      });
    }

    const bookingRoomSelect = document.getElementById('booking-room-type');
    if (bookingRoomSelect) {
      bookingRoomSelect.addEventListener('change', (e) => {
        currentBookingState.roomTypeId = e.target.value;
        updateBookingCalculations();
      });
    }

    const bookingAdults = document.getElementById('cust-adults');
    if (bookingAdults) {
      bookingAdults.addEventListener('change', (e) => {
        currentBookingState.adults = parseInt(e.target.value) || 2;
      });
    }

    // Filter Buttons
    document.querySelectorAll('.room-filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.room-filter-btn').forEach(b => {
          b.className = 'room-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:border-amber-400 transition-all';
        });
        this.className = 'room-filter-btn px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-white shadow-md transition-all';
        const type = this.getAttribute('data-type');
        renderRooms(type);
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Initial renders
    renderRooms();
    renderServices();
    renderBookingServiceCheckboxes();
    updateBookingCalculations();
    renderAdminRack();
    renderAdminBookings();
  });
})();
