import axios from 'axios';
import { mockProducts, mockStores, mockStocks, mockStoreCapabilities } from '../mocks/mockData';
import type { 
  Product, 
  StoreStockResult, 
  StoreCapabilityResult, 
  CapabilityTypeOption,
  CapabilityType,
  StockLevel
} from '../types/api';

const VITE_STOCK_SERVICE_URL = import.meta.env.VITE_STOCK_SERVICE_URL || 'http://localhost:8080';
const VITE_STORE_SERVICE_URL = import.meta.env.VITE_STORE_SERVICE_URL || 'http://localhost:8081';
const VITE_CAPABILITY_SERVICE_URL = import.meta.env.VITE_CAPABILITY_SERVICE_URL || 'http://localhost:8082';

export const stockApi = axios.create({
  baseURL: VITE_STOCK_SERVICE_URL,
  timeout: 5000,
});

export const storeApi = axios.create({
  baseURL: VITE_STORE_SERVICE_URL,
  timeout: 5000,
});

export const capabilityApi = axios.create({
  baseURL: VITE_CAPABILITY_SERVICE_URL,
  timeout: 5000,
});

// API Connection & CORS Status Tracker
export const apiStatus = {
  isUsingFallback: false,
  lastErrorMessage: '',
};

const handleApiError = (serviceName: string, baseURL: string, error: any) => {
  apiStatus.isUsingFallback = true;
  let message = 'Backend sunucusuna bağlanılamadı.';
  
  if (error.code === 'ERR_NETWORK') {
    message = `${serviceName} (${baseURL}) adresine erişilemiyor veya CORS izni verilmeli (@CrossOrigin).`;
  } else if (error.response) {
    message = `${serviceName} HTTP ${error.response.status} hatası döndürdü.`;
  }
  
  apiStatus.lastErrorMessage = message;
  console.warn(`[CORS / API Katmanı Uyarısı] ${serviceName} ->`, message, error);
};

// Interceptor setup for diagnostic logging
[stockApi, storeApi, capabilityApi].forEach(api => {
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.info('[CORS Diagnostic] Cross-Origin or Network Error detected on request:', error.config?.url);
      }
      return Promise.reject(error);
    }
  );
});

// Helper for Haversine distance simulation in mock fallbacks
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
};

// API Services with automatic mock fallback on failure
export const apiService = {
  // Pasaj endpoints
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await stockApi.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      handleApiError('stock-service', VITE_STOCK_SERVICE_URL, error);
      return mockProducts;
    }
  },

  getProductStores: async (
    productId: number, 
    lat: number, 
    lng: number, 
    radius: number = 10
  ): Promise<StoreStockResult[]> => {
    try {
      const response = await stockApi.get<StoreStockResult[]>(`/products/${productId}/stores`, {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      handleApiError('stock-service', VITE_STOCK_SERVICE_URL, error);
      // Mock local filtering logic:
      return mockStores.map(store => {
        const qty = mockStocks[`${productId}-${store.id}`] ?? 0;
        let stockLevel: StockLevel = 'OUT_OF_STOCK';
        if (qty > 5) stockLevel = 'IN_STOCK';
        else if (qty > 0) stockLevel = 'LOW';
        
        const dist = getDistance(lat, lng, store.latitude, store.longitude);
        return { 
          ...store, 
          distance: dist, 
          stockLevel 
        };
      })
      .filter(s => s.stockLevel !== 'OUT_OF_STOCK' && s.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    }
  },

  // Capability endpoints
  getCapabilityTypes: async (): Promise<CapabilityTypeOption[]> => {
    try {
      const response = await capabilityApi.get<CapabilityTypeOption[]>('/capabilities/types');
      return response.data;
    } catch (error) {
      handleApiError('capability-service', VITE_CAPABILITY_SERVICE_URL, error);
      return [
        { key: 'NEW_LINE', label: 'Yeni Hat Aktivasyonu' },
        { key: 'DEVICE_DELIVERY', label: 'Cihaz Teslimatı' },
        { key: 'DEVICE_REPAIR', label: 'Cihaz Tamir & Bakım Yetkisi' },
        { key: 'NUMBER_PORT', label: 'Numara Taşıma' },
        { key: 'BILL_PAYMENT', label: 'Fatura Ödeme' }
      ];
    }
  },

  getCapabilityStores: async (
    type: CapabilityType, 
    lat: number, 
    lng: number, 
    radius: number = 10,
    filters?: { workingHours?: string; storeType?: string }
  ): Promise<StoreCapabilityResult[]> => {
    try {
      const response = await capabilityApi.get<StoreCapabilityResult[]>(`/capabilities/${type}/stores`, {
        params: { lat, lng, radius, ...filters }
      });
      return response.data;
    } catch (error) {
      handleApiError('capability-service', VITE_CAPABILITY_SERVICE_URL, error);
      
      // Mock filtering logic on fallback
      return mockStores.map(store => {
        const caps = mockStoreCapabilities[store.id] ?? [];
        const isEligible = caps.includes(type);

        const matchesStoreType = !filters?.storeType || filters.storeType === 'ALL' || store.type === filters.storeType;

        let matchesWorkingHours = true;
        if (filters?.workingHours === 'LATE_CLOSE') {
          const hours = store.workingHours || '';
          const parts = hours.split('-');
          if (parts.length === 2) {
            const closeTime = parts[1].trim();
            const closeHour = parseInt(closeTime.split(':')[0]);
            if (isNaN(closeHour) || closeHour < 21) {
              matchesWorkingHours = false;
            }
          } else {
            matchesWorkingHours = false;
          }
        } else if (filters?.workingHours === 'WEEKEND') {
          const hours = store.workingHours || '';
          const isLateFranchise = hours.includes('21:00') || hours.includes('22:00');
          const isOpenWeekend = store.type === 'TIM' || isLateFranchise;
          if (!isOpenWeekend) {
            matchesWorkingHours = false;
          }
        }

        const dist = getDistance(lat, lng, store.latitude, store.longitude);
        return {
          ...store,
          distance: dist,
          isEligible: isEligible && matchesStoreType && matchesWorkingHours
        };
      })
      .filter(s => s.isEligible && s.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    }
  }
};
