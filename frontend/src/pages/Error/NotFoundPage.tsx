import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center text-center"
            style={{ height: "100vh", backgroundColor: "#f8f9fa" }}
        >
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="mb-3">Trang không tồn tại</h2>
            <p className="text-muted mb-4">
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc chưa bao giờ tồn tại.
            </p>

            <button
                className="btn btn-primary px-4"
                onClick={() => navigate("/")}
            >
                Quay lại trang chủ
            </button>
        </div>
    );
};

export default NotFoundPage;
