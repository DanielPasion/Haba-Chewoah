import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#D8FF3C",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 200 200">
          <rect x="20" y="24" width="160" height="160" rx="38" fill="#1B1726" />
          <path
            d="M 40 56 H 100 V 168 H 56 a 16 16 0 0 1 -16 -16 Z"
            fill="#D8FF3C"
          />
          <path
            d="M 100 56 H 160 V 152 a 16 16 0 0 1 -16 16 H 100 Z"
            fill="#FFFFFF"
          />
          <line x1="100" y1="56" x2="100" y2="168" stroke="#1B1726" strokeWidth="3" />
          <circle cx="68" cy="100" r="9" fill="#1B1726" />
          <circle cx="71" cy="97" r="2.5" fill="#D8FF3C" />
          <path d="M 58 82 L 80 82" stroke="#1B1726" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M 60 138 Q 76 138 84 138"
            stroke="#1B1726"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="138" cy="102" rx="11" ry="8" fill="#1B1726" />
          <circle cx="144" cy="100" r="3" fill="#FFFFFF" />
          <path
            d="M 122 78 Q 138 70 156 84"
            stroke="#1B1726"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 118 138 Q 136 148 156 134"
            stroke="#1B1726"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="148" cy="142" r="3" fill="#FF4D8D" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
