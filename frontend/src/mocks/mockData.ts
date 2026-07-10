import type { Store, Product, CapabilityType } from '../types/api';

// 1. Realistic stores in Istanbul (shared database reference)
export const mockStores: Store[] = [
  {
    id: 1,
    name: 'Turkcell Kadikoy TIM',
    address: 'Sogutlucesme Cd. No: 42, Kadikoy',
    city: 'Istanbul',
    district: 'Kadikoy',
    latitude: 40.9901,
    longitude: 29.0253,
    type: 'TIM',
    phone: '+90 216 555 0101',
    workingHours: '09:00 - 21:00'
  },
  {
    id: 2,
    name: 'Turkcell Besiktas TIM',
    address: 'Barbaros Blv. No: 12, Besiktas',
    city: 'Istanbul',
    district: 'Besiktas',
    latitude: 41.0428,
    longitude: 29.0075,
    type: 'TIM',
    phone: '+90 212 555 0102',
    workingHours: '09:00 - 21:00'
  },
  {
    id: 3,
    name: 'Turkcell Sisli TIM',
    address: 'Halaskargazi Cd. No: 150, Sisli',
    city: 'Istanbul',
    district: 'Sisli',
    latitude: 41.0602,
    longitude: 28.9877,
    type: 'TIM',
    phone: '+90 212 555 0103',
    workingHours: '09:00 - 22:00'
  },
  {
    id: 4,
    name: 'Turkcell Uskudar TIM',
    address: 'Hakimiyeti Milliye Cd. No: 80, Uskudar',
    city: 'Istanbul',
    district: 'Uskudar',
    latitude: 41.0267,
    longitude: 29.0152,
    type: 'TIM',
    phone: '+90 216 555 0104',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 5,
    name: 'Turkcell Fatih TIM',
    address: 'Fevzipasa Cd. No: 210, Fatih',
    city: 'Istanbul',
    district: 'Fatih',
    latitude: 41.0186,
    longitude: 28.9497,
    type: 'TIM',
    phone: '+90 212 555 0105',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 6,
    name: 'Turkcell Beyoglu TIM',
    address: 'Istiklal Cd. No: 75, Beyoglu',
    city: 'Istanbul',
    district: 'Beyoglu',
    latitude: 41.0370,
    longitude: 28.9764,
    type: 'TIM',
    phone: '+90 212 555 0106',
    workingHours: '10:00 - 22:00'
  },
  {
    id: 7,
    name: 'Turkcell Kadikoy Franchise 1',
    address: 'Moda Cd. No: 18, Kadikoy',
    city: 'Istanbul',
    district: 'Kadikoy',
    latitude: 40.9880,
    longitude: 29.0300,
    type: 'FRANCHISE',
    phone: '+90 216 555 0107',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 8,
    name: 'Turkcell Besiktas Franchise 1',
    address: 'Sinanpasa Pasaji No: 5, Besiktas',
    city: 'Istanbul',
    district: 'Besiktas',
    latitude: 41.0410,
    longitude: 29.0090,
    type: 'FRANCHISE',
    phone: '+90 212 555 0108',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 9,
    name: 'Turkcell Sisli Franchise 1',
    address: 'Abdi Ipekci Cd. No: 45, Nisantasi',
    city: 'Istanbul',
    district: 'Sisli',
    latitude: 41.0580,
    longitude: 28.9850,
    type: 'FRANCHISE',
    phone: '+90 212 555 0109',
    workingHours: '10:00 - 20:00'
  },
  {
    id: 10,
    name: 'Turkcell Uskudar Franchise 1',
    address: 'Baglarbasi Cd. No: 120, Uskudar',
    city: 'Istanbul',
    district: 'Uskudar',
    latitude: 41.0250,
    longitude: 29.0120,
    type: 'FRANCHISE',
    phone: '+90 216 555 0110',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 11,
    name: 'Turkcell Fatih Franchise 1',
    address: 'Vatan Cd. No: 33, Fatih',
    city: 'Istanbul',
    district: 'Fatih',
    latitude: 41.0150,
    longitude: 28.9450,
    type: 'FRANCHISE',
    phone: '+90 212 555 0111',
    workingHours: '09:00 - 19:00'
  },
  {
    id: 12,
    name: 'Turkcell Kadikoy Franchise 2',
    address: 'Acibadem Cd. No: 88, Kadikoy',
    city: 'Istanbul',
    district: 'Kadikoy',
    latitude: 40.9850,
    longitude: 29.0200,
    type: 'FRANCHISE',
    phone: '+90 216 555 0112',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 13,
    name: 'Turkcell Besiktas Franchise 2',
    address: 'Ortakoy Meydan No: 3, Besiktas',
    city: 'Istanbul',
    district: 'Besiktas',
    latitude: 41.0450,
    longitude: 29.0020,
    type: 'FRANCHISE',
    phone: '+90 212 555 0113',
    workingHours: '10:00 - 21:00'
  },
  {
    id: 14,
    name: 'Turkcell Sisli Franchise 2',
    address: 'Mecidiyekoy Yolu No: 12, Sisli',
    city: 'Istanbul',
    district: 'Sisli',
    latitude: 41.0620,
    longitude: 28.9920,
    type: 'FRANCHISE',
    phone: '+90 212 555 0114',
    workingHours: '09:00 - 20:00'
  },
  {
    id: 15,
    name: 'Turkcell Uskudar Franchise 2',
    address: 'Libadiye Cd. No: 200, Uskudar',
    city: 'Istanbul',
    district: 'Uskudar',
    latitude: 41.0290,
    longitude: 29.0200,
    type: 'FRANCHISE',
    phone: '+90 216 555 0115',
    workingHours: '09:00 - 20:00'
  }
];

