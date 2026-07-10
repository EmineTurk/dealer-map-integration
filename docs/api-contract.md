# Dealer Map Integration — API Contract

Single source of truth for Frontend, Backend A (`stock-service`), and Backend B (`store-service` / `capability-service`).
Field names (`id`, `name`, `workingHours`, …) match the frontend mock data and must stay in sync across all three sides.

---

## 1. General Rules

| Rule | Description |
|---|---|
| Field names | camelCase (`id`, not `storeId`; `workingHours`, etc.) |
| Enum values | UPPER_SNAKE_CASE (`IN_STOCK`, `NEW_LINE`) |
| Pagination | Not in MVP — lists return a plain array |
| Empty result | Not 404 — `200 OK` + empty array `[]` |
| 404 usage | Only when a specific ID does not exist |
| Error format | Shared `ApiError` body on every service |

```ts
interface ApiError {
  status: number;
  message: string;
  timestamp: string; // ISO 8601
}
```

---

## 2. Shared Types

### Store

```ts
type StoreType = "TIM" | "FRANCHISE";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  type: StoreType;
  phone: string;
  workingHours: string;
}
```

> Note: Base `Store` has **no** `distance`. `distance` is added only on geo endpoints (`lat` / `lng` / `radius`) as `StoreWithDistance`.

```ts
interface StoreWithDistance extends Store {
  distance: number; // km, 1 decimal place
}
```

Endpoints such as `GET /stores?ids=` (no geo params) return `Store[]` — never include `distance`.

### Product

```ts
interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
}
```

### StockLevel

Raw quantity is never exposed; domain rules map it to:

```ts
type StockLevel = "IN_STOCK" | "LOW" | "OUT_OF_STOCK";
```

| quantity | StockLevel |
|---|---|
| 0 | OUT_OF_STOCK |
| 1–5 | LOW |
| 6+ | IN_STOCK |

```ts
interface StoreStockResult extends StoreWithDistance {
  stockLevel: StockLevel;
}
```

### CapabilityType

```ts
type CapabilityType =
  | "NEW_LINE"
  | "DEVICE_DELIVERY"
  | "DEVICE_REPAIR"
  | "NUMBER_PORT"
  | "BILL_PAYMENT";

interface CapabilityTypeOption {
  key: CapabilityType;
  label: string;
}
```

```ts
interface StoreCapabilityResult extends StoreWithDistance {}
```

---

## 3. Endpoints

### 3.1 `GET /products`
Pasaj product catalog. (**stock-service**)

**Response `200`:**
```json
[
  { "id": 1, "name": "iPhone 15 128GB", "sku": "APL-IPH15-128", "category": "Smartphones" },
  { "id": 5, "name": "AirPods Pro Gen 2", "sku": "APL-APP2", "category": "Accessories" }
]
```

---

### 3.2 `GET /stores/{id}`
Single store detail. (**store-service**)

**Response `200`:**
```json
{
  "id": 1,
  "name": "Turkcell Kadikoy TIM",
  "address": "Sogutlucesme Cd. No: 42, Kadikoy",
  "city": "Istanbul",
  "district": "Kadikoy",
  "latitude": 40.9901,
  "longitude": 29.0253,
  "type": "TIM",
  "phone": "+90 216 555 0101",
  "workingHours": "09:00 - 21:00"
}
```

**Response `404`** (unknown `id`):
```json
{ "status": 404, "message": "Store not found: id=999", "timestamp": "2026-07-09T10:00:00Z" }
```

---

### 3.3 `GET /stores?ids=1,2,3`
Bulk store lookup — primary endpoint used by `stock-service` / `capability-service`. **No geo params, no `distance`.**

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Turkcell Kadikoy TIM",
    "address": "Sogutlucesme Cd. No: 42, Kadikoy",
    "city": "Istanbul",
    "district": "Kadikoy",
    "latitude": 40.9901,
    "longitude": 29.0253,
    "type": "TIM",
    "phone": "+90 216 555 0101",
    "workingHours": "09:00 - 21:00"
  }
]
```

---

### 3.4 `GET /stores?city=&district=`
Regional listing. Do not combine with `ids`.

**Example:** `GET /stores?city=Istanbul&district=Kadikoy`

**Response `200`:** same `Store[]` shape as `GET /stores?ids=`. No matches → `[]` + `200` (not 404).

---

### 3.5 `GET /products/{id}/stores?lat=&lng=&radius=`
Pasaj main endpoint — stores with stock for the product, within radius, sorted by distance. (**stock-service**)

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Turkcell Kadikoy TIM",
    "address": "Sogutlucesme Cd. No: 42, Kadikoy",
    "city": "Istanbul",
    "district": "Kadikoy",
    "latitude": 40.9901,
    "longitude": 29.0253,
    "type": "TIM",
    "phone": "+90 216 555 0101",
    "workingHours": "09:00 - 21:00",
    "distance": 2.3,
    "stockLevel": "IN_STOCK"
  }
]
```

**Response `404`** (unknown product id):
```json
{ "status": 404, "message": "Product not found: id=99", "timestamp": "2026-07-09T10:00:00Z" }
```

**Response `200` + `[]`** (product exists, no matching stores — not 404):
```json
[]
```

---

### 3.6 `GET /capabilities/{type}/stores?lat=&lng=&radius=`
com.tr main endpoint — stores that support the capability, within radius. (**capability-service**)

> **Note (Week 2 / Day 7):** Extra filters such as `?workingHours=weekend&status=ACTIVE` may be added later. MVP (Week 1) uses only `lat` / `lng` / `radius`.

**Response `200`:**
```json
[
  {
    "id": 3,
    "name": "Turkcell Sisli TIM",
    "address": "Halaskargazi Cd. No: 150, Sisli",
    "city": "Istanbul",
    "district": "Sisli",
    "latitude": 41.0602,
    "longitude": 28.9877,
    "type": "TIM",
    "phone": "+90 212 555 0103",
    "workingHours": "09:00 - 22:00",
    "distance": 3.7
  }
]
```

---

### 3.7 `GET /capabilities/types`
Capability options for dropdowns / filters. (**capability-service**)

**Response `200`:**
```json
[
  { "key": "NEW_LINE", "label": "New Line Application" },
  { "key": "DEVICE_DELIVERY", "label": "Device Delivery" },
  { "key": "DEVICE_REPAIR", "label": "Device Repair / Technical Service" },
  { "key": "NUMBER_PORT", "label": "Number Portability" },
  { "key": "BILL_PAYMENT", "label": "Bill Payment" }
]
```

---

## 4. Relation to Frontend Mock Data

Aligned with `frontend` mock stores / products / stocks / capabilities:

- `mockStores` → `Store[]`
- `mockProducts` → `Product[]`
- `mockStocks` → mapped to `StockLevel` on `StoreStockResult`
- `mockStoreCapabilities` → backs `/capabilities/{type}/stores`

---

## 5. Change Process

Update this file first, then code and Postman examples. Do not diverge field names or error shapes without a contract change.
