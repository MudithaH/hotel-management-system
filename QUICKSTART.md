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

### Branch 1
- Admin: `admin@branch1.com` / `password123`
- Staff: `sarah@branch1.com` / `password123`

### Branch 2
- Admin: `admin@branch2.com` / `password123`
- Staff: `david@branch2.com` / `password123`

### Branch 3
- Admin: `admin@branch3.com` / `password123`
- Staff: `maria@branch3.com` / `password123`

## Environment Setup

The `.env` file contains database credentials for Aiven MySQL and other configuration.
Make sure all variables are properly set before running.

## Troubleshooting

- If ports are in use, check running containers: `docker ps`
- To rebuild containers: `docker-compose up -d --build`
- To reset everything: `docker-compose down -v`
