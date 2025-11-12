#!/bin/bash

echo "🧪 Testing MIA Logistics API Endpoints"
echo "======================================"

BASE_URL="http://localhost:5050"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        echo -e "${GREEN}✅ PASS${NC} ($response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} ($response)"
        ((FAILED++))
    fi
}

echo ""
echo "1️⃣  HEALTH & STATUS"
test_endpoint "GET" "/api/health" "Health Check"
test_endpoint "GET" "/api/google-sheets-auth/status" "Google Sheets Status"

echo ""
echo "2️⃣  AUTHENTICATION (9 endpoints)"
test_endpoint "POST" "/api/auth/login" "Login" '{"email":"admin@mia.vn","password":"password"}'
test_endpoint "GET" "/api/auth/me" "Get Current User"
test_endpoint "GET" "/api/auth/users" "Get All Users"

echo ""
echo "3️⃣  CARRIERS"
test_endpoint "GET" "/api/carriers" "Get All Carriers"

echo ""
echo "4️⃣  TRANSFERS"
test_endpoint "GET" "/api/transfers" "Get All Transfers"

echo ""
echo "5️⃣  LOCATIONS"
test_endpoint "GET" "/api/locations" "Get All Locations"

echo ""
echo "6️⃣  TRANSPORT REQUESTS"
test_endpoint "GET" "/api/transport-requests" "Get Transport Requests"

echo ""
echo "7️⃣  INBOUND DOMESTIC"
test_endpoint "GET" "/api/inbound/domestic" "Get Inbound Domestic"

echo ""
echo "8️⃣  INBOUND INTERNATIONAL"
test_endpoint "GET" "/api/inbound/international" "Get Inbound International"

echo ""
echo "9️⃣  ROLES"
test_endpoint "GET" "/api/roles" "Get All Roles"

echo ""
echo "🔟 EMPLOYEES"
test_endpoint "GET" "/api/employees" "Get All Employees"

echo ""
echo "1️⃣1️⃣ ROLE PERMISSIONS"
test_endpoint "GET" "/api/role-permissions" "Get Role Permissions"

echo ""
echo "1️⃣2️⃣ SETTINGS"
test_endpoint "GET" "/api/settings/volume-rules" "Get Volume Rules"

echo ""
echo "1️⃣3️⃣ GOOGLE SHEETS"
test_endpoint "GET" "/api/sheets/info" "Get Sheets Info"

echo ""
echo "1️⃣4️⃣ ADMIN"
test_endpoint "GET" "/api/admin/stats" "Get System Stats"
test_endpoint "GET" "/api/admin/sheets" "Get All Sheets"

echo ""
echo "1️⃣5️⃣ TELEGRAM"
test_endpoint "POST" "/api/telegram/test" "Test Telegram" '{"message":"Test from API"}'

echo ""
echo "======================================"
echo -e "📊 SUMMARY:"
echo -e "   ${GREEN}Passed: $PASSED${NC}"
echo -e "   ${RED}Failed: $FAILED${NC}"
echo -e "   Total: $((PASSED + FAILED))"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed!${NC}"
    exit 1
fi
