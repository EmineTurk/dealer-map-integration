export type IstanbulDistrict = {
  key: string;
  label: string;
  lat: number;
  lng: number;
};

export const ISTANBUL_DISTRICTS: IstanbulDistrict[] = [
  { key: 'Adalar', label: 'Adalar', lat: 40.8747, lng: 29.1294 },
  { key: 'Arnavutkoy', label: 'Arnavutköy', lat: 41.1856, lng: 28.7407 },
  { key: 'Atasehir', label: 'Ataşehir', lat: 40.9833, lng: 29.1278 },
  { key: 'Avcilar', label: 'Avcılar', lat: 40.9799, lng: 28.7211 },
  { key: 'Bagcilar', label: 'Bağcılar', lat: 41.0390, lng: 28.8567 },
  { key: 'Bahcelievler', label: 'Bahçelievler', lat: 40.9979, lng: 28.8506 },
  { key: 'Bakirkoy', label: 'Bakırköy', lat: 40.9804, lng: 28.8724 },
  { key: 'Basaksehir', label: 'Başakşehir', lat: 41.1076, lng: 28.8062 },
  { key: 'Bayrampasa', label: 'Bayrampaşa', lat: 41.0482, lng: 28.9003 },
  { key: 'Besiktas', label: 'Beşiktaş', lat: 41.0422, lng: 29.0083 },
  { key: 'Beykoz', label: 'Beykoz', lat: 41.1342, lng: 29.0920 },
  { key: 'Beylikduzu', label: 'Beylikdüzü', lat: 41.0030, lng: 28.6410 },
  { key: 'Beyoglu', label: 'Beyoğlu', lat: 41.0369, lng: 28.9773 },
  { key: 'Buyukcekmece', label: 'Büyükçekmece', lat: 41.0201, lng: 28.5850 },
  { key: 'Catalca', label: 'Çatalca', lat: 41.1437, lng: 28.4618 },
  { key: 'Cekmekoy', label: 'Çekmeköy', lat: 41.0324, lng: 29.1755 },
  { key: 'Esenler', label: 'Esenler', lat: 41.0436, lng: 28.8760 },
  { key: 'Esenyurt', label: 'Esenyurt', lat: 41.0343, lng: 28.6801 },
  { key: 'Eyupsultan', label: 'Eyüpsultan', lat: 41.0478, lng: 28.9337 },
  { key: 'Fatih', label: 'Fatih', lat: 41.0193, lng: 28.9479 },
  { key: 'Gaziosmanpasa', label: 'Gaziosmanpaşa', lat: 41.0759, lng: 28.9120 },
  { key: 'Gungoren', label: 'Güngören', lat: 41.0229, lng: 28.8723 },
  { key: 'Kadikoy', label: 'Kadıköy', lat: 40.9910, lng: 29.0288 },
  { key: 'Kagithane', label: 'Kağıthane', lat: 41.0810, lng: 28.9730 },
  { key: 'Kartal', label: 'Kartal', lat: 40.8897, lng: 29.1856 },
  { key: 'Kucukcekmece', label: 'Küçükçekmece', lat: 41.0002, lng: 28.7809 },
  { key: 'Maltepe', label: 'Maltepe', lat: 40.9351, lng: 29.1307 },
  { key: 'Pendik', label: 'Pendik', lat: 40.8775, lng: 29.2333 },
  { key: 'Sancaktepe', label: 'Sancaktepe', lat: 41.0024, lng: 29.2319 },
  { key: 'Sariyer', label: 'Sarıyer', lat: 41.1667, lng: 29.0573 },
  { key: 'Sile', label: 'Şile', lat: 41.1754, lng: 29.6120 },
  { key: 'Silivri', label: 'Silivri', lat: 41.0732, lng: 28.2464 },
  { key: 'Sisli', label: 'Şişli', lat: 41.0602, lng: 28.9877 },
  { key: 'Sultanbeyli', label: 'Sultanbeyli', lat: 40.9684, lng: 29.2618 },
  { key: 'Sultangazi', label: 'Sultangazi', lat: 41.1065, lng: 28.8683 },
  { key: 'Tuzla', label: 'Tuzla', lat: 40.8168, lng: 29.3003 },
  { key: 'Umraniye', label: 'Ümraniye', lat: 41.0161, lng: 29.1248 },
  { key: 'Uskudar', label: 'Üsküdar', lat: 41.0267, lng: 29.0152 },
  { key: 'Zeytinburnu', label: 'Zeytinburnu', lat: 40.9905, lng: 28.8961 },
];

export const ISTANBUL_DISTRICT_COORDS: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(
    ISTANBUL_DISTRICTS.map(({ key, lat, lng }) => [key, { lat, lng }])
  );
