import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Store } from '../types/api';

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
  stores: (Store & { distance: number; stockLevel?: string })[];
  selectedStoreId: number | undefined;
  hoveredStoreId?: number | undefined;
  onStoreSelect: (store: Store & { distance: number }) => void;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  center,
  zoom,
  stores,
  selectedStoreId,
  hoveredStoreId,
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
