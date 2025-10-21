# Quick Start Guide

## Running the Application

1. **Start the containers:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the containers:**
   ```bash
   docker-compose down
   ```

## Demo Credentials

### Colombo Branch
- Admin: `admin@colombo.skynest.lk` / `password123`
- Staff: `sanduni@colombo.skynest.lk` / `password123`
- Staff: `chamara@colombo.skynest.lk` / `password123`

### Kandy Branch
- Admin: `admin@kandy.skynest.lk` / `password123`
- Staff: `tharindu@kandy.skynest.lk` / `password123`
- Staff: `nadeeka@kandy.skynest.lk` / `password123`

### Galle Branch
- Admin: `admin@galle.skynest.lk` / `password123`
- Staff: `dilini@galle.skynest.lk` / `password123`
- Staff: `kasun@galle.skynest.lk` / `password123`

## Environment Setup

The `.env` file contains database credentials for Aiven MySQL and other configuration.
Make sure all variables are properly set before running.

## Troubleshooting

- If ports are in use, check running containers: `docker ps`
- To rebuild containers: `docker-compose up -d --build`
- To reset everything: `docker-compose down -v`
