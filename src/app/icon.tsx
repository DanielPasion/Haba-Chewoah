import { ImageResponse } from "next/og";

import { BRAND } from "~/components/brand/colors";

export const runtime = "edge";
export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BRAND.brand,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 200 200">
          <rect x="20" y="24" width="160" height="160" rx="38" fill={BRAND.inkLegacy} />
          <path
            d="M 40 56 H 100 V 168 H 56 a 16 16 0 0 1 -16 -16 Z"
            fill={BRAND.brand}
          />
          <path
            d="M 100 56 H 160 V 152 a 16 16 0 0 1 -16 16 H 100 Z"
            fill={BRAND.white}
          />
          <line x1="100" y1="56" x2="100" y2="168" stroke={BRAND.inkLegacy} strokeWidth="3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
