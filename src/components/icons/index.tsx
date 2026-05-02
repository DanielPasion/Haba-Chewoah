import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function makeIcon(
  paths: React.ReactNode,
  defaults: Partial<SVGProps<SVGSVGElement>> = {},
) {
  return function Icon({ size = 20, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        {...defaults}
        {...rest}
      >
        {paths}
      </svg>
    );
  };
}

export const RefreshIcon = makeIcon(
  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />,
  { strokeWidth: 2.6 },
);

export const ArrowRightIcon = makeIcon(<path d="M5 12h14M12 5l7 7-7 7" />, {
  strokeWidth: 2.5,
});

export const DownloadIcon = makeIcon(
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  { strokeWidth: 2.2 },
);

export const PhoneIcon = makeIcon(
  <>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
  </>,
  { strokeWidth: 1.8 },
);

export const SunIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>,
  { strokeWidth: 2.2 },
);

export const MoonIcon = makeIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  { strokeWidth: 2.2 },
);

export function DiscordIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...rest}
    >
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.21.376-.444.866-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.07.07 0 0 0-.073-.035A19.74 19.74 0 0 0 3.683 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.055 19.9 19.9 0 0 0 5.993 3.03.07.07 0 0 0 .076-.026 14.26 14.26 0 0 0 1.226-1.994.07.07 0 0 0-.038-.097 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.371-.291a.07.07 0 0 1 .074-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .075.01c.12.099.245.197.372.291a.07.07 0 0 1-.006.117 12.3 12.3 0 0 1-1.873.891.07.07 0 0 0-.038.098c.36.698.772 1.362 1.225 1.993a.07.07 0 0 0 .076.027 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.158-1.085-2.158-2.419 0-1.333.956-2.418 2.158-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.42-2.157 2.42zm7.974 0c-1.183 0-2.158-1.085-2.158-2.419 0-1.333.956-2.418 2.158-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
    </svg>
  );
}
