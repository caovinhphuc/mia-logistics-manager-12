#!/bin/bash

# MIA Logistics Manager - Development Setup Script
echo "🚀 Setting up MIA Logistics Manager for development..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Setup environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created"
    print_warning "Please edit .env file with your Google Cloud credentials"
else
    print_status ".env file already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p temp
mkdir -p uploads
print_success "Directories created"

# Initialize test data
print_status "Setting up test data..."
cat > src/utils/initTestData.js << 'EOF'
import { initializeTestData } from '../test-data/testData';

// Initialize test data on app start in development
if (process.env.NODE_ENV === 'development') {
  initializeTestData();
  console.log('🧪 Test data initialized for development');
}
EOF

print_success "Test data setup completed"

# Setup git hooks (if git repository)
if [ -d ".git" ]; then
    print_status "Setting up git hooks..."

    # Install husky if not already installed
    if [ ! -d ".husky" ]; then
        npx husky install
        npx husky add .husky/pre-commit "npm run lint && npm test -- --watchAll=false"
        npx husky add .husky/pre-push "npm run build"
    fi

    print_success "Git hooks setup completed"
fi

# Create development scripts
print_status "Creating development helper scripts..."

# Create quick start script
cat > dev-start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting MIA Logistics Manager in development mode..."
export NODE_ENV=development
export BROWSER=none
npm start
EOF
chmod +x dev-start.sh

# Create test script
cat > run-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests for MIA Logistics Manager..."
npm test -- --coverage --watchAll=false
EOF
chmod +x run-tests.sh

# Create lint script
cat > lint-fix.sh << 'EOF'
#!/bin/bash
echo "🔧 Running linter and fixing issues..."
npm run lint:fix
npm run format
EOF
chmod +x lint-fix.sh

print_success "Development scripts created"

# Setup VS Code configuration (if VS Code is used)
if command -v code &> /dev/null || [ -d ".vscode" ]; then
    print_status "Setting up VS Code configuration..."

    mkdir -p .vscode

    # Create settings.json
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.js": "javascriptreact"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
EOF

    # Create extensions.json
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
EOF

    # Create launch.json for debugging
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
EOF

    print_success "VS Code configuration created"
fi

# Final instructions
echo ""
print_success "🎉 Development setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your Google Cloud credentials"
echo "   2. Setup Google Cloud Project (see docs/GOOGLE_CLOUD_SETUP.md)"
echo "   3. Create Google Spreadsheet (see docs/DEPLOYMENT.md)"
echo "   4. Run 'npm start' or './dev-start.sh' to start development server"
echo ""
echo "🔗 Useful commands:"
echo "   npm start          - Start development server"
echo "   npm test           - Run tests"
echo "   npm run build      - Build for production"
echo "   npm run lint       - Check code quality"
echo "   ./scripts/start.sh - Start with full logging"
echo ""
echo "📚 Documentation:"
echo "   README.md                     - Main documentation"
echo "   docs/DEPLOYMENT.md            - Deployment guide"
echo "   docs/GOOGLE_CLOUD_SETUP.md    - Google Cloud setup"
echo "   google-apps-script/README.md  - Apps Script setup"
echo ""
print_success "Happy coding! 🚀"
