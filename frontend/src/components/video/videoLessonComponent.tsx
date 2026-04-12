import React, { useState, useRef, useEffect, useMemo } from "react";
import { Spin, Alert, message } from "antd";
import ReactPlayer from "react-player";
import {
  progressService,
  type CompleteLessonResponse,
} from "../../service/progress.service";


interface VideoLessonPlayerProps {
  videoUrl: string;
  lessonId?: string;
  lessonTitle?: string;
  autoPlay?: boolean;
  onCompleted?: (result?: CompleteLessonResponse) => void;
}

const VideoLessonPlayer: React.FC<VideoLessonPlayerProps> = ({
  videoUrl: rawVideoUrl,
  lessonId,
  autoPlay = false,
  onCompleted,
}) => {
  const Player = ReactPlayer as any;
  const playerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // 🛠 SIÊU CHUẨN HÓA SANG DẠNG LINK EMBED (TRÁNH LỖI 0:00)
  const videoUrl = useMemo(() => {
    if (!rawVideoUrl) return "";
    const trimmed = rawVideoUrl.trim();
    let videoId = "";

    if (trimmed.includes("v=")) {
      videoId = trimmed.split("v=")[1]?.split("&")[0];
    } else if (trimmed.includes("youtu.be/")) {
      videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    } else if (trimmed.includes("embed/")) {
      videoId = trimmed.split("embed/")[1]?.split("?")[0];
    } else if (!trimmed.includes("http") && trimmed.length > 0) {
      videoId = trimmed;
    }

    // Nếu lấy được ID, dùng link Embed là chắc chắn 100% không bị nhầm sang HTML5
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return trimmed;
  }, [rawVideoUrl]);

  // Track lesson access khi component mount
  useEffect(() => {
    if (lessonId) {
      progressService.accessLesson(lessonId).catch((err) => {
        console.error("Error tracking lesson access:", err);
      });
    }
  }, [lessonId]);

  useEffect(() => {
    console.log("VideoLessonPlayer: videoUrl changed to:", videoUrl);
    setIsLoading(true);
    setIsError(false);
  }, [videoUrl]);

  const handleReady = () => {
    console.log("VideoLessonPlayer: onReady");
    setIsLoading(false);
  };

  const handleError = (e: any) => {
    console.error("VideoLessonPlayer: onError", e);
    setIsLoading(false);
    setIsError(true);
  };

  const handleEnded = async () => {
    console.log("VideoLessonPlayer: onEnded - Tự động hoàn thành bài học");

    if (lessonId) {
      try {
        const result = await progressService.completeLesson(lessonId);
        console.log("✅ Complete lesson response:", result);

        if (onCompleted) {
          onCompleted(result);
        }

        message.success(
          `✅ Hoàn thành bài học! Tiến độ: ${result.courseProgress.toFixed(1)}%`,
          3,
        );
      } catch (error: unknown) {
        console.error("Error completing lesson:", error);
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (!axiosError.response?.data?.message?.includes("đã hoàn thành")) {
          message.warning("Không thể đánh dấu hoàn thành. Vui lòng thử lại.");
        } else {
          if (onCompleted) onCompleted();
        }
      }
    } else {
      if (onCompleted) onCompleted();
    }
  };

  // ⚡️ GIẢI PHÁP ĐẶC TRỊ: Dùng Iframe gốc của YouTube để tránh lỗi nhận diện của thư viện
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  if (isYouTube) {
    return (
      <div
        className="video-player-container"
        style={{
          width: "100%",
          paddingTop: "56.25%", // Duy trì tỷ lệ 16:9 chuẩn
          position: "relative",
          backgroundColor: "#1a1a1a",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <iframe
          key={videoUrl}
          src={`${videoUrl}?autoplay=0&rel=0&modestbranding=1&origin=${window.location.origin}`}
          title="Video lesson"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          onLoad={handleReady}
        ></iframe>
      </div>
    );
  }

  return (
    <div
      className="video-player-container"
      style={{
        width: "100%",
        height: "300px", // Dự phòng cho các nguồn khác
        position: "relative",
        backgroundColor: "#000",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Player
        key={videoUrl}
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={false}
        controls={true}
        onReady={handleReady}
        onError={handleError}
        onEnded={() => {
          handleEnded();
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {isError && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.9)",
            padding: "20px",
          }}
        >
          <Alert message="Không thể tải video" type="error" showIcon />
        </div>
      )}
    </div>
  );
};

export default VideoLessonPlayer;
