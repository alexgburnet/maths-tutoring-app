# 🧱 Stage 1: Build the React app
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .
RUN npm run build

# 🚀 Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy built app to NGINX's HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Use custom NGINX config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]