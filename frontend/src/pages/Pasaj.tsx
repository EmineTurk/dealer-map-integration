import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Select, Tag, Badge, Empty, Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { StoreCard } from '../components/StoreCard';
import { StoreMap } from '../components/StoreMap';
import { StoreDetailsDrawer } from '../components/StoreDetailsDrawer';
import {
  LocationSearchFilters,
  UNLIMITED_RADIUS_KM,
  type LocationMode,
  type SearchRadius
} from '../components/LocationSearchFilters';
import type { Store, StockLevel, Product } from '../types/api';
import { apiService, apiStatus } from '../api/client';
import { ISTANBUL_DISTRICT_COORDS } from '../data/istanbulDistricts';
import './Pages.css';

const PRODUCT_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Turkcell', 'Anker', 'JBL', 'Huawei', 'TP-Link'] as const;

const getProductBrand = (product: Product): string => {
  const skuPrefix = product.sku.split('-')[0].toUpperCase();
  const brandBySkuPrefix: Record<string, string> = {
    APL: 'Apple',
    SAM: 'Samsung',
    XIA: 'Xiaomi',
    TKC: 'Turkcell',
    ANK: 'Anker',
    JBL: 'JBL',
    HUA: 'Huawei',
    TPL: 'TP-Link'
  };

  return brandBySkuPrefix[skuPrefix] ?? 'Diğer';
};

const { Option } = Select;

