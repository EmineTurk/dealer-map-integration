import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Store } from '../types/api';
import { useLanguage } from '../context/LanguageContext';

// Custom Leaflet pins styled dynamically
const getCustomMapIcon = (isSelected: boolean, isHovered: boolean, stockLevel?: string) => {
  let pinColor = 'rgb(51, 84, 166)'; // Turkcell Blue default
  if (stockLevel === 'IN_STOCK') {
    pinColor = '#10B981'; // Green
  } else if (stockLevel === 'LOW') {
    pinColor = '#F59E0B'; // Amber
  } else if (stockLevel === 'OUT_OF_STOCK') {
    pinColor = '#EF4444'; // Red
  }

  const isHighlighted = isSelected || isHovered;
  const pinSize = isHighlighted ? 26 : 20;
  const borderCol = isSelected ? '#ffffff' : (isHovered ? 'var(--turkcell-yellow)' : 'rgba(255, 255, 255, 0.8)');
  const glow = isSelected 
    ? `0 0 12px ${pinColor}, 0 4px 8px rgba(0, 0, 0, 0.5)` 
    : (isHovered ? '0 0 8px var(--turkcell-yellow), 0 3px 6px rgba(0, 0, 0, 0.4)' : '0 2px 5px rgba(0,0,0,0.4)');

  return L.divIcon({
    html: `<div style="
      background-color: ${pinColor};
      width: ${pinSize}px;
      height: ${pinSize}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid ${borderCol};
      box-shadow: ${glow};
      transition: all 0.15s ease-in-out;
    "></div>`,
    className: isSelected 
      ? 'custom-brand-pin-selected' 
      : (isHovered ? 'custom-brand-pin-hovered' : 'custom-brand-pin'),
    iconSize: [pinSize, pinSize],
    iconAnchor: [pinSize / 2, pinSize]
  });
};

// Helper component to dynamically adjust map bounds to fit user coordinates and furthest store card
const FitMapBounds: React.FC<{
  currentLocation?: { lat: number; lng: number };
  stores: { latitude: number; longitude: number }[];
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ currentLocation, stores, center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (Array.isArray(stores) && stores.length > 0) {
      const bounds = L.latLngBounds([]);

      // Include search anchor coordinates
      if (currentLocation) {
        bounds.extend([currentLocation.lat, currentLocation.lng]);
      } else {
        bounds.extend([center.lat, center.lng]);
      }

      // Include all stores found
      stores.forEach(store => {
        bounds.extend([store.latitude, store.longitude]);
      });

      // Fit map frame with padding and prevent zooming too close for single/close results
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    } else {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [currentLocation, stores, center, zoom, map]);

  return null;
};

const CurrentLocationControl: React.FC<{ location: { lat: number; lng: number } }> = ({ location }) => {
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    const LocationControl = L.Control.extend({
      options: { position: 'topright' as L.ControlPosition },
      onAdd: () => {
        const button = L.DomUtil.create('button', 'leaflet-bar current-location-control');
        button.type = 'button';
        button.title = t('goToCurrentLoc');
        button.setAttribute('aria-label', t('goToCurrentLoc'));
        button.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
            <circle cx="12" cy="12" r="8"></circle>
          </svg>
        `;

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', () => {
          map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 15), {
            animate: true,
            duration: 0.7
          });
        });

        return button;
      }
    });

    const control = new LocationControl();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [location.lat, location.lng, map, t]);

  return null;
};

interface StoreMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  currentLocation?: { lat: number; lng: number };
  stores: (Store & { distance: number; stockLevel?: string })[];
  selectedStoreId: number | undefined;
  hoveredStoreId?: number | undefined;
  onStoreSelect: (store: Store & { distance: number }) => void;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  center,
  zoom,
  currentLocation,
  stores,
  selectedStoreId,
  hoveredStoreId,
  onStoreSelect
}) => {
  const { t } = useLanguage();

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMapBounds
        currentLocation={currentLocation}
        stores={stores}
        center={center}
        zoom={zoom}
      />
      {currentLocation && (
        <>
          <CurrentLocationControl location={currentLocation} />
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: '#1677ff',
              fillOpacity: 1
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {t('currentLocation')}
            </Tooltip>
          </CircleMarker>
        </>
      )}
      {Array.isArray(stores) && stores.map(item => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={getCustomMapIcon(item.id === selectedStoreId, item.id === hoveredStoreId, item.stockLevel)}
          eventHandlers={{
            click: () => {
              onStoreSelect(item);
            }
          }}
        />
      ))}
    </MapContainer>
  );
};
