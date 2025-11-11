#!/bin/bash

# MIA Logistics Manager - Run GCP Deployment
# Script để chạy deployment sau khi đã setup gcloud

set -e

echo "🚀 MIA Logistics Manager - GCP Deployment Runner"
echo "================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Setup PATH
export PATH=$PATH:/Users/phuccao/google-cloud-sdk/bin

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not available. Please check installation."
    exit 1
fi

print_status "gcloud CLI is available"

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    print_warning "Not authenticated with gcloud"
    echo ""
    echo "To authenticate, please run:"
    echo "gcloud auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

print_status "User is authenticated with gcloud"

# Check if project exists
PROJECT_ID="mia-logistics-prod"
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    print_warning "Project $PROJECT_ID already exists"
    echo "Do you want to continue with existing project? (y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Set project
gcloud config set project $PROJECT_ID
print_status "Project set to $PROJECT_ID"

# Check billing
print_info "Checking billing status..."
if gcloud billing projects describe $PROJECT_ID &> /dev/null; then
    print_status "Billing is enabled"
else
    print_warning "Billing is not enabled"
    echo "Please enable billing for project $PROJECT_ID in Google Cloud Console"
    echo "Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    exit 1
fi

# Enable APIs
print_info "Enabling required APIs..."
APIS=(
    "sheets.googleapis.com"
    "drive.googleapis.com"
    "script.googleapis.com"
    "maps-backend.googleapis.com"
    "places-backend.googleapis.com"
    "directions-backend.googleapis.com"
    "distance-matrix-backend.googleapis.com"
    "geocoding-backend.googleapis.com"
    "geolocation.googleapis.com"
    "monitoring.googleapis.com"
)

for api in "${APIS[@]}"; do
    gcloud services enable $api
    print_status "Enabled $api"
done

# Create service account
SERVICE_ACCOUNT_NAME="mia-logistics-service"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

print_info "Creating service account..."
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    print_warning "Service account $SERVICE_ACCOUNT_NAME already exists"
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="MIA Logistics Service Account" \
        --description="Service account for MIA Logistics Manager"
    print_status "Service account $SERVICE_ACCOUNT_NAME created"
fi

# Grant roles
print_info "Granting roles to service account..."
ROLES=(
    "roles/sheets.editor"
    "roles/drive.file"
    "roles/script.developer"
)

for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role"
    print_status "Granted role $role to service account"
done

# Create service account key
print_info "Creating service account key..."
mkdir -p credentials

if [ -f "credentials/service-account-key.json" ]; then
    print_warning "Service account key already exists"
    echo "Do you want to create a new key? (y/n)"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        gcloud iam service-accounts keys create credentials/service-account-key.json \
            --iam-account=$SERVICE_ACCOUNT_EMAIL
        print_status "New service account key created"
    fi
else
    gcloud iam service-accounts keys create credentials/service-account-key.json \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    print_status "Service account key created"
fi

# Create API key for Maps
print_info "Creating API key for Maps..."
API_KEY_ID=$(gcloud alpha services api-keys create \
    --display-name="MIA Logistics Maps API Key" \
    --format="value(name)" \
    --quiet)

print_status "API key created: $API_KEY_ID"

# Get the actual API key value
API_KEY_VALUE=$(gcloud alpha services api-keys get-key-string $API_KEY_ID)
print_status "API key value: $API_KEY_VALUE"

# Restrict API key
gcloud alpha services api-keys update $API_KEY_ID \
    --api-target=maps-backend.googleapis.com \
    --api-target=places-backend.googleapis.com \
    --api-target=directions-backend.googleapis.com \
    --api-target=distance-matrix-backend.googleapis.com \
    --api-target=geocoding-backend.googleapis.com

print_status "API key restricted to Maps APIs"

# Update .env file
print_info "Updating .env file..."
if [ -f ".env" ]; then
    cp .env .env.backup
    print_status "Backed up existing .env file"
fi

cat > .env << EOF
# Google Cloud Platform Configuration
REACT_APP_GOOGLE_PROJECT_ID=$PROJECT_ID
REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_EMAIL

# Google APIs Configuration
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
REACT_APP_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
REACT_APP_GOOGLE_API_KEY=$API_KEY_VALUE
REACT_APP_GOOGLE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
REACT_APP_GOOGLE_APPS_SCRIPT_ID=YOUR_APPS_SCRIPT_ID_HERE
REACT_APP_APPS_SCRIPT_WEB_APP_URL=YOUR_WEB_APP_URL_HERE

# Feature Flags
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_ENABLE_GOOGLE_DRIVE=true

# Development Configuration
NODE_ENV=development
REACT_APP_ENV=development

# Google Maps Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=$API_KEY_VALUE

# Monitoring Configuration
REACT_APP_ENABLE_MONITORING=true
REACT_APP_MONITORING_PROJECT_ID=$PROJECT_ID
EOF

print_status "Updated .env file with GCP configuration"

# Test deployment
print_info "Testing deployment..."

# Test API access
if gcloud services list --enabled --filter="name:sheets.googleapis.com" | grep -q "sheets.googleapis.com"; then
    print_status "Google Sheets API is enabled"
else
    print_error "Google Sheets API is not enabled"
fi

if gcloud services list --enabled --filter="name:drive.googleapis.com" | grep -q "drive.googleapis.com"; then
    print_status "Google Drive API is enabled"
else
    print_error "Google Drive API is not enabled"
fi

if gcloud services list --enabled --filter="name:maps-backend.googleapis.com" | grep -q "maps-backend.googleapis.com"; then
    print_status "Google Maps API is enabled"
else
    print_error "Google Maps API is not enabled"
fi

if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    print_status "Service account is properly configured"
else
    print_error "Service account configuration failed"
fi

echo ""
print_status "GCP deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Complete OAuth 2.0 setup in Google Cloud Console"
echo "2. Setup Google Sheets and Drive structure in Apps Script"
echo "3. Update placeholder values in .env file"
echo "4. Test the application with: npm start"
echo ""
echo "Documentation:"
echo "- GOOGLE_CLOUD_SETUP.md: Detailed setup guide"
echo "- GOOGLE_SETUP_GUIDE.md: Basic setup guide"
echo "- GOOGLE_APIS_DEPLOYMENT.md: Deployment guide"
echo ""
print_warning "Keep your service account key and API keys secure!"
