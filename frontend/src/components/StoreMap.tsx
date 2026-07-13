import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Store } from '../types/api';

// Custom Leaflet pins styled in brand color rgb(51, 84, 166)
const getCustomMapIcon = (isSelected: boolean) => {
  return L.divIcon({
    html: `<div style="
      background-color: rgb(51, 84, 166);
      width: ${isSelected ? '24px' : '20px'};
      height: ${isSelected ? '24px' : '20px'};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
      box-shadow: ${isSelected ? '0 0 12px #ffffff, 0 4px 8px rgba(0, 0, 0, 0.5)' : '0 2px 5px rgba(0,0,0,0.5)'};
      transition: all 0.2s ease-in-out;
    "></div>`,
    className: isSelected ? 'custom-brand-pin-selected' : 'custom-brand-pin',
    iconSize: isSelected ? [24, 24] : [20, 20],
    iconAnchor: isSelected ? [12, 24] : [10, 20]
  });
};

// Helper component to recenter the Leaflet map dynamically
const RecenterMap: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

interface StoreMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  stores: (Store & { distance: number })[];
  selectedStoreId: number | undefined;
  onStoreSelect: (store: Store & { distance: number }) => void;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  center,
  zoom,
  stores,
  selectedStoreId,
  onStoreSelect
}) => {
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
      <RecenterMap center={center} zoom={zoom} />
      {stores.map(item => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={getCustomMapIcon(item.id === selectedStoreId)}
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
