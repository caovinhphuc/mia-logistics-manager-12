# Phân Tích Dependencies - MIA Logistics Manager

## 📋 Tổng Quan

### Frontend (Root package.json)

- **Node Version**: >=16.0.0
- **NPM Version**: >=8.0.0
- **Total Dependencies**: ~70 packages
- **Total DevDependencies**: ~15 packages

### Backend (backend/package.json)

- **Node Version**: >=16.0.0
- **NPM Version**: >=8.0.0
- **Total Dependencies**: ~15 packages
- **Total DevDependencies**: ~3 packages

---

## ⚠️ VẤN ĐỀ PHÁT HIỆN

### 1. **Lỗi Cú Pháp trong Scripts (Frontend)**

```json
"axios": "^1.12.2",  // ❌ LỖI: Đây không phải là script, nó đã có trong dependencies
```

**Vị trí**: `package.json` dòng 25
**Vấn đề**: `axios` được đặt trong `scripts` thay vì `dependencies`
**Giải pháp**: Xóa dòng này (đã có trong dependencies ở dòng 55)

### 2. **Duplicate React Query Packages**

```json
"@tanstack/react-query": "^5.90.8",     // ✅ Mới (nên dùng)
"react-query": "^3.39.3",              // ❌ Cũ (nên xóa)
```

**Vấn đề**: Có cả 2 version của React Query
**Giải pháp**: Xóa `react-query` (cũ), chỉ giữ `@tanstack/react-query`

### 3. **Dependencies Không Cần Thiết cho Frontend**

#### ❌ `express` (^5.1.0)

- **Lý do**: Express là server framework, không cần cho React app
- **Nơi sử dụng**: Không tìm thấy trong `src/`
- **Hành động**: Xóa khỏi dependencies

#### ❌ `@google-cloud/storage` (^7.7.0)

- **Lý do**: Google Cloud Storage SDK cho server-side
- **Nơi sử dụng**: Cần kiểm tra
- **Hành động**: Nếu không dùng, xóa khỏi dependencies

#### ❌ `formidable` (^3.5.4)

- **Lý do**: File upload parser cho Node.js
- **Nơi sử dụng**: Cần kiểm tra
- **Hành động**: Nếu không dùng, xóa khỏi dependencies

### 4. **Dependencies Có Thể Tối Ưu**

#### ⚠️ `moment` + `moment-timezone` + `date-fns`

- **Vấn đề**: Có cả 2 thư viện xử lý date
- **Khuyến nghị**: Chỉ dùng `date-fns` (nhẹ hơn, tree-shakeable)

#### ⚠️ `react-beautiful-dnd` (^13.1.1)

- **Vấn đề**: Package này đã không còn được maintain
- **Khuyến nghị**: Chuyển sang `@dnd-kit/core` hoặc `react-dnd`

---

## ✅ DEPENDENCIES ĐÚNG

### Frontend Core

- ✅ `react` (^18.2.0)
- ✅ `react-dom` (^18.2.0)
- ✅ `react-router-dom` (^6.30.1)
- ✅ `react-scripts` (^5.0.1)

### UI Framework

- ✅ `@mui/material` (^5.18.0)
- ✅ `@mui/icons-material` (^5.18.0)
- ✅ `@mui/x-data-grid` (^6.20.4)
- ✅ `@mui/x-date-pickers` (^6.18.2)

### State Management & Data Fetching

- ✅ `@tanstack/react-query` (^5.90.8) - **Nên dùng**
- ✅ `axios` (^1.13.2)
- ✅ `zustand` (^5.0.8)

### Google Integration

- ✅ `googleapis` (^128.0.0)
- ✅ `google-auth-library` (^9.15.1)

### Backend Dependencies

- ✅ `express` (^4.19.2) - **Đúng cho backend**
- ✅ `cors` (^2.8.5)
- ✅ `helmet` (^7.1.0)
- ✅ `socket.io` (^4.7.5)
- ✅ `node-telegram-bot-api` (^0.66.0)

---

## 📊 SO SÁNH VERSIONS

### Google APIs

| Package | Frontend | Backend | Status |
|---------|----------|---------|--------|
| `googleapis` | ^128.0.0 | ^128.0.0 | ✅ Đồng bộ |
| `google-auth-library` | ^9.15.1 | ^9.15.1 | ✅ Đồng bộ |

### Express

| Package | Frontend | Backend | Status |
|---------|----------|---------|--------|
| `express` | ^5.1.0 ❌ | ^4.19.2 ✅ | ⚠️ Frontend không cần |

### UUID

| Package | Frontend | Backend | Status |
|---------|----------|---------|--------|
| `uuid` | ^9.0.1 | ^9.0.1 | ✅ Đồng bộ |

---

## 🔧 KHUYẾN NGHỊ

### 1. **Sửa Lỗi Ngay**

```bash
# Xóa axios khỏi scripts
# Xóa react-query (cũ)
# Xóa express, @google-cloud/storage, formidable khỏi frontend
```

### 2. **Tối Ưu Dependencies**

- Xóa `moment` và `moment-timezone` nếu chỉ dùng `date-fns`
- Thay `react-beautiful-dnd` bằng `@dnd-kit/core`

### 3. **Kiểm Tra Sử Dụng**

```bash
# Kiểm tra xem các package có được sử dụng không
grep -r "express" src/
grep -r "@google-cloud/storage" src/
grep -r "formidable" src/
```

### 4. **Cập Nhật Package Lock**

Sau khi sửa, chạy:

```bash
npm install
# Hoặc
npm ci
```

---

## 📝 SCRIPTS ANALYSIS

### Frontend Scripts

- ✅ `start`: React dev server
- ✅ `build`: Production build
- ✅ `test`: Jest tests
- ✅ `dev:frontend`: Custom dev với port config
- ✅ `dev:backend`: Backend dev server
- ⚠️ `axios`: **LỖI** - Không phải script

### Backend Scripts

- ✅ `start`: Production server
- ✅ `dev`: Development với nodemon
- ✅ `lint`: ESLint check
- ✅ `lint:fix`: ESLint auto-fix

---

## 🎯 HÀNH ĐỘNG CẦN THỰC HIỆN

1. **Sửa package.json frontend**:
   - Xóa dòng `"axios": "^1.12.2"` trong scripts
   - Xóa `"react-query": "^3.39.3"` khỏi dependencies
   - Xóa `express`, `@google-cloud/storage`, `formidable` nếu không dùng

2. **Kiểm tra sử dụng**:
   - Tìm xem có file nào import các package không cần thiết không
   - Xóa các import không dùng

3. **Cập nhật dependencies**:
   - Chạy `npm install` để cập nhật package-lock.json
   - Kiểm tra conflicts

4. **Test**:
   - Chạy `npm start` để đảm bảo không có lỗi
   - Kiểm tra build: `npm run build`

---

## 📈 METRICS

### Bundle Size Impact (ước tính)

- `express` (frontend): ~200KB (không cần)
- `@google-cloud/storage`: ~500KB (nếu không dùng)
- `react-query` (cũ): ~50KB (duplicate)
- `moment` + `moment-timezone`: ~200KB (nếu thay bằng date-fns)

**Tổng có thể giảm**: ~950KB nếu clean up đúng cách

---

*Generated: $(date)*
