# Dealer Map Integration

This project is developed for Turkcell dealer map integration.

The main goal is to show users the nearest suitable dealers on a map.

## Main Scenarios

- **Pasaj — Nearby Stock:** Users can see which dealers have the selected product in stock.
- **turkcell.com.tr — Nearby Service:** Users can see the nearest dealers that can perform the selected operation.

## Project Structure

```txt
dealer-map-integration
├── stock-service      (port 8080 — Pasaj / Backend A)
├── store-service      (port 8081 — Bayi master data / Backend B)
├── capability-service (Hafta 2 — Backend B)
├── frontend
└── docs