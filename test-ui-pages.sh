#!/bin/bash

echo "🖥️  Testing UI Pages"
echo "==================="

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASSED=0
FAILED=0

test_page() {
    local path=$1
    local name=$2

    echo -n "Testing $name ... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")

    if [ $response -eq 200 ]; then
        echo -e "${GREEN}✅ OK${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} ($response)"
        ((FAILED++))
    fi
}

echo ""
test_page "/" "Dashboard"
test_page "/login" "Login"
test_page "/maps" "Maps"
test_page "/transport/locations-saved" "Locations"
test_page "/inbound/domestic" "Inbound-Domestic"
test_page "/inbound/international" "Inbound-International"
test_page "/carriers" "Carriers"
test_page "/employees" "Employees"
test_page "/settings/roles" "Roles"
test_page "/settings/permissions" "Permissions"
test_page "/settings/users" "Users"
test_page "/reports" "Reports"

echo ""
echo "==================="
echo -e "📊 SUMMARY:"
echo -e "   ${GREEN}Passed: $PASSED${NC}"
echo -e "   ${RED}Failed: $FAILED${NC}"
echo "==================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ UI Test Complete${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some pages failed${NC}"
    exit 1
fi