export const Pasaj: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | 'ALL' | undefined>(undefined);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [hoveredStoreId, setHoveredStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(10);

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);

  const [locationMode, setLocationMode] = useState<LocationMode | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined);
  const [searchRadius, setSearchRadius] = useState<SearchRadius | undefined>(undefined);
  const locationRequestId = useRef(0);

  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Load products list from API using TanStack Query
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: apiService.getProducts,
  });

  const handleLocationModeChange = (mode: LocationMode) => {
    const requestId = ++locationRequestId.current;
    setLocationMode(mode);
    setUserCoords(undefined);
    setSelectedDistrict(undefined);
    setSearchRadius(undefined);
    setLocationError(undefined);
    setIsLocating(false);
    setSelectedStoreId(undefined);
    setMapCenter({ lat: 41.0082, lng: 28.9784 });
    setZoomLevel(10);

    if (mode !== 'current') return;

    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum bilgisini desteklemiyor. İlçe seçeneğini kullanabilirsiniz.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (locationRequestId.current !== requestId) return;
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        setMapCenter(coords);
        setZoomLevel(13);
        setLocationError(undefined);
        setIsLocating(false);
      },
      (error) => {
        if (locationRequestId.current !== requestId) return;
        console.warn('Geolocation blocked or failed:', error);
        setLocationError('Konum izni verilmedi veya konum alınamadı. İlçe seçeneğini kullanabilirsiniz.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleDistrictChange = (value?: string) => {
    setSelectedDistrict(value);
    setSelectedStoreId(undefined);
    const coords = value ? ISTANBUL_DISTRICT_COORDS[value] : undefined;
    if (coords) {
      setUserCoords(coords);
      setMapCenter(coords);
      setZoomLevel(13);
    } else {
      setUserCoords(undefined);
      setMapCenter({ lat: 41.0082, lng: 28.9784 });
      setZoomLevel(10);
    }
  };

  // Derive list of categories and brands dynamically based on loaded products
  const categories = ['ALL', ...Array.from(new Set(Array.isArray(products) ? products.map(p => p.category) : []))];
  const availableBrands = new Set(Array.isArray(products) ? products.map(getProductBrand) : []);
  const brands = [
    'ALL',
    ...PRODUCT_BRANDS.filter(brand => availableBrands.has(brand)),
    ...Array.from(availableBrands).filter(brand => !PRODUCT_BRANDS.includes(brand as typeof PRODUCT_BRANDS[number]))
  ];

  // Filtered products list based on selected category and brand
  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    const matchesCategory = !selectedCategory || selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesBrand = !selectedBrand || selectedBrand === 'ALL' || getProductBrand(p) === selectedBrand;
    return matchesCategory && matchesBrand;
  }) : [];

  const isLocationReady = Boolean(
    userCoords
    && (
      (locationMode === 'current' && searchRadius)
      || (locationMode === 'district' && selectedDistrict)
    )
  );
  const isSearchReady = Boolean(
    selectedCategory
    && selectedBrand
    && selectedProductId !== undefined
    && isLocationReady
  );

  // Load store stocks from API using TanStack Query
  const { data: storeStocksList = [], isLoading: isStoreLoading } = useQuery<(Store & { stockLevel: StockLevel; distance: number; quantity?: number })[]>({
    queryKey: ['productStores', selectedProductId, userCoords?.lat, userCoords?.lng, locationMode, selectedDistrict, searchRadius],
    queryFn: async () => {
      if (selectedProductId === undefined || !userCoords) return [];

      const radius = locationMode === 'district' || searchRadius === 'UNLIMITED'
        ? UNLIMITED_RADIUS_KM
        : searchRadius;
      if (!radius) return [];

      const productIds = selectedProductId === 'ALL'
        ? filteredProducts.map(product => product.id)
        : [selectedProductId];
      const storeResults = await Promise.all(
        productIds.map(productId =>
          apiService.getProductStores(productId, userCoords.lat, userCoords.lng, radius)
        )
      );
      const stockPriority: Record<StockLevel, number> = {
        OUT_OF_STOCK: 0,
        LOW: 1,
        IN_STOCK: 2
      };
      const storesById = new Map<number, Store & { stockLevel: StockLevel; distance: number; quantity?: number }>();

      storeResults.flat().forEach(item => {
        if (locationMode === 'district' && selectedDistrict && item.district !== selectedDistrict) return;
        const existing = storesById.get(item.id);
        if (!existing || stockPriority[item.stockLevel] > stockPriority[existing.stockLevel]) {
          storesById.set(item.id, item);
        }
      });

      return Array.from(storesById.values()).sort((a, b) => a.distance - b.distance);
    },
    enabled: isSearchReady,
  });

  const selectedStore = storeStocksList.find(s => s.id === selectedStoreId);

  // Reset selection and adjust center when product changes
  useEffect(() => {
    setSelectedStoreId(undefined);
    if (selectedDistrict) {
      setZoomLevel(13);
    } else {
      setMapCenter({ lat: 41.0082, lng: 28.9784 });
      setZoomLevel(10);
    }
  }, [selectedProductId, selectedDistrict, storeStocksList.length]);

  // Simulate loading state whenever a store details panel opens
  useEffect(() => {
    if (selectedStoreId) {
      setIsDrawerLoading(true);
      const timer = setTimeout(() => {
        setIsDrawerLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [selectedStoreId]);

  const handleStoreSelect = (store: Store & { distance: number }) => {
    setSelectedStoreId(store.id);
    setMapCenter({ lat: store.latitude, lng: store.longitude });
    setZoomLevel(17);
  };

  const getStockTagColor = (level: StockLevel) => {
    switch (level) {
      case 'IN_STOCK': return 'success';
      case 'LOW': return 'warning';
      case 'OUT_OF_STOCK': return 'error';
      default: return 'default';
    }
  };

  const getStockLabel = (level: StockLevel) => {
    switch (level) {
      case 'IN_STOCK': return 'Stokta';
      case 'LOW': return 'Düşük Stok';
      case 'OUT_OF_STOCK': return 'Stokta Yok';
      default: return 'Bilinmiyor';
    }
  };

  const pasajExtraDetail = selectedStore && (
    <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '1.5rem' }}>
      <div className="drawer-detail-label">Mevcut Stok Durumu</div>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '0.5rem'
        }}
      >
        <Tag color={getStockTagColor(selectedStore.stockLevel)} style={{ fontSize: '0.95rem', padding: '0.25rem 0.75rem' }}>
          {getStockLabel(selectedStore.stockLevel)}
        </Tag>
      </div>
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      <Link to="/" className="back-btn">
        &larr; Kontrol Paneline Dön
      </Link>

      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          Pasaj - Yakınımdaki Cihaz Stokları
        </h1>
        <p className="hero-subtitle">
          Hangi Turkcell fiziksel mağazasında aradığınız ürünün stokta olduğunu bulun.
        </p>
      </section>

      <div className="locator-layout">
        {/* Sidebar Controls */}
        <aside className="locator-sidebar glass-panel">
          {apiStatus.isUsingFallback && (
            <Alert
              message="Simülasyon Modu Aktif"
              description="Gerçek API bağlantısı başarısız oldu (CORS veya Ağ Hatası). Sistem otomatik olarak Mock verilerine geçti."
              type="warning"
              showIcon
              style={{ marginBottom: '1.25rem', borderRadius: '8px' }}
            />
          )}

          <LocationSearchFilters
            locationMode={locationMode}
            selectedDistrict={selectedDistrict}
            searchRadius={searchRadius}
            isLocating={isLocating}
            locationError={locationError}
            hasCurrentLocation={locationMode === 'current' && Boolean(userCoords)}
            onLocationModeChange={handleLocationModeChange}
            onDistrictChange={handleDistrictChange}
            onRadiusChange={setSearchRadius}
          />

          <h3 className="sidebar-title">Ürün Kataloğu</h3>
          
          <div className="filter-group">
            <label className="filter-label">Kategori</label>
            <Select 
              value={selectedCategory} 
              style={{ width: '100%' }} 
              placeholder="Kategori seçiniz"
              allowClear
              onChange={(val) => {
                setSelectedCategory(val);
                setSelectedProductId(undefined);
              }}
            >
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat === 'ALL' ? 'Tümü' : cat}</Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '0.75rem' }}>
            <label className="filter-label">Marka</label>
            <Select 
              value={selectedBrand} 
              style={{ width: '100%' }} 
              placeholder="Marka seçiniz"
              allowClear
              onChange={(val) => {
                setSelectedBrand(val);
                setSelectedProductId(undefined);
              }}
            >
              {brands.map(brand => (
                <Option key={brand} value={brand}>{brand === 'ALL' ? 'Tümü' : brand}</Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '0.75rem' }}>
            <label className="filter-label">Ürün</label>
            <Select 
              value={selectedProductId} 
              style={{ width: '100%' }} 
              placeholder="Ürün seçiniz"
              allowClear
              onChange={(val) => setSelectedProductId(val)}
              disabled={filteredProducts.length === 0}
            >
              <Option value="ALL">Tümü</Option>
              {filteredProducts.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <span className="filter-label">
              Bu Ürünü Satan Bayiler ({storeStocksList.length})
            </span>
          </div>

          <div className="card-list">
            {!isSearchReady ? (
              <Empty
                description="Bayi aramak için tüm filtreleri ve konum bilgilerini seçin."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : isStoreLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                <Spin tip="Stoktaki mağazalar yükleniyor..." size="large" />
              </div>
            ) : storeStocksList.length > 0 ? (
              storeStocksList.map(item => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredStoreId(item.id)}
                  onMouseLeave={() => setHoveredStoreId(undefined)}
                >
                  <StoreCard
                    store={item}
                    isSelected={item.id === selectedStoreId}
                    onClick={() => handleStoreSelect(item)}
                    extra={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={getStockTagColor(item.stockLevel)}>
                          {getStockLabel(item.stockLevel)}
                        </Tag>
                        {item.type === 'TIM' ? (
                          <Badge status="processing" text="TIM" style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem' }} />
                        ) : (
                          <Badge status="default" text="Franchise" style={{ color: 'rgba(0,0,0,0.25)', fontSize: '0.8rem' }} />
                        )}
                      </div>
                    }
                  />
                </div>
              ))
            ) : (
              <Empty 
                description={
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Stokta Ürün Bulunamadı</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Seçtiğiniz ürün yakınlardaki hiçbir bayide mevcut değil. Lütfen başka bir aramayı deneyin.
                    </div>
                  </div>
                } 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel" style={{ padding: '0.5rem', overflow: 'hidden', zIndex: 1 }}>
          {isSearchReady ? (
            <StoreMap
              center={mapCenter}
              zoom={zoomLevel}
              currentLocation={locationMode === 'current' ? userCoords : undefined}
              stores={storeStocksList}
              selectedStoreId={selectedStoreId}
              hoveredStoreId={hoveredStoreId}
              onStoreSelect={handleStoreSelect}
            />
          ) : (
            <Empty
              description="Haritayı görmek için tüm filtreleri seçiniz."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ paddingTop: '8rem' }}
            />
          )}
        </main>
      </div>

      <StoreDetailsDrawer
        open={selectedStoreId !== undefined}
        onClose={() => setSelectedStoreId(undefined)}
        store={selectedStore}
        isLoading={isDrawerLoading}
        extra={pasajExtraDetail}
      />
    </div>
  );
};
