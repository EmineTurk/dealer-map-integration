import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    brandPortal: "Dealer Portal",
    controlPanel: "Dashboard",
    pasajStocks: "Pasaj (Stocks)",
    transactions: "Turkcell Transactions",
    title: "Turkcell My Dealers",
    subtitle: "A high-performance location engine coordinating stock levels and service capabilities across physical Turkcell stores.",
    pasajTitle: "Pasaj",
    pasajSubtitle: "\"Stocks Near Me\"",
    pasajDesc: "Search physical device stock catalog (e.g., iPhone 15, Galaxy S24) and find matching dealers on the map in real-time.",
    transTitle: "Turkcell",
    transSubtitle: "\"Transactions Near Me\"",
    transDesc: "Filter dealers by service capabilities (e.g., new line activation, device repair) and reach the nearest suitable location.",
    metricsTitle: "Dealers by Numbers",
    metric1Label: "Active TIM and Franchise Stores",
    metric2Label: "Total Products in Catalog",
    metric3Label: "Registered Transaction Types",
    searchBtn: "Launch Finder →",
    discoverBtn: "Explore Transactions →",
    // Pasaj page translations
    pasajPageTitle: "Pasaj - Device Stocks Near Me",
    pasajPageDesc: "Find which physical Turkcell store has the product you are looking for in stock.",
    productCatalog: "Product Catalog",
    category: "Category",
    brand: "Brand",
    product: "Product",
    all: "All",
    foundDealers: "Found Dealers",
    stockAvailable: "Stock Available",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    distance: "km away",
    workingHours: "Working Hours",
    status: "Status",
    opensWeekend: "Open on Weekend",
    phone: "Phone",
    hours: "Hours",
    details: "Details",
    // Transactions page translations
    transPageTitle: "Turkcell Transactions Near Me",
    transPageDesc: "Find the nearest Turkcell dealer that can perform the service you need.",
    searchFilters: "Search Filters",
    transactionType: "Transaction Type",
    workingHoursFilter: "Working Hours",
    dealerType: "Dealer Type",
    selectTxType: "Please select a transaction type.",
    selectWorkingHours: "Please select working hours.",
    selectDealerType: "Please select a dealer type.",
    lateClose: "Late Close",
    tim: "TIM",
    franchise: "Franchise",
    searchDealersBtn: "Search Dealers",
    // Drawer & Map translations
    storeDetails: "Store Details",
    currentLocation: "Your Current Location",
    goToCurrentLoc: "Go to my current location",
    simulationMode: "Simulation Mode Active",
    connectionFailed: "API Connection Failed",
    apiNoConnection: "No API Connection",
    fallbackWarning: "Currently running on simulated mock data.",
    reconnectBtn: "Retry API Connection",
    backToDashboard: "← Back to Dashboard",
    districtSelectPlaceholder: "Select district",
    searchRadiusPlaceholder: "Select search radius",
    allCategories: "All Categories",
    allBrands: "All Brands",
    allProducts: "All Products",
    allTxTypes: "All Transaction Types",
    searchRadiusLabel: "Search Radius",
    locationMethodLabel: "Location Method",
    currentLocationLabel: "My Current Location",
    districtSelectLabel: "Select District",
    unlimitedRadius: "Unlimited",
    locatingText: "Retrieving your location...",
    locationErrorTitle: "Location not retrieved",
    currentLocSuccess: "Your current location is being used",
    timDealer: "TIM Dealer",
    franchiseDealer: "Franchise Agency",
    getDirections: "🗺️ Get Directions (Google Maps)",
    drawerTitle: "Dealer Details",
    noDealersFound: "No dealers found matching the selected criteria.",
    noDealersDesc: "Try expanding your search radius or changing your filters.",
    dealersSellingThisProduct: "Dealers Selling This Product",
    searchHint: "Select all filters and location to find dealers.",
    loadingStores: "Loading matching stores...",
    mapHint: "Please select all filters to display the map.",
    currentStockStatus: "Current Stock Level",
    eligibleDealers: "Eligible Dealers",
    searchFiltersTitle: "Search Filters",
    address: "Address",
    phoneLabel: "Phone",
    distanceLabel: "Distance",
  },
  tr: {
    brandPortal: "Bayi Portalı",
    controlPanel: "Kontrol Paneli",
    pasajStocks: "Pasaj (Stoklar)",
    transactions: "Turkcell İşlemler",
    title: "Turkcell Bayilerim",
    subtitle: "Turkcell bayi kanallarında stok seviyelerini ve işlem yetkinliklerini koordine eden yüksek performanslı, birleşik bir konum motoru.",
    pasajTitle: "Pasaj",
    pasajSubtitle: "\"Yakınımdaki Stoklar\"",
    pasajDesc: "Fiziksel cihaz stok kataloğunu (örn. iPhone 15, Galaxy S24) arayın ve çevrenizdeki eşleşen bayileri gerçek zamanlı olarak haritada bulun.",
    transTitle: "Turkcell",
    transSubtitle: "\"Yakınımdaki İşlemler\"",
    transDesc: "Bayileri işlem yetkinliklerine (örn. yeni hat aktivasyonu, cihaz tamiri) göre filtreleyin ve en yakın uygun konuma ulaşın.",
    metricsTitle: "Sayılarla Bayiler",
    metric1Label: "Aktif TİM ve Franchise Mağazalar",
    metric2Label: "Katalogtaki Toplam Ürün",
    metric3Label: "Kayıtlı İşlem Tipi",
    searchBtn: "Bulucuyu Başlat →",
    discoverBtn: "İşlemleri Keşfet →",
    // Pasaj page translations
    pasajPageTitle: "Pasaj - Yakınımdaki Cihaz Stokları",
    pasajPageDesc: "Hangi Turkcell fiziksel mağazasında aradığınız ürünün stokta olduğunu bulun.",
    productCatalog: "Ürün Kataloğu",
    category: "Kategori",
    brand: "Marka",
    product: "Ürün",
    all: "Tümü",
    foundDealers: "Bulunan Mağazalar",
    stockAvailable: "Stok Var",
    inStock: "Stokta Var",
    lowStock: "Az Stok",
    outOfStock: "Stokta Yok",
    distance: "km uzakta",
    workingHours: "Çalışma Saatleri",
    status: "Durum",
    opensWeekend: "Hafta sonu açık",
    phone: "Telefon",
    hours: "Saatler",
    details: "Detaylar",
    // Transactions page translations
    transPageTitle: "Turkcell İşlemleri Yakınımda",
    transPageDesc: "İhtiyacınız olan işlemi yapabilen en yakın Turkcell bayisini bulun.",
    searchFilters: "Arama Filtreleri",
    transactionType: "İşlem Tipi",
    workingHoursFilter: "Çalışma Zamanı",
    dealerType: "Bayi Tipi",
    selectTxType: "Lütfen bir işlem tipi seçiniz.",
    selectWorkingHours: "Lütfen çalışma zamanı seçiniz.",
    selectDealerType: "Lütfen bayi tipi seçiniz.",
    lateClose: "Geç Kapanan",
    tim: "TİM",
    franchise: "Franchise",
    searchDealersBtn: "Bayi Ara",
    // Drawer & Map translations
    storeDetails: "Mağaza Detayları",
    currentLocation: "Mevcut konumunuz",
    goToCurrentLoc: "Mevcut konumuma git",
    simulationMode: "Simülasyon Modu Aktif",
    connectionFailed: "API Bağlantısı Başarısız",
    apiNoConnection: "API Bağlantısı Yok",
    fallbackWarning: "Şu anda simüle edilmiş mock veriler gösterilmektedir.",
    reconnectBtn: "API Bağlantısını Yeniden Dene",
    backToDashboard: "← Kontrol Paneline Dön",
    districtSelectPlaceholder: "İlçe seçin",
    searchRadiusPlaceholder: "Arama yarıçapı seçiniz",
    allCategories: "Tüm Kategoriler",
    allBrands: "Tüm Markalar",
    allProducts: "Tüm Ürünler",
    allTxTypes: "Tüm İşlem Tipleri",
    searchRadiusLabel: "Arama Yarıçapı",
    locationMethodLabel: "Konum Yöntemi",
    currentLocationLabel: "Mevcut Konumum",
    districtSelectLabel: "İlçe Seç",
    unlimitedRadius: "Sınırsız",
    locatingText: "Konumunuz alınıyor...",
    locationErrorTitle: "Konum alınamadı",
    currentLocSuccess: "Mevcut konumunuz kullanılıyor",
    timDealer: "TİM Bayisi",
    franchiseDealer: "Franchise Acente",
    getDirections: "🗺️ Yol Tarifi Al (Google Maps)",
    drawerTitle: "Bayi Detay Bilgileri",
    noDealersFound: "Seçilen kriterlere uygun bayi bulunamadı.",
    noDealersDesc: "Arama yarıçapını genişletmeyi veya filtrelerinizi değiştirmeyi deneyebilirsiniz.",
    dealersSellingThisProduct: "Bu Ürünü Satan Bayiler",
    searchHint: "Bayi aramak için tüm filtreleri ve konum bilgilerini seçin.",
    loadingStores: "Stoktaki mağazalar yükleniyor...",
    mapHint: "Haritayı görmek için tüm filtreleri seçiniz.",
    currentStockStatus: "Mevcut Stok Durumu",
    eligibleDealers: "Uygun Bayiler",
    searchFiltersTitle: "Arama Filtreleri",
    address: "Adres",
    phoneLabel: "Telefon",
    distanceLabel: "Uzaklık",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