// 2. Mock Products (Pasaj catalog)
export const mockProducts: Product[] = [
  { id: 1, name: 'iPhone 15 128GB', sku: 'APL-IPH15-128', category: 'Akıllı Telefonlar' },
  { id: 2, name: 'iPhone 15 Pro 256GB', sku: 'APL-IPH15P-256', category: 'Akıllı Telefonlar' },
  { id: 3, name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-512', category: 'Akıllı Telefonlar' },
  { id: 4, name: 'Samsung Galaxy A55 128GB', sku: 'SAM-A55-128', category: 'Akıllı Telefonlar' },
  { id: 5, name: 'AirPods Pro Gen 2', sku: 'APL-APP2', category: 'Aksesuarlar' },
  { id: 6, name: 'Apple Watch Series 9', sku: 'APL-AW9-45', category: 'Akıllı Saatler' },
  { id: 7, name: 'Samsung Galaxy Watch 6', sku: 'SAM-GW6-44', category: 'Akıllı Saatler' },
  { id: 8, name: 'Xiaomi Redmi Note 13', sku: 'XIA-RN13-256', category: 'Akıllı Telefonlar' },
  { id: 9, name: 'Turkcell Superbox Router', sku: 'TKC-SBOX-LTE', category: 'Ağ ve İnternet' },
  { id: 10, name: 'Anker PowerCore 20k', sku: 'ANK-PC20', category: 'Aksesuarlar' }
];

// 3. Mock Stock levels mapping: key: productId-storeId, value: quantity
export const mockStocks: Record<string, number> = {
  // iPhone 15 stock (Product 1)
  '1-1': 10, // Kadikoy TIM - IN_STOCK
  '1-2': 4,  // Besiktas TIM - LOW
  '1-3': 0,  // Sisli TIM - OUT_OF_STOCK
  '1-4': 7,  // Uskudar TIM - IN_STOCK
  '1-5': 3,  // Fatih TIM - LOW
  '1-7': 12, // Kadikoy Franchise 1 - IN_STOCK
  '1-8': 2,  // Besiktas Franchise 1 - LOW
  '1-12': 0, // Kadikoy Franchise 2 - OUT_OF_STOCK

  // iPhone 15 Pro stock (Product 2)
  '2-1': 6,
  '2-2': 1,
  '2-3': 8,
  '2-6': 3,
  '2-9': 0,

  // Galaxy S24 Ultra (Product 3)
  '3-1': 3,
  '3-2': 12,
  '3-3': 0,
  '3-5': 5,
  '3-10': 2,

  // AirPods Pro (Product 5)
  '5-1': 20,
  '5-2': 15,
  '5-3': 18,
  '5-4': 25,
  '5-5': 8,
  '5-6': 30,
  '5-7': 5,
  '5-8': 2,
  '5-9': 0,
  '5-10': 12
};

// 4. Mock Capabilities mapping: key: storeId, value: list of capabilities
export const mockStoreCapabilities: Record<number, CapabilityType[]> = {
  1: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'], // TIMs support all
  2: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'],
  3: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'],
  4: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'],
  5: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'],
  6: ['NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'],
  // Franchises support subsets
  7: ['NEW_LINE', 'NUMBER_PORT', 'BILL_PAYMENT'],
  8: ['NEW_LINE', 'DEVICE_DELIVERY', 'BILL_PAYMENT'],
  9: ['NEW_LINE', 'DEVICE_DELIVERY', 'NUMBER_PORT'],
  10: ['NEW_LINE', 'BILL_PAYMENT'],
  11: ['NEW_LINE', 'NUMBER_PORT', 'BILL_PAYMENT'],
  12: ['NEW_LINE', 'DEVICE_DELIVERY', 'BILL_PAYMENT'],
  13: ['NEW_LINE', 'NUMBER_PORT'],
  14: ['NEW_LINE', 'DEVICE_REPAIR', 'BILL_PAYMENT'],
  15: ['NEW_LINE', 'BILL_PAYMENT']
};
