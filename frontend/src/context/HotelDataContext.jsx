import React, { createContext, useContext, useState, useEffect } from 'react';

const HotelDataContext = createContext();

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Initial realistic Indian luxury hotel seed data
const INITIAL_ROOMS = [
  {
    id: 1,
    number: '101',
    name: 'Deluxe Courtyard Chamber',
    category: 'Deluxe',
    floor: '1st Floor',
    bedType: 'King Bed',
    view: 'Mughal Courtyard & Gardens',
    sizeSqFt: 420,
    maxOccupancy: 2,
    basePrice: 4500,
    status: 'Ready', // 'Ready' | 'Occupied' | 'Cleaning' | 'Maintenance'
    image: '/images/rooms/deluxe_king.jpg',
    amenities: ['High-speed Wi-Fi', 'Rain Shower', 'Private Balcony', 'Artisanal Tea Station', '4K Smart TV'],
    description: 'A serene sanctuary featuring traditional jharokha architecture, plush king bed, and private courtyard vistas.',
  },
  {
    id: 2,
    number: '102',
    name: 'Superior Heritage Twin',
    category: 'Deluxe',
    floor: '1st Floor',
    bedType: 'Twin Beds',
    view: 'Garden & Fountains',
    sizeSqFt: 420,
    maxOccupancy: 2,
    basePrice: 4200,
    status: 'Occupied',
    image: '/images/rooms/superior_twin.jpg',
    amenities: ['High-speed Wi-Fi', 'Marble Bathroom', 'Work Desk', 'Mini Bar', 'Pillow Menu'],
    description: 'Elegantly appointed twin chamber crafted with carved teakwood, modern conveniences, and garden tranquility.',
  },
  {
    id: 3,
    number: '201',
    name: 'Executive Palace Suite',
    category: 'Suite',
    floor: '2nd Floor',
    bedType: 'Imperial King Bed',
    view: 'Lake Pichola Panoramic View',
    sizeSqFt: 650,
    maxOccupancy: 3,
    basePrice: 7800,
    status: 'Ready',
    image: '/images/rooms/executive_suite.jpg',
    amenities: ['Private Living Room', 'Deep Soaking Tub', 'Complimentary Breakfast', 'Butler Service', 'Nespresso Bar'],
    description: 'Expansive suite featuring a lavish living room, hand-painted murals, walk-in dressing salon, and lake vistas.',
  },
  {
    id: 4,
    number: '202',
    name: 'Royal Heritage Suite',
    category: 'Suite',
    floor: '2nd Floor',
    bedType: 'King Bed',
    view: 'City Palace & Lake',
    sizeSqFt: 720,
    maxOccupancy: 3,
    basePrice: 9500,
    status: 'Cleaning',
    image: '/images/rooms/executive_suite.jpg',
    amenities: ['Private Balcony', 'Sunken Jacuzzi', 'Royal Club Access', 'Evening High Tea', 'Chauffeured Pickup'],
    description: 'Regal sanctuary offering dramatic sunset views, private balcony, master bathtub, and club privileges.',
  },
  {
    id: 5,
    number: '301',
    name: 'Maharaja Imperial Suite',
    category: 'Royal Suite',
    floor: '3rd Floor',
    bedType: 'Custom Silk King Bed',
    view: '360° Royal Palace & Lake View',
    sizeSqFt: 1250,
    maxOccupancy: 4,
    basePrice: 16500,
    status: 'Ready',
    image: '/images/rooms/royal_penthouse.jpg',
    amenities: ['24/7 Dedicated Butler', 'Dining Room for 6', 'Whirlpool Spa Bath', 'Custom Wine Cellar', 'Airport Mercedes Transfer'],
    description: 'The epitome of Rajputana royalty. Grand dining hall, gold-leaf motifs, bespoke antique furnishings, and private terrace.',
  },
  {
    id: 6,
    number: '302',
    name: 'Presidential Palace Penthouse',
    category: 'Royal Suite',
    floor: '3rd Floor (Penthouse)',
    bedType: 'Two Master King Bedrooms',
    view: 'Full Palace Grounds & Aravalli Hills',
    sizeSqFt: 1950,
    maxOccupancy: 5,
    basePrice: 28000,
    status: 'Occupied',
    image: '/images/rooms/royal_penthouse.jpg',
    amenities: ['Private Plunge Pool', 'Personal Chef on Call', 'Grand Piano Lounge', 'Steam Room & Sauna', 'Helipad Access'],
    description: 'Our most prestigious residence. Multi-bedroom estate with private plunge pool, sprawling terrace, and personal chef.',
  },
  {
    id: 7,
    number: '104',
    name: 'Lotus Courtyard Villa',
    category: 'Villa',
    floor: 'Ground Floor',
    bedType: 'King Bed',
    view: 'Private Lotus Pond & Garden',
    sizeSqFt: 900,
    maxOccupancy: 3,
    basePrice: 14500,
    status: 'Ready',
    image: '/images/rooms/deluxe_king.jpg',
    amenities: ['Private Walled Courtyard', 'Open-air Rain Shower', 'Sun Loungers', 'Ayurvedic Bath Amenities', 'Yoga Pavilion'],
    description: 'Private walled villa surrounded by blooming lotus ponds, private garden cabana, and blissful secluded luxury.',
  },
  {
    id: 8,
    number: '205',
    name: 'Luxury Club Chamber',
    category: 'Deluxe',
    floor: '2nd Floor',
    bedType: 'King Bed',
    view: 'Palace Courtyard',
    sizeSqFt: 480,
    maxOccupancy: 2,
    basePrice: 5800,
    status: 'Maintenance',
    image: '/images/rooms/superior_twin.jpg',
    amenities: ['Club Lounge Access', 'Complimentary Cocktails', 'Ergonomic Workspace', 'Smart Climate Control', 'Rain Shower'],
    description: 'Designed for the discerning traveler with full Club Lounge privileges, evening cocktail hour, and executive amenities.',
  },
];

