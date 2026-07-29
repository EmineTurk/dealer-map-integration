import type { Store, Product, CapabilityType } from '../types/api';
import { ISTANBUL_DISTRICTS } from '../data/istanbulDistricts';

// 1. Realistic stores in Istanbul (shared database reference)
const baseMockStores: Store[] = [
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

// Bearing from each coastal district center towards land
// (0=N, 90=E, 180=S, 270=W).
const COASTAL_INLAND_BEARINGS: Record<string, number> = {
  Adalar: 180,
  Avcilar: 0,
  Bakirkoy: 0,
  Besiktas: 270,
  Beykoz: 90,
  Beylikduzu: 0,
  Beyoglu: 270,
  Buyukcekmece: 0,
  Kadikoy: 30,
  Kartal: 0,
  Kucukcekmece: 90,
  Maltepe: 0,
  Pendik: 0,
  Sariyer: 270,
  Sile: 180,
  Silivri: 0,
  Tuzla: 315,
  Uskudar: 90,
  Zeytinburnu: 0
};

const distributedCoordinates = (
  district: (typeof ISTANBUL_DISTRICTS)[number],
  districtIndex: number,
  branchNumber: number
) => {
  const kilometersPerLatitudeDegree = 111.32;
  const inlandBearing = COASTAL_INLAND_BEARINGS[district.key];
  const isCoastal = inlandBearing !== undefined;
  const distanceKm = isCoastal ? 0.15 + ((branchNumber - 1) * 0.30) : 0.35;
  const districtRotationDegrees = (districtIndex * 137.508) % 360;
  const branchAngleDegrees = isCoastal
    ? inlandBearing
    : districtRotationDegrees + ((branchNumber - 1) * 120);
  const branchAngleRadians = branchAngleDegrees * Math.PI / 180;
  const latitudeOffset = (
    distanceKm / kilometersPerLatitudeDegree
  ) * Math.cos(branchAngleRadians);
  const longitudeDegreeKm = (
    kilometersPerLatitudeDegree * Math.cos(district.lat * Math.PI / 180)
  );
  const longitudeOffset = (
    distanceKm / longitudeDegreeKm
  ) * Math.sin(branchAngleRadians);

  return {
    latitude: district.lat + latitudeOffset,
    longitude: district.lng + longitudeOffset
  };
};

const generatedMockStores: Store[] = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  const districtIndex = index % ISTANBUL_DISTRICTS.length;
  const district = ISTANBUL_DISTRICTS[districtIndex];
  const branchNumber = Math.floor(index / ISTANBUL_DISTRICTS.length) + 1;
  const coordinates = distributedCoordinates(district, districtIndex, branchNumber);
  const type = baseMockStores.find(store => store.id === id)?.type
    ?? (id % 3 === 0 ? 'TIM' : 'FRANCHISE');
  const hours = ['09:00 - 21:00', '09:00 - 20:00', '10:00 - 22:00', '10:00 - 20:00'];

  return {
    id,
    name: `Turkcell ${district.key} ${type === 'TIM' ? 'TIM' : 'Franchise'} ${branchNumber}`,
    address: `${district.label} Merkez Cd. No: ${id}, ${district.label}`,
    city: 'Istanbul',
    district: district.key,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    type,
    phone: `+90 212 555 ${String(100 + id).padStart(4, '0')}`,
    workingHours: hours[id % hours.length]
  };
});

export const mockStores: Store[] = generatedMockStores;

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
  { id: 10, name: 'Anker PowerCore 20k', sku: 'ANK-PC20', category: 'Aksesuarlar' },
  { id: 11, name: 'iPad Air M3', sku: 'APL-IPADAIR-M3', category: 'Tabletler' },
  { id: 12, name: 'Samsung Galaxy Tab S10', sku: 'SAM-TABS10', category: 'Tabletler' },
  { id: 13, name: 'Turkcell Superbox 5G', sku: 'TKC-SBOX-5G', category: 'Ağ ve İnternet' },
  { id: 14, name: 'Xiaomi 15', sku: 'XIA-15-256', category: 'Akıllı Telefonlar' },
  { id: 15, name: 'Samsung Galaxy S25', sku: 'SAM-S25-256', category: 'Akıllı Telefonlar' },
  { id: 16, name: 'JBL Tune 770NC', sku: 'JBL-T770NC', category: 'Aksesuarlar' },
  { id: 17, name: 'Apple Pencil Pro', sku: 'APL-PENCIL-PRO', category: 'Aksesuarlar' },
  { id: 18, name: 'Samsung Galaxy Buds3 Pro', sku: 'SAM-BUDS3-PRO', category: 'Aksesuarlar' },
  { id: 19, name: 'Huawei Watch GT 5', sku: 'HUA-WGT5', category: 'Akıllı Saatler' },
  { id: 20, name: 'TP-Link Archer AX55', sku: 'TPL-AX55', category: 'Ağ ve İnternet' }
];

// 3. Mock Stock levels mapping: key: productId-storeId, value: quantity
const productStoreCounts = [
  58, 48, 52, 35, 28, 34, 42, 31, 44, 26,
  18, 22, 37, 29, 46, 24, 33, 39, 17, 21,
];

export const mockStocks: Record<string, number> = Object.fromEntries(
  mockProducts.flatMap(product =>
    Array.from({ length: productStoreCounts[product.id - 1] }, (_, index) => {
      const slot = index + 1;
      const storeId = (product.id * 29 + slot * 37) % 100 + 1;
      const stockScore = (product.id * 41 + storeId * 17 + slot * 13) % 100;
      const quantity = stockScore < 11
        ? 0
        : stockScore < 31
          ? 1 + (stockScore % 5)
          : 6 + ((product.id * 7 + storeId * 3 + slot * 11) % 45);

      return [`${product.id}-${storeId}`, quantity];
    })
  )
);

// 4. Mock Capabilities mapping: key: storeId, value: list of capabilities
export const mockStoreCapabilities: Record<number, CapabilityType[]> = Object.fromEntries(
  mockStores.map(store => [
    store.id,
    [
      'NEW_LINE',
      store.id % 2 === 0 ? 'DEVICE_DELIVERY' : 'NUMBER_PORT',
      store.id % 3 === 0 ? 'DEVICE_REPAIR' : 'BILL_PAYMENT'
    ] as CapabilityType[]
  ])
);
