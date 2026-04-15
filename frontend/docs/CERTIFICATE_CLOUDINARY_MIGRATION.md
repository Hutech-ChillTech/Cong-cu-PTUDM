# Certificate Integration - Backend với Cloudinary

## 🎯 Thay đổi quan trọng

Backend đã chuyển sang sử dụng **Cloudinary** để lưu trữ PDF certificates thay vì lưu local. Frontend cần cập nhật để sử dụng `pdfUrl` thay vì `certificateURL`.

## ✅ Đã cập nhật

### 1. Interface Certificate (2 files)

**`src/service/certificate.service.ts`**
```typescript
interface Certificate {
  certificateId: string;
  certificateCode: string;      // ← MỚI: Mã chứng chỉ
  pdfUrl: string;               // ← THAY ĐỔI: certificateURL → pdfUrl
  qrCodeUrl?: string;           // ← MỚI: QR code URL
  // ... các fields khác
}
```

**`src/pages/User/MyCertificates.tsx`**
- Cập nhật interface giống như service
- Đơn giản hóa `handleDownload()` - chỉ cần dùng `pdfUrl` trực tiếp

### 2. Files đã sửa

| File | Thay đổi | Status |
|------|----------|--------|
| `src/service/certificate.service.ts` | Interface Certificate | ✅ Done |
| `src/pages/User/MyCertificates.tsx` | Interface + handleDownload | ✅ Done |
| `src/pages/Lesson/LessonDetailPage.tsx` | Certificate URL handling | ✅ Done |
| `src/pages/User/UserProfile.tsx` | Cần cập nhật | ⏳ TODO |
| `src/pages/User/CourseDetailPage.tsx` | Cần cập nhật | ⏳ TODO |
| `src/pages/User/CertificateVerify.tsx` | Cần cập nhật | ⏳ TODO |

## 📝 Backend Response Structure

### Trước (Local storage):
```json
{
  "certificateId": "uuid",
  "certificateURL": "/certificates/certificate_xxx.pdf",  // ← Local path
  "certificateTitle": "...",
  // ...
}
```

### Sau (Cloudinary):
```json
{
  "certificateId": "uuid",
  "certificateCode": "CERT-2025-001",                     // ← MỚI
  "pdfUrl": "https://res.cloudinary.com/.../cert.pdf",   // ← Cloudinary URL
  "qrCodeUrl": "https://res.cloudinary.com/.../qr.png",  // ← MỚI
  "certificateTitle": "...",
  "averageScore": 85.5,
  "totalScore": 85,
  "maxScore": 100,
  // ...
}
```

## 🔧 Cách sử dụng mới

### 1. Hiển thị certificate
```tsx
{certificate && (
  <div className="certificate-section">
    <h3>🎓 Chúc mừng! Bạn đã nhận được chứng chỉ</h3>
    <p>Mã chứng chỉ: {certificate.certificateCode}</p>
    <p>Điểm số: {certificate.averageScore}%</p>
    
    {/* Nút xem/tải PDF - Dùng pdfUrl trực tiếp */}
    <a 
      href={certificate.pdfUrl} 
      target="_blank" 
      rel="noopener noreferrer"
    >
      📄 Xem chứng chỉ
    </a>
    
    <a 
      href={certificate.pdfUrl} 
      download={`certificate-${certificate.certificateCode}.pdf`}
    >
      ⬇️ Tải xuống
    </a>
  </div>
)}
```

### 2. Download handler (Simplified)
```typescript
const handleDownload = (pdfUrl: string, title: string) => {
  if (!pdfUrl) {
    showToast("warning", "Chứng chỉ đang được xử lý");
    return;
  }

  // Không cần xử lý URL nữa, backend đã trả về full URL
  const link = document.createElement("a");
  link.href = pdfUrl;  // ← Dùng trực tiếp
  link.target = "_blank";
  link.download = `certificate_${title}.pdf`;
  link.click();
};
```

## ⚠️ Breaking Changes

### TRƯỚC:
```typescript
// Phải xử lý URL phức tạp
if (url.startsWith("http")) {
  certUrl = url;
} else if (url.startsWith("/certificates/")) {
  certUrl = `${BACKEND_URL}${url}`;
} else {
  certUrl = `${BACKEND_URL}/certificates/view/${url}`;
}
```

### SAU:
```typescript
// Đơn giản, chỉ cần dùng pdfUrl
const certUrl = certificate.pdfUrl;  // ✅ That's it!
```

## 🚀 Next Steps

### Files cần cập nhật tiếp:

1. **`UserProfile.tsx`** (Line 786-810)
   - Thay `certificateURL` → `pdfUrl`
   - Xóa logic xử lý URL phức tạp

2. **`CourseDetailPage.tsx`** (Line 167-176)
   - Thay `certificateURL` → `pdfUrl`
   - Đơn giản hóa `handleDownloadCertificate()`

3. **`CertificateVerify.tsx`** (Line 205-218)
   - Thay `certificateURL` → `pdfUrl`
   - Cập nhật interface

## 📊 Test Checklist

- [ ] Reload trang `/my-certificates`
- [ ] Kiểm tra console logs:
  - `📜 Certificates data:` - Xem có `pdfUrl` không
  - `📊 First certificate scores:` - Xem có `certificateCode` không
- [ ] Click "Tải PDF" - Xem có mở được không
- [ ] Kiểm tra URL trong browser - Phải là Cloudinary URL
- [ ] Test trên các trang khác:
  - `/profile` → Tab "Chứng chỉ"
  - `/course/:id` → Nút "Tải chứng chỉ"
  - `/certificate/verify/:id`
  - `/practice/:id` → Modal hoàn thành

## 💡 Benefits

✅ **Đơn giản hơn**: Không cần xử lý URL phức tạp
✅ **Nhanh hơn**: Cloudinary CDN tốc độ cao
✅ **Bảo mật hơn**: Cloudinary handle authentication
✅ **Scalable**: Không lo về storage local
✅ **QR Code**: Backend tự động generate QR code

## 🔗 Related Docs

- `docs/MY_CERTIFICATES_PAGE.md` - Hướng dẫn trang chứng chỉ
- `docs/CERTIFICATE_URL_FIX.md` - Fix lỗi URL duplicate (cũ)
- `docs/DEBUG_CERTIFICATES.md` - Debug guide
