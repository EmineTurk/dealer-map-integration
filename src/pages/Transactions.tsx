import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Select, Card, Tag, Empty } from 'antd';
import { mockStores, mockStoreCapabilities } from '../mocks/mockData';
import type { CapabilityType } from '../types/api';
import './Pages.css';

const { Option } = Select;

const capabilitiesList: { type: CapabilityType; label: string }[] = [
  { type: 'NEW_LINE', label: 'New Line Activation' },
  { type: 'DEVICE_DELIVERY', label: 'Device Delivery' },
  { type: 'DEVICE_REPAIR', label: 'Device Repairs & Service' },
  { type: 'NUMBER_PORT', label: 'Number Porting' },
  { type: 'BILL_PAYMENT', label: 'Bill Payment' }
];

export const Transactions: React.FC = () => {
  const [selectedCapability, setSelectedCapability] = useState<CapabilityType>('NEW_LINE');

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

  // Get active capability label
  const activeLabel = capabilitiesList.find(c => c.type === selectedCapability)?.label ?? '';

  return (
    <div className="page-container animate-fade-in">
      <Link to="/" className="back-btn">
        &larr; Back to Dashboard
      </Link>

      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          turkcell.com.tr - Transaction Near Me
        </h1>
        <p className="hero-subtitle">
          Find the nearest Turkcell dealer that supports your specific account or line operation.
        </p>
      </section>

      <div className="locator-layout">
        {/* Sidebar Controls */}
        <aside className="locator-sidebar glass-panel">
          <h3 className="sidebar-title">Select Operation</h3>
          
          <div className="filter-group">
            <label className="filter-label">What transaction do you want to perform?</label>
            <Select 
              value={selectedCapability} 
              style={{ width: '100%' }} 
              onChange={(val) => setSelectedCapability(val as CapabilityType)}
              dropdownStyle={{ background: '#0d1426', border: '1px solid rgba(255,255,255,0.08)' }}
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
              Eligible Stores ({eligibleStores.length})
            </span>
          </div>

          <div className="card-list">
            {eligibleStores.length > 0 ? (
              eligibleStores.map(item => (
                <Card 
                  key={item.id} 
                  className="list-card glass-panel" 
                  bodyStyle={{ padding: '0.75rem 1rem' }}
                  style={{ border: 'none' }}
                >
                  <div className="list-card-title">{item.name}</div>
                  <div className="list-card-subtitle" style={{ marginBottom: '0.5rem' }}>
                    {item.district}, {item.city} &bull; <strong>{item.distance} km away</strong>
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
                      Supports {item.capabilities.length} ops
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <Empty description="No stores found supporting this service" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel">
          <div className="placeholder-map">
            <span className="placeholder-map-icon">⚡</span>
            <h3>Interactive Map View</h3>
            <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Showing {eligibleStores.length} matching store pins for <strong>{activeLabel}</strong>. Google Maps integration will load here in Day 4.
            </p>
            {eligibleStores.length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {eligibleStores.map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      background: 'rgba(255, 199, 44, 0.1)', 
                      border: '1px solid rgba(255, 199, 44, 0.2)', 
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      color: 'var(--turkcell-yellow)'
                    }}
                  >
                    📍 {item.name} ({item.distance}km)
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
