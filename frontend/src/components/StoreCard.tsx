import React from 'react';
import { Card } from 'antd';
import type { Store } from '../types/api';

interface StoreCardProps {
  store: Store & { distance: number };
  isSelected: boolean;
  onClick: () => void;
  extra?: React.ReactNode;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  isSelected,
  onClick,
  extra
}) => {
  return (
    <Card
      className="list-card glass-panel"
      bodyStyle={{ padding: '0.75rem 1rem' }}
      style={{
        border: isSelected ? '1px solid var(--turkcell-yellow)' : '1px solid transparent',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div className="list-card-title">{store.name}</div>
      <div className="list-card-subtitle" style={{ marginBottom: '0.5rem' }}>
        {store.district}, {store.city} &bull; <strong>{store.distance} km uzakta</strong>
      </div>
      {extra}
    </Card>
  );
};
