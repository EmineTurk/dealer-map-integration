# Day 15 — Demo #3 & Week 3 Retrospective

## What I did today
Today I finalized the Week 3 goals and prepared for Demo #3. I tested the end-to-end integration by querying store locations through the Spring Cloud Gateway (`:8085`) routes. I verified that TanStack Query caching provides instant transitions between pages, preventing redundant network requests. Finally, I documented our progress and took part in the weekly retro demo.

## What I learned
- **Caching Synergy:** Combining client-side caching (TanStack Query) with backend caching (Redis) yields incredible performance improvements, minimizing database roundtrips and showing data instantly.
- **API Gateway Routing:** Verified how a single host endpoint manages requests for different domains safely by evaluating prefixes (`/api/pasaj/` and `/api/comtr/`).

## Questions & Struggles
- Ensuring that preflight CORS origins configured in Spring Cloud Gateway align with the frontend dev port was critical to prevent browser console errors during the live demo.

## For Tomorrow's Standup
- Ready for Week 4! I will begin writing the Dockerfile for the frontend to package the application with a multi-stage Nginx configuration.
