#!/bin/bash

# Script untuk deployment dan troubleshooting kelas tidak muncul
# Author: AI Assistant
# Date: 2026-01-06

echo "=========================================="
echo "🚀 Deployment & Fix Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Kelas Data
echo -e "${YELLOW}Step 1: Checking Kelas Data...${NC}"
php artisan check:kelas
echo ""

# Step 2: Build Frontend
echo -e "${YELLOW}Step 2: Building Frontend Assets...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
echo ""

# Step 3: Clear All Caches
echo -e "${YELLOW}Step 3: Clearing Caches...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize
echo -e "${GREEN}✓ All caches cleared${NC}"
echo ""

# Step 4: Set Permissions (Linux/Mac only)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}Step 4: Setting Permissions...${NC}"
    chmod -R 775 storage
    chmod -R 775 bootstrap/cache
    echo -e "${GREEN}✓ Permissions set${NC}"
    echo ""
fi

# Step 5: Check Laravel Log
echo -e "${YELLOW}Step 5: Recent Laravel Logs...${NC}"
if [ -f storage/logs/laravel.log ]; then
    echo "Last 10 lines:"
    tail -n 10 storage/logs/laravel.log
else
    echo -e "${YELLOW}No log file found${NC}"
fi
echo ""

# Step 6: Test API Response
echo -e "${YELLOW}Step 6: Testing API Response...${NC}"
echo "Run this command manually to test:"
echo "php artisan tinker"
echo ">>> \App\Models\Kelas::with('prodi')->first()"
echo ""

# Final Instructions
echo "=========================================="
echo -e "${GREEN}✓ Deployment Script Completed!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Push ke git: git add . && git commit -m 'fix: kelas dropdown' && git push"
echo "2. Di production server, pull dan jalankan script ini"
echo "3. Restart web server: sudo systemctl restart nginx"
echo "4. Test di browser dengan DevTools Console terbuka"
echo ""
echo "Troubleshooting:"
echo "- Buka browser DevTools (F12)"
echo "- Pilih tab Console dan Network"
echo "- Buka halaman Mahasiswa"
echo "- Cek apakah ada error atau data kelas tidak dikirim"
echo ""