const INITIAL_BOOKINGS = [
  {
    id: 'ROY-8921',
    guestName: 'Alexander Wright',
    guestEmail: 'alexander@royalhotel.in',
    guestPhone: '+91 98765 43210',
    roomId: 3,
    roomName: 'Executive Palace Suite',
    roomNumber: '201',
    checkIn: '2026-11-01',
    checkOut: '2026-11-04',
    nights: 3,
    guests: 2,
    basePricePerNight: 7800,
    subtotal: 23400,
    taxGst: 4212, // 18% GST
    totalAmount: 27612,
    status: 'Confirmed', // 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled'
    paymentStatus: 'Paid via UPI',
    createdDate: '2026-10-28',
    specialRequests: 'High floor, feather pillows, late check-in around 6 PM.',
  },
  {
    id: 'ROY-8842',
    guestName: 'Alexander Wright',
    guestEmail: 'alexander@royalhotel.in',
    guestPhone: '+91 98765 43210',
    roomId: 2,
    roomName: 'Superior Heritage Twin',
    roomNumber: '102',
    checkIn: '2026-10-30',
    checkOut: '2026-11-02',
    nights: 3,
    guests: 2,
    basePricePerNight: 4200,
    subtotal: 12600,
    taxGst: 2268,
    totalAmount: 14868,
    status: 'Checked-In',
    paymentStatus: 'Settled via Credit Card',
    createdDate: '2026-10-25',
    specialRequests: 'Twin beds setup, extra towels.',
  },
  {
    id: 'ROY-8715',
    guestName: 'Vikramaditya Rathore',
    guestEmail: 'vikram.rathore@heritage.in',
    guestPhone: '+91 99100 23456',
    roomId: 6,
    roomName: 'Presidential Palace Penthouse',
    roomNumber: '302',
    checkIn: '2026-10-31',
    checkOut: '2026-11-03',
    nights: 3,
    guests: 4,
    basePricePerNight: 28000,
    subtotal: 84000,
    taxGst: 15120,
    totalAmount: 99120,
    status: 'Checked-In',
    paymentStatus: 'Corporate Direct Billing',
    createdDate: '2026-10-26',
    specialRequests: 'VIP Butler service, airport Mercedes transfer.',
  },
  {
    id: 'ROY-8630',
    guestName: 'Dr. Ananya Iyer',
    guestEmail: 'ananya.iyer@health.org',
    guestPhone: '+91 98201 54321',
    roomId: 1,
    roomName: 'Deluxe Courtyard Chamber',
    roomNumber: '101',
    checkIn: '2026-11-03',
    checkOut: '2026-11-06',
    nights: 3,
    guests: 1,
    basePricePerNight: 4500,
    subtotal: 13500,
    taxGst: 2430,
    totalAmount: 15930,
    status: 'Confirmed',
    paymentStatus: 'Paid via NetBanking',
    createdDate: '2026-10-29',
    specialRequests: 'Quiet room away from elevators, herbal tea selection.',
  },
  {
    id: 'ROY-8502',
    guestName: 'David Chen',
    guestEmail: 'd.chen@globaltravel.com',
    guestPhone: '+1 415 555 8920',
    roomId: 4,
    roomName: 'Royal Heritage Suite',
    roomNumber: '202',
    checkIn: '2026-10-27',
    checkOut: '2026-10-31',
    nights: 4,
    guests: 2,
    basePricePerNight: 9500,
    subtotal: 38000,
    taxGst: 6840,
    totalAmount: 44840,
    status: 'Completed',
    paymentStatus: 'Settled at Checkout',
    createdDate: '2026-10-20',
    specialRequests: 'Late checkout requested and completed.',
  },
];

