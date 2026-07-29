# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Browser requests use Nginx's same-origin gateway proxy in Docker Compose.
ARG VITE_API_GATEWAY_URL=/gateway
ENV VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL}

# Build the production bundle
RUN npm run build

# Stage 2: Production server stage
FROM nginx:1.27-alpine AS runtime

# Copy the built static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
