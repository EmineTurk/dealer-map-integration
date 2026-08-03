import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Select, Tag, Empty, Button, Spin, Alert } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import type { Store, CapabilityType, CapabilityTypeOption, StoreCapabilityResult } from '../types/api';
import { apiService, apiStatus } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { ISTANBUL_DISTRICT_COORDS } from '../data/istanbulDistricts';
import './Pages.css';

const { Option } = Select;

type FormValues = {
  capabilityType: CapabilityType | 'ALL' | '';
  workingHours: 'ALL' | 'WEEKEND' | 'LATE_CLOSE' | '';
  storeType: 'ALL' | 'TIM' | 'FRANCHISE' | '';
};

export const Transactions: React.FC = () => {
  const { t } = useLanguage();
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [hoveredStoreId, setHoveredStoreId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [zoomLevel, setZoomLevel] = useState(10);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  const [locationMode, setLocationMode] = useState<LocationMode | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined);
  const [searchRadius, setSearchRadius] = useState<SearchRadius | undefined>(undefined);
  const [locationSelectionError, setLocationSelectionError] = useState<string | undefined>(undefined);
  const locationRequestId = useRef(0);

  const [appliedFilters, setAppliedFilters] = useState<FormValues | null>(null);

  const schema = yup.object().shape({
    capabilityType: yup.string()
      .oneOf(['ALL', 'NEW_LINE', 'DEVICE_DELIVERY', 'DEVICE_REPAIR', 'NUMBER_PORT', 'BILL_PAYMENT'])
      .required(t('selectTxType')),
    workingHours: yup.string()
      .oneOf(['ALL', 'WEEKEND', 'LATE_CLOSE'], t('selectWorkingHours'))
      .required(t('selectWorkingHours')),
    storeType: yup.string()
      .oneOf(['ALL', 'TIM', 'FRANCHISE'], t('selectDealerType'))
      .required(t('selectDealerType'))
  });

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      capabilityType: '',
      workingHours: '',
      storeType: ''
    }
  });

  const handleLocationModeChange = (mode: LocationMode) => {
    const requestId = ++locationRequestId.current;
    setLocationMode(mode);
    setUserCoords(undefined);
    setSelectedDistrict(undefined);
    setSearchRadius(undefined);
    setLocationError(undefined);
    setLocationSelectionError(undefined);
    setIsLocating(false);
    setAppliedFilters(null);
    setSelectedStoreId(undefined);
    setMapCenter({ lat: 41.0082, lng: 28.9784 });
    setZoomLevel(10);

    if (mode !== 'current') return;

    if (!navigator.geolocation) {
      setLocationError(t('locatingUnsupported'));
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
        setLocationError(t('locationErrorTitle'));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleDistrictChange = (value?: string) => {
    setSelectedDistrict(value);
    setLocationSelectionError(undefined);
    setAppliedFilters(null);
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

  const handleRadiusChange = (value?: SearchRadius) => {
    setSearchRadius(value);
    setLocationSelectionError(undefined);
    setAppliedFilters(null);
    setSelectedStoreId(undefined);
  };

  // Load capability options from API using TanStack Query
  const { data: capabilitiesList = [] } = useQuery<CapabilityTypeOption[]>({
    queryKey: ['capabilityTypes'],
    queryFn: apiService.getCapabilityTypes,
  });

  const isLocationReady = Boolean(
    userCoords
    && (
      (locationMode === 'current' && searchRadius)
      || (locationMode === 'district' && selectedDistrict)
    )
  );

  // Fetch eligible stores from API based on applied filters and coordinates using TanStack Query
  const { data: eligibleStores = [], isLoading: isSearching } = useQuery<StoreCapabilityResult[]>({
    queryKey: [
      'capabilityStores',
      appliedFilters,
      userCoords?.lat,
      userCoords?.lng,
      locationMode,
      selectedDistrict,
      searchRadius
    ],
    queryFn: async () => {
      if (!appliedFilters || !userCoords) return [];

      const radius = locationMode === 'district' || searchRadius === 'UNLIMITED'
        ? UNLIMITED_RADIUS_KM
        : searchRadius;
      if (!radius) return [];

      const capabilityTypes = appliedFilters.capabilityType === 'ALL'
        ? capabilitiesList.map(capability => capability.key)
        : [appliedFilters.capabilityType as CapabilityType];
      const results = await Promise.all(
        capabilityTypes.map(async capabilityType => ({
          capabilityType,
          stores: await apiService.getCapabilityStores(
            capabilityType,
            userCoords.lat,
            userCoords.lng,
            radius,
            {
              workingHours: appliedFilters.workingHours as 'ALL' | 'WEEKEND' | 'LATE_CLOSE',
              storeType: appliedFilters.storeType as 'ALL' | 'TIM' | 'FRANCHISE'
            }
          )
        }))
      );
      const storesById = new Map<number, StoreCapabilityResult & { capabilities: CapabilityType[] }>();

      results.forEach(({ capabilityType, stores }) => {
        stores.forEach(store => {
          if (locationMode === 'district' && selectedDistrict && store.district !== selectedDistrict) return;
          const existing = storesById.get(store.id);
          if (existing) {
            if (!existing.capabilities.includes(capabilityType)) {
              existing.capabilities.push(capabilityType);
            }
          } else {
            storesById.set(store.id, { ...store, capabilities: [capabilityType] });
          }
        });
      });

      return Array.from(storesById.values()).sort((a, b) => a.distance - b.distance);
    },
    enabled: Boolean(appliedFilters && isLocationReady),
  });

  const selectedStore = eligibleStores.find(s => s.id === selectedStoreId);

  // Reset selection and adjust center when filters change
  useEffect(() => {
    setSelectedStoreId(undefined);
    if (selectedDistrict) {
      setZoomLevel(13);
    } else {
      setMapCenter({ lat: 41.0082, lng: 28.9784 });
      setZoomLevel(10);
    }
  }, [appliedFilters, selectedDistrict, eligibleStores.length]);

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
    if (!isLocationReady) {
      setLocationSelectionError(t('locationErrorTitle'));
      setAppliedFilters(null);
      return;
    }
    setLocationSelectionError(undefined);
    setAppliedFilters(values);
  };

  const transactionsExtraDetail = selectedStore && appliedFilters && (
    <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.5rem' }}>
      <div className="drawer-detail-label">Desteklenen İşlemler</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
        {((selectedStore as any).capabilities || [appliedFilters.capabilityType]).map((capCode: CapabilityType) => {
          const capLabel = capabilitiesList.find(c => c.key === capCode)?.label ?? capCode;
          const isCurrentSearch = appliedFilters.capabilityType === 'ALL' || capCode === appliedFilters.capabilityType;
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
        {t('backToDashboard')}
      </Link>

      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          {t('transPageTitle')}
        </h1>
        <p className="hero-subtitle">
          {t('transPageDesc')}
        </p>
      </section>

      <div className="locator-layout">
        {/* Sidebar Controls */}
        <aside className="locator-sidebar glass-panel">
          {apiStatus.isUsingFallback && (
            <Alert
              message={t('simulationMode')}
              description={t('fallbackWarning')}
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
            onRadiusChange={handleRadiusChange}
          />

          {locationSelectionError && (
            <Alert
              message={locationSelectionError}
              type="error"
              showIcon
              style={{ marginBottom: '1rem' }}
            />
          )}

          <h3 className="sidebar-title">{t('searchFiltersTitle')}</h3>

          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <div className="filter-group">
              <label className="filter-label">{t('transactionType')}</label>
              <Controller
                name="capabilityType"
                control={control}
                render={({ field }) => (
                  <Select 
                    {...field}
                    value={field.value || undefined}
                    placeholder={t('allTxTypes')}
                    allowClear
                    style={{ width: '100%' }}
                    status={errors.capabilityType ? 'error' : ''}
                  >
                    <Option value="ALL">{t('all')}</Option>
                    {Array.isArray(capabilitiesList) && capabilitiesList.map(cap => (
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
              <label className="filter-label">{t('workingHoursFilter')}</label>
              <Controller
                name="workingHours"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    placeholder={t('workingHoursFilter')}
                    allowClear
                    status={errors.workingHours ? 'error' : ''}
                    style={{ width: '100%' }}
                  >
                    <Option value="ALL">{t('all')}</Option>
                    <Option value="WEEKEND">{t('opensWeekend')}</Option>
                    <Option value="LATE_CLOSE">{t('lateClose')}</Option>
                  </Select>
                )}
              />
              {errors.workingHours && (
                <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.workingHours.message}
                </div>
              )}
            </div>

            <div className="filter-group" style={{ marginTop: '0.75rem' }}>
              <label className="filter-label">{t('dealerType')}</label>
              <Controller
                name="storeType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    placeholder={t('dealerType')}
                    allowClear
                    status={errors.storeType ? 'error' : ''}
                    style={{ width: '100%' }}
                  >
                    <Option value="ALL">{t('all')}</Option>
                    <Option value="TIM">{t('tim')}</Option>
                    <Option value="FRANCHISE">{t('franchise')}</Option>
                  </Select>
                )}
              />
              {errors.storeType && (
                <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.storeType.message}
                </div>
              )}
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSearching}
              style={{ width: '100%', marginTop: '1.25rem', backgroundColor: 'var(--turkcell-blue)', borderColor: 'var(--turkcell-blue)' }}
            >
              {t('searchDealersBtn')}
            </Button>
          </form>

          <div className="filter-group" style={{ marginTop: '1.5rem' }}>
            <span className="filter-label">
              {t('eligibleDealers')} ({eligibleStores.length})
            </span>
          </div>

          <div className="card-list">
            {!appliedFilters || !isLocationReady ? (
              <Empty
                description={t('searchHint')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : isSearching ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                <Spin tip={t('loadingStores')} size="large" />
              </div>
            ) : (Array.isArray(eligibleStores) && eligibleStores.length > 0) ? (
              eligibleStores.map(item => (
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {item.type === 'TIM' ? (
                            <Tag color="blue">{t('tim')}</Tag>
                          ) : (
                            <Tag color="cyan">{t('franchise')}</Tag>
                          )}
                        </div>
                      </div>
                    }
                  />
                </div>
              ))
            ) : (
              <Empty 
                description={
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('noDealersFound')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {t('noDealersDesc')}
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
          {appliedFilters && isLocationReady ? (
            <StoreMap
              center={mapCenter}
              zoom={zoomLevel}
              currentLocation={locationMode === 'current' ? userCoords : undefined}
              stores={eligibleStores}
              selectedStoreId={selectedStoreId}
              hoveredStoreId={hoveredStoreId}
              onStoreSelect={handleStoreSelect}
              pageType="transaction"
            />
          ) : (
            <Empty
              description={t('mapHint')}
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
        extra={transactionsExtraDetail}
      />
    </div>
  );
};