const INITIAL_SERVICE_REQUESTS = [
  {
    id: 'REQ-101',
    roomNumber: '102',
    guestName: 'Alexander Wright',
    category: 'Dining',
    item: 'Royal Rajasthani Thali (x2) & Lassi',
    amount: 1450,
    status: 'In Progress', // 'Pending' | 'In Progress' | 'Completed'
    time: '20 mins ago',
    notes: 'Please serve warm with extra ghee & garlic chutney.',
  },
  {
    id: 'REQ-102',
    roomNumber: '302',
    guestName: 'Vikramaditya Rathore',
    category: 'Housekeeping',
    item: 'Fresh Egyptian Cotton Towels & Extra Pillows',
    amount: 0,
    status: 'Pending',
    time: '35 mins ago',
    notes: 'Firm memory foam pillows requested.',
  },
  {
    id: 'REQ-103',
    roomNumber: '102',
    guestName: 'Alexander Wright',
    category: 'Dining',
    item: 'Masala Chai & Paneer Tikka Platter',
    amount: 600,
    status: 'Completed',
    time: '2 hours ago',
    notes: 'Delivered promptly to room.',
  },
  {
    id: 'REQ-104',
    roomNumber: '202',
    guestName: 'David Chen',
    category: 'Concierge',
    item: 'Airport Mercedes Chauffeur Transfer',
    amount: 1800,
    status: 'Completed',
    time: '4 hours ago',
    notes: 'Guest departed for flight AI-442.',
  },
];

