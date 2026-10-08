/**
 * DỮ LIỆU GỐC HỆ THỐNG KHÁCH SẠN ÁNH DƯƠNG LUXURY 5 SAO
 * Hỗ trợ đồng thời Browser (window.ANH_DUONG_DATA) và Node.js CommonJS (module.exports)
 */

const DATA_CORE = {
  hotelInfo: {
    name: "Khách Sạn Ánh Dương",
    brand: "Ánh Dương Luxury Hotel & Resort",
    starRating: 5,
    address: "Số 88 Đường Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa",
    phone: "0258.3888.999",
    hotline: "1900 888 666",
    email: "contact@khachsananhduong.vn",
    bookingEmail: "reservation@khachsananhduong.vn",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    bankName: "Ngân Hàng Quân Đội (MB Bank)",
    bankAccount: "888899996666",
    bankAccountName: "CTCP KHACH SAN ANH DUONG NHA TRANG",
    description: "Khách sạn 5 sao quốc tế Ánh Dương tọa lạc tại vị trí vàng hướng biển tuyệt đẹp trên cung đường Trần Phú, sở hữu 120 phòng nghỉ sang trọng, hồ bơi vô cực ngắm hoàng hôn, spa thảo dược và chuỗi nhà hàng ẩm thực Á-Âu thượng hạng."
  },

  roomTypes: [
    {
      id: "rt-std",
      code: "STD",
      name: "Standard City View",
      basePrice: 850000,
      description: "Phòng Tiêu chuẩn hướng nhìn toàn cảnh thành phố Nha Trang lung linh về đêm, trang bị đầy đủ tiện nghi hiện đại thích hợp cho các chuyến công tác hoặc kỳ nghỉ ngắn ngày.",
      size: 28,
      bed: "1 Giường đôi Queen hoặc 2 Giường đơn",
      maxAdults: 2,
      maxChildren: 1,
      view: "Hướng thành phố (City View)",
      badge: "Tiết kiệm nhất",
      amenities: [
        "Wifi tốc độ cao 5G miễn phí",
        "Smart TV 50 inch 4K Ultra HD",
        "Điều hòa 2 chiều Inverter êm ái",
        "Minibar & Trà cafe miễn phí mỗi ngày",
        "Máy sấy tóc ion âm & Két sắt an toàn",
        "Bàn làm việc cao cấp & Áo choàng tắm"
      ],
      images: [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "rt-dlx",
      code: "DLX",
      name: "Deluxe Ocean View",
      basePrice: 1450000,
      description: "Phòng Deluxe cao cấp với ban công riêng rộng rãi hướng thẳng ra biển xanh ngát, nội thất gỗ sồi ấm áp và bồn tắm nằm ngắm trọn vẹn bình minh vịnh Nha Trang.",
      size: 38,
      bed: "1 Giường King Size cỡ lớn",
      maxAdults: 2,
      maxChildren: 2,
      view: "Hướng biển trực diện (Ocean View)",
      badge: "Bán chạy nhất",
      amenities: [
        "Ban công riêng nhìn trọn biển",
        "Bồn tắm nằm ngắm vịnh biển",
        "Wifi tốc độ cao & Smart TV 55 inch",
        "Máy pha cà phê Nespresso thượng hạng",
        "Minibar miễn phí đồ uống ngày đầu",
        "Loa Bluetooth cao cấp Marshall",
        "Bộ đồ ngủ & Áo choàng lụa cao cấp"
      ],
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "rt-ste",
      code: "STE",
      name: "Premier Executive Suite",
      basePrice: 2650000,
      description: "Căn hộ Suite thượng hạng gồm phòng khách riêng biệt sang trọng, quầy bar mini, phòng ngủ lộng lẫy cùng đặc quyền thưởng thức trà chiều tại Executive Lounge tầng 20.",
      size: 65,
      bed: "1 Giường Super King Hoàng Gia",
      maxAdults: 3,
      maxChildren: 2,
      view: "Toàn cảnh Vịnh Biển & Thành phố (Panoramic View)",
      badge: "Đặc quyền VIP Lounge",
      amenities: [
        "Phòng khách riêng biệt sang trọng",
        "Đặc quyền thưởng thức VIP Executive Lounge",
        "Bồn sục Jacuzzi massage thư giãn",
        "Ban công đôi ngắm hoàng hôn",
        "Dịch vụ Butler quản gia 24/7",
        "Bữa sáng buffet miễn phí tại phòng",
        "Rượu vang & Trái cây nhập khẩu chào mừng",
        "Bộ mỹ phẩm hữu cơ cao cấp L'Occitane"
      ],
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "rt-fam",
      code: "FAM",
      name: "Family Ocean Grand Villa",
      basePrice: 3800000,
      description: "Villa biệt lập không gian lớn 2 phòng ngủ kết nối, sân vườn nhỏ hướng biển, bếp tiện nghi và khu vực bàn ăn gia đình ấm cúng cho cả gia đình đông người.",
      size: 95,
      bed: "2 Phòng ngủ (1 King Master + 2 Giường đơn)",
      maxAdults: 5,
      maxChildren: 3,
      view: "Biển & Sân vườn nhiệt đới",
      badge: "Dành cho Gia đình",
      amenities: [
        "2 Phòng ngủ khép kín riêng tư",
        "Phòng ăn & Khu bếp tiện ích đầy đủ",
        "Hồ bơi mini sân vườn riêng biệt",
        "Sân vườn tổ chức tiệc BBQ gia đình",
        "Đưa đón sân bay 2 chiều miễn phí",
        "Khu vui chơi trẻ em an toàn",
        "Smart TV 65 inch mỗi phòng ngủ"
      ],
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "rt-pen",
      code: "PEN",
      name: "Ánh Dương Royal Presidential Penthouse",
      basePrice: 7500000,
      description: "Căn Penthouse độc bản tại tầng thượng cao nhất của khách sạn Ánh Dương, bể bơi vô cực kính tràn viền riêng biệt ngắm trọn bình minh và hoàng hôn biển tuyệt mỹ.",
      size: 180,
      bed: "Master King Suite Hoàng Gia Độc Bản",
      maxAdults: 4,
      maxChildren: 2,
      view: "Đỉnh cao 360 độ Vịnh Biển Ánh Dương",
      badge: "Đẳng cấp Hoàng Gia",
      amenities: [
        "Bể bơi vô cực riêng trên tầng cao nhất",
        "Phòng xông hơi khô Sauna & Jacuzzi",
        "Đầu bếp riêng 5 sao phục vụ tại phòng",
        "Quản gia riêng túc trực phục vụ 24/7",
        "Xe Rolls Royce đưa đón sân bay",
        "Dàn âm thanh rạp phim Hi-End cao cấp",
        "Hầm rượu vang thượng hạng cá nhân"
      ],
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ],

  rooms: [
    { id: "rm-101", roomNumber: "101", floor: 1, typeId: "rt-std", status: "available" },
    { id: "rm-102", roomNumber: "102", floor: 1, typeId: "rt-std", status: "available" },
    { id: "rm-103", roomNumber: "103", floor: 1, typeId: "rt-std", status: "occupied", guest: "Trần Hoàng Long" },
    { id: "rm-104", roomNumber: "104", floor: 1, typeId: "rt-dlx", status: "available" },
    { id: "rm-105", roomNumber: "105", floor: 1, typeId: "rt-dlx", status: "available" },

    { id: "rm-201", roomNumber: "201", floor: 2, typeId: "rt-dlx", status: "available" },
    { id: "rm-202", roomNumber: "202", floor: 2, typeId: "rt-dlx", status: "reserved", guest: "Lê Minh Tuấn" },
    { id: "rm-203", roomNumber: "203", floor: 2, typeId: "rt-dlx", status: "available" },
    { id: "rm-204", roomNumber: "204", floor: 2, typeId: "rt-ste", status: "available" },
    { id: "rm-205", roomNumber: "205", floor: 2, typeId: "rt-ste", status: "occupied", guest: "Phạm Minh Trang" },

    { id: "rm-301", roomNumber: "301", floor: 3, typeId: "rt-ste", status: "available" },
    { id: "rm-302", roomNumber: "302", floor: 3, typeId: "rt-ste", status: "available" },
    { id: "rm-303", roomNumber: "303", floor: 3, typeId: "rt-fam", status: "available" },
    { id: "rm-304", roomNumber: "304", floor: 3, typeId: "rt-fam", status: "maintenance", guest: "Bảo trì định kỳ" },

    { id: "rm-401", roomNumber: "401", floor: 4, typeId: "rt-fam", status: "available" },
    { id: "rm-402", roomNumber: "402", floor: 4, typeId: "rt-pen", status: "available" }
  ],

  services: [
    {
      id: "srv-trans",
      name: "Đưa đón sân bay Cam Ranh (Limousine VIP)",
      price: 350000,
      unit: "chuyến",
      icon: "fa-van-shuttle",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      description: "Xe Limousine đón tiễn riêng tư, êm ái, máy lạnh và khăn lạnh nước suối miễn phí suốt hành trình."
    },
    {
      id: "srv-buffet",
      name: "Buffet Sáng Quốc Tế Thượng Hạng",
      price: 220000,
      unit: "người/ngày",
      icon: "fa-utensils",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      description: "Hơn 80 món ăn Á-Âu, hải sản Nha Trang tươi ngon, quầy bánh ngọt chuẩn Pháp và nước trái cây tươi."
    },
    {
      id: "srv-spa",
      name: "Liệu Trình Lotus Spa & Đá Nóng (60 phút)",
      price: 490000,
      unit: "người",
      icon: "fa-spa",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
      description: "Massage body thư giãn kết hợp tinh dầu thảo mộc tự nhiên và đá núi lửa giúp phục hồi năng lượng."
    },
    {
      id: "srv-dinner",
      name: "Set Tiệc Nướng BBQ Hoàng Hôn Bãi Biển",
      price: 890000,
      unit: "cặp đôi",
      icon: "fa-wine-glass",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      description: "Bàn tiệc lãng mạn bên tiếng sóng vỗ, hải sản tôm hùm nướng than hoa và 1 chai vang Pháp nồng nàn."
    },
    {
      id: "srv-tour",
      name: "Tour Cano Cao Tốc 4 Đảo Vịnh Nha Trang",
      price: 650000,
      unit: "người",
      icon: "fa-compass",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      description: "Lặn ngắm rạn san hô Hòn Mun, câu cá thư giãn, tắm biển Bãi Tranh và ăn hải sản tại làng chài."
    }
  ],

  coupons: [
    {
      code: "ANHDUONG2026",
      discountType: "percent",
      discountValue: 10,
      description: "Giảm 10% tổng đơn cho khách đặt phòng trực tuyến"
    },
    {
      code: "ANHDUONG10",
      discountType: "percent",
      discountValue: 10,
      description: "Voucher giảm ngay 10% tổng tiền phòng"
    },
    {
      code: "VIP2026",
      discountType: "percent",
      discountValue: 15,
      description: "Đặc quyền thành viên VIP - Giảm 15% tổng hóa đơn"
    },
    {
      code: "SUMMER500K",
      discountType: "fixed",
      discountValue: 500000,
      description: "Tặng ngay 500.000 VNĐ cho đơn từ 3.000.000 VNĐ"
    }
  ],

  initialBookings: [
    {
      bookingCode: "AD-2026-8910",
      customerName: "Trần Hoàng Long",
      phone: "0905123456",
      email: "khachhang@gmail.com",
      roomTypeId: "rt-std",
      roomNumber: "103",
      checkIn: "2026-10-08",
      checkOut: "2026-10-10",
      nights: 2,
      adults: 2,
      children: 0,
      services: ["srv-buffet"],
      couponCode: "ANHDUONG2026",
      roomTotal: 1700000,
      servicesTotal: 440000,
      discountAmount: 214000,
      finalTotal: 1926000,
      depositAmount: 577800,
      paymentStatus: "paid_deposit",
      bookingStatus: "checked_in",
      createdAt: "2026-10-05T14:20:00.000Z",
      notes: "Cần phòng tầng yên tĩnh, không hút thuốc"
    },
    {
      bookingCode: "AD-2026-9421",
      customerName: "Phạm Minh Trang",
      phone: "0988776655",
      email: "minhtrang@gmail.com",
      roomTypeId: "rt-ste",
      roomNumber: "205",
      checkIn: "2026-10-07",
      checkOut: "2026-10-11",
      nights: 4,
      adults: 2,
      children: 1,
      services: ["srv-trans", "srv-spa"],
      couponCode: "VIP2026",
      roomTotal: 10600000,
      servicesTotal: 840000,
      discountAmount: 1716000,
      finalTotal: 9724000,
      depositAmount: 2917200,
      paymentStatus: "paid_full",
      bookingStatus: "checked_in",
      createdAt: "2026-10-06T09:15:00.000Z",
      notes: "Kỷ niệm ngày cưới, chuẩn bị cánh hoa hồng trên giường"
    },
    {
      bookingCode: "AD-2026-1123",
      customerName: "Lê Minh Tuấn",
      phone: "0912334455",
      email: "minhtuan.le@gmail.com",
      roomTypeId: "rt-dlx",
      roomNumber: "202",
      checkIn: "2026-10-09",
      checkOut: "2026-10-12",
      nights: 3,
      adults: 2,
      children: 2,
      services: ["srv-buffet", "srv-tour"],
      couponCode: "",
      roomTotal: 4350000,
      servicesTotal: 1310000,
      discountAmount: 0,
      finalTotal: 5660000,
      depositAmount: 1698000,
      paymentStatus: "paid_deposit",
      bookingStatus: "confirmed",
      createdAt: "2026-10-07T16:45:00.000Z",
      notes: "Yêu cầu phòng hướng biển tầng cao"
    }
  ],

  users: [
    {
      id: "usr-admin-1",
      username: "admin",
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
      username: "letan",
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
      username: "khachhang",
      email: "khachhang@gmail.com",
      password: "khach",
      fullName: "Trần Hoàng Long",
      phone: "0905123456",
      role: "customer",
      roleLabel: "Thành Viên VIP (Customer)",
      points: 850,
      tier: "Gold VIP"
    }
  ]
};

// Chuẩn bị mảng tương thích cho Node.js Test Suite & Server
const INITIAL_ROOM_TYPES = DATA_CORE.roomTypes.map(rt => ({
  ...rt,
  id: rt.code // STD, DLX, STE, FAM, PEN để test_suite.js tìm theo id: 'STD'
})).concat(DATA_CORE.roomTypes); // Giữ cả rt-std

const INITIAL_HOTEL_INFO = DATA_CORE.hotelInfo;
const INITIAL_ROOMS = DATA_CORE.rooms;
const INITIAL_SERVICES = DATA_CORE.services;
const INITIAL_VOUCHERS = DATA_CORE.coupons;
const INITIAL_USERS = DATA_CORE.users;
const INITIAL_BOOKINGS = DATA_CORE.initialBookings;
const INITIAL_REVIEWS = [
  { id: "rev-1", customerName: "Trần Hoàng Long", rating: 5, comment: "Kỳ nghỉ tuyệt vời, vịnh biển ngắm hoàng hôn rất đẹp!", roomType: "Standard City View", date: "2026-10-06" }
];

// Browser attach
if (typeof window !== 'undefined') {
  window.ANH_DUONG_DATA = DATA_CORE;
}

// Node.js CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ANH_DUONG_DATA: DATA_CORE,
    INITIAL_HOTEL_INFO,
    INITIAL_ROOM_TYPES,
    INITIAL_ROOMS,
    INITIAL_SERVICES,
    INITIAL_VOUCHERS,
    INITIAL_USERS,
    INITIAL_BOOKINGS,
    INITIAL_REVIEWS
  };
}
