#!/bin/bash

# MIA Logistics Manager - Phase 1 Setup Script
# Ngày: 18/08/2025
# Tác giả: Claude AI Assistant

echo "🚀 Bắt đầu setup MIA Logistics Manager - Phase 1"
echo "================================================"

# Kiểm tra Node.js version
echo "📋 Kiểm tra môi trường phát triển..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js >= 16"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version quá cũ. Cần >= 16, hiện tại: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Tạo dự án mới
echo ""
echo "📦 Tạo dự án React với TypeScript..."
read -p "Nhập tên dự án (mặc định: mia-logistics-manager): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-mia-logistics-manager}

# Kiểm tra thư mục đã tồn tại
if [ -d "$PROJECT_NAME" ]; then
    echo "❌ Thư mục $PROJECT_NAME đã tồn tại!"
    read -p "Bạn có muốn xóa và tạo lại? (y/N): " CONFIRM
    if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        rm -rf "$PROJECT_NAME"
    else
        echo "❌ Setup bị hủy"
        exit 1
    fi
fi

# Tạo dự án với Vite
npm create vite@latest "$PROJECT_NAME" -- --template react-ts
cd "$PROJECT_NAME"

echo ""
echo "📥 Cài đặt dependencies..."

# Cài đặt core dependencies
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-data-grid
npm install react-router-dom zustand @xstate/react xstate
npm install react-hook-form @hookform/resolvers yup
npm install axios react-query date-fns

# Cài đặt dev dependencies
npm install -D @types/react @types/react-dom @types/node
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

echo ""
echo "📁 Tạo cấu trúc thư mục..."

# Tạo cấu trúc thư mục
mkdir -p src/features/{shipments,orders,inventory,carriers,tracking}/{components,hooks,services,types}
mkdir -p src/shared/{components/{layout,forms,tables,ui},hooks,services,utils,types,constants}
mkdir -p src/assets/{images,icons}
mkdir -p src/styles
mkdir -p src/config
mkdir -p public/icons

echo ""
echo "⚙️ Tạo file cấu hình..."

# Tạo tsconfig.json với absolute imports
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/features/*": ["./features/*"],
      "@/shared/*": ["./shared/*"],
      "@/config/*": ["./config/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Cập nhật vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
EOF

# Tạo .eslintrc.js
cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOF

# Tạo .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Tạo .env.local template
cat > .env.local << 'EOF'
# Google APIs
REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Telegram Bot
REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
REACT_APP_TELEGRAM_CHAT_ID=your_telegram_chat_id

# Email Service
REACT_APP_EMAIL_SERVICE_URL=your_email_service_url
REACT_APP_EMAIL_API_KEY=your_email_api_key

# App Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_COMPANY_NAME=MIA.vn
EOF

# Cập nhật package.json scripts
npm pkg set scripts.lint="eslint src --ext .ts,.tsx --fix"
npm pkg set scripts.format="prettier --write src/**/*.{ts,tsx}"
npm pkg set scripts.type-check="tsc --noEmit"

echo ""
echo "📝 Tạo file core components..."

# Tạo theme configuration
cat > src/config/theme.ts << 'EOF'
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f57c00',
      light: '#ffb74d',
      dark: '#e65100',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
EOF

# Tạo common types
cat > src/shared/types/commonTypes.ts << 'EOF'
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

export interface Address {
  id?: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  company?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'vali' | 'balo' | 'tui-xach';
  size: 'S' | 'M' | 'L' | 'XL';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
  volumetricWeight: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}
EOF

# Tạo constants
cat > src/shared/constants/index.ts << 'EOF'
export const API_ENDPOINTS = {
  GOOGLE_SHEETS: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY,
  GOOGLE_MAPS: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  SHIPMENTS: '/shipments',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  CARRIERS: '/carriers',
  TRACKING: '/tracking',
} as const;

export const PRODUCT_CATEGORIES = {
  VALI: 'vali',
  BALO: 'balo',
  TUI_XACH: 'tui-xach',
} as const;

export const PRODUCT_SIZES = {
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
} as const;

export const SHIPMENT_STATUS = {
  PENDING: 'Chuẩn bị',
  IN_TRANSIT: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
} as const;
EOF

echo ""
echo "🎨 Tạo UI components cơ bản..."

# Tạo các placeholder components được tự động generate
echo "// Components sẽ được tạo từ artifacts..." > src/temp_components.txt

echo ""
echo "🔧 Setup Git repository..."

# Git setup
git init
echo "node_modules/
.env.local
.env.development.local
.env.test.local
.env.production.local
build/
dist/
.DS_Store
*.log" > .gitignore

git add .
git commit -m "feat: initial project setup with React, TypeScript, MUI

- Setup Vite + React + TypeScript
- Configure Material UI theme
- Setup Zustand state management
- Configure React Router
- Add ESLint and Prettier
- Create feature-based folder structure
- Add environment configuration"

echo ""
echo "✅ Phase 1 setup hoàn thành!"
echo "================================================"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Cập nhật .env.local với API keys thực tế"
echo "2. Copy các components từ artifacts vào thư mục tương ứng"
echo "3. Chạy npm run dev để kiểm tra"
echo "4. Test navigation và responsive design"
echo ""
echo "🚀 Để chạy ứng dụng:"
echo "   cd $PROJECT_NAME"
echo "   npm run dev"
echo ""
echo "🔧 Scripts có sẵn:"
echo "   npm run dev      - Chạy development server"
echo "   npm run build    - Build production"
echo "   npm run lint     - Kiểm tra linting"
echo "   npm run format   - Format code"
echo "   npm run type-check - Kiểm tra TypeScript"
echo ""
echo "📄 Tài liệu tiếp theo: Xem artifacts để có hướng dẫn chi tiết Phase 1"
