# 🗺️ Roadmap - Các Bước Tiếp Theo

## ✅ Đã Hoàn Thành

1. ✅ Sửa lỗi package.json (xóa duplicate, dependencies không cần)
2. ✅ Fix Telegram API endpoint (thêm POST handler)
3. ✅ Cấu hình Telegram trong backend/.env
4. ✅ Phân tích dependencies và tối ưu

---

## 🎯 Ưu Tiên Cao - Cần Làm Ngay

### 1. **Tạo API Service Layer cho Frontend** ⭐⭐⭐

**Vấn đề**: Frontend chưa có cách gọi API backend một cách có tổ chức

**Cần làm**:

- Tạo `src/services/api/apiClient.js` - Axios instance với config
- Tạo `src/services/api/endpoints.js` - Định nghĩa tất cả API endpoints
- Tạo các service files:
  - `src/services/api/transportService.js`
  - `src/services/api/carriersService.js`
  - `src/services/api/dashboardService.js`
  - `src/services/api/warehouseService.js`

**Lợi ích**:

- Centralized API calls
- Dễ maintain và test
- Có thể thêm interceptors (auth, error handling)

---

### 2. **Implement Data Fetching cho Dashboard** ⭐⭐⭐

**Vấn đề**: Dashboard đang dùng mock data, chưa fetch từ backend

**Cần làm**:

- Tạo React Query hooks cho Dashboard:
  - `useDashboardStats()` - Lấy thống kê tổng quan
  - `useRecentActivities()` - Lấy hoạt động gần đây
  - `useTransportSummary()` - Tóm tắt vận chuyển
- Thay thế mock data trong `Dashboard.jsx`
- Thêm loading states và error handling

**API Endpoints cần**:

- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/activities` - Hoạt động gần đây
- `GET /api/transports/summary` - Tóm tắt vận chuyển

---

### 3. **Tạo Backend API Endpoints cho Dashboard** ⭐⭐

**Vấn đề**: Backend chưa có endpoints cho Dashboard

**Cần làm**:

- Tạo `backend/src/routes/dashboardRoutes.js`
- Implement các endpoints:

  ```javascript
  GET /api/dashboard/stats
  GET /api/dashboard/activities
  GET /api/dashboard/transport-summary
  ```

- Tích hợp với database/models hiện có
- Thêm vào `backend/src/routes/router.js`

---

## 🔧 Ưu Tiên Trung Bình

### 4. **Tối Ưu Dependencies - Moment vs Date-fns** ⭐⭐

**Vấn đề**: Có cả `moment`, `moment-timezone` và `date-fns`

**Cần làm**:

- Kiểm tra xem `moment` có được sử dụng không
- Nếu không, xóa `moment` và `moment-timezone`
- Chỉ giữ `date-fns` (nhẹ hơn, tree-shakeable)

**Lợi ích**: Giảm bundle size ~200KB

---

### 5. **Test API Endpoints** ⭐⭐

**Cần làm**:

- Test tất cả endpoints hiện có
- Tạo test suite cho API
- Kiểm tra error handling

**Scripts có sẵn**:

- `test-all-apis.sh` - Có thể cần update

---

### 6. **Implement Data Fetching cho các Pages khác** ⭐

**Các pages cần implement**:

- Transport pages (carriers, requests, transfers)
- Warehouse management
- Staff management
- Partners management

**Cách làm**: Tương tự Dashboard, dùng React Query hooks

---

## 🚀 Ưu Tiên Thấp - Cải Thiện

### 7. **Thay thế react-beautiful-dnd** ⭐

**Vấn đề**: Package không còn được maintain

**Giải pháp**: Chuyển sang `@dnd-kit/core`

---

### 8. **Cải thiện Error Handling** ⭐

**Cần làm**:

- Global error boundary
- API error handling với toast notifications
- Retry logic cho failed requests

---

### 9. **Thêm Loading States & Skeletons** ⭐

**Cần làm**:

- Skeleton loaders cho các pages
- Loading indicators
- Optimistic updates với React Query

---

## 📋 Checklist Thực Hiện

### Phase 1: API Infrastructure (Ưu tiên cao)

- [ ] Tạo `src/services/api/apiClient.js`
- [ ] Tạo `src/services/api/endpoints.js`
- [ ] Tạo dashboard service
- [ ] Tạo transport service
- [ ] Tạo carriers service

### Phase 2: Dashboard Integration (Ưu tiên cao)

- [ ] Tạo backend dashboard routes
- [ ] Implement dashboard endpoints
- [ ] Tạo React Query hooks cho Dashboard
- [ ] Update Dashboard.jsx với real data
- [ ] Test Dashboard với real API

### Phase 3: Optimization (Ưu tiên trung bình)

- [ ] Xóa moment dependencies
- [ ] Test tất cả API endpoints
- [ ] Update test scripts

### Phase 4: Other Pages (Ưu tiên thấp)

- [ ] Implement data fetching cho Transport
- [ ] Implement data fetching cho Warehouse
- [ ] Implement data fetching cho Staff
- [ ] Implement data fetching cho Partners

---

## 🎯 Bước Tiếp Theo Ngay (Recommended)

**Tôi đề xuất bắt đầu với:**

1. **Tạo API Service Layer** (30 phút)
   - Tạo apiClient.js với Axios config
   - Tạo endpoints.js với tất cả API paths
   - Setup interceptors cho auth và errors

2. **Tạo Dashboard Backend Endpoints** (1 giờ)
   - Tạo dashboardRoutes.js
   - Implement 3 endpoints cơ bản
   - Test với Postman/curl

3. **Implement Dashboard Data Fetching** (1 giờ)
   - Tạo React Query hooks
   - Update Dashboard.jsx
   - Test end-to-end

**Tổng thời gian ước tính**: ~2.5 giờ

---

## 💡 Lưu Ý

- Bắt đầu với Dashboard vì đây là trang đầu tiên user thấy
- Sử dụng React Query đã có sẵn (@tanstack/react-query)
- Backend đã có sẵn structure, chỉ cần thêm routes
- Test từng bước một để đảm bảo không break

---

*Generated: $(date)*
