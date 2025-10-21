# ====================================================================
# Hotel Management System - Backend Dockerfile
# ====================================================================
# This Dockerfile creates a production-ready container for the 
# Express.js backend API server
# ====================================================================

# Use official Node.js LTS (Long Term Support) image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for layer caching optimization)
# Docker will cache this layer if package.json hasn't changed
COPY package*.json ./

# Install production dependencies only
# --omit=dev excludes devDependencies like nodemon
RUN npm ci --omit=dev

# Copy application source code
# This is done after npm install to leverage Docker layer caching
COPY . .

# Create a non-root user for security
# Running as root inside container is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
# This is just documentation, actual port mapping happens at runtime
EXPOSE 5000

# Health check to ensure container is running properly
# Docker will periodically check if the app is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment to production by default
ENV NODE_ENV=production

# Start the application
# Use node directly (not npm start) for better signal handling
CMD ["node", "src/server.js"]
