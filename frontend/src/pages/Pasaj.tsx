import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, Card, Tag, Badge, Empty, Drawer } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockProducts, mockStores, mockStocks } from '../mocks/mockData';
import type { StockLevel } from '../types/api';
import './Pages.css';

// Custom Leaflet pin styled in brand color rgb(51, 84, 166)
const pasajMapIcon = L.divIcon({
  html: `<div style="
    background-color: rgb(51, 84, 166);
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  "></div>`,
  className: 'custom-pasaj-pin',
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

// Helper component to recenter the Leaflet map dynamically
const RecenterMap: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

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
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(1); // default to iPhone 15
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(12);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Derive list of categories and brands dynamically
  const categories = ['ALL', ...Array.from(new Set(mockProducts.map(p => p.category)))];
  const brands = ['ALL', ...Array.from(new Set(mockProducts.map(p => getProductBrand(p.name))))];

  // Filtered products list based on selected category and brand
  const filteredProducts = mockProducts.filter(p => {
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

  // Filter stores that have stock entries for this product
  const storeStocksList = mockStores.map(store => {
    const quantity = selectedProductId ? (mockStocks[`${selectedProductId}-${store.id}`] ?? 0) : 0;
    
    let stockLevel: StockLevel = 'OUT_OF_STOCK';
    if (quantity > 5) {
      stockLevel = 'IN_STOCK';
    } else if (quantity > 0) {
      stockLevel = 'LOW';
    }

    // Mock distance for display purposes (Haversine simulated)
    const simulatedDistance = parseFloat((Math.random() * 8 + 1.2).toFixed(1));

    return {
      ...store,
      quantity,
      stockLevel,
      distance: simulatedDistance
    };
  })
  .filter(item => item.stockLevel !== 'OUT_OF_STOCK') // only show available/low stock stores
  .sort((a, b) => a.distance - b.distance); // sort by distance

  const selectedStore = storeStocksList.find(s => s.id === selectedStoreId);

  // Reset selection and adjust center when product changes
  useEffect(() => {
    setSelectedStoreId(undefined);
    setZoomLevel(12);
    if (storeStocksList.length > 0) {
      setMapCenter({ lat: storeStocksList[0].latitude, lng: storeStocksList[0].longitude });
    } else {
      setMapCenter({ lat: 41.0082, lng: 28.9784 });
    }
  }, [selectedProductId]);

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
            {storeStocksList.length > 0 ? (
              storeStocksList.map(item => (
                <Card 
                  key={item.id} 
                  className="list-card glass-panel" 
                  bodyStyle={{ padding: '0.75rem 1rem' }}
                  style={{ 
                    border: item.id === selectedStoreId ? '1px solid var(--turkcell-yellow)' : '1px solid transparent', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => {
                    setSelectedStoreId(item.id);
                    setMapCenter({ lat: item.latitude, lng: item.longitude });
                    setZoomLevel(17);
                  }}
                >
                  <div className="list-card-title">{item.name}</div>
                  <div className="list-card-subtitle" style={{ marginBottom: '0.5rem' }}>
                    {item.district}, {item.city} &bull; <strong>{item.distance} km uzakta</strong>
                  </div>
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
                </Card>
              ))
            ) : (
              <Empty description="Stokta bu ürünü bulunduran mağaza bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel" style={{ padding: '0.5rem', overflow: 'hidden', zIndex: 1 }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={mapCenter} zoom={zoomLevel} />
            {storeStocksList.map(item => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={pasajMapIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedStoreId(item.id);
                    setMapCenter({ lat: item.latitude, lng: item.longitude });
                    setZoomLevel(17);
                  }
                }}
              />
            ))}
            {selectedStoreId && (() => {
              const selectedStore = storeStocksList.find(s => s.id === selectedStoreId);
              if (!selectedStore) return null;
              return (
                <Popup
                  position={[selectedStore.latitude, selectedStore.longitude]}
                  eventHandlers={{
                    remove: () => setSelectedStoreId(undefined)
                  }}
                >
                  <div style={{ color: '#060913', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{selectedStore.name}</strong>
                    {selectedStore.address}
                  </div>
                </Popup>
              );
            })()}
          </MapContainer>
        </main>
      </div>
      <Drawer
        title="Bayi Detay Bilgileri"
        placement="right"
        onClose={() => setSelectedStoreId(undefined)}
        open={selectedStoreId !== undefined}
        width={380}
      >
        {selectedStore && (
          <div style={{ padding: '0.5rem 0' }}>
            <div className="drawer-detail-section" style={{ marginBottom: '2rem' }}>
              <div 
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  color: 'var(--turkcell-blue)',
                  marginBottom: '0.5rem'
                }}
              >
                {selectedStore.name}
              </div>
              <Tag color={selectedStore.type === 'TIM' ? 'blue' : 'cyan'}>
                {selectedStore.type === 'TIM' ? 'TİM Bayisi' : 'Franchise Acente'}
              </Tag>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Adres</div>
              <div className="drawer-detail-value">{selectedStore.address}</div>
              <div className="drawer-detail-value" style={{ marginTop: '0.25rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                {selectedStore.district}, {selectedStore.city}
              </div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Telefon</div>
              <div className="drawer-detail-value">{selectedStore.phone || 'N/A'}</div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Çalışma Saatleri</div>
              <div className="drawer-detail-value">⏱️ {selectedStore.workingHours || '09:00 - 20:00'}</div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Uzaklık</div>
              <div className="drawer-detail-value">📍 {selectedStore.distance} km uzakta</div>
            </div>

            <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '1.5rem' }}>
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
          </div>
        )}
      </Drawer>
    </div>
  );
};
