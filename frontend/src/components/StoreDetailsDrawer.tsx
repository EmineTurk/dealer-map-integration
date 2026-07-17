import React from 'react';
import { Drawer, Tag, Skeleton } from 'antd';
import type { Store } from '../types/api';

interface StoreDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  store: (Store & { distance: number }) | undefined;
  isLoading: boolean;
  extra?: React.ReactNode;
}

export const StoreDetailsDrawer: React.FC<StoreDetailsDrawerProps> = ({
  open,
  onClose,
  store,
  isLoading,
  extra
}) => {
  return (
    <Drawer
      title="Bayi Detay Bilgileri"
      placement="right"
      onClose={onClose}
      open={open}
      width={380}
    >
      {isLoading ? (
        <div style={{ padding: '0.5rem 0' }}>
          {/* Skeleton representation of header store name and badge */}
          <div className="drawer-detail-section" style={{ marginBottom: '2rem' }}>
            <Skeleton.Button active size="large" style={{ width: '220px', height: '24px', marginBottom: '0.5rem' }} />
            <br />
            <Skeleton.Button active size="small" style={{ width: '80px', height: '18px', marginTop: '0.5rem' }} />
          </div>

          {/* Skeleton address section */}
          <div className="drawer-detail-section">
            <Skeleton.Input active size="small" style={{ width: '60px', height: '14px', marginBottom: '0.5rem' }} />
            <Skeleton active paragraph={{ rows: 2, width: ['100%', '80%'] }} title={false} />
          </div>

          {/* Skeleton Phone */}
          <div className="drawer-detail-section">
            <Skeleton.Input active size="small" style={{ width: '60px', height: '14px', marginBottom: '0.5rem' }} />
            <br />
            <Skeleton.Button active size="small" style={{ width: '120px', height: '18px' }} />
          </div>

          {/* Skeleton working hours */}
          <div className="drawer-detail-section">
            <Skeleton.Input active size="small" style={{ width: '100px', height: '14px', marginBottom: '0.5rem' }} />
            <br />
            <Skeleton.Button active size="small" style={{ width: '140px', height: '18px' }} />
          </div>

          {/* Skeleton extra details section */}
          <div className="drawer-detail-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '1.5rem' }}>
            <Skeleton.Input active size="small" style={{ width: '150px', height: '14px', marginBottom: '0.5rem' }} />
            <Skeleton active paragraph={{ rows: 1, width: ['90%'] }} title={false} />
          </div>
        </div>
      ) : (
        store && (
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
                {store.name}
              </div>
              <Tag color={store.type === 'TIM' ? 'blue' : 'cyan'}>
                {store.type === 'TIM' ? 'TİM Bayisi' : 'Franchise Acente'}
              </Tag>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Adres</div>
              <div className="drawer-detail-value">{store.address}</div>
              <div className="drawer-detail-value" style={{ marginTop: '0.25rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                {store.district}, {store.city}
              </div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Telefon</div>
              <div className="drawer-detail-value">{store.phone || 'N/A'}</div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Çalışma Saatleri</div>
              <div className="drawer-detail-value">⏱️ {store.workingHours || '09:00 - 20:00'}</div>
            </div>

            <div className="drawer-detail-section">
              <div className="drawer-detail-label">Uzaklık</div>
              <div className="drawer-detail-value">📍 {store.distance} km uzakta</div>
            </div>

            {extra}
          </div>
        )
      )}
    </Drawer>
  );
};
