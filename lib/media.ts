export function checkMediaSupported(): {
  supported: boolean;
  error: string | null;
} {
  if (typeof window === "undefined") {
    return { supported: false, error: null };
  }

  if (!window.isSecureContext) {
    return {
      supported: false,
      error:
        "Video recording requires a secure connection (HTTPS). Please access this page via HTTPS.",
    };
  }

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    return {
      supported: false,
      error:
        "Your browser does not support video recording. Please try using a modern browser like Chrome, Safari, or Firefox.",
    };
  }

  return { supported: true, error: null };
}

export function getMediaMimeType() {
  if (MediaRecorder.isTypeSupported("video/mp4")) {
    return "video/mp4";
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
    return "video/webm;codecs=h264";
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=avc1")) {
    return "video/webm;codecs=avc1";
  }
  return "video/webm";
}
