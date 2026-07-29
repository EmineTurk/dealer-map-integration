import { Alert, Radio, Select, Spin } from 'antd';
import { ISTANBUL_DISTRICTS } from '../data/istanbulDistricts';

export type LocationMode = 'current' | 'district';
export type SearchRadius = number | 'UNLIMITED';
export const UNLIMITED_RADIUS_KM = 25000;

type LocationSearchFiltersProps = {
  locationMode?: LocationMode;
  selectedDistrict?: string;
  searchRadius?: SearchRadius;
  isLocating: boolean;
  locationError?: string;
  hasCurrentLocation: boolean;
  onLocationModeChange: (mode: LocationMode) => void;
  onDistrictChange: (district?: string) => void;
  onRadiusChange: (radius?: SearchRadius) => void;
};

const SEARCH_RADIUS_OPTIONS = [1, 5, 10, 20];

export const LocationSearchFilters = ({
  locationMode,
  selectedDistrict,
  searchRadius,
  isLocating,
  locationError,
  hasCurrentLocation,
  onLocationModeChange,
  onDistrictChange,
  onRadiusChange,
}: LocationSearchFiltersProps) => (
  <div className="location-search-filters">
    <div className="filter-group">
      <label className="filter-label">Konum Yöntemi</label>
      <Radio.Group
        value={locationMode}
        onChange={(event) => onLocationModeChange(event.target.value)}
        style={{ display: 'flex', width: '100%' }}
      >
        <Radio.Button value="current" style={{ flex: 1, textAlign: 'center' }}>
          Mevcut Konumum
        </Radio.Button>
        <Radio.Button value="district" style={{ flex: 1, textAlign: 'center' }}>
          İlçe Seç
        </Radio.Button>
      </Radio.Group>
    </div>

    {locationMode === 'current' && (
      <div style={{ marginTop: '0.75rem' }}>
        {isLocating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Spin size="small" />
            <span>Konumunuz alınıyor...</span>
          </div>
        ) : locationError ? (
          <Alert message="Konum alınamadı" description={locationError} type="error" showIcon />
        ) : hasCurrentLocation ? (
          <Alert message="Mevcut konumunuz kullanılıyor" type="success" showIcon />
        ) : null}
      </div>
    )}

    {locationMode === 'district' && (
      <div className="filter-group" style={{ marginTop: '0.75rem' }}>
        <label className="filter-label">İlçe</label>
        <Select
          placeholder="İlçe seçin"
          value={selectedDistrict}
          onChange={onDistrictChange}
          allowClear
          style={{ width: '100%' }}
        >
          {ISTANBUL_DISTRICTS.map((district) => (
            <Select.Option key={district.key} value={district.key}>
              {district.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    )}

    {locationMode === 'current' && (
      <div className="filter-group" style={{ marginTop: '0.75rem' }}>
        <label className="filter-label">Arama Yarıçapı</label>
        <Select
          placeholder="Arama yarıçapı seçiniz"
          value={searchRadius}
          onChange={onRadiusChange}
          allowClear
          style={{ width: '100%' }}
        >
          {SEARCH_RADIUS_OPTIONS.map((radius) => (
            <Select.Option key={radius} value={radius}>
              {radius} km
            </Select.Option>
          ))}
          <Select.Option value="UNLIMITED">Sınırsız</Select.Option>
        </Select>
      </div>
    )}
  </div>
);
