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

export interface StoreWithDistance extends Store {
  distance: number; // calculated in km (e.g. Haversine distance), 1 decimal place
}

// --- stock-service (Pasaj) Types ---

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
}

export type StockLevel = 'IN_STOCK' | 'LOW' | 'OUT_OF_STOCK';

export interface StoreStockResult extends StoreWithDistance {
  stockLevel: StockLevel;
  quantity?: number; // optional exact quantity from database
}

// --- capability-service (turkcell.com.tr) Types ---

export type CapabilityType =
  | 'NEW_LINE'
  | 'DEVICE_DELIVERY'
  | 'DEVICE_REPAIR'
  | 'NUMBER_PORT'
  | 'BILL_PAYMENT';

export interface CapabilityTypeOption {
  key: CapabilityType;
  label: string;
}

export interface StoreCapabilityResult extends StoreWithDistance {}

// Backward compatibility mappings
export interface ProductStoreStockResponse extends StoreStockResult {}
export interface StoreCapabilityResponse extends StoreCapabilityResult {}
