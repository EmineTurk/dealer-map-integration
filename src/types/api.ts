/**
 * Common types and API contracts for the Dealer Map Integration project.
 * All properties are documented and strictly typed.
 */

// --- store-service (Bayi Master Data) Types ---

export type StoreType = 'TIM' | 'FRANCHISE';

export interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  type: StoreType;
  phone?: string;
  workingHours?: string;
}

// --- stock-service (Pasaj) Types ---

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
}

export type StockLevel = 'IN_STOCK' | 'LOW' | 'OUT_OF_STOCK';

export interface ProductStoreStockResponse {
  storeId: number;
  storeName: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: number; // calculated in km (e.g. Haversine distance)
  stockLevel: StockLevel;
  quantity?: number; // optional, database quantity value
}

// --- capability-service (turkcell.com.tr) Types ---

export type CapabilityType =
  | 'NEW_LINE'
  | 'DEVICE_DELIVERY'
  | 'DEVICE_REPAIR'
  | 'NUMBER_PORT'
  | 'BILL_PAYMENT';

export interface StoreCapabilityResponse {
  storeId: number;
  storeName: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: number; // calculated in km
  capabilities: CapabilityType[];
}
