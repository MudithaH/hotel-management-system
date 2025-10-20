#!/bin/bash

# ====================================================================
# Script to Upload Database to Aiven
# ====================================================================
# Usage: ./upload_to_aiven.sh
# Make sure to fill in your Aiven connection details below
# ====================================================================

# AIVEN CONNECTION DETAILS
# Replace these with your actual Aiven connection details
AIVEN_HOST="skynest-database-databaseproject-616.b.aivencloud.com"
AIVEN_PORT="21937"
AIVEN_USER="avnadmin"
AIVEN_PASSWORD="AVNS_9ZKGn8oXGKK1XBypXSh"
AIVEN_DATABASE="defaultdb"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Aiven Database Upload Script${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}Error: mysql client is not installed${NC}"
    echo "Please install it using: sudo apt-get install mysql-client"
    exit 1
fi

# Check if SQL files exist
if [ ! -f "backend/schema.sql" ]; then
    echo -e "${RED}Error: backend/schema.sql not found${NC}"
    exit 1
fi

if [ ! -f "backend/complete_database_setup.sql" ]; then
    echo -e "${RED}Error: backend/complete_database_setup.sql not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Uploading schema.sql...${NC}"
mysql --host="$AIVEN_HOST" \
  --port="$AIVEN_PORT" \
  --user="$AIVEN_USER" \
  --password="$AIVEN_PASSWORD" \
  --ssl-mode=REQUIRED \
  "$AIVEN_DATABASE" < backend/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema uploaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to upload schema${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Uploading stored procedures...${NC}"
mysql --host="$AIVEN_HOST" \
  --port="$AIVEN_PORT" \
  --user="$AIVEN_USER" \
  --password="$AIVEN_PASSWORD" \
  --ssl-mode=REQUIRED \
  "$AIVEN_DATABASE" < backend/complete_database_setup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stored procedures uploaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to upload stored procedures${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Database upload completed!${NC}"
echo -e "${GREEN}================================${NC}"