const INITIAL_STAFF = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Front Office Supervisor',
    department: 'Reception & Front Desk',
    shift: 'Morning (07:00 - 15:30)',
    phone: '+91 98111 00101',
    email: 'sarah.frontdesk@royalhotel.in',
    status: 'On Duty',
  },
  {
    id: 2,
    name: 'Carlos Gomez',
    role: 'Housekeeping Team Lead',
    department: 'Housekeeping & Turnover',
    shift: 'Day (09:00 - 17:30)',
    phone: '+91 98111 00102',
    email: 'carlos.hsk@royalhotel.in',
    status: 'On Duty',
  },
  {
    id: 3,
    name: 'Chef Sanjeev Roy',
    role: 'Executive Head Chef',
    department: 'Food & Beverage',
    shift: 'Evening (14:00 - 23:00)',
    phone: '+91 98111 00103',
    email: 'chef.sanjeev@royalhotel.in',
    status: 'On Duty',
  },
  {
    id: 4,
    name: 'Dave Miller',
    role: 'Chief Facilities Engineer',
    department: 'Engineering & Maintenance',
    shift: 'Day (08:00 - 16:30)',
    phone: '+91 98111 00104',
    email: 'dave.maint@royalhotel.in',
    status: 'On Duty',
  },
  {
    id: 5,
    name: 'Sunita Rao',
    role: 'Financial Controller',
    department: 'Accounts & Audit',
    shift: 'Day (09:30 - 18:00)',
    phone: '+91 98111 00105',
    email: 'sunita.accounts@royalhotel.in',
    status: 'Available',
  },
  {
    id: 6,
    name: 'Rajesh Singhania',
    role: 'General Manager',
    department: 'Executive Leadership',
    shift: 'General',
    phone: '+91 98111 00100',
    email: 'rajesh.gm@royalhotel.in',
    status: 'On Duty',
  },
];

export const ROLE_PROFILES = {
  customer: {
    role: 'customer',
    name: 'Alexander Wright',
    email: 'alexander@royalhotel.in',
    phone: '+91 98765 43210',
    title: 'Hotel Guest (Loyalty Gold Member)',
    badge: 'Guest',
    avatar: 'AW',
  },
  staff: {
    role: 'staff',
    name: 'Sarah Jenkins',
    email: 'sarah.frontdesk@royalhotel.in',
    phone: '+91 98111 00101',
    title: 'Front Office Supervisor',
    badge: 'Front Desk Staff',
    avatar: 'SJ',
  },
  admin: {
    role: 'admin',
    name: 'Rajesh Singhania',
    email: 'rajesh.admin@royalhotel.in',
    phone: '+91 98111 00100',
    title: 'General Manager & Hotel Admin',
    badge: 'Executive Admin',
    avatar: 'RS',
  },
};

