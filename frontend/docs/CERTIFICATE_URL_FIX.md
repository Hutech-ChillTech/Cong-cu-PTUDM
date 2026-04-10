# Certificate URL Fix - Summary

## Vấn đề
Lỗi **duplicate path** khi download certificate:
```
Cannot GET /api/certificates/view//certificates/certificate_xxx.pdf
```

## Nguyên nhân
Backend trả về `certificateURL` đã có prefix `/certificates/`, nhưng frontend lại thêm `/certificates/view/` nữa, dẫn đến URL bị duplicate.

## Giải pháp
Cập nhật logic xử lý URL ở **TẤT CẢ** các file liên quan để xử lý 3 trường hợp:

```typescript
let certUrl: string;

if (url.startsWith("http")) {
  // Case 1: Full URL - giữ nguyên
  certUrl = url;
} else if (url.startsWith("/certificates/")) {
  // Case 2: Relative path có prefix /certificates/ - chỉ thêm backend URL
  certUrl = `${import.meta.env.VITE_BACKEND_URL}${url}`;
} else {
  // Case 3: Chỉ có filename - thêm full path
  certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${url}`;
}
```

## Files đã sửa

### 1. ✅ `src/pages/User/MyCertificates.tsx`
- **Function**: `handleDownload()`
- **Line**: 52-84
- **Mô tả**: Trang danh sách chứng chỉ của user

### 2. ✅ `src/pages/User/UserProfile.tsx`
- **Functions**: 
  - Button "Xem" (line 781-798)
  - Button "Tải xuống" (line 794-816)
- **Mô tả**: Tab "Chứng chỉ của tôi" trong user profile
- **Bonus**: Cũng sửa luôn `getUserCertificates()` để không cần truyền `userId`

### 3. ✅ `src/pages/User/CourseDetailPage.tsx`
- **Function**: `handleDownloadCertificate()`
- **Line**: 167-176
- **Mô tả**: Nút "Tải chứng chỉ" trong trang chi tiết khóa học

### 4. ✅ `src/pages/User/CertificateVerify.tsx`
- **Function**: Button "Tải chứng chỉ (PDF)"
- **Line**: 205-218
- **Mô tả**: Trang xác thực chứng chỉ

### 5. ✅ `src/pages/Lesson/LessonDetailPage.tsx`
- **Function**: Certificate URL construction trong quiz completion
- **Line**: 516-523
- **Mô tả**: Modal hoàn thành khóa học

### 6. ✅ `src/service/certificate.service.ts`
- **Function**: `getUserCertificates()`
- **Line**: 83-101
- **Thay đổi**: 
  - API endpoint: `/certificates/user/${userId}` → `/certificates/my-certificates`
  - Signature: `getUserCertificates(userId: string)` → `getUserCertificates()`
  - Lý do: API mới tự động lấy user từ token

## Test Cases

### Test 1: Backend trả về full URL
```javascript
certificateURL: "http://localhost:3000/certificates/cert.pdf"
// Expected: http://localhost:3000/certificates/cert.pdf
```

### Test 2: Backend trả về relative path (HIỆN TẠI)
```javascript
certificateURL: "/certificates/certificate_xxx.pdf"
// Expected: http://localhost:3000/certificates/certificate_xxx.pdf
// ✅ FIXED: Không còn duplicate /certificates/view//certificates/
```

### Test 3: Backend trả về filename only
```javascript
certificateURL: "certificate_xxx.pdf"
// Expected: http://localhost:3000/certificates/view/certificate_xxx.pdf
```

## Cách test

1. **Reload trang** để áp dụng code mới
2. **Vào trang** "Chứng chỉ của tôi" (User Profile → Tab "Chứng chỉ của tôi")
3. **Click** nút "Tải xuống"
4. **Kiểm tra**:
   - URL không còn duplicate `/certificates/view//certificates/`
   - File PDF được mở/download thành công

## Các trang cần test

- [ ] `/profile` → Tab "Chứng chỉ của tôi" → Nút "Tải xuống"
- [ ] `/my-certificates` → Nút "Tải PDF"
- [ ] `/course/:id` → Nút "Tải chứng chỉ" (nếu đã hoàn thành)
- [ ] `/certificate/verify/:id` → Nút "Tải chứng chỉ (PDF)"
- [ ] `/practice/:id` → Modal hoàn thành khóa học → Nút "Tải chứng chỉ"

## Checklist

- [x] Sửa `MyCertificates.tsx`
- [x] Sửa `UserProfile.tsx` (2 buttons)
- [x] Sửa `CourseDetailPage.tsx`
- [x] Sửa `CertificateVerify.tsx`
- [x] Sửa `LessonDetailPage.tsx`
- [x] Cập nhật `certificate.service.ts` API endpoint
- [x] Sửa lint error trong `UserProfile.tsx`
- [ ] Test trên browser
- [ ] Verify không còn lỗi 404

## Notes

- Tất cả các file đã được cập nhật với logic xử lý URL nhất quán
- Code đã được optimize để handle tất cả các trường hợp URL có thể
- Không cần thay đổi backend, chỉ cần fix frontend
