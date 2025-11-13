# API Service Layer

API Service Layer cung cấp cách tiếp cận có tổ chức để gọi API backend từ frontend.

## 📁 Cấu Trúc

```
src/services/api/
├── apiClient.js          # Axios instance với interceptors
├── endpoints.js          # Định nghĩa tất cả API endpoints
├── index.js              # Export tất cả services
├── dashboardService.js   # Dashboard API calls
├── carriersService.js    # Carriers API calls
├── transportService.js   # Transport API calls
├── locationsService.js   # Locations API calls
└── employeesService.js   # Employees API calls
```

## 🚀 Sử Dụng

### Import Service

```javascript
// Import service cụ thể
import { getCarriers, createCarrier } from '@/services/api/carriersService';

// Hoặc import từ index
import { carriersService } from '@/services/api';
```

### Sử dụng với React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCarriers, createCarrier } from '@/services/api/carriersService';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['carriers'],
  queryFn: getCarriers,
});

// Mutation
const mutation = useMutation({
  mutationFn: createCarrier,
  onSuccess: () => {
    queryClient.invalidateQueries(['carriers']);
  },
});
```

### Sử dụng trực tiếp (không dùng React Query)

```javascript
import { getCarriers } from '@/services/api/carriersService';

const fetchCarriers = async () => {
  try {
    const data = await getCarriers({ page: 1, limit: 10 });
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🔧 Cấu Hình

### API Base URL

API base URL được cấu hình trong `apiClient.js`:

```javascript
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:5050';
```

Thêm vào `.env`:

```
REACT_APP_API_URL=http://localhost:5050
```

### Authentication

Token được tự động thêm vào headers từ localStorage/sessionStorage:

```javascript
// Token được lấy từ:
localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
```

## 📝 Thêm Service Mới

1. Tạo file service mới trong `src/services/api/`
2. Import `apiClient` và `endpoints`
3. Export các functions
4. Thêm vào `index.js`

Ví dụ:

```javascript
// warehouseService.js
import apiClient from './apiClient';
import { warehouse } from './endpoints';

export const getWarehouseItems = async (params = {}) => {
  const response = await apiClient.get(warehouse.list(), { params });
  return response.data;
};

export default {
  getWarehouseItems,
};
```

## 🎯 Features

- ✅ Automatic error handling với toast notifications
- ✅ Request/Response logging trong development
- ✅ Automatic token injection
- ✅ TypeScript-ready (có thể thêm types sau)
- ✅ Centralized API configuration

## 📚 API Endpoints

Xem `endpoints.js` để biết tất cả endpoints có sẵn.

## 🔍 Debugging

Trong development mode, tất cả requests và responses được log ra console:

```
[API Request] GET /api/carriers
[API Response] GET /api/carriers { status: 200, data: {...} }
```
