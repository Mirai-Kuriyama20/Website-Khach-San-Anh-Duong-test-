// Main Application Script for Khách Sạn Ánh Dương (SOF3033)
// 100% Live Server compatible & LocalStorage/REST API Dual Mode
(function () {
  // State management keys
  const STORAGE_KEYS = {
    HOTEL_INFO: 'anhduong_hotel_info',
    ROOM_TYPES: 'anhduong_room_types_data',
    ROOMS: 'anhduong_rooms_data',
    SERVICES: 'anhduong_services_data',
    BOOKINGS: 'anhduong_bookings_data',
    CURRENT_SEARCH: 'anhduong_search_state',
    CURRENT_ROLE: 'anhduong_current_role'
  };

  // Currency Formatter: 1.500.000 VNĐ
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  }

  // Active Role State
  let currentUserRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || 'customer';

  // Load or initialize datasets
  let hotelInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTEL_INFO)) || window.ANH_DUONG_DATA.hotelInfo;
  let roomTypesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOM_TYPES)) || window.ANH_DUONG_DATA.roomTypes;
  let roomsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS)) || window.ANH_DUONG_DATA.rooms;
  let servicesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || window.ANH_DUONG_DATA.services;
  let bookingsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || window.ANH_DUONG_DATA.initialBookings;

  function saveHotelInfo() {
    localStorage.setItem(STORAGE_KEYS.HOTEL_INFO, JSON.stringify(hotelInfo));
  }
  function saveRoomTypes() {
    localStorage.setItem(STORAGE_KEYS.ROOM_TYPES, JSON.stringify(roomTypesData));
  }
  function saveRooms() {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(roomsData));
  }
  function saveServices() {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(servicesData));
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
  window.showToast = showToast;

  // SPA Multi-Page Routing (Hiển thị trang mới trong cùng 1 tab duy nhất)
  const PAGE_IDS = [
    'trang-chu',
    'phong-nghi',
    'dich-vu',
    'dat-phong',
    'tra-cuu',
    'gioi-thieu',
    'admin-portal'
  ];

  function navigateToPage(pageId, pushHash = true) {
    if (!pageId || !PAGE_IDS.includes(pageId)) {
      pageId = 'trang-chu';
    }

    PAGE_IDS.forEach(id => {
      const el = document.getElementById('view-' + id);
      if (el) {
        if (id === pageId) {
          el.classList.remove('hidden');
          el.classList.add('animate-fade-in');
        } else {
          el.classList.add('hidden');
          el.classList.remove('animate-fade-in');
        }
      }
    });

    // Update active nav links state
    document.querySelectorAll('.nav-link-item').forEach(link => {
      const target = link.getAttribute('data-page');
      if (target === pageId) {
        link.classList.add('text-amber-700', 'font-bold');
        link.classList.remove('text-slate-700', 'font-medium');
      } else {
        link.classList.remove('text-amber-700', 'font-bold');
        link.classList.add('text-slate-700', 'font-medium');
      }
    });

    if (pushHash && window.location.hash !== '#' + pageId) {
      window.location.hash = pageId;
    }

    // Scroll cleanly to the top of the new page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  }
  window.navigateToPage = navigateToPage;

  // Listen to browser Back / Forward buttons in the same tab
  window.addEventListener('hashchange', () => {
    let rawHash = window.location.hash.replace('#', '');
    if (!rawHash || rawHash === 'trang-chu') {
      navigateToPage('trang-chu', false);
    } else if (PAGE_IDS.includes(rawHash)) {
      navigateToPage(rawHash, false);
    }
  });

  // Global click interceptor: Bắt mọi link #, #trang-chu hoặc các trang để chuyển view ngay trong tab hiện tại
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;

    if (href === '#' || href === '#trang-chu') {
      e.preventDefault();
      navigateToPage('trang-chu');
    } else if (href.startsWith('#')) {
      const page = href.substring(1);
      if (PAGE_IDS.includes(page)) {
        e.preventDefault();
        navigateToPage(page);
      }
    }
  });


  // 1. Role Switcher (RBAC - Nhóm 2 FPT)
  window.switchUserRole = function(role) {
    currentUserRole = role;
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);

    ['customer', 'receptionist', 'admin'].forEach(r => {
      const btn = document.getElementById('role-btn-' + r);
      if (btn) {
        if (r === role) {
          btn.className = 'px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold transition-all';
        } else {
          btn.className = 'px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 hover:text-white transition-all';
        }
      }
    });

    if (role === 'customer') {
      const cust = (window.ANH_DUONG_DATA.users || []).find(u => u.role === 'customer') || {
        fullName: 'Trần Hoàng Long', phone: '0905123456', email: 'khachhang@gmail.com'
      };
      const nameInput = document.getElementById('cust-name');
      const phoneInput = document.getElementById('cust-phone');
      const emailInput = document.getElementById('cust-email');
      if (nameInput) nameInput.value = cust.fullName;
      if (phoneInput) phoneInput.value = cust.phone;
      if (emailInput) emailInput.value = cust.email;
      showToast('Đã chuyển sang vai trò: Khách hàng (Trần Hoàng Long)');
    } else if (role === 'receptionist') {
      showToast('Đã chuyển sang vai trò: Lễ tân trưởng (Nguyễn Ngọc Anh)');
    } else if (role === 'admin') {
      showToast('Đã chuyển sang vai trò: Quản trị viên (Thẩm Anh Minh)');
    }
  };

  // 2. Render Hotel Info throughout the page
  function renderHotelInfo() {
    document.querySelectorAll('.hotel-name-text').forEach(el => el.textContent = hotelInfo.name);
    document.querySelectorAll('.hotel-brand-text').forEach(el => el.textContent = hotelInfo.brand);
    document.querySelectorAll('.hotel-address-text').forEach(el => el.textContent = hotelInfo.address);
    document.querySelectorAll('.hotel-hotline-text').forEach(el => el.textContent = hotelInfo.hotline);
    document.querySelectorAll('.hotel-phone-text').forEach(el => el.textContent = hotelInfo.phone);
    document.querySelectorAll('.hotel-email-text').forEach(el => el.textContent = hotelInfo.email);
    document.querySelectorAll('.hotel-desc-text').forEach(el => el.textContent = hotelInfo.description);

    const bankNameEl = document.getElementById('hotel-bank-name');
    const bankAccEl = document.getElementById('hotel-bank-acc');
    const bankOwnerEl = document.getElementById('hotel-bank-owner');
    if (bankNameEl) bankNameEl.textContent = hotelInfo.bankName;
    if (bankAccEl) bankAccEl.textContent = hotelInfo.bankAccount;
    if (bankOwnerEl) bankOwnerEl.textContent = hotelInfo.bankAccountName;

    const fName = document.getElementById('edit-hotel-name');
    const fBrand = document.getElementById('edit-hotel-brand');
    const fAddress = document.getElementById('edit-hotel-address');
    const fPhone = document.getElementById('edit-hotel-phone');
    const fHotline = document.getElementById('edit-hotel-hotline');
    const fEmail = document.getElementById('edit-hotel-email');
    const fBookingEmail = document.getElementById('edit-hotel-booking-email');
    const fCheckIn = document.getElementById('edit-hotel-checkin');
    const fCheckOut = document.getElementById('edit-hotel-checkout');
    const fBankName = document.getElementById('edit-hotel-bank-name');
    const fBankAccount = document.getElementById('edit-hotel-bank-acc');
    const fBankOwner = document.getElementById('edit-hotel-bank-owner');
    const fDesc = document.getElementById('edit-hotel-desc');

    if (fName) fName.value = hotelInfo.name;
    if (fBrand) fBrand.value = hotelInfo.brand;
    if (fAddress) fAddress.value = hotelInfo.address;
    if (fPhone) fPhone.value = hotelInfo.phone;
    if (fHotline) fHotline.value = hotelInfo.hotline;
    if (fEmail) fEmail.value = hotelInfo.email;
    if (fBookingEmail) fBookingEmail.value = hotelInfo.bookingEmail;
    if (fCheckIn) fCheckIn.value = hotelInfo.checkInTime;
    if (fCheckOut) fCheckOut.value = hotelInfo.checkOutTime;
    if (fBankName) fBankName.value = hotelInfo.bankName;
    if (fBankAccount) fBankAccount.value = hotelInfo.bankAccount;
    if (fBankOwner) fBankOwner.value = hotelInfo.bankAccountName;
    if (fDesc) fDesc.value = hotelInfo.description;
  }

  window.handleSaveHotelInfo = function (e) {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa thông tin khách sạn!', 'error');
      return;
    }
    hotelInfo = {
      ...hotelInfo,
      name: document.getElementById('edit-hotel-name').value.trim(),
      brand: document.getElementById('edit-hotel-brand').value.trim(),
      address: document.getElementById('edit-hotel-address').value.trim(),
      phone: document.getElementById('edit-hotel-phone').value.trim(),
      hotline: document.getElementById('edit-hotel-hotline').value.trim(),
      email: document.getElementById('edit-hotel-email').value.trim(),
      bookingEmail: document.getElementById('edit-hotel-booking-email').value.trim(),
      checkInTime: document.getElementById('edit-hotel-checkin').value.trim(),
      checkOutTime: document.getElementById('edit-hotel-checkout').value.trim(),
      bankName: document.getElementById('edit-hotel-bank-name').value.trim(),
      bankAccount: document.getElementById('edit-hotel-bank-acc').value.trim(),
      bankAccountName: document.getElementById('edit-hotel-bank-owner').value.trim(),
      description: document.getElementById('edit-hotel-desc').value.trim(),
    };
    saveHotelInfo();
    renderHotelInfo();
    updateBookingCalculations();
    showToast('Đã lưu thành công thông tin khách sạn Ánh Dương!');
  };

  window.handleResetHotelInfo = function () {
    if (!confirm('Khôi phục lại thông tin khách sạn về mặc định ban đầu?')) return;
    hotelInfo = { ...window.ANH_DUONG_DATA.hotelInfo };
    saveHotelInfo();
    renderHotelInfo();
    updateBookingCalculations();
    showToast('Đã khôi phục cài đặt khách sạn về mặc định.');
  };

  // 3. Render Rooms & Filter tabs
  let currentCategoryFilter = 'all';

  function renderRoomFilters() {
    const container = document.getElementById('room-filter-container');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'Tất cả hạng phòng' },
      { id: 'standard', label: 'Standard' },
      { id: 'deluxe', label: 'Deluxe' },
      { id: 'suite', label: 'Suite' },
      { id: 'villa', label: 'Villa & Penthouse' }
    ];

    container.innerHTML = categories.map(cat => {
      const isActive = currentCategoryFilter === cat.id;
      return `<button onclick="window.filterRooms('${cat.id}')" class="px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive ? 'gold-gradient text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
      }">${cat.label}</button>`;
    }).join('') + `
      <button onclick="window.openRoomTypeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm">
        <i class="fa-solid fa-plus text-amber-600"></i> Thêm phòng
      </button>
    `;
  }

  window.filterRooms = function (catId) {
    currentCategoryFilter = catId;
    renderRoomFilters();
    renderRooms();
  };

  function renderRooms() {
    const container = document.getElementById('rooms-container');
    if (!container) return;

    let filtered = roomTypesData;
    if (currentCategoryFilter === 'standard') {
      filtered = roomTypesData.filter(r => r.code === 'STD' || r.id === 'rt-std');
    } else if (currentCategoryFilter === 'deluxe') {
      filtered = roomTypesData.filter(r => r.code === 'DLX' || r.id === 'rt-dlx');
    } else if (currentCategoryFilter === 'suite') {
      filtered = roomTypesData.filter(r => r.code === 'STE' || r.id === 'rt-ste');
    } else if (currentCategoryFilter === 'villa') {
      filtered = roomTypesData.filter(r => r.code === 'FAM' || r.code === 'PEN' || r.id === 'rt-fam' || r.id === 'rt-pen');
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400">Không tìm thấy hạng phòng nào trong danh mục này.</div>';
      return;
    }

    container.innerHTML = filtered.map(room => {
      const img = (room.images && room.images.length > 0) ? room.images[0] : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

      return `
        <div class="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 room-card flex flex-col justify-between relative group">
          <div>
            <div class="relative h-64 overflow-hidden">
              <img src="${img}" alt="${room.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              ${room.badge ? `<span class="absolute top-4 left-4 gold-gradient text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-md">${room.badge}</span>` : ''}
              <button onclick="window.openRoomTypeModal('${room.id}')" class="absolute top-4 right-4 bg-slate-900/80 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20" title="Sửa thông tin và giá phòng">
                <i class="fa-solid fa-pen-to-square"></i> Sửa
              </button>
              <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                <div>
                  <span class="text-xs text-amber-300 font-semibold uppercase tracking-wider block">${room.view || 'View Biển Đẹp'}</span>
                  <h3 class="font-serif text-xl font-bold leading-tight">${room.name}</h3>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                <span><i class="fa-solid fa-vector-square text-amber-600 mr-1.5"></i>${room.size} m²</span>
                <span><i class="fa-solid fa-bed text-amber-600 mr-1.5"></i>${room.bed}</span>
                <span><i class="fa-solid fa-user-group text-amber-600 mr-1.5"></i>Tối đa ${room.maxAdults} Lớn</span>
              </div>

              <p class="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">${room.description}</p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                ${(room.amenities || []).slice(0, 3).map(a => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">${a}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="p-6 pt-0 flex items-center justify-between mt-2 border-t border-slate-50">
            <div>
              <span class="text-[10px] text-slate-400 block">Giá mỗi đêm từ</span>
              <div class="text-amber-700 font-bold text-lg font-serif">${formatCurrency(room.basePrice)}</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.viewRoomDetail('${room.id}')" class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-400 rounded-xl transition-all">
                Chi tiết
              </button>
              <button onclick="window.selectRoomForBooking('${room.id}')" class="px-4 py-2 text-xs font-semibold text-white gold-gradient hover:opacity-95 rounded-xl shadow-md transition-all">
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Render Services
  function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;

    container.innerHTML = servicesData.map(srv => {
      return `
        <div class="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-shadow flex flex-col justify-between group relative">
          <div>
            <div class="relative h-48 overflow-hidden">
              <img src="${srv.image}" alt="${srv.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-slate-900/30"></div>
              <button onclick="window.openServiceModal('${srv.id}')" class="absolute top-3 left-3 bg-slate-900/80 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md backdrop-blur-md transition-all flex items-center gap-1 border border-white/20" title="Sửa dịch vụ">
                <i class="fa-solid fa-pen-to-square"></i> Sửa
              </button>
              <div class="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-amber-600 flex items-center justify-center text-lg shadow">
                <i class="fa-solid ${srv.icon}"></i>
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-serif font-bold text-base text-slate-900 mb-2">${srv.name}</h3>
              <p class="text-xs text-slate-500 leading-relaxed mb-4">${srv.description}</p>
            </div>
          </div>
          <div class="p-6 pt-0 flex items-center justify-between border-t border-slate-50">
            <div>
              <span class="text-amber-700 font-bold text-sm">${formatCurrency(srv.price)}</span>
              <span class="text-[11px] text-slate-400">/ ${srv.unit}</span>
            </div>
            <button onclick="window.addServiceToBooking('${srv.id}')" class="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-amber-300 hover:bg-slate-800 rounded-lg transition-colors">
              + Thêm vào đơn
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Booking Form & 15-Minute Room Locking Logic
  let currentBookingState = {
    roomTypeId: 'rt-std',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    services: [],
    couponCode: ''
  };

  let lockTimerInterval = null;
  let lockSecondsRemaining = 900; // 15 phút

  function startLockTimer() {
    const banner = document.getElementById('booking-lock-banner');
    const timerDisplay = document.getElementById('lock-countdown-timer');
    if (!banner || !timerDisplay) return;

    banner.classList.remove('hidden');
    lockSecondsRemaining = 900;

    if (lockTimerInterval) clearInterval(lockTimerInterval);

    lockTimerInterval = setInterval(() => {
      lockSecondsRemaining--;
      if (lockSecondsRemaining <= 0) {
        clearInterval(lockTimerInterval);
        banner.classList.add('hidden');
        showToast('Hết thời gian giữ chỗ tạm thời (15 phút)! Vui lòng chọn lại phòng.', 'error');
        return;
      }
      const m = Math.floor(lockSecondsRemaining / 60);
      const s = lockSecondsRemaining % 60;
      timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function renderBookingFormRoomOptions() {
    const select = document.getElementById('booking-room-type');
    const searchSelect = document.getElementById('search-type');

    const optionsHtml = roomTypesData.map(r => {
      return `<option value="${r.id}">${r.name} - ${formatCurrency(r.basePrice)}/đêm</option>`;
    }).join('');

    if (select) select.innerHTML = optionsHtml;
    if (searchSelect) searchSelect.innerHTML = optionsHtml;
  }

  function renderBookingServiceCheckboxes() {
    const container = document.getElementById('booking-services-checkboxes');
    if (!container) return;

    container.innerHTML = servicesData.map(s => {
      const isChecked = currentBookingState.services.includes(s.id);
      return `
        <label class="flex items-center gap-2 p-2.5 rounded-xl border ${isChecked ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-slate-50'} cursor-pointer hover:border-amber-400 transition-colors">
          <input type="checkbox" value="${s.id}" ${isChecked ? 'checked' : ''} onchange="window.toggleBookingService('${s.id}')" class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4">
          <span class="text-xs text-slate-700 flex-1">${s.name}</span>
          <span class="text-xs font-semibold text-amber-700">+${formatCurrency(s.price)}</span>
        </label>
      `;
    }).join('');
  }

  window.toggleBookingService = function (serviceId) {
    const idx = currentBookingState.services.indexOf(serviceId);
    if (idx >= 0) {
      currentBookingState.services.splice(idx, 1);
    } else {
      currentBookingState.services.push(serviceId);
    }
    renderBookingServiceCheckboxes();
    updateBookingCalculations();
  };

  function updateBookingCalculations() {
    const checkInDate = new Date(currentBookingState.checkIn);
    const checkOutDate = new Date(currentBookingState.checkOut);
    let diffDays = 1;

    if (currentBookingState.checkIn && currentBookingState.checkOut && checkOutDate > checkInDate) {
      diffDays = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    }

    const roomType = roomTypesData.find(r => r.id === currentBookingState.roomTypeId) || roomTypesData[0] || { basePrice: 850000, name: 'Standard City View' };
    const roomTotal = roomType.basePrice * diffDays;

    let servicesTotal = 0;
    currentBookingState.services.forEach(srvId => {
      const s = servicesData.find(srv => srv.id === srvId);
      if (s) servicesTotal += s.price;
    });

    const subtotal = roomTotal + servicesTotal;

    // Voucher Discount Calculation (BUG-MA-09)
    let discount = 0;
    if (currentBookingState.couponCode) {
      const coupon = (window.ANH_DUONG_DATA.coupons || []).find(c => c.code.toUpperCase() === currentBookingState.couponCode.toUpperCase());
      if (coupon) {
        if (coupon.discountType === 'percent') {
          discount = Math.round(subtotal * (coupon.discountValue / 100));
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discount);
    const depositAmount = Math.round(finalTotal * 0.3); // Tiền cọc 30% bảo lãnh

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
      const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=2026-ANHDUONGFPT-${depositAmount}-${transferMemo}`;
      qrImage.src = qrData;
    }

    return { diffDays, roomTotal, servicesTotal, discount, finalTotal, depositAmount, roomType };
  }

  window.selectRoomForBooking = function (roomTypeId) {
    currentBookingState.roomTypeId = roomTypeId;
    const select = document.getElementById('booking-room-type');
    if (select) select.value = roomTypeId;
    updateBookingCalculations();
    startLockTimer();

    window.navigateToPage('dat-phong');
  };

  window.addServiceToBooking = function (serviceId) {
    if (!currentBookingState.services.includes(serviceId)) {
      currentBookingState.services.push(serviceId);
      renderBookingServiceCheckboxes();
      updateBookingCalculations();
      showToast('Đã thêm dịch vụ vào bảng kê chi phí!');
    }
    window.navigateToPage('dat-phong');
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

    const coupon = (window.ANH_DUONG_DATA.coupons || []).find(c => c.code.toUpperCase() === code);
    if (coupon) {
      currentBookingState.couponCode = code;
      if (couponMsg) {
        couponMsg.textContent = `Áp dụng mã ${coupon.code} thành công: ${coupon.description}`;
        couponMsg.className = 'text-xs mt-1.5 text-emerald-400 font-medium';
      }
      showToast(`Áp dụng mã giảm giá ${coupon.code} thành công!`);
    } else {
      currentBookingState.couponCode = '';
      if (couponMsg) {
        couponMsg.textContent = 'Mã ưu đãi không hợp lệ hoặc đã hết hạn!';
        couponMsg.className = 'text-xs mt-1.5 text-rose-400 font-medium';
      }
      showToast('Mã ưu đãi không hợp lệ!', 'error');
    }
    updateBookingCalculations();
  };

  // Submit Booking Form with all 30 Bug Validations
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

    // BUG-MI-04: Regex số điện thoại Việt Nam (10 chữ số)
    const phoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số (đầu 03, 05, 07, 08, 09).', 'error');
      return;
    }

    // BUG-MI-03: Email regex
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Định dạng email không hợp lệ!', 'error');
      return;
    }

    // BUG-CR-02 & BUG-MI-01: Chặn ngày quá khứ & Ngày trả <= Ngày nhận
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentBookingState.checkIn < todayStr) {
      showToast('Ngày nhận phòng không thể trong quá khứ!', 'error');
      return;
    }
    if (currentBookingState.checkOut <= currentBookingState.checkIn) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!', 'error');
      return;
    }

    // BUG-MA-03: Sức chứa phòng
    const roomType = roomTypesData.find(r => r.id === currentBookingState.roomTypeId) || roomTypesData[0];
    if (roomType && currentBookingState.adults > roomType.maxAdults) {
      showToast(`Hạng phòng ${roomType.name} chỉ chứa tối đa ${roomType.maxAdults} người lớn!`, 'error');
      return;
    }

    const calc = updateBookingCalculations();

    // Tìm phòng trống
    const availableRoom = roomsData.find(r => r.typeId === currentBookingState.roomTypeId && r.status === 'available');
    const assignedRoomNumber = availableRoom ? availableRoom.roomNumber : "101";

    // BUG-CR-04: Sinh mã đặt phòng duy nhất dạng AD-2026-XXXX
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

    // BUG-CR-03: Cập nhật phòng sang trạng thái đã đặt
    if (availableRoom) {
      availableRoom.status = 'reserved';
      availableRoom.guest = fullName;
      saveRooms();
    }

    bookingsData.unshift(newBooking);
    saveBookings();

    // Tắt khóa đếm ngược
    const lockBanner = document.getElementById('booking-lock-banner');
    if (lockBanner) lockBanner.classList.add('hidden');
    if (lockTimerInterval) clearInterval(lockTimerInterval);

    // Bật Modal Hóa đơn điện tử
    window.showInvoiceModal(newBooking);
    showToast(`Đặt phòng thành công! Mã đơn của bạn: ${bookingCode}`);

    // Render lại giao diện
    renderRooms();
    renderAdminRack();
    renderAdminBookings();
  };

  // 6. Invoice / E-Ticket Modal
  window.showInvoiceModal = function (booking) {
    const modal = document.getElementById('invoice-modal');
    const container = document.getElementById('invoice-print-area');
    const roomType = roomTypesData.find(r => r.id === booking.roomTypeId) || { name: 'Standard Room' };

    const serviceNames = (booking.services || []).map(sId => {
      const s = servicesData.find(srv => srv.id === sId);
      return s ? s.name : sId;
    });

    if (container) {
      container.innerHTML = `
        <div class="border-b-2 border-amber-600 pb-5 mb-6 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <i class="fa-solid fa-crown text-amber-600 text-xl"></i>
              <h2 class="font-serif text-2xl font-bold text-slate-900">${hotelInfo.name}</h2>
            </div>
            <p class="text-xs text-slate-500">${hotelInfo.address}</p>
            <p class="text-xs text-slate-500">Hotline: ${hotelInfo.hotline} • Email: ${hotelInfo.email}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Phiếu Xác Nhận Đặt Phòng</span>
            <div class="font-mono text-sm font-bold text-slate-800 mt-2">Mã: ${booking.bookingCode}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${new Date(booking.createdAt).toLocaleString('vi-VN')}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Khách Hàng</span>
            <strong class="text-slate-800 text-sm">${booking.customerName}</strong>
            <div class="text-slate-600 mt-0.5">SĐT: ${booking.phone}</div>
            ${booking.email ? `<div class="text-slate-600">Email: ${booking.email}</div>` : ''}
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Chi Tiết Lưu Trú</span>
            <strong class="text-slate-800 text-sm">${roomType.name} (Phòng ${booking.roomNumber})</strong>
            <div class="text-slate-600 mt-0.5">${booking.checkIn} đến ${booking.checkOut} (${booking.nights} đêm)</div>
            <div class="text-slate-600">${booking.adults} Người lớn, ${booking.children || 0} Trẻ em</div>
          </div>
        </div>

        ${serviceNames.length > 0 ? `
          <div class="mb-4 text-xs">
            <span class="text-slate-500 block mb-1 font-semibold">Dịch vụ đi kèm:</span>
            <div class="flex flex-wrap gap-1.5">
              ${serviceNames.map(s => `<span class="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="border-t border-slate-200 pt-4 space-y-2 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>Tiền phòng (${booking.nights} đêm):</span>
            <span>${formatCurrency(booking.roomTotal)}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Dịch vụ cộng thêm:</span>
            <span>${formatCurrency(booking.servicesTotal || 0)}</span>
          </div>
          ${booking.discountAmount > 0 ? `
            <div class="flex justify-between text-emerald-600 font-medium">
              <span>Chiết khấu Voucher (${booking.couponCode}):</span>
              <span>-${formatCurrency(booking.discountAmount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
            <span>Tổng thanh toán:</span>
            <span class="text-amber-700 text-base font-serif">${formatCurrency(booking.finalTotal)}</span>
          </div>
          <div class="flex justify-between text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-semibold">
            <span>Đã cọc bảo lãnh (30%):</span>
            <span class="text-amber-800 font-bold">${formatCurrency(booking.depositAmount)}</span>
          </div>
        </div>

        <div class="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-4">
          <div class="bg-white p-2 rounded-xl shrink-0">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${booking.bookingCode}" alt="VietQR" class="w-20 h-20">
          </div>
          <div class="text-[11px] text-slate-300 space-y-0.5">
            <div class="font-bold text-amber-400 text-xs">Mã QR Nhận Phòng Tự Động (Self Check-in)</div>
            <div>Quý khách vui lòng xuất trình mã này cho bộ phận Lễ tân khi nhận phòng.</div>
            <div>Giờ nhận phòng: ${hotelInfo.checkInTime} • Giờ trả phòng: ${hotelInfo.checkOutTime}</div>
          </div>
        </div>
      `;
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeInvoiceModal = function () {
    const modal = document.getElementById('invoice-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // 7. Lookup & Reschedule & Cancel Bookings
  window.searchMyBookings = function () {
    const query = document.getElementById('lookup-input').value.trim().toLowerCase();
    const resultContainer = document.getElementById('lookup-results');
    if (!resultContainer) return;

    if (!query) {
      resultContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs">Vui lòng nhập mã đơn hoặc số điện thoại để tra cứu.</div>';
      return;
    }

    const matched = bookingsData.filter(b =>
      b.bookingCode.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.customerName.toLowerCase().includes(query)
    );

    if (matched.length === 0) {
      resultContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          <i class="fa-solid fa-circle-question text-3xl text-slate-300 block mb-2"></i>
          Không tìm thấy đơn đặt phòng nào khớp với "<strong>${query}</strong>".
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = matched.map(b => {
      const roomType = roomTypesData.find(r => r.id === b.roomTypeId) || { name: 'Standard Room' };
      const statusBadge = {
        'confirmed': '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">Đã xác nhận cọc</span>',
        'checked_in': '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Đang lưu trú</span>',
        'checked_out': '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">Đã trả phòng</span>',
        'cancelled': '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">Đã hủy đơn</span>'
      }[b.bookingStatus] || '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Chờ xử lý</span>';

      return `
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-3">
              <strong class="font-mono text-sm text-slate-900">${b.bookingCode}</strong>
              ${statusBadge}
            </div>
            <div class="text-xs text-slate-600 mt-1">
              <strong>${b.customerName}</strong> • ${roomType.name} (Phòng ${b.roomNumber})
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              ${b.checkIn} ➔ ${b.checkOut} (${b.nights} đêm) • Tổng: ${formatCurrency(b.finalTotal)}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick='window.showInvoiceModal(${JSON.stringify(b)})' class="px-3 py-1.5 text-xs bg-slate-900 text-amber-300 rounded-lg hover:bg-slate-800 transition-colors">
              <i class="fa-solid fa-receipt mr-1"></i>Hóa đơn
            </button>
            ${b.bookingStatus !== 'cancelled' ? `
              <button onclick="window.openRescheduleModal('${b.bookingCode}')" class="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-500/20 font-medium transition-colors">
                <i class="fa-solid fa-calendar-days mr-1"></i>Đổi lịch
              </button>
              <button onclick="window.cancelBooking('${b.bookingCode}')" class="text-rose-600 hover:text-rose-800 font-semibold text-xs px-2 py-1 transition-colors">
                <i class="fa-solid fa-ban mr-1"></i>Hủy phòng
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  // BUG-CR-05: Khi hủy phòng, giải phóng phòng trống ngay lập tức
  window.cancelBooking = function (bookingCode) {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn đặt phòng ${bookingCode} không?`)) return;

    const b = bookingsData.find(item => item.bookingCode === bookingCode);
    if (b) {
      b.bookingStatus = 'cancelled';
      const rm = roomsData.find(r => r.roomNumber === b.roomNumber);
      if (rm) {
        rm.status = 'available';
        delete rm.guest;
        saveRooms();
      }
      saveBookings();
      showToast(`Đã hủy thành công đơn ${bookingCode}! Phòng đã được giải phóng sang trạng thái trống.`);
      window.searchMyBookings();
      renderRooms();
      renderAdminRack();
      renderAdminBookings();
    }
  };

  // Reschedule Modal Handlers (BUG-MA-07)
  window.openRescheduleModal = function (bookingCode) {
    const b = bookingsData.find(item => item.bookingCode === bookingCode);
    if (!b) return;
    document.getElementById('reschedule-booking-code').value = b.bookingCode;
    document.getElementById('reschedule-display-code').value = `${b.bookingCode} (${b.customerName})`;
    document.getElementById('reschedule-checkin').value = b.checkIn;
    document.getElementById('reschedule-checkout').value = b.checkOut;

    const modal = document.getElementById('reschedule-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeRescheduleModal = function () {
    const modal = document.getElementById('reschedule-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.handleConfirmReschedule = function (e) {
    e.preventDefault();
    const code = document.getElementById('reschedule-booking-code').value;
    const newIn = document.getElementById('reschedule-checkin').value;
    const newOut = document.getElementById('reschedule-checkout').value;
    const todayStr = new Date().toISOString().split('T')[0];

    if (newIn < todayStr) return showToast('Ngày nhận phòng không thể trong quá khứ!', 'error');
    if (newOut <= newIn) return showToast('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!', 'error');

    const b = bookingsData.find(item => item.bookingCode === code);
    if (!b) return;

    // Check overlap with other bookings of the same room
    const hasOverlap = bookingsData.some(other => {
      if (other.bookingCode === code || other.bookingStatus === 'cancelled' || other.bookingStatus === 'checked_out') return false;
      if (other.roomNumber !== b.roomNumber) return false;
      return (newIn < other.checkOut && newOut > other.checkIn);
    });

    if (hasOverlap) {
      showToast(`Khoảng ngày ${newIn} đến ${newOut} đã có khách khác đặt phòng ${b.roomNumber}!`, 'error');
      return;
    }

    const diffDays = Math.max(1, Math.round((new Date(newOut) - new Date(newIn)) / 86400000));
    const rt = roomTypesData.find(r => r.id === b.roomTypeId) || { basePrice: 850000 };
    const newRoomTotal = rt.basePrice * diffDays;

    // Tính toán lại Voucher động (BUG-MA-07)
    let newDiscount = 0;
    if (b.couponCode) {
      const coupon = (window.ANH_DUONG_DATA.coupons || []).find(c => c.code.toUpperCase() === b.couponCode.toUpperCase());
      if (coupon) {
        if (coupon.discountType === 'percent') {
          newDiscount = Math.round((newRoomTotal + (b.servicesTotal || 0)) * (coupon.discountValue / 100));
        } else if (coupon.discountType === 'fixed') {
          newDiscount = coupon.discountValue;
        }
      }
    }

    b.checkIn = newIn;
    b.checkOut = newOut;
    b.nights = diffDays;
    b.roomTotal = newRoomTotal;
    b.discountAmount = newDiscount;
    b.finalTotal = Math.max(0, newRoomTotal + (b.servicesTotal || 0) - newDiscount);
    b.depositAmount = Math.round(b.finalTotal * 0.3);

    saveBookings();
    showToast(`Đã đổi lịch thành công cho đơn ${code}!`);
    window.closeRescheduleModal();
    window.searchMyBookings();
    renderAdminRack();
    renderAdminBookings();
  };

  // 8. Admin Portal: Room Rack & Management
  function renderAdminRack() {
    const rackGrid = document.getElementById('admin-rack-grid');
    if (!rackGrid) return;

    rackGrid.innerHTML = roomsData.map(r => {
      const type = roomTypesData.find(t => t.id === r.typeId) || { code: 'STD' };
      const badgeClass = {
        'available': 'rack-badge-available',
        'occupied': 'rack-badge-occupied',
        'reserved': 'rack-badge-reserved',
        'maintenance': 'rack-badge-maintenance'
      }[r.status] || 'rack-badge-available';

      const label = {
        'available': 'Trống',
        'occupied': 'Đang ở',
        'reserved': 'Đã cọc',
        'maintenance': 'Bảo trì'
      }[r.status] || 'Trống';

      return `
        <div class="p-3 rounded-xl border ${badgeClass} text-center flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.cycleRoomStatus('${r.id}')" title="Nhấp để đổi trạng thái">
          <div class="font-bold text-sm font-mono">${r.roomNumber}</div>
          <div class="text-[10px] uppercase font-semibold text-slate-500">${type.code} - T${r.floor}</div>
          <div class="text-[11px] font-bold mt-1.5">${label}</div>
          ${r.guest ? `<div class="text-[9px] truncate text-slate-600 mt-0.5">${r.guest}</div>` : ''}
        </div>
      `;
    }).join('');

    // Update KPI metrics
    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.filter(b => b.bookingStatus !== 'cancelled').reduce((acc, curr) => acc + (curr.finalTotal || 0), 0);
    const occupiedCount = roomsData.filter(r => r.status === 'occupied' || r.status === 'reserved').length;
    const occupancyRate = roomsData.length > 0 ? Math.round((occupiedCount / roomsData.length) * 100) : 0;
    const availableCount = roomsData.filter(r => r.status === 'available').length;

    const elStatRevenue = document.getElementById('admin-stat-revenue');
    const elStatBookings = document.getElementById('admin-stat-bookings');
    const elStatOccupancy = document.getElementById('admin-stat-occupancy');
    const elStatAvailable = document.getElementById('admin-stat-available');

    if (elStatRevenue) elStatRevenue.textContent = formatCurrency(totalRevenue);
    if (elStatBookings) elStatBookings.textContent = `${totalBookings} đơn`;
    if (elStatOccupancy) elStatOccupancy.textContent = `${occupancyRate}%`;
    if (elStatAvailable) elStatAvailable.textContent = `${availableCount}/${roomsData.length}`;
  }

  // RBAC Guarded Room Status Cycle (BUG-MA-08 & RBAC-04/05/06)
  window.cycleRoomStatus = function (roomId) {
    if (currentUserRole !== 'admin') {
      showToast('Chỉ Quản trị viên (Admin - Thẩm Anh Minh) mới có quyền đổi trạng thái bảo trì phòng!', 'error');
      return;
    }

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
    showToast(`Đã cập nhật phòng ${rm.roomNumber} sang: ${nextStatus}`);
  };

  function renderAdminBookings() {
    const tbody = document.getElementById('admin-bookings-table');
    if (!tbody) return;

    tbody.innerHTML = bookingsData.map(b => {
      const roomType = roomTypesData.find(r => r.id === b.roomTypeId) || { name: 'Standard' };
      return `
        <tr class="hover:bg-slate-800/50 text-xs">
          <td class="p-3 font-mono text-amber-400 font-bold">${b.bookingCode}</td>
          <td class="p-3">
            <strong class="text-white block">${b.customerName}</strong>
            <span class="text-slate-400 text-[11px]">${b.phone}</span>
          </td>
          <td class="p-3 text-slate-300">
            ${roomType.name} <span class="text-amber-400 font-mono">(P.${b.roomNumber})</span>
          </td>
          <td class="p-3 text-slate-400">
            ${b.checkIn} ➔ ${b.checkOut}
          </td>
          <td class="p-3 font-bold text-amber-300 font-serif">
            ${formatCurrency(b.finalTotal)}
          </td>
          <td class="p-3">
            <select onchange="window.updateBookingStatus('${b.bookingCode}', this.value)" class="text-xs bg-slate-800 text-white border border-slate-700 rounded-lg p-1.5 focus:ring-amber-500">
              <option value="confirmed" ${b.bookingStatus === 'confirmed' ? 'selected' : ''}>Đã cọc</option>
              <option value="checked_in" ${b.bookingStatus === 'checked_in' ? 'selected' : ''}>Đang ở</option>
              <option value="checked_out" ${b.bookingStatus === 'checked_out' ? 'selected' : ''}>Đã trả</option>
              <option value="cancelled" ${b.bookingStatus === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
            </select>
          </td>
          <td class="p-3 text-right">
            <button onclick='window.showInvoiceModal(${JSON.stringify(b)})' class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded-lg" title="In phiếu">
              <i class="fa-solid fa-print"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.updateBookingStatus = function (bookingCode, newStatus) {
    if (currentUserRole === 'customer') {
      showToast('Khách hàng không có quyền cập nhật trạng thái lễ tân!', 'error');
      return;
    }
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
    renderRooms();
    showToast(`Đã cập nhật đơn ${bookingCode} sang: ${newStatus}`);
  };

  // 9. Admin Tabs Switcher
  window.switchAdminTab = function (tabName) {
    const tabOverview = document.getElementById('admin-tab-overview');
    const tabRooms = document.getElementById('admin-tab-rooms');
    const tabServices = document.getElementById('admin-tab-services');
    const tabHotel = document.getElementById('admin-tab-hotel');

    const btnOverview = document.getElementById('btn-admin-overview');
    const btnRooms = document.getElementById('btn-admin-rooms');
    const btnServices = document.getElementById('btn-admin-services');
    const btnHotel = document.getElementById('btn-admin-hotel');

    const tabs = [tabOverview, tabRooms, tabServices, tabHotel];
    const btns = [btnOverview, btnRooms, btnServices, btnHotel];

    tabs.forEach(t => { if (t) t.classList.add('hidden'); });
    btns.forEach(b => {
      if (b) {
        b.className = 'px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2';
      }
    });

    const activeBtnClass = 'px-4 py-2.5 rounded-xl text-xs font-semibold gold-gradient text-white shadow-md transition-all flex items-center gap-2';

    if (tabName === 'overview') {
      if (tabOverview) tabOverview.classList.remove('hidden');
      if (btnOverview) btnOverview.className = activeBtnClass;
      renderAdminRack();
      renderAdminBookings();
    } else if (tabName === 'rooms') {
      if (tabRooms) tabRooms.classList.remove('hidden');
      if (btnRooms) btnRooms.className = activeBtnClass;
      renderAdminRoomTypes();
    } else if (tabName === 'services') {
      if (tabServices) tabServices.classList.remove('hidden');
      if (btnServices) btnServices.className = activeBtnClass;
      renderAdminServices();
    } else if (tabName === 'hotel') {
      if (tabHotel) tabHotel.classList.remove('hidden');
      if (btnHotel) btnHotel.className = activeBtnClass;
    }
  };

  // 10. Room Detail Modal
  window.viewRoomDetail = function (roomId) {
    const room = roomTypesData.find(r => r.id === roomId);
    if (!room) return;

    const modal = document.getElementById('room-detail-modal');
    const content = document.getElementById('room-detail-content');
    const images = (room.images && room.images.length > 0) ? room.images : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];

    if (content) {
      content.innerHTML = `
        <div class="relative">
          <div class="h-80 sm:h-96 relative overflow-hidden rounded-t-3xl">
            <img id="detail-active-img" src="${images[0]}" alt="${room.name}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            <button onclick="window.closeRoomDetail()" class="absolute top-4 right-4 bg-slate-900/80 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors text-lg">
              &times;
            </button>
            <div class="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
              <div>
                <span class="text-xs text-amber-300 font-semibold uppercase tracking-wider block">${room.view}</span>
                <h2 class="font-serif text-3xl font-bold leading-tight">${room.name}</h2>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-300 block">Giá niêm yết</span>
                <span class="text-2xl font-serif font-bold text-amber-400">${formatCurrency(room.basePrice)}</span>
                <span class="text-xs text-slate-300">/đêm</span>
              </div>
            </div>
          </div>

          <div class="p-6 sm:p-8 space-y-6">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <div><strong class="block text-slate-900">Diện tích:</strong> ${room.size} m²</div>
              <div><strong class="block text-slate-900">Giường:</strong> ${room.bed}</div>
              <div><strong class="block text-slate-900">Sức chứa:</strong> Tối đa ${room.maxAdults} Lớn, ${room.maxChildren} Nhỏ</div>
              <div><strong class="block text-slate-900">Tầm nhìn:</strong> ${room.view}</div>
            </div>

            <div>
              <h4 class="font-serif font-bold text-slate-900 text-sm mb-2">Mô tả không gian</h4>
              <p class="text-xs text-slate-600 leading-relaxed">${room.description}</p>
            </div>

            <div>
              <h4 class="font-serif font-bold text-slate-900 text-sm mb-3">Tiện nghi cao cấp chuẩn 5 sao</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                ${(room.amenities || []).map(a => `
                  <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> ${a}</div>
                `).join('')}
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onclick="window.closeRoomDetail()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors">Đóng</button>
              <button onclick="window.closeRoomDetail(); window.selectRoomForBooking('${room.id}')" class="px-6 py-2.5 gold-gradient text-white font-semibold text-xs rounded-xl shadow hover:opacity-95 transition-all">Đặt phòng này</button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeRoomDetail = function () {
    const modal = document.getElementById('room-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // 11. Quick Search Handler
  window.handleQuickSearch = function (e) {
    e.preventDefault();
    const checkIn = document.getElementById('search-checkin').value;
    const checkOut = document.getElementById('search-checkout').value;
    const guests = document.getElementById('search-guests').value;
    const roomType = document.getElementById('search-type').value;

    const todayStr = new Date().toISOString().split('T')[0];
    if (checkIn < todayStr) return showToast('Ngày nhận phòng không thể trong quá khứ!', 'error');
    if (checkOut <= checkIn) return showToast('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!', 'error');

    currentBookingState.checkIn = checkIn;
    currentBookingState.checkOut = checkOut;
    currentBookingState.adults = parseInt(guests) || 2;
    if (roomType) currentBookingState.roomTypeId = roomType;

    const bookingCheckIn = document.getElementById('cust-checkin');
    const bookingCheckOut = document.getElementById('cust-checkout');
    const bookingRoomSelect = document.getElementById('booking-room-type');
    const bookingAdults = document.getElementById('cust-adults');

    if (bookingCheckIn) bookingCheckIn.value = checkIn;
    if (bookingCheckOut) bookingCheckOut.value = checkOut;
    if (bookingRoomSelect) bookingRoomSelect.value = currentBookingState.roomTypeId;
    if (bookingAdults) bookingAdults.value = currentBookingState.adults;

    updateBookingCalculations();
    startLockTimer();

    window.navigateToPage('dat-phong');
    showToast('Đã áp dụng thông tin tìm kiếm vào biểu mẫu đặt phòng!');
  };

  // 12. Modal Edit Room Types & Services (Quản trị viên)
  window.openRoomTypeModal = function (roomTypeId = null) {
    if (currentUserRole !== 'admin') {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền thêm/sửa hạng phòng!', 'error');
      return;
    }
    const modal = document.getElementById('room-type-modal');
    const title = document.getElementById('room-modal-title');
    const idField = document.getElementById('form-room-id');

    if (roomTypeId) {
      const room = roomTypesData.find(r => r.id === roomTypeId);
      if (!room) return;
      if (title) title.textContent = 'Chỉnh Sửa Hạng Phòng';
      if (idField) idField.value = room.id;
      document.getElementById('form-room-name').value = room.name || '';
      document.getElementById('form-room-code').value = room.code || '';
      document.getElementById('form-room-price').value = room.basePrice || '';
      document.getElementById('form-room-size').value = room.size || '';
      document.getElementById('form-room-bed').value = room.bed || '';
      document.getElementById('form-room-adults').value = room.maxAdults || 2;
      document.getElementById('form-room-children').value = room.maxChildren || 1;
      document.getElementById('form-room-view').value = room.view || '';
      document.getElementById('form-room-badge').value = room.badge || '';
      document.getElementById('form-room-image').value = (room.images && room.images[0]) || '';
      document.getElementById('form-room-amenities').value = (room.amenities || []).join(', ');
      document.getElementById('form-room-desc').value = room.description || '';
    } else {
      if (title) title.textContent = 'Thêm Hạng Phòng Mới';
      if (idField) idField.value = '';
      const f = document.querySelector('#room-type-modal form');
      if (f) f.reset();
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeRoomTypeModal = function () {
    const modal = document.getElementById('room-type-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.handleSaveRoomType = function (e) {
    e.preventDefault();
    if (currentUserRole !== 'admin') return;

    const id = document.getElementById('form-room-id').value;
    const name = document.getElementById('form-room-name').value.trim();
    const code = document.getElementById('form-room-code').value.trim().toUpperCase();
    const price = parseInt(document.getElementById('form-room-price').value) || 1000000;
    const size = parseInt(document.getElementById('form-room-size').value) || 30;
    const bed = document.getElementById('form-room-bed').value.trim();
    const adults = parseInt(document.getElementById('form-room-adults').value) || 2;
    const children = parseInt(document.getElementById('form-room-children').value) || 1;
    const view = document.getElementById('form-room-view').value.trim();
    const badge = document.getElementById('form-room-badge').value.trim();
    const imgUrl = document.getElementById('form-room-image').value.trim() || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
    const amenities = document.getElementById('form-room-amenities').value.split(',').map(s => s.trim()).filter(Boolean);
    const desc = document.getElementById('form-room-desc').value.trim();

    if (id) {
      const idx = roomTypesData.findIndex(r => r.id === id);
      if (idx >= 0) {
        roomTypesData[idx] = {
          ...roomTypesData[idx],
          name, code, basePrice: price, size, bed, maxAdults: adults, maxChildren: children, view, badge, description: desc,
          images: [imgUrl], amenities
        };
        showToast('Đã cập nhật hạng phòng thành công!');
      }
    } else {
      const newId = 'rt-' + Date.now().toString().slice(-6);
      roomTypesData.push({
        id: newId, name, code, basePrice: price, size, bed, maxAdults: adults, maxChildren: children, view, badge, description: desc,
        images: [imgUrl], amenities
      });
      showToast('Đã thêm mới hạng phòng thành công!');
    }

    saveRoomTypes();
    renderRooms();
    renderBookingFormRoomOptions();
    window.closeRoomTypeModal();
  };

  function renderAdminRoomTypes() {
    const list = document.getElementById('admin-room-types-list');
    if (!list) return;

    list.innerHTML = roomTypesData.map(r => `
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-xs">
        <div>
          <strong class="text-white text-sm block">${r.name} (${r.code})</strong>
          <span class="text-amber-400 font-bold">${formatCurrency(r.basePrice)}/đêm</span>
          <span class="text-slate-400 ml-2">• ${r.size} m² • ${r.maxAdults} Lớn</span>
        </div>
        <div class="flex gap-2">
          <button onclick="window.openRoomTypeModal('${r.id}')" class="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-semibold">Sửa</button>
        </div>
      </div>
    `).join('');
  }

  window.openServiceModal = function (serviceId = null) {
    if (currentUserRole !== 'admin') {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền thêm/sửa dịch vụ VIP!', 'error');
      return;
    }
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-modal-title');
    const idField = document.getElementById('form-service-id');

    if (serviceId) {
      const s = servicesData.find(item => item.id === serviceId);
      if (!s) return;
      if (title) title.textContent = 'Chỉnh Sửa Dịch Vụ VIP';
      if (idField) idField.value = s.id;
      document.getElementById('form-service-name').value = s.name;
      document.getElementById('form-service-price').value = s.price;
      document.getElementById('form-service-unit').value = s.unit;
      document.getElementById('form-service-icon').value = s.icon;
      document.getElementById('form-service-image').value = s.image;
      document.getElementById('form-service-desc').value = s.description;
    } else {
      if (title) title.textContent = 'Thêm Gói Dịch Vụ Mới';
      if (idField) idField.value = '';
      const f = document.querySelector('#service-modal form');
      if (f) f.reset();
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeServiceModal = function () {
    const modal = document.getElementById('service-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.handleSaveService = function (e) {
    e.preventDefault();
    if (currentUserRole !== 'admin') return;

    const id = document.getElementById('form-service-id').value;
    const name = document.getElementById('form-service-name').value.trim();
    const price = parseInt(document.getElementById('form-service-price').value) || 200000;
    const unit = document.getElementById('form-service-unit').value.trim();
    const icon = document.getElementById('form-service-icon').value.trim() || 'fa-bell-concierge';
    const image = document.getElementById('form-service-image').value.trim() || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80';
    const desc = document.getElementById('form-service-desc').value.trim();

    if (id) {
      const idx = servicesData.findIndex(s => s.id === id);
      if (idx >= 0) {
        servicesData[idx] = { ...servicesData[idx], name, price, unit, icon, image, description: desc };
        showToast('Đã cập nhật dịch vụ thành công!');
      }
    } else {
      const newId = 'srv-' + Date.now().toString().slice(-6);
      servicesData.push({ id: newId, name, price, unit, icon, image, description: desc });
      showToast('Đã thêm mới dịch vụ VIP thành công!');
    }

    saveServices();
    renderServices();
    renderBookingServiceCheckboxes();
    window.closeServiceModal();
  };

  function renderAdminServices() {
    const list = document.getElementById('admin-services-list');
    if (!list) return;

    list.innerHTML = servicesData.map(s => `
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-xs">
        <div>
          <strong class="text-white text-sm block"><i class="fa-solid ${s.icon} text-amber-400 mr-1.5"></i>${s.name}</strong>
          <span class="text-amber-400 font-bold">${formatCurrency(s.price)}</span>
          <span class="text-slate-400">/ ${s.unit}</span>
        </div>
        <button onclick="window.openServiceModal('${s.id}')" class="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-semibold">Sửa</button>
      </div>
    `).join('');
  }

  // 13. Auto-detect Backend Server (Live Server Port 5500 -> API Port 5000)
  async function checkBackendConnection() {
    const connDot = document.getElementById('conn-dot');
    const connText = document.getElementById('conn-text');
    try {
      const res = await fetch('http://localhost:5000/api/hotel-info', { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        if (connDot) connDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        if (connText) connText.textContent = 'Máy chủ API: Đã kết nối';
      }
    } catch (e) {
      if (connDot) connDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      if (connText) connText.textContent = 'LocalStorage';
    }
  }

  // 14. Initialization on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    // Set default dates: checkIn = today, checkOut = +2 days
    const today = new Date().toISOString().split('T')[0];
    const twoDaysLater = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    const elCheckIn = document.getElementById('search-checkin');
    const elCheckOut = document.getElementById('search-checkout');
    const elCustCheckIn = document.getElementById('cust-checkin');
    const elCustCheckOut = document.getElementById('cust-checkout');

    if (elCheckIn) { elCheckIn.min = today; elCheckIn.value = today; }
    if (elCheckOut) { elCheckOut.min = today; elCheckOut.value = twoDaysLater; }
    if (elCustCheckIn) { elCustCheckIn.min = today; elCustCheckIn.value = today; }
    if (elCustCheckOut) { elCustCheckOut.min = today; elCustCheckOut.value = twoDaysLater; }

    currentBookingState.checkIn = today;
    currentBookingState.checkOut = twoDaysLater;

    // Render components
    renderHotelInfo();
    renderRoomFilters();
    renderRooms();
    renderServices();
    renderBookingFormRoomOptions();
    renderBookingServiceCheckboxes();
    updateBookingCalculations();
    renderAdminRack();
    renderAdminBookings();

    // Init active role
    window.switchUserRole(currentUserRole);

    // Check backend connection
    checkBackendConnection();

    // Initialize Auth UI
    updateAuthNavUI();

    // Initial Route check
    const initialHash = window.location.hash.replace('#', '');
    if (PAGE_IDS.includes(initialHash)) {
      navigateToPage(initialHash, false);
    } else {
      navigateToPage('trang-chu', false);
    }

    // Form change event listeners
    const bookingRoomSelect = document.getElementById('booking-room-type');
    if (bookingRoomSelect) {
      bookingRoomSelect.addEventListener('change', (e) => {
        currentBookingState.roomTypeId = e.target.value;
        updateBookingCalculations();
        startLockTimer();
      });
    }

    if (elCustCheckIn) {
      elCustCheckIn.addEventListener('change', (e) => {
        currentBookingState.checkIn = e.target.value;
        if (elCustCheckOut) elCustCheckOut.min = e.target.value;
        updateBookingCalculations();
      });
    }

    if (elCustCheckOut) {
      elCustCheckOut.addEventListener('change', (e) => {
        currentBookingState.checkOut = e.target.value;
        updateBookingCalculations();
      });
    }

    const bookingAdults = document.getElementById('cust-adults');
    if (bookingAdults) {
      bookingAdults.addEventListener('change', (e) => {
        currentBookingState.adults = parseInt(e.target.value) || 2;
        updateBookingCalculations();
      });
    }

    const bookingChildren = document.getElementById('cust-children');
    if (bookingChildren) {
      bookingChildren.addEventListener('change', (e) => {
        currentBookingState.children = parseInt(e.target.value) || 0;
        updateBookingCalculations();
      });
    }

    // Mobile Hamburger Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  });

  // =========================================================================
  // AUTHENTICATION & USER MANAGEMENT MODULE
  // =========================================================================
  const AUTH_STORAGE = {
    USERS: 'anhduong_users_list',
    CURRENT: 'anhduong_current_auth_user'
  };

  const defaultUsers = window.ANH_DUONG_DATA.users || [
    {
      id: "usr-admin-1",
      email: "admin@anhduonghotel.vn",
      password: "admin",
      fullName: "Thẩm Anh Minh",
      phone: "0912345678",
      role: "admin",
      roleLabel: "Quản Trị Viên (Admin)",
      points: 2500,
      tier: "Diamond VIP"
    },
    {
      id: "usr-recep-1",
      email: "reception@anhduonghotel.vn",
      password: "reception",
      fullName: "Nguyễn Ngọc Anh",
      phone: "0987654321",
      role: "receptionist",
      roleLabel: "Lễ Tân Trưởng (Receptionist)",
      points: 1200,
      tier: "Gold VIP"
    },
    {
      id: "usr-guest-1",
      email: "khachhang@gmail.com",
      password: "khach",
      fullName: "Trần Hoàng Long",
      phone: "0905123456",
      role: "customer",
      roleLabel: "Thành Viên VIP (Customer)",
      points: 850,
      tier: "Gold VIP"
    }
  ];

  let authUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE.USERS)) || defaultUsers;
  let currentAuthUser = JSON.parse(localStorage.getItem(AUTH_STORAGE.CURRENT)) || authUsers[2]; // Default to customer

  function saveAuthUsers() {
    localStorage.setItem(AUTH_STORAGE.USERS, JSON.stringify(authUsers));
  }

  function saveCurrentAuthUser() {
    if (currentAuthUser) {
      localStorage.setItem(AUTH_STORAGE.CURRENT, JSON.stringify(currentAuthUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE.CURRENT);
    }
  }

  // Update Header / Nav UI according to logged in user
  function updateAuthNavUI() {
    const container = document.getElementById('auth-nav-container');
    const roleBadge = document.getElementById('current-role-badge');

    // Update Top Bar Badge
    if (roleBadge) {
      if (currentAuthUser) {
        roleBadge.textContent = `${currentAuthUser.roleLabel || currentAuthUser.role}: ${currentAuthUser.fullName.split(' ').slice(-1)[0]}`;
      } else {
        roleBadge.textContent = 'Chưa đăng nhập';
      }
    }

    if (!container) return;

    if (currentAuthUser) {
      const initial = currentAuthUser.fullName ? currentAuthUser.fullName.charAt(0).toUpperCase() : 'U';

      container.innerHTML = `
        <div class="relative group">
          <button onclick="window.openProfileModal()" class="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-all">
            <div class="w-8 h-8 rounded-full gold-gradient text-white font-bold text-xs flex items-center justify-center shadow-sm">
              ${initial}
            </div>
            <div class="text-left text-xs leading-tight hidden md:block">
              <span class="font-bold text-slate-800 block truncate max-w-[120px]">${currentAuthUser.fullName}</span>
              <span class="text-[10px] text-amber-700 font-semibold">${currentAuthUser.tier || currentAuthUser.roleLabel || 'Thành Viên'}</span>
            </div>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1"></i>
          </button>
        </div>
      `;

      // Auto-fill customer details in booking form
      const nameInput = document.getElementById('cust-name');
      const phoneInput = document.getElementById('cust-phone');
      const emailInput = document.getElementById('cust-email');

      if (nameInput && !nameInput.value) nameInput.value = currentAuthUser.fullName;
      if (phoneInput && !phoneInput.value) phoneInput.value = currentAuthUser.phone;
      if (emailInput && !emailInput.value) emailInput.value = currentAuthUser.email;
    } else {
      container.innerHTML = `
        <button onclick="window.openAuthModal('login')" class="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 hover:text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-all">
          <i class="fa-regular fa-circle-user text-amber-600 text-sm"></i>
          <span>Đăng Nhập / Đăng Ký</span>
        </button>
      `;
    }
  }

  // Open Auth Modal
  window.openAuthModal = function (tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    window.switchAuthTab(tab);
  };

  // Close Auth Modal
  window.closeAuthModal = function () {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  // Switch Auth Tabs (Login / Register / Forgot)
  window.switchAuthTab = function (tab) {
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const tabForgot = document.getElementById('auth-tab-forgot');
    const btnLogin = document.getElementById('tab-btn-login');
    const btnRegister = document.getElementById('tab-btn-register');
    const title = document.getElementById('auth-modal-title');

    if (!tabLogin || !tabRegister || !tabForgot) return;

    tabLogin.classList.add('hidden');
    tabRegister.classList.add('hidden');
    tabForgot.classList.add('hidden');

    if (btnLogin) btnLogin.className = 'py-2 rounded-lg transition-all text-slate-600 hover:text-slate-900';
    if (btnRegister) btnRegister.className = 'py-2 rounded-lg transition-all text-slate-600 hover:text-slate-900';

    if (tab === 'login') {
      tabLogin.classList.remove('hidden');
      if (btnLogin) btnLogin.className = 'py-2 rounded-lg transition-all bg-white text-slate-900 shadow-sm';
      if (title) title.textContent = 'Cổng Đăng Nhập Thành Viên VIP';
    } else if (tab === 'register') {
      tabRegister.classList.remove('hidden');
      if (btnRegister) btnRegister.className = 'py-2 rounded-lg transition-all bg-white text-slate-900 shadow-sm';
      if (title) title.textContent = 'Đăng Ký Thành Viên VIP Ánh Dương';
    } else if (tab === 'forgot') {
      tabForgot.classList.remove('hidden');
      if (title) title.textContent = 'Khôi Phục Mật Khẩu Tài Khoản';
    }
  };

  // Quick Demo Auto-fill Login for Testers
  window.fillDemoLogin = function (role) {
    const target = authUsers.find(u => u.role === role);
    if (!target) return;

    const emailInput = document.getElementById('login-email');
    const pwdInput = document.getElementById('login-password');

    if (emailInput) emailInput.value = target.email;
    if (pwdInput) pwdInput.value = target.password;

    currentAuthUser = target;
    saveCurrentAuthUser();
    updateAuthNavUI();
    window.closeAuthModal();
    showToast(`Đăng nhập thành công với vai trò: ${target.roleLabel}!`, 'success');

    if (target.role === 'admin' || target.role === 'receptionist') {
      navigateToPage('admin-portal');
    }
  };

  // Quick Switch Role from Top Bar dropdown
  window.quickSwitchRole = function (role) {
    const target = authUsers.find(u => u.role === role);
    if (target) {
      currentAuthUser = target;
      saveCurrentAuthUser();
      updateAuthNavUI();
      const dropdown = document.getElementById('role-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      showToast(`Đã chuyển vai trò kiểm thử sang: ${target.roleLabel}`, 'success');

      if (target.role === 'admin' || target.role === 'receptionist') {
        navigateToPage('admin-portal');
      }
    }
  };

  window.toggleRoleDropdown = function () {
    const dropdown = document.getElementById('role-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
  };

  // Toggle Password Visibility
  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye-slash';
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye';
    }
  };

  // Check Password Strength
  window.checkPasswordStrength = function (pwd) {
    const bar = document.getElementById('pwd-strength-bar');
    const text = document.getElementById('pwd-strength-text');
    if (!bar || !text) return;

    if (!pwd || pwd.length === 0) {
      bar.style.width = '0%';
      text.textContent = 'Độ mạnh mật khẩu';
      return;
    }

    if (pwd.length < 6) {
      bar.style.width = '25%';
      bar.className = 'h-full bg-rose-500 w-[25%] transition-all duration-300';
      text.textContent = 'Yếu (Tối thiểu 6 ký tự)';
      text.className = 'text-[10px] text-rose-600 font-semibold';
    } else if (pwd.length < 9) {
      bar.style.width = '60%';
      bar.className = 'h-full bg-amber-500 w-[60%] transition-all duration-300';
      text.textContent = 'Trung bình';
      text.className = 'text-[10px] text-amber-600 font-semibold';
    } else {
      bar.style.width = '100%';
      bar.className = 'h-full bg-emerald-500 w-[100%] transition-all duration-300';
      text.textContent = 'Mạnh & An toàn';
      text.className = 'text-[10px] text-emerald-600 font-semibold';
    }
  };

  // Handle Login Submit
  window.handleLoginSubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    const user = authUsers.find(u => u.email.toLowerCase() === email);
    if (!user) {
      showToast('Email tài khoản không tồn tại trên hệ thống.', 'error');
      return;
    }

    if (user.password !== password) {
      showToast('Mật khẩu không chính xác. Vui lòng thử lại!', 'error');
      return;
    }

    currentAuthUser = user;
    saveCurrentAuthUser();
    updateAuthNavUI();
    window.closeAuthModal();
    showToast(`Chào mừng ${user.fullName} đã quay trở lại Khách Sạn Ánh Dương!`, 'success');

    if (user.role === 'admin' || user.role === 'receptionist') {
      navigateToPage('admin-portal');
    }
  };

  // Handle Register Submit
  window.handleRegisterSubmit = function (e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Validation
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không đúng định dạng VN (10 số, đầu 03/05/07/08/09).', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Mật khẩu phải có tối thiểu 6 ký tự.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.', 'error');
      return;
    }

    const exists = authUsers.some(u => u.email.toLowerCase() === email);
    if (exists) {
      showToast('Email này đã được đăng ký tài khoản.', 'error');
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      email,
      password,
      fullName,
      phone,
      role: 'customer',
      roleLabel: 'Thành Viên VIP',
      points: 200, // Welcome points
      tier: 'Gold VIP'
    };

    authUsers.push(newUser);
    saveAuthUsers();

    currentAuthUser = newUser;
    saveCurrentAuthUser();
    updateAuthNavUI();
    window.closeAuthModal();
    showToast('Đăng ký thành công! Bạn nhận được 200 điểm thưởng chào mừng.', 'success');
  };

  // Handle Forgot Password Submit
  window.handleForgotSubmit = function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('forgot-email');
    const otpGroup = document.getElementById('otp-group');
    const otpInput = document.getElementById('forgot-otp');
    const newPwdInput = document.getElementById('forgot-new-pwd');
    const submitBtn = document.getElementById('btn-forgot-submit');

    if (otpGroup.classList.contains('hidden')) {
      const user = authUsers.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase());
      if (!user) {
        showToast('Email không tồn tại trong hệ thống.', 'error');
        return;
      }
      otpGroup.classList.remove('hidden');
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i> Đặt Lại Mật Khẩu';
      showToast('Đã gửi mã OTP xác nhận về email của bạn (Mã: 888999).', 'success');
    } else {
      if (otpInput.value.trim() !== '888999') {
        showToast('Mã OTP không chính xác. Vui lòng nhập mã: 888999', 'error');
        return;
      }
      if (!newPwdInput.value || newPwdInput.value.length < 6) {
        showToast('Mật khẩu mới phải có tối thiểu 6 ký tự.', 'error');
        return;
      }

      const userIndex = authUsers.findIndex(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase());
      if (userIndex !== -1) {
        authUsers[userIndex].password = newPwdInput.value;
        saveAuthUsers();
        showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.', 'success');
        window.switchAuthTab('login');
      }
    }
  };

  // Mock Social Login
  window.mockSocialLogin = function (provider) {
    const demoCustomer = authUsers.find(u => u.role === 'customer') || authUsers[0];
    currentAuthUser = demoCustomer;
    saveCurrentAuthUser();
    updateAuthNavUI();
    window.closeAuthModal();
    showToast(`Đăng nhập thành công qua ${provider}!`, 'success');
  };

  // User Profile Modal Handlers
  window.openProfileModal = function () {
    if (!currentAuthUser) {
      window.openAuthModal('login');
      return;
    }

    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    document.getElementById('profile-avatar-char').textContent = currentAuthUser.fullName ? currentAuthUser.fullName.charAt(0).toUpperCase() : 'U';
    document.getElementById('profile-fullname').textContent = currentAuthUser.fullName;
    document.getElementById('profile-tier').textContent = currentAuthUser.tier || currentAuthUser.roleLabel || 'Thành Viên VIP';
    document.getElementById('profile-points').textContent = `${currentAuthUser.points || 500} Điểm`;
    document.getElementById('profile-email-input').value = currentAuthUser.email;
    document.getElementById('profile-phone-input').value = currentAuthUser.phone || '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeProfileModal = function () {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  window.updateUserProfilePhone = function () {
    if (!currentAuthUser) return;
    const phone = document.getElementById('profile-phone-input').value.trim();
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không đúng định dạng VN 10 chữ số.', 'error');
      return;
    }

    currentAuthUser.phone = phone;
    const idx = authUsers.findIndex(u => u.id === currentAuthUser.id);
    if (idx !== -1) {
      authUsers[idx].phone = phone;
      saveAuthUsers();
    }
    saveCurrentAuthUser();
    showToast('Cập nhật số điện thoại thành công!', 'success');
    window.closeProfileModal();
  };

  // Handle Logout
  window.handleLogout = function () {
    currentAuthUser = null;
    saveCurrentAuthUser();
    updateAuthNavUI();
    window.closeProfileModal();
    showToast('Đã đăng xuất khỏi tài khoản.', 'success');
  };
})();
