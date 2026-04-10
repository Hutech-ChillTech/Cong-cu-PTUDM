import React from "react";

// 1. Interface cho các thuộc tính config của File
export interface FileConfigAttributes {
  controlsList?: string;
  onContextMenu?: (e: React.MouseEvent<HTMLVideoElement>) => void;
  disablePictureInPicture?: boolean;
}

export interface ExtendedReactPlayerProps {
  url?: string | string[];
  playing?: boolean;
  loop?: boolean;
  controls?: boolean;
  light?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  progressInterval?: number;
  playsinline?: boolean;
  pip?: boolean;
  stopOnUnmount?: boolean;
  fallback?: React.ReactElement;
  wrapper?: React.ComponentType<Record<string, unknown>>;
  onReady?: () => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onBuffer?: () => void;
  onBufferEnd?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onProgress?: (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => void;
  onDuration?: (duration: number) => void;
  onSeek?: (seconds: number) => void;
  config?: {
    file?: {
      attributes?: FileConfigAttributes;
      forceVideo?: boolean;
      forceAudio?: boolean;
      forceHLS?: boolean;
      forceDASH?: boolean;
      forceFLV?: boolean;
    };
    // Cho phép thêm các key khác (youtube, facebook...) nếu cần, tránh lỗi thiếu thuộc tính
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}