export function HotelDataProvider({ children }) {
  // 1. Role State: 'customer' | 'staff' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('royal_hotel_active_role') || 'customer';
  });

  // 2. Hotel Inventory State
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('royal_hotel_rooms_v2');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  // 3. Bookings State
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('royal_hotel_bookings_v2');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // 4. Service Requests State
  const [serviceRequests, setServiceRequests] = useState(() => {
    const saved = localStorage.getItem('royal_hotel_requests_v2');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_REQUESTS;
  });

  // 5. Staff Roster State
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('royal_hotel_staff_v2');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem('royal_hotel_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('royal_hotel_rooms_v2', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('royal_hotel_bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('royal_hotel_requests_v2', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('royal_hotel_staff_v2', JSON.stringify(staffList));
  }, [staffList]);

  // Current active user object based on role
  const currentUser = ROLE_PROFILES[activeRole] || ROLE_PROFILES.customer;

  // Function to switch role
  const switchRole = (newRole) => {
    if (ROLE_PROFILES[newRole]) {
      setActiveRole(newRole);
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS & DISPATCHERS (Clean, Reliable, Functional)
  // --------------------------------------------------------------------------

  // Create a new booking
  const createBooking = (bookingData) => {
    const newId = `ROY-${Math.floor(1000 + Math.random() * 9000)}`;
    const nights = Math.max(1, Math.round((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) || 1);
    const subtotal = bookingData.basePricePerNight * nights;
    const taxGst = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxGst;

    const newBooking = {
      id: newId,
      guestName: bookingData.guestName || currentUser.name,
      guestEmail: bookingData.guestEmail || currentUser.email,
      guestPhone: bookingData.guestPhone || currentUser.phone,
      roomId: bookingData.roomId,
      roomName: bookingData.roomName,
      roomNumber: bookingData.roomNumber || 'TBD',
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights,
      guests: Number(bookingData.guests || 2),
      basePricePerNight: bookingData.basePricePerNight,
      subtotal,
      taxGst,
      totalAmount,
      status: 'Confirmed',
      paymentStatus: 'Paid via Card / UPI (Simulated)',
      createdDate: new Date().toISOString().split('T')[0],
      specialRequests: bookingData.specialRequests || 'Standard luxury amenities',
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  // Cancel an existing booking
  const cancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

  // Staff Check-in action
  const checkInBooking = (bookingId, roomNumber = null) => {
    let allocatedRoom = roomNumber;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          allocatedRoom = allocatedRoom || b.roomNumber;
          return { ...b, status: 'Checked-In', roomNumber: allocatedRoom };
        }
        return b;
      })
    );

    // Update room status to Occupied
    if (allocatedRoom && allocatedRoom !== 'TBD') {
      setRooms((prev) =>
        prev.map((r) => (r.number === allocatedRoom ? { ...r, status: 'Occupied' } : r))
      );
    }
  };

  // Staff Check-out action
  const checkOutBooking = (bookingId) => {
    let roomNum = null;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          roomNum = b.roomNumber;
          return { ...b, status: 'Completed' };
        }
        return b;
      })
    );

    // Room becomes 'Cleaning' after checkout
    if (roomNum && roomNum !== 'TBD') {
      setRooms((prev) =>
        prev.map((r) => (r.number === roomNum ? { ...r, status: 'Cleaning' } : r))
      );
    }
  };

  // Update room status
  const updateRoomStatus = (roomId, newStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
  };

  // Admin: Update room base price in INR
  const updateRoomPrice = (roomId, newPrice) => {
    const parsed = Number(newPrice);
    if (!parsed || parsed <= 0) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, basePrice: parsed } : r))
    );
  };

  // Customer or Staff: Add service request
  const addServiceRequest = (requestData) => {
    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      roomNumber: requestData.roomNumber || '102',
      guestName: requestData.guestName || currentUser.name,
      category: requestData.category || 'Dining',
      item: requestData.item,
      amount: Number(requestData.amount || 0),
      status: 'Pending',
      time: 'Just now',
      notes: requestData.notes || '',
    };
    setServiceRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  // Staff: Update service request status
  const updateServiceRequestStatus = (reqId, newStatus) => {
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
  };

  // Admin: Add new staff member
  const addStaffMember = (staffData) => {
    const newStaff = {
      id: Date.now(),
      name: staffData.name,
      role: staffData.role,
      department: staffData.department || 'Front Office',
      shift: staffData.shift || 'Day',
      phone: staffData.phone || '+91 98111 00000',
      email: staffData.email,
      status: 'Available',
    };
    setStaffList((prev) => [...prev, newStaff]);
  };

  // Reset to initial demo data
  const resetToDefaults = () => {
    localStorage.removeItem('royal_hotel_rooms_v2');
    localStorage.removeItem('royal_hotel_bookings_v2');
    localStorage.removeItem('royal_hotel_requests_v2');
    localStorage.removeItem('royal_hotel_staff_v2');
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setServiceRequests(INITIAL_SERVICE_REQUESTS);
    setStaffList(INITIAL_STAFF);
  };

  // Calculated Analytics / KPIs
  const totalRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0) +
    serviceRequests
      .filter((s) => s.status === 'Completed')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

  const totalOccupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const occupancyPercentage = Math.round((totalOccupiedRooms / rooms.length) * 100);

  return (
    <HotelDataContext.Provider
      value={{
        activeRole,
        switchRole,
        currentUser,
        rooms,
        bookings,
        serviceRequests,
        staffList,
        totalRevenue,
        occupancyPercentage,
        totalOccupiedRooms,
        createBooking,
        cancelBooking,
        checkInBooking,
        checkOutBooking,
        updateRoomStatus,
        updateRoomPrice,
        addServiceRequest,
        updateServiceRequestStatus,
        addStaffMember,
        resetToDefaults,
      }}
    >
      {children}
    </HotelDataContext.Provider>
  );
}

export function useHotelData() {
  const context = useContext(HotelDataContext);
  if (!context) {
    throw new Error('useHotelData must be used within a HotelDataProvider');
  }
  return context;
}
