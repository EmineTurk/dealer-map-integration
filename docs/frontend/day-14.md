# Day 14 — Graceful Error States, Geolocation Alerts, and Branded Empty Views

## What I did today
Today, I focused on visual polishing and robust error UX. I replaced generic blank lists and silent failures with structured Ant Design components (`Alert` and `Empty`). Specifically, I built:
- **API Offline Banners:** A dynamic warning alert showing up when the Gateway or local microservices are down, informing the user that the app is currently running in mock "Simulation Mode".
- **Branded Empty States:** Customized empty list views with reset suggestions when query filters return zero matching stores.
- **Geolocation Warnings:** An intuitive alert reminding users that their browser location permission is denied and that they are browsing using fallback coordinates (with dropdowns).

## What I learned
- **Graceful Failures:** Users shouldn't be left guessing when a connection fails. Communicating clearly when the application drops back to a mock simulation makes the product feel reliable and complete.
- **Ant Design Alerts:** Leveraging standard component libraries for notifications keeps the design system consistent and cuts down on custom boilerplate CSS.

## Questions & Struggles
- Synchronizing the reactive state when the API status object changes required ensuring that TanStack Query fetches successfully trigger re-renders to draw the offline banner correctly.

## For Tomorrow's Standup
- When we go to production, do we want to trigger global notifications (toasts) in addition to the alert banners when the API Gateway fails?
