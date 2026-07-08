import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Select, Card, Tag, Badge, Empty } from 'antd';
import { mockProducts, mockStores, mockStocks } from '../mocks/mockData';
import type { StockLevel } from '../types/api';
import './Pages.css';

const { Option } = Select;

export const Pasaj: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(1); // default to iPhone 15

  // Get active product details
  const activeProduct = mockProducts.find(p => p.id === selectedProductId);

  // Filter stores that have stock entries for this product
  const storeStocksList = mockStores.map(store => {
    const stockKey = `${selectedProductId}-${store.id}`;
    const quantity = mockStocks[stockKey] ?? 0;
    
    let stockLevel: StockLevel = 'OUT_OF_STOCK';
    if (quantity > 5) {
      stockLevel = 'IN_STOCK';
    } else if (quantity > 0) {
      stockLevel = 'LOW';
    }

    // Mock distance for display purposes (Haversine simulated)
    const simulatedDistance = parseFloat((Math.random() * 8 + 1.2).toFixed(1));

    return {
      ...store,
      quantity,
      stockLevel,
      distance: simulatedDistance
    };
  })
  .filter(item => item.stockLevel !== 'OUT_OF_STOCK') // only show available/low stock stores
  .sort((a, b) => a.distance - b.distance); // sort by distance

  const getStockTagColor = (level: StockLevel) => {
    switch (level) {
      case 'IN_STOCK': return 'success';
      case 'LOW': return 'warning';
      case 'OUT_OF_STOCK': return 'error';
      default: return 'default';
    }
  };

  const getStockLabel = (level: StockLevel) => {
    switch (level) {
      case 'IN_STOCK': return 'In Stock (>5)';
      case 'LOW': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <Link to="/" className="back-btn">
        &larr; Back to Dashboard
      </Link>

      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          Pasaj - Stock Near Me
        </h1>
        <p className="hero-subtitle">
          Find which Turkcell physical store has your desired product in stock.
        </p>
      </section>

      <div className="locator-layout">
        {/* Sidebar Controls */}
        <aside className="locator-sidebar glass-panel">
          <h3 className="sidebar-title">Product Catalog</h3>
          
          <div className="filter-group">
            <label className="filter-label">Select Device / accessory</label>
            <Select 
              value={selectedProductId} 
              style={{ width: '100%' }} 
              onChange={(val) => setSelectedProductId(val)}
              dropdownStyle={{ background: '#0d1426', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {mockProducts.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <span className="filter-label">
              Available Stores ({storeStocksList.length})
            </span>
          </div>

          <div className="card-list">
            {storeStocksList.length > 0 ? (
              storeStocksList.map(item => (
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
                    <Tag color={getStockTagColor(item.stockLevel)}>
                      {getStockLabel(item.stockLevel)}
                    </Tag>
                    {item.type === 'TIM' ? (
                      <Badge status="processing" text="TIM" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} />
                    ) : (
                      <Badge status="default" text="Franchise" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Empty description="No stores found with stock" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <main className="locator-main glass-panel">
          <div className="placeholder-map">
            <span className="placeholder-map-icon">🗺️</span>
            <h3>Interactive Map View</h3>
            <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Showing {storeStocksList.length} store pins for <strong>{activeProduct?.name}</strong>. Google Maps integration will load here in Day 4.
            </p>
            {storeStocksList.length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {storeStocksList.map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      background: 'rgba(0, 86, 179, 0.2)', 
                      border: '1px solid rgba(0, 86, 179, 0.3)', 
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)'
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
