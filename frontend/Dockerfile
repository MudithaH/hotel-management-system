# ====================================================================
# Hotel Management System - Frontend Dockerfile
# ====================================================================
# Multi-stage build for optimized production image
# Stage 1: Build the React application
# Stage 2: Serve static files with nginx
# ====================================================================

# ====================================================================
# STAGE 1: Build Stage
# ====================================================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Debug: Print the env var value
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Build the application for production
# This creates optimized static files in the dist/ directory
RUN npm run build

# Debug: Check if the URL is in the built files
RUN grep -r "hotel-backend-production" /app/dist || echo "Railway URL not found in build!"

# ====================================================================
# STAGE 2: Production Stage
# ====================================================================
FROM nginx:alpine

# Copy custom nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage to nginx serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# Create nginx pid directory
RUN touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
