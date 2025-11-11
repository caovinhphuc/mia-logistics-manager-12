#!/bin/bash

# MIA Logistics Manager - Environment Variables Setup
# ===================================================

echo "🔧 MIA Logistics Manager - Environment Variables Setup"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show current environment
show_current_env() {
    echo -e "${BLUE}Current Environment Variables:${NC}"
    echo ""

    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ .env file exists${NC}"
        echo ""
        echo "Key variables:"
        grep -E "REACT_APP_GOOGLE_|REACT_APP_USE_MOCK_DATA|REACT_APP_ENABLE_" .env | head -10
    else
        echo -e "${RED}❌ .env file not found${NC}"
    fi
    echo ""
}

# Function to create .env from template
create_env_file() {
    echo -e "${YELLOW}Creating .env file from template...${NC}"

    if [ -f "production.env" ]; then
        cp production.env .env
        echo -e "${GREEN}✅ Created .env from production.env${NC}"
    else
        echo -e "${RED}❌ production.env not found${NC}"
        return 1
    fi
}

# Function to prompt for Google credentials
prompt_google_credentials() {
    echo -e "${YELLOW}Please provide your Google API credentials:${NC}"
    echo ""

    # Google Client ID
    read -p "Google Client ID (REACT_APP_GOOGLE_CLIENT_ID): " google_client_id
    if [ -n "$google_client_id" ]; then
        sed -i.bak "s/your-production-client-id.apps.googleusercontent.com/$google_client_id/g" .env
        echo -e "${GREEN}✅ Updated Google Client ID${NC}"
    fi

    # Google API Key
    read -p "Google API Key (REACT_APP_GOOGLE_API_KEY): " google_api_key
    if [ -n "$google_api_key" ]; then
        sed -i.bak "s/your-production-api-key/$google_api_key/g" .env
        echo -e "${GREEN}✅ Updated Google API Key${NC}"
    fi

    # Google Drive Folder ID (optional)
    read -p "Google Drive Folder ID (REACT_APP_GOOGLE_DRIVE_FOLDER_ID) [optional]: " google_drive_folder_id
    if [ -n "$google_drive_folder_id" ]; then
        sed -i.bak "s/your-drive-folder-id/$google_drive_folder_id/g" .env
        echo -e "${GREEN}✅ Updated Google Drive Folder ID${NC}"
    fi

    echo ""
}

# Function to validate environment
validate_environment() {
    echo -e "${YELLOW}Validating environment configuration...${NC}"

    local errors=0

    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ .env file not found${NC}"
        errors=$((errors + 1))
    fi

    # Check Google Client ID
    if grep -q "your-production-client-id" .env; then
        echo -e "${RED}❌ Google Client ID not configured${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✅ Google Client ID configured${NC}"
    fi

    # Check Google API Key
    if grep -q "your-production-api-key" .env; then
        echo -e "${RED}❌ Google API Key not configured${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✅ Google API Key configured${NC}"
    fi

    # Check Spreadsheet ID
    if grep -q "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As" .env; then
        echo -e "${GREEN}✅ Google Spreadsheet ID configured${NC}"
    else
        echo -e "${RED}❌ Google Spreadsheet ID not found${NC}"
        errors=$((errors + 1))
    fi

    # Check Mock Data setting
    if grep -q "REACT_APP_USE_MOCK_DATA=false" .env; then
        echo -e "${GREEN}✅ Mock data disabled (using real Google Sheets)${NC}"
    else
        echo -e "${YELLOW}⚠️  Mock data setting not found${NC}"
    fi

    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ Environment configuration is valid${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment configuration has $errors errors${NC}"
        return 1
    fi
}

# Function to test configuration
test_configuration() {
    echo -e "${YELLOW}Testing configuration...${NC}"

    # Test build
    echo -e "${BLUE}Testing build...${NC}"
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    fi

    # Test environment variables in build
    echo -e "${BLUE}Testing environment variables in build...${NC}"
    if grep -q "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As" build/static/js/*.js; then
        echo -e "${GREEN}✅ Spreadsheet ID found in build${NC}"
    else
        echo -e "${YELLOW}⚠️  Spreadsheet ID not found in build${NC}"
    fi

    return 0
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Environment setup completed!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Test local development:"
    echo "   npm start"
    echo ""
    echo "2. Test production build:"
    echo "   npm run build"
    echo "   npx serve -s build -l 3000"
    echo ""
    echo "3. Deploy to hosting platform:"
    echo "   ./deploy.sh"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "- Make sure to configure the same environment variables in your hosting platform"
    echo "- Test Google Sheets connection after deployment"
    echo "- Monitor the application for any issues"
    echo ""
}

# Main execution
echo "Step 1: Checking current environment..."
show_current_env

echo "Step 2: Creating .env file..."
if [ ! -f ".env" ]; then
    create_env_file
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ $overwrite =~ ^[Yy]$ ]]; then
        create_env_file
    fi
fi

echo ""
echo "Step 3: Configuring Google credentials..."
prompt_google_credentials

echo ""
echo "Step 4: Validating configuration..."
if validate_environment; then
    echo ""
    echo "Step 5: Testing configuration..."
    if test_configuration; then
        show_next_steps
    else
        echo -e "${RED}❌ Configuration test failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Environment validation failed${NC}"
    echo -e "${YELLOW}Please fix the errors and run the script again${NC}"
    exit 1
fi
