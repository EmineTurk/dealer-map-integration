import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, Tag, Empty, Button } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { StoreCard } from '../components/StoreCard';
import { StoreMap } from '../components/StoreMap';
import { StoreDetailsDrawer } from '../components/StoreDetailsDrawer';
import type { Store, CapabilityType, CapabilityTypeOption, StoreCapabilityResult } from '../types/api';
import { apiService } from '../api/client';
import './Pages.css';

const { Option } = Select;

type FormValues = {
  capabilityType: CapabilityType | '';
  workingHours: 'ALL' | 'WEEKEND' | 'LATE_CLOSE';
  storeType: 'ALL' | 'TIM' | 'FRANCHISE';
};

const schema = yup.object().shape({
  capabilityType: yup.string().required('Lütfen bir işlem tipi seçiniz.'),
  workingHours: yup.string().oneOf(['ALL', 'WEEKEND', 'LATE_CLOSE']).default('ALL'),
  storeType: yup.string().oneOf(['ALL', 'TIM', 'FRANCHISE']).default('ALL')
});

export const Transactions: React.FC = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(12);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Geolocation & Fallback States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9784 });
  const [locationError, setLocationError] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Dropdown options & Results States from API
  const [capabilitiesList, setCapabilitiesList] = useState<CapabilityTypeOption[]>([]);
  const [eligibleStores, setEligibleStores] = useState<StoreCapabilityResult[]>([]);

  const [appliedFilters, setAppliedFilters] = useState<FormValues>({
    capabilityType: 'NEW_LINE',
    workingHours: 'ALL',
    storeType: 'ALL'
  });

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      capabilityType: 'NEW_LINE',
      workingHours: 'ALL',
      storeType: 'ALL'
    }
  });

  // Try to retrieve user's location via Geolocation API on mount
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

  // Load capability options from API on mount
  useEffect(() => {
    apiService.getCapabilityTypes().then(data => {
      setCapabilitiesList(data);
    });
  }, []);

  // Fetch eligible stores from API based on applied filters and coordinates
  useEffect(() => {
    if (!appliedFilters.capabilityType) {
      setEligibleStores([]);
      return;
    }

    apiService.getCapabilityStores(
      appliedFilters.capabilityType as CapabilityType,
      userCoords.lat,
      userCoords.lng,
      10, // 10km radius
      {
        workingHours: appliedFilters.workingHours,
        storeType: appliedFilters.storeType
      }
    ).then(data => {
      setEligibleStores(data);
    });
  }, [appliedFilters, userCoords]);

  const selectedStore = eligibleStores.find(s => s.id === selectedStoreId);

  // Reset selection and adjust center when filters change
  useEffect(() => {
    setSelectedStoreId(undefined);
    setZoomLevel(12);
    if (eligibleStores.length > 0) {
      setMapCenter({ lat: eligibleStores[0].latitude, lng: eligibleStores[0].longitude });
    }
  }, [appliedFilters, eligibleStores.length]);

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

  const onFilterSubmit = (values: FormValues) => {
    setAppliedFilters(values);
  };

  const transactionsExtraDetail = selectedStore && (
    <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.5rem' }}>
      <div className="drawer-detail-label">Desteklenen İşlemler</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
        {((selectedStore as any).capabilities || [appliedFilters.capabilityType]).map((capCode: CapabilityType) => {
          const capLabel = capabilitiesList.find(c => c.key === capCode)?.label ?? capCode;
          const isCurrentSearch = capCode === appliedFilters.capabilityType;
          return (
            <div 
              key={capCode}
              style={{
                padding: '0.5rem 0.75rem',
                background: isCurrentSearch ? 'rgba(51, 84, 166, 0.08)' : 'rgba(0,0,0,0.02)',
                border: isCurrentSearch ? '1px solid rgb(51, 84, 166)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: isCurrentSearch ? 'rgb(51, 84, 166)' : 'rgba(0, 0, 0, 0.65)',
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

          <h3 className="sidebar-title">Filtrele</h3>

          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <div className="filter-group">
              <label className="filter-label">Hangi işlemi gerçekleştirmek istiyorsunuz?</label>
              <Controller
                name="capabilityType"
                control={control}
                render={({ field }) => (
                  <Select 
                    {...field}
                    placeholder="-- İşlem Seçiniz --"
                    style={{ width: '100%' }}
                    status={errors.capabilityType ? 'error' : ''}
                  >
                    <Option value="">-- İşlem Seçiniz --</Option>
                    {capabilitiesList.map(cap => (
                      <Option key={cap.key} value={cap.key}>
                        {cap.label}
                      </Option>
                    ))}
                  </Select>
                )}
              />
              {errors.capabilityType && (
                <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.capabilityType.message}
                </div>
              )}
            </div>

            <div className="filter-group" style={{ marginTop: '0.75rem' }}>
              <label className="filter-label">Çalışma Günleri & Saatleri</label>
              <Controller
                name="workingHours"
                control={control}
                render={({ field }) => (
                  <Select {...field} style={{ width: '100%' }}>
                    <Option value="ALL">Tümü</Option>
                    <Option value="WEEKEND">Hafta Sonu Açık (TİM / Bazı Franchise)</Option>
                    <Option value="LATE_CLOSE">Geç Kapanan (21:00+)</Option>
                  </Select>
                )}
              />
            </div>

            <div className="filter-group" style={{ marginTop: '0.75rem' }}>
              <label className="filter-label">Bayi Tipi</label>
              <Controller
                name="storeType"
                control={control}
                render={({ field }) => (
                  <Select {...field} style={{ width: '100%' }}>
                    <Option value="ALL">Tümü</Option>
                    <Option value="TIM">TİM (Turkcell İletişim Merkezi)</Option>
                    <Option value="FRANCHISE">Franchise (Acente)</Option>
                  </Select>
                )}
              />
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%', marginTop: '1.25rem', backgroundColor: 'var(--turkcell-blue)', borderColor: 'var(--turkcell-blue)' }}
            >
              Bayi Ara
            </Button>
          </form>

          <div className="filter-group" style={{ marginTop: '1.5rem' }}>
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
                      <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.45)' }}>
                        📍 {item.distance} km uzakta
                      </span>
                    </div>
                  }
                />
              ))
            ) : (
              <Empty description="Seçilen kriterlere uygun bayi bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
