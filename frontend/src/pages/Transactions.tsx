import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, Tag, Empty } from 'antd';
import { mockStores, mockStoreCapabilities } from '../mocks/mockData';
import { StoreCard } from '../components/StoreCard';
import { StoreMap } from '../components/StoreMap';
import { StoreDetailsDrawer } from '../components/StoreDetailsDrawer';
import type { Store, CapabilityType } from '../types/api';
import './Pages.css';

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

  // Simulated latency for Drawer details
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

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

  const selectedStore = eligibleStores.find(s => s.id === selectedStoreId);

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

  // Simulate loading state whenever a store details panel opens
  useEffect(() => {
    if (selectedStoreId) {
      setIsDrawerLoading(true);
      const timer = setTimeout(() => {
        setIsDrawerLoading(false);
      }, 600); // 600ms latency simulation
      return () => clearTimeout(timer);
    }
  }, [selectedStoreId]);

  const handleStoreSelect = (store: Store & { distance: number }) => {
    setSelectedStoreId(store.id);
    setMapCenter({ lat: store.latitude, lng: store.longitude });
    setZoomLevel(17);
  };

  const transactionsExtraDetail = selectedStore && (
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
  );

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
                <StoreCard
                  key={item.id}
                  store={item}
                  isSelected={item.id === selectedStoreId}
                  onClick={() => handleStoreSelect(item)}
                  extra={
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
                  }
                />
              ))
            ) : (
              <Empty description="Bu işlemi destekleyen bayi bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel" style={{ padding: '0.5rem', overflow: 'hidden', zIndex: 1 }}>
          <StoreMap
            center={mapCenter}
            zoom={zoomLevel}
            stores={eligibleStores}
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
        extra={transactionsExtraDetail}
      />
    </div>
  );
};
