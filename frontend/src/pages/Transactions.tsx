import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, Card, Tag, Empty, Drawer } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockStores, mockStoreCapabilities } from '../mocks/mockData';
import type { CapabilityType } from '../types/api';
import './Pages.css';

// Custom Leaflet pin styled in brand color rgb(51, 84, 166)
const transactionsMapIcon = L.divIcon({
  html: `<div style="
    background-color: rgb(51, 84, 166);
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  "></div>`,
  className: 'custom-transactions-pin',
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

const { Option } = Select;

const capabilitiesList: { type: CapabilityType; label: string }[] = [
  { type: 'NEW_LINE', label: 'Yeni Hat Aktivasyonu' },
  { type: 'DEVICE_DELIVERY', label: 'Cihaz Teslimatı' },
  { type: 'DEVICE_REPAIR', label: 'Cihaz Tamir & Bakım Yetkisi' },
  { type: 'NUMBER_PORT', label: 'Numara Taşıma' },
  { type: 'BILL_PAYMENT', label: 'Fatura Ödeme' }
];

export const Transactions: React.FC = () => {
  const [selectedCapability, setSelectedCapability] = useState<CapabilityType>('NEW_LINE');
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(12);

  // Filter stores that support the selected capability
  const eligibleStores = mockStores.map(store => {
    const caps = mockStoreCapabilities[store.id] ?? [];
    const isEligible = caps.includes(selectedCapability);

    // Mock distance for display purposes (Haversine simulated)
    const simulatedDistance = parseFloat((Math.random() * 8 + 1.2).toFixed(1));

    return {
      ...store,
      isEligible,
      distance: simulatedDistance,
      capabilities: caps
    };
  })
  .filter(item => item.isEligible)
  .sort((a, b) => a.distance - b.distance); // sort by distance

  // Reset selection and adjust center when capability changes
  useEffect(() => {
    setSelectedStoreId(undefined);
    setZoomLevel(12);
    if (eligibleStores.length > 0) {
      setMapCenter({ lat: eligibleStores[0].latitude, lng: eligibleStores[0].longitude });
    } else {
      setMapCenter({ lat: 41.0082, lng: 28.9784 });
    }
  }, [selectedCapability]);

  return (
    <div className="page-container animate-fade-in">
      <Link to="/" className="back-btn">
        &larr; Kontrol Paneline Dön
      </Link>

      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          turkcell.com.tr - Yakınımdaki İşlemler
        </h1>
        <p className="hero-subtitle">
          Belirli hesap veya hat işleminizi destekleyen en yakın Turkcell bayisini bulun.
        </p>
      </section>

      <div className="locator-layout">
        {/* Sidebar Controls */}
        <aside className="locator-sidebar glass-panel">
          <h3 className="sidebar-title">İşlem Seçin</h3>
          
          <div className="filter-group">
            <label className="filter-label">Hangi işlemi gerçekleştirmek istiyorsunuz?</label>
            <Select 
              value={selectedCapability} 
              style={{ width: '100%' }} 
              onChange={(val) => setSelectedCapability(val as CapabilityType)}
            >
              {capabilitiesList.map(cap => (
                <Option key={cap.type} value={cap.type}>
                  {cap.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <span className="filter-label">
              Uygun Bayiler ({eligibleStores.length})
            </span>
          </div>

          <div className="card-list">
            {eligibleStores.length > 0 ? (
              eligibleStores.map(item => (
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
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {item.type === 'TIM' ? (
                        <Tag color="blue">TIM</Tag>
                      ) : (
                        <Tag color="cyan">Franchise</Tag>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.capabilities.length} işlem destekliyor
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <Empty description="Bu işlemi destekleyen bayi bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
            {eligibleStores.map(item => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={transactionsMapIcon}
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
              const selectedStore = eligibleStores.find(s => s.id === selectedStoreId);
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
        {(() => {
          const selectedStore = eligibleStores.find(s => s.id === selectedStoreId);
          if (!selectedStore) return null;
          return (
            <div style={{ padding: '0.5rem 0' }}>
              <div className="drawer-detail-section" style={{ marginBottom: '2rem' }}>
                <div 
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: 'var(--turkcell-yellow)',
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
                <div className="drawer-detail-value" style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
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

              <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <div className="drawer-detail-label">Desteklenen İşlemler</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {selectedStore.capabilities.map(capCode => {
                    const capLabel = capabilitiesList.find(c => c.type === capCode)?.label ?? capCode;
                    const isCurrentSearch = capCode === selectedCapability;
                    return (
                      <div 
                        key={capCode}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: isCurrentSearch ? 'rgba(51, 84, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: isCurrentSearch ? '1px solid rgb(51, 84, 166)' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: isCurrentSearch ? '#ffffff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{capLabel}</span>
                        {isCurrentSearch && <Tag color="success" style={{ margin: 0, fontSize: '0.7rem' }}>Aranan İşlem</Tag>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};
