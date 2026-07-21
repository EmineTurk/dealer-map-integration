import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, Tag, Badge, Empty, Spin } from 'antd';
import { StoreCard } from '../components/StoreCard';
import { StoreMap } from '../components/StoreMap';
import { StoreDetailsDrawer } from '../components/StoreDetailsDrawer';
import type { Store, StockLevel, Product } from '../types/api';
import { apiService } from '../api/client';
import './Pages.css';

const getProductBrand = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('iphone') || lower.includes('apple') || lower.includes('airpods')) return 'Apple';
  if (lower.includes('samsung') || lower.includes('galaxy')) return 'Samsung';
  if (lower.includes('xiaomi')) return 'Xiaomi';
  if (lower.includes('anker')) return 'Anker';
  if (lower.includes('superbox') || lower.includes('turkcell')) return 'Turkcell';
  return 'Other';
};

const { Option } = Select;

export const Pasaj: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(1); // default to iPhone 15
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(12);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Geolocation & Fallback
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9784 });
  const [locationError, setLocationError] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Results list from API
  const [storeStocksList, setStoreStocksList] = useState<(Store & { stockLevel: StockLevel; distance: number; quantity?: number })[]>([]);
  const [isStoreLoading, setIsStoreLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Load products list from API on mount
  useEffect(() => {
    apiService.getProducts().then(data => {
      setProducts(data);
    });
  }, []);

  // Try to retrieve user's location via Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserCoords(coords);
          setMapCenter(coords);
          setLocationError(false);
        },
        (error) => {
          console.warn('Geolocation blocked or failed:', error);
          setLocationError(true);
        }
      );
    } else {
      setLocationError(true);
    }
  }, []);

  const districtCoords: Record<string, { lat: number; lng: number }> = {
    Kadikoy: { lat: 40.9901, lng: 29.0253 },
    Besiktas: { lat: 41.0428, lng: 29.0075 },
    Sisli: { lat: 41.0602, lng: 28.9877 },
    Uskudar: { lat: 41.0267, lng: 29.0152 },
    Fatih: { lat: 41.0186, lng: 28.9497 },
    Beyoglu: { lat: 41.0370, lng: 28.9764 }
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    const coords = districtCoords[value];
    if (coords) {
      setUserCoords(coords);
      setMapCenter(coords);
      setZoomLevel(13);
    }
  };

  // Derive list of categories and brands dynamically based on loaded products
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ['ALL', ...Array.from(new Set(products.map(p => getProductBrand(p.name))))];

  // Filtered products list based on selected category and brand
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'ALL' || getProductBrand(p.name) === selectedBrand;
    return matchesCategory && matchesBrand;
  });

  // Auto-select first matching product if the current selection is filtered out
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const isStillAvailable = filteredProducts.some(p => p.id === selectedProductId);
      if (!isStillAvailable) {
        setSelectedProductId(filteredProducts[0].id);
      }
    } else {
      setSelectedProductId(undefined);
    }
  }, [selectedCategory, selectedBrand, filteredProducts, selectedProductId]);

  // Load store stocks from API
  useEffect(() => {
    if (!selectedProductId) {
      setStoreStocksList([]);
      return;
    }
    
    setIsStoreLoading(true);
    apiService.getProductStores(selectedProductId, userCoords.lat, userCoords.lng, 10)
      .then(data => {
        const mapped = data.map(item => ({
          ...item,
          quantity: item.quantity ?? 0
        }));
        setStoreStocksList(mapped);
      })
      .finally(() => {
        setIsStoreLoading(false);
      });
  }, [selectedProductId, userCoords]);

  const selectedStore = storeStocksList.find(s => s.id === selectedStoreId);

  // Reset selection and adjust center when product changes
  useEffect(() => {
    setSelectedStoreId(undefined);
    setZoomLevel(12);
    if (storeStocksList.length > 0) {
      setMapCenter({ lat: storeStocksList[0].latitude, lng: storeStocksList[0].longitude });
    }
  }, [selectedProductId, storeStocksList.length]);

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
      case 'IN_STOCK': return 'Stokta Var (>5)';
      case 'LOW': return 'Düşük Stok';
      case 'OUT_OF_STOCK': return 'Stokta Yok';
      default: return 'Bilinmiyor';
    }
  };

  const pasajExtraDetail = selectedStore && (
    <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
      <div className="drawer-detail-label">Mevcut Stok Durumu</div>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}
      >
        <div 
          style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: selectedStore.stockLevel === 'IN_STOCK' ? 'var(--color-success)' : 'var(--color-warning)'
          }}
        >
          {selectedStore.quantity} Adet
        </div>
        <Tag color={selectedStore.stockLevel === 'IN_STOCK' ? 'success' : 'warning'}>
          {selectedStore.stockLevel === 'IN_STOCK' ? 'Stokta Var' : 'Düşük Stok'}
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
          {locationError && (
            <div className="location-fallback-panel" style={{ padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 199, 44, 0.3)', borderRadius: '8px', background: 'rgba(255, 199, 44, 0.03)' }}>
              <div style={{ color: 'var(--turkcell-yellow)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ⚠️ Konum izni devre dışı. Lütfen bölge seçin:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <label className="filter-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>İl</label>
                  <Select defaultValue="Istanbul" style={{ width: '100%' }} disabled>
                    <Option value="Istanbul">İstanbul</Option>
                  </Select>
                </div>
                <div>
                  <label className="filter-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>İlçe</label>
                  <Select 
                    placeholder="İlçe Seçin" 
                    style={{ width: '100%' }}
                    onChange={handleDistrictChange}
                    value={selectedDistrict || undefined}
                  >
                    <Option value="Kadikoy">Kadıköy</Option>
                    <Option value="Besiktas">Beşiktaş</Option>
                    <Option value="Sisli">Şişli</Option>
                    <Option value="Uskudar">Üsküdar</Option>
                    <Option value="Fatih">Fatih</Option>
                    <Option value="Beyoglu">Beyoğlu</Option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <h3 className="sidebar-title">Ürün Kataloğu</h3>
          
          <div className="filter-group">
            <label className="filter-label">Kategori</label>
            <Select 
              value={selectedCategory} 
              style={{ width: '100%' }} 
              onChange={(val) => {
                setSelectedCategory(val);
                setSelectedBrand('ALL');
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
              onChange={(val) => setSelectedBrand(val)}
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
              onChange={(val) => setSelectedProductId(val)}
              disabled={filteredProducts.length === 0}
            >
              {filteredProducts.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <span className="filter-label">
              Bulunan Mağazalar ({storeStocksList.length})
            </span>
          </div>

          <div className="card-list">
            {isStoreLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                <Spin tip="Stoktaki mağazalar yükleniyor..." size="large" />
              </div>
            ) : storeStocksList.length > 0 ? (
              storeStocksList.map(item => (
                <StoreCard
                  key={item.id}
                  store={item}
                  isSelected={item.id === selectedStoreId}
                  onClick={() => handleStoreSelect(item)}
                  extra={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={getStockTagColor(item.stockLevel)}>
                        {getStockLabel(item.stockLevel)}
                      </Tag>
                      {item.type === 'TIM' ? (
                        <Badge status="processing" text="TIM" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} />
                      ) : (
                        <Badge status="default" text="Franchise" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                      )}
                    </div>
                  }
                />
              ))
            ) : (
              <Empty description="Stokta bu ürünü bulunduran mağaza bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel" style={{ padding: '0.5rem', overflow: 'hidden', zIndex: 1 }}>
          <StoreMap
            center={mapCenter}
            zoom={zoomLevel}
            stores={storeStocksList}
            selectedStoreId={selectedStoreId}
            onStoreSelect={handleStoreSelect}
          />
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
