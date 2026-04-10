# Debug Guide - My Certificates Page

## Vấn đề đã sửa

### 1. ❌ Lỗi URL duplicate: `Cannot GET /api/certificates/view//certificates/certificate_xxx.pdf`

**Nguyên nhân:**
- Backend trả về `certificateURL` đã có prefix `/certificates/`
- Frontend lại thêm `/certificates/view/` nữa
- Kết quả: `/api/certificates/view//certificates/...` (duplicate)

**Giải pháp:**
```typescript
// TRƯỚC (SAI):
const certUrl = url.startsWith("http")
  ? url
  : `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${url}`;

// SAU (ĐÚNG):
let certUrl: string;

if (url.startsWith("http")) {
  // Đã là full URL
  certUrl = url;
} else if (url.startsWith("/certificates/")) {
  // Đã có prefix /certificates/, chỉ cần thêm backend URL
  certUrl = `${import.meta.env.VITE_BACKEND_URL}${url}`;
} else {
  // Chỉ có filename, cần thêm full path
  certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${url}`;
}
```

### 2. ❌ Điểm số hiển thị 0%

**Nguyên nhân có thể:**
1. Backend không trả về field `totalScore`, `maxScore`, `averageScore`
2. Giá trị thực sự là 0 (user chưa làm bài quiz hoặc làm sai hết)
3. Interface không khớp với API response

**Giải pháp:**

#### Bước 1: Kiểm tra API response
Mở DevTools (F12) → Network → Reload trang → Tìm request `my-certificates`

**Response mong đợi:**
```json
{
  "data": [
    {
      "certificateId": "uuid",
      "courseId": "uuid",
      "certificateTitle": "Certificate Title",
      "certificateURL": "/certificates/certificate_xxx.pdf",
      "issuedAt": "2025-12-29T00:00:00.000Z",
      "totalScore": 85,      // ← Kiểm tra field này
      "averageScore": 85.5,  // ← Kiểm tra field này
      "maxScore": 100,       // ← Kiểm tra field này
      "course": {
        "courseName": "Course Name",
        "level": "beginner"
      }
    }
  ]
}
```

#### Bước 2: Cập nhật Interface
Đã cập nhật interface để bao gồm tất cả score fields:

```typescript
interface Certificate {
  certificateId: string;
  courseId: string;
  certificateTitle: string;
  certificateURL: string;
  issuedAt: string;
  totalScore?: number;      // ← Thêm
  averageScore?: number;
  maxScore?: number;        // ← Thêm
  course?: {
    courseName: string;
    level: string;
  };
}
```

#### Bước 3: Cải thiện hiển thị điểm
```typescript
// Hiển thị điểm theo thứ tự ưu tiên:
// 1. totalScore/maxScore (%) - nếu có
// 2. averageScore/100 - nếu có
// 3. "N/A" - nếu không có gì

{(cert.totalScore !== undefined || cert.averageScore !== undefined) && (
  <div className="info-row">
    <Text type="secondary">Điểm số:</Text>
    <Text strong style={{ color: "#52c41a" }}>
      {cert.totalScore !== undefined && cert.maxScore !== undefined
        ? `${cert.totalScore}/${cert.maxScore} (${((cert.totalScore / cert.maxScore) * 100).toFixed(1)}%)`
        : cert.averageScore !== undefined
        ? `${cert.averageScore.toFixed(1)}/100`
        : "N/A"}
    </Text>
  </div>
)}
```

## Cách debug tiếp

### 1. Kiểm tra API Response
```javascript
// Thêm console.log vào fetchCertificates
const fetchCertificates = async () => {
  try {
    setLoading(true);
    const data = await certificateService.getUserCertificates();
    console.log("📜 Certificates data:", data); // ← Thêm dòng này
    console.log("📊 First cert scores:", {
      totalScore: data[0]?.totalScore,
      averageScore: data[0]?.averageScore,
      maxScore: data[0]?.maxScore
    }); // ← Thêm dòng này
    setCertificates(data);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    showToast("error", "Không thể tải danh sách chứng chỉ");
  } finally {
    setLoading(false);
  }
};
```

### 2. Kiểm tra Backend API
Nếu backend không trả về score fields, cần kiểm tra:

**Backend route:** `GET /api/certificates/my-certificates`

**Expected query:**
```sql
SELECT 
  c.*,
  c.totalScore,      -- Cần có
  c.averageScore,    -- Cần có
  c.maxScore,        -- Cần có
  course.courseName,
  course.level
FROM Certificate c
LEFT JOIN Course course ON c.courseId = course.courseId
WHERE c.userId = ?
```

### 3. Kiểm tra Database Schema
Đảm bảo table `Certificate` có các columns:
- `totalScore` (number/decimal)
- `averageScore` (number/decimal)
- `maxScore` (number/decimal)

## Test Cases

### Test 1: Certificate có đầy đủ score
```json
{
  "totalScore": 85,
  "averageScore": 85.5,
  "maxScore": 100
}
```
**Expected:** Hiển thị "85/100 (85.0%)"

### Test 2: Certificate chỉ có averageScore
```json
{
  "averageScore": 75.5
}
```
**Expected:** Hiển thị "75.5/100"

### Test 3: Certificate không có score
```json
{}
```
**Expected:** Không hiển thị dòng điểm số (hidden)

### Test 4: Certificate URL formats
```javascript
// Test case 1: Full URL
certificateURL: "http://localhost:3000/certificates/cert.pdf"
// Expected: http://localhost:3000/certificates/cert.pdf

// Test case 2: Relative path with /certificates/
certificateURL: "/certificates/cert.pdf"
// Expected: http://localhost:3000/certificates/cert.pdf

// Test case 3: Just filename
certificateURL: "cert.pdf"
// Expected: http://localhost:3000/certificates/view/cert.pdf
```

## Checklist

- [x] Sửa lỗi URL duplicate
- [x] Cập nhật interface Certificate với score fields
- [x] Cải thiện logic hiển thị điểm số
- [ ] Kiểm tra API response trong DevTools
- [ ] Verify backend trả về đúng score fields
- [ ] Test download certificate
- [ ] Test với các trường hợp edge cases

## Next Steps

1. **Mở DevTools** và kiểm tra Network tab
2. **Reload trang** `/my-certificates`
3. **Tìm request** `my-certificates`
4. **Kiểm tra Response** xem có fields `totalScore`, `averageScore`, `maxScore` không
5. **Nếu không có** → Cần fix backend API
6. **Nếu có nhưng vẫn hiển thị 0%** → Share response data để debug tiếp
