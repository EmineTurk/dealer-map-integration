# Day 16 — Frontend Containerization & Nginx Routing Fallback

## What I did today
Today I containerized our frontend application. I wrote a multi-stage `Dockerfile`, a `.dockerignore` file, and a custom `nginx.conf` file to host the production-compiled static assets. 
- Stage 1 uses a `node:20-alpine` image to install dependencies and compile the production assets into the `dist/` directory.
- Stage 2 copies the compiled static assets into a lightweight `nginx:1.27-alpine` web server, exposing port `80`.

## What I learned
- **Single Page Application Serve Principles:** SPAs (like React + Vite) compile down to pure static HTML/CSS/JS files. In production, we do not need a running Node.js process to run the app; we just need a fast, lightweight web server like Nginx to serve these static files.
- **Why Nginx SPA Fallback is Required:** Since React Router manages routes on the client side, if a user reloads `http://localhost/pasaj`, Nginx will look for a physical file or directory named `/pasaj/` on disk and return a 404. Our custom `try_files $uri $uri/ /index.html` configuration redirects all unmatched paths to `index.html`, allowing React Router to parse the path and load the correct view.
- **Multi-Stage Docker Builds:** By splitting the build process into two stages, we prevent compiler tools and source files from bloating the final production image, resulting in a minimal, secure, and fast-loading Nginx container.

## Questions & Struggles
- Vite environment variables (like `VITE_API_GATEWAY_URL`) are baked into the static assets during `npm run build`. This means changing the gateway URL at runtime inside the container requires rebuilding the image or using shell replacement scripts inside the container at start. I want to look into how this is typically handled in production.

## For Tomorrow's Standup
- Ready for Day 17! We will combine this frontend container with the backend containers (Oracle, Redis, Gateway, Services) under a unified `docker-compose.yml` file.
