# 🐳 Docker Setup Guide - Hotel Management System

This guide explains how to run the Hotel Management System using Docker containers for the frontend and backend, while keeping the MySQL database running locally on your host machine.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Detailed Setup](#detailed-setup)
6. [Docker Commands Reference](#docker-commands-reference)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## 🎯 Overview

### What Gets Dockerized?

✅ **Frontend** - React/Vite application served by Nginx  
✅ **Backend** - Node.js/Express API server  
❌ **Database** - MySQL runs locally on your host machine

### Why This Approach?

- **Database Persistence**: Your data stays on your local machine
- **Easy Database Management**: Use familiar MySQL tools
- **Performance**: Direct database access without container overhead
- **Development Flexibility**: Easy to switch between Docker and local development

---

## 📦 Prerequisites

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download: https://www.docker.com/products/docker-desktop
   - Version: 20.10+ recommended

2. **Docker Compose**
   - Included with Docker Desktop
   - Linux users: Install separately

3. **MySQL Server** (Running locally)
   - Version: 8.0+ recommended
   - Must be running on port 3306
   - Database `hotel_management` must exist

### Verify Installation

```powershell
# Check Docker version
docker --version
# Should show: Docker version 20.10.x or higher

# Check Docker Compose version
docker-compose --version
# Should show: Docker Compose version 2.x.x or higher

# Check MySQL is running
mysql --version
# Should show: mysql Ver 8.0.x
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR HOST MACHINE                       │
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │  Frontend       │         │  Backend        │            │
│  │  Container      │         │  Container      │            │
│  │  (Nginx:Alpine) │         │  (Node:Alpine)  │            │
│  │  Port: 3000→80  │────────▶│  Port: 5000     │            │
│  └─────────────────┘         └────────┬────────┘            │
│                                       │                      │
│                                       │ host.docker.internal │
│                                       │                      │
│                              ┌────────▼────────┐            │
│                              │  MySQL Database │            │
│                              │  (Local)        │            │
│                              │  Port: 3306     │            │
│                              └─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Port Mapping

| Service  | Container Port | Host Port | Access URL |
|----------|---------------|-----------|------------|
| Frontend | 80            | 3000      | http://localhost:3000 |
| Backend  | 5000          | 5000      | http://localhost:5000 |
| MySQL    | -             | 3306      | localhost:3306 (local) |

---

## 🚀 Quick Start

### Step 1: Prepare Database

```powershell
# Start MySQL service (if not running)
# Windows (run as Administrator):
net start MySQL80

# Import database schema
cd backend
mysql -u root -p hotel_management < schema.sql

# Optionally seed with sample data
mysql -u root -p hotel_management < complete_database_setup.sql
```

### Step 2: Configure Environment

```powershell
# Create root .env file from template
cd ..
copy .env.example .env

# Edit .env and set your values:
# - DB_PASSWORD=your_mysql_password
# - JWT_SECRET=generate_a_secure_random_string
```

### Step 3: Build and Run

```powershell
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Default Login Credentials

- **Admin**: `admin@branch1.com` / `password123`
- **Staff**: `sarah@branch1.com` / `password123`

---

## 📚 Detailed Setup

### 1. Database Setup (One-time)

#### Create Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS hotel_management;

-- Verify
SHOW DATABASES;

-- Exit
exit;
```

#### Import Schema

```powershell
# Method 1: Import schema only
cd backend
mysql -u root -p hotel_management < schema.sql

# Method 2: Import schema + sample data
mysql -u root -p hotel_management < complete_database_setup.sql
```

#### Verify Tables

```sql
mysql -u root -p hotel_management

-- Show all tables
SHOW TABLES;
-- Should show 13 tables

-- Check a sample table
DESCRIBE staff;

-- Exit
exit;
```

### 2. Environment Configuration

#### Root .env File

Create `.env` in the project root:

```env
# Database credentials (for local MySQL)
DB_USER=root
DB_PASSWORD=your_actual_password

# JWT Secret (generate a secure random string)
JWT_SECRET=use_a_very_long_random_string_here_32_chars_minimum
```

**Generate Secure JWT Secret:**

```powershell
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Backend .env File (Optional)

If you want to run backend locally (not in Docker), create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Building Docker Images

#### Build Both Services

```powershell
# Build both frontend and backend
docker-compose build

# Build with no cache (clean build)
docker-compose build --no-cache

# Build specific service
docker-compose build backend
docker-compose build frontend
```

#### View Built Images

```powershell
# List all Docker images
docker images

# You should see:
# - test-hotel-management-database-project-backend
# - test-hotel-management-database-project-frontend
```

### 4. Running Containers

#### Start Services

```powershell
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start specific service
docker-compose up backend
docker-compose up frontend
```

#### Monitor Containers

```powershell
# View running containers
docker-compose ps

# View logs (all services)
docker-compose logs

# View logs (specific service)
docker-compose logs backend
docker-compose logs frontend

# Follow logs (real-time)
docker-compose logs -f backend
```

### 5. Stopping Containers

```powershell
# Stop all services (containers remain)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove images
docker-compose down --rmi all

# Stop, remove everything including volumes
docker-compose down -v --rmi all
```

---

## 📖 Docker Commands Reference

### Container Management

```powershell
# Start services
docker-compose up                    # Foreground
docker-compose up -d                 # Background
docker-compose up --build            # Rebuild and start

# Stop services
docker-compose stop                  # Stop containers
docker-compose down                  # Stop and remove containers

# Restart services
docker-compose restart               # Restart all
docker-compose restart backend       # Restart specific service

# View status
docker-compose ps                    # List containers
docker-compose top                   # Show running processes
```

### Logs and Debugging

```powershell
# View logs
docker-compose logs                  # All services
docker-compose logs -f               # Follow logs (real-time)
docker-compose logs -f backend       # Follow specific service
docker-compose logs --tail=100       # Last 100 lines

# Execute commands in container
docker-compose exec backend sh       # Open shell in backend
docker-compose exec backend node -v  # Run command in backend

# View container details
docker inspect hotel-backend         # Backend container info
docker inspect hotel-frontend        # Frontend container info
```

### Image Management

```powershell
# Build images
docker-compose build                 # Build all
docker-compose build --no-cache      # Clean build
docker-compose build backend         # Build specific service

# List images
docker images                        # All images
docker images | findstr hotel        # Filter hotel-related

# Remove images
docker rmi hotel-backend            # Remove specific image
docker-compose down --rmi all       # Remove all project images
```

### Health Checks

```powershell
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:5000/api/health    # Backend
curl http://localhost:3000                # Frontend

# View health check logs
docker inspect hotel-backend | findstr Health
```

### Network Management

```powershell
# List networks
docker network ls

# Inspect project network
docker network inspect hotel-management-network

# Remove unused networks
docker network prune
```

### Volume Management (Future Use)

```powershell
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm volume_name
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Cannot Connect to Database

**Problem**: Backend container can't connect to local MySQL

**Solutions**:

```powershell
# A. Check MySQL is running
net start MySQL80

# B. Verify MySQL is listening on 3306
netstat -an | findstr 3306

# C. Check MySQL allows connections from Docker
# Edit MySQL config (my.ini or my.cnf)
# Set: bind-address = 0.0.0.0

# D. Verify .env has correct credentials
cat .env

# E. Test database connection from host
mysql -u root -p -h localhost hotel_management
```

#### 2. Port Already in Use

**Problem**: Port 3000 or 5000 is already in use

**Solutions**:

```powershell
# Find process using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <process_id> /F

# Or change ports in docker-compose.yml
# Example: "3001:80" instead of "3000:80"
```

#### 3. Build Failures

**Problem**: Docker build fails

**Solutions**:

```powershell
# Clean build (no cache)
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config

# Remove old images and rebuild
docker-compose down --rmi all
docker-compose up --build

# Check disk space
docker system df
docker system prune  # Clean up
```

#### 4. Container Keeps Restarting

**Problem**: Container starts but immediately restarts

**Solutions**:

```powershell
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check health status
docker-compose ps

# Run container without restart policy
docker-compose up --no-deps backend

# Verify environment variables
docker-compose config
```

#### 5. CORS Errors

**Problem**: Frontend can't communicate with backend

**Solutions**:

```powershell
# A. Verify backend CORS is configured correctly
# In docker-compose.yml, ensure:
# FRONTEND_URL: http://localhost:3000

# B. Check backend is accessible
curl http://localhost:5000/api/health

# C. Verify frontend is making requests to correct URL
# Should be: http://localhost:5000/api/...
```

#### 6. Frontend Shows Blank Page

**Problem**: Frontend doesn't load properly

**Solutions**:

```powershell
# Check nginx logs
docker-compose logs frontend

# Verify frontend built correctly
docker-compose exec frontend ls /usr/share/nginx/html

# Check browser console for errors
# Open Developer Tools (F12) in browser

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 7. Database Changes Not Reflected

**Problem**: Schema changes don't appear in application

**Solutions**:

```powershell
# Restart backend container
docker-compose restart backend

# Clear any cached connections
docker-compose down
docker-compose up -d

# Verify schema in database
mysql -u root -p hotel_management
SHOW TABLES;
DESCRIBE table_name;
```

---

## 🌍 Production Deployment

### Docker Hub Deployment

#### 1. Tag Images

```powershell
# Tag backend
docker tag test-hotel-management-database-project-backend:latest yourusername/hotel-backend:latest

# Tag frontend
docker tag test-hotel-management-database-project-frontend:latest yourusername/hotel-frontend:latest
```

#### 2. Push to Docker Hub

```powershell
# Login to Docker Hub
docker login

# Push images
docker push yourusername/hotel-backend:latest
docker push yourusername/hotel-frontend:latest
```

#### 3. Pull on Production Server

```powershell
# Pull images
docker pull yourusername/hotel-backend:latest
docker pull yourusername/hotel-frontend:latest

# Run with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: yourusername/hotel-backend:latest
    restart: always
    ports:
      - "5000:5000"
    environment:
      DB_HOST: host.docker.internal
      DB_PORT: 3306
      DB_NAME: hotel_management
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRE: 7d
      PORT: 5000
      NODE_ENV: production
      FRONTEND_URL: https://your-domain.com
    extra_hosts:
      - "host.docker.internal:host-gateway"

  frontend:
    image: yourusername/hotel-frontend:latest
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Production Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure firewall rules
- [ ] Set up proper logging and monitoring
- [ ] Use environment-specific .env files
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up health check monitoring
- [ ] Use Docker secrets for sensitive data
- [ ] Configure proper restart policies
- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Enable container resource limits

---

## 📊 Docker Image Details

### Backend Image

- **Base Image**: `node:18-alpine`
- **Size**: ~150MB
- **Exposed Port**: 5000
- **Health Check**: `/api/health` endpoint
- **User**: Non-root (nodejs)

### Frontend Image

- **Stage 1**: `node:18-alpine` (builder)
- **Stage 2**: `nginx:alpine` (production)
- **Size**: ~25MB
- **Exposed Port**: 80
- **Health Check**: Root URL
- **User**: Non-root (nginx-user)

---

## 🛡️ Security Best Practices

1. **Non-root Users**: Both containers run as non-root users
2. **Multi-stage Builds**: Frontend uses multi-stage to reduce size
3. **Health Checks**: Both services have health monitoring
4. **.dockerignore**: Excludes sensitive files from images
5. **Environment Variables**: Sensitive data in .env (not committed)
6. **Minimal Base Images**: Alpine Linux for smaller attack surface
7. **Production Dependencies**: Backend only installs production deps
8. **Resource Limits**: Configure in production (CPU/memory limits)

---

## 📝 File Structure

```
project-root/
├── backend/
│   ├── Dockerfile                 # Backend container definition
│   ├── .dockerignore              # Files to exclude from build
│   ├── .env.example               # Backend env template
│   └── src/                       # Application code
│
├── frontend/
│   ├── Dockerfile                 # Frontend container definition
│   ├── .dockerignore              # Files to exclude from build
│   ├── nginx.conf                 # Nginx configuration
│   └── src/                       # Application code
│
├── docker-compose.yml             # Orchestration configuration
├── .env                           # Environment variables (create this)
├── .env.example                   # Environment template
└── DOCKER.md                      # This file
```

---

## 🔗 Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Nginx Docker Documentation](https://hub.docker.com/_/nginx)

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. View container logs: `docker-compose logs`
3. Check container status: `docker-compose ps`
4. Verify environment variables: `docker-compose config`

---

**Last Updated**: October 17, 2025  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.0+
