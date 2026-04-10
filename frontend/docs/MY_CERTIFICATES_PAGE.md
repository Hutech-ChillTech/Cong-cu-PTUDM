# Trang Chứng Chỉ Của Tôi (My Certificates)

## Mô tả
Trang này hiển thị tất cả các chứng chỉ mà người dùng đã đạt được sau khi hoàn thành các khóa học.

## Tính năng

### 1. **Header Section**
- Gradient background màu tím đẹp mắt (Purple gradient: #667eea → #764ba2)
- Icon chứng chỉ lớn với hiệu ứng shadow
- Tiêu đề và mô tả rõ ràng
- Animation floating cho background

### 2. **Thống kê**
- Card hiển thị tổng số chứng chỉ
- Gradient background màu cam đào (Peach gradient)
- Icon trophy nổi bật

### 3. **Danh sách chứng chỉ (Grid Layout)**
- Hiển thị dạng card grid responsive (3 cột trên desktop, 2 cột trên tablet, 1 cột trên mobile)
- Mỗi card bao gồm:
  - **Header**: Icon chứng chỉ với gradient background + Badge "Đã hoàn thành"
  - **Body**: 
    - Tên khóa học (2 dòng tối đa)
    - Cấp độ với màu sắc phân biệt:
      - Beginner (Cơ bản): Xanh lá #52c41a
      - Intermediate (Trung cấp): Xanh dương #1890ff
      - Advanced (Nâng cao): Tím #722ed1
    - Điểm trung bình (nếu có)
    - Ngày cấp với format đầy đủ
  - **Actions**: 2 nút
    - "Xem chi tiết": Chuyển đến trang verify certificate
    - "Tải PDF": Download file PDF chứng chỉ

### 4. **Empty State**
- Hiển thị khi chưa có chứng chỉ nào
- Nút "Khám phá khóa học" để chuyển đến trang danh sách khóa học

### 5. **Loading State**
- Skeleton loading cho 3 cards khi đang tải dữ liệu

## API Endpoints

### GET /api/certificates/my-certificates
Lấy tất cả chứng chỉ của user hiện tại (dựa vào token)

**Response:**
```json
{
  "data": [
    {
      "certificateId": "uuid",
      "courseId": "uuid",
      "certificateTitle": "Certificate Title",
      "certificateURL": "path/to/certificate.pdf",
      "issuedAt": "2025-12-29T00:00:00.000Z",
      "averageScore": 85.5,
      "course": {
        "courseName": "Course Name",
        "level": "beginner|intermediate|advanced"
      }
    }
  ]
}
```

## Thiết kế UI/UX

### Màu sắc
- **Primary Gradient**: #667eea → #764ba2 (Purple)
- **Stats Gradient**: #ffecd2 → #fcb69f (Peach)
- **Success**: #52c41a (Green)
- **Info**: #1890ff (Blue)
- **Advanced**: #722ed1 (Purple)

### Hiệu ứng
- **Hover**: Card nâng lên 8px với shadow tăng
- **Animation**: Floating effect cho header background
- **Transition**: Smooth 0.3s ease cho tất cả interactions

### Responsive
- **Desktop (>768px)**: 3 cột
- **Tablet (≤768px)**: 2 cột
- **Mobile (≤576px)**: 1 cột

## Files liên quan

1. **Component**: `src/pages/User/MyCertificates.tsx`
2. **Styles**: `src/styles/MyCertificates.css`
3. **Service**: `src/service/certificate.service.ts`
4. **Route**: `/my-certificates`

## Cách sử dụng

1. User đăng nhập vào hệ thống
2. Truy cập `/my-certificates` hoặc click vào menu "Chứng chỉ của tôi"
3. Xem danh sách các chứng chỉ đã đạt được
4. Click "Xem chi tiết" để xem thông tin chi tiết và verify
5. Click "Tải PDF" để download chứng chỉ

## Cải tiến so với phiên bản cũ

✅ **Thay đổi từ Table sang Card Grid**
- Giao diện đẹp hơn, hiện đại hơn
- Dễ nhìn và tương tác hơn trên mobile
- Thể hiện thông tin trực quan hơn

✅ **API Endpoint chuẩn hóa**
- Sử dụng `/api/certificates/my-certificates` thay vì `/api/certificates/user/:userId`
- Không cần truyền userId, tự động lấy từ token

✅ **Thêm thống kê**
- Hiển thị tổng số chứng chỉ đạt được

✅ **Cải thiện UX**
- Loading state với skeleton
- Empty state với CTA rõ ràng
- Hover effects mượt mà
- Responsive design tốt hơn
