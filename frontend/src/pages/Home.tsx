import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container home-page animate-fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          Bayi Harita Entegrasyonu
        </h1>
        <p className="hero-subtitle">
          Turkcell bayi kanallarında stok seviyelerini ve işlem yetkinliklerini koordine eden yüksek performanslı, birleşik bir konum motoru.
        </p>
      </section>

      <div className="modules-grid">
        {/* Module 1: Pasaj Stocks */}
        <div className="module-card glass-panel" onClick={() => navigate('/pasaj')}>
          <div className="card-accent-blue"></div>
          <div className="module-icon">📦</div>
          <h2 className="module-title">Pasaj</h2>
          <h3 className="module-subtitle">"Yakınımdaki Stoklar"</h3>
          <p className="module-desc">
            Fiziksel cihaz stok kataloğunu (örn. iPhone 15, Galaxy S24) arayın ve çevrenizdeki eşleşen bayileri gerçek zamanlı olarak haritada bulun.
          </p>
          <div className="module-badge stock-badge">Stock-Service</div>
          <button className="module-btn">Bulucuyu Başlat &rarr;</button>
        </div>

        {/* Module 2: Transactions */}
        <div className="module-card glass-panel" onClick={() => navigate('/transactions')}>
          <div className="card-accent-yellow"></div>
          <div className="module-icon">⚡</div>
          <h2 className="module-title">turkcell.com.tr</h2>
          <h3 className="module-subtitle">"Yakınımdaki İşlemler"</h3>
          <p className="module-desc">
            Bayileri işlem yetkinliklerine (örn. yeni hat aktivasyonu, cihaz tamiri) göre filtreleyin ve en yakın uygun konuma ulaşın.
          </p>
          <div className="module-badge capability-badge">Capability-Service</div>
          <button className="module-btn yellow-btn">İşlemleri Keşfet &rarr;</button>
        </div>
      </div>

      {/* Metrics Section */}
      <section className="system-metrics">
        <h3 className="section-heading">Sistem Ana Veri Özeti</h3>
        <div className="metrics-grid">
          <div className="metric-box glass-panel">
            <span className="metric-value">15</span>
            <span className="metric-label">Aktif TİM ve Franchise Mağazalar</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">10</span>
            <span className="metric-label">Katalogtaki Toplam Ürün</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">5</span>
            <span className="metric-label">Kayıtlı İşlem Tipi</span>
          </div>
        </div>
      </section>

      {/* Microservice Architecture Visualizer */}
      <section className="architecture-section glass-panel">
        <h3 className="arch-heading">Mimari Topoloji</h3>
        <div className="arch-map">
          <div className="arch-node node-client">React Uygulaması (SPA)</div>
          <div className="arch-line">&darr;</div>
          <div className="arch-node node-gateway">API Ağ Geçidi (Port 8080)</div>
          <div className="arch-line-split">
            <div className="split-branch">
              <div className="arch-line-diagonal"></div>
              <div className="arch-node node-svc">stock-service</div>
            </div>
            <div className="split-branch">
              <div className="arch-line-straight"></div>
              <div className="arch-node node-svc-shared">store-service (Ortak)</div>
            </div>
            <div className="split-branch">
              <div className="arch-line-diagonal-right"></div>
              <div className="arch-node node-svc">capability-service</div>
            </div>
          </div>
          <div className="arch-line">&darr;</div>
          <div className="arch-node node-redis">Redis Önbellek Katmanı</div>
        </div>
      </section>
    </div>
  );
};
