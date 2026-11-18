import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'home'
  | 'receipt'
  | 'user'
  | 'pin'
  | 'search'
  | 'bell'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'close'
  | 'check'
  | 'checkCircle'
  | 'star'
  | 'clock'
  | 'shield'
  | 'shieldCheck'
  | 'headset'
  | 'phone'
  | 'edit'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'ticket'
  | 'heart'
  | 'share'
  | 'calendar'
  | 'wallet'
  | 'info'
  | 'sparkle'
  | 'refresh'
  | 'camera'
  | 'wechat'
  | 'arrowRight'
  | 'chat'
  | 'map'
  | 'lock'
  | 'comment'
  | 'gift'
  | 'scan'
  | 'alert'
  | 'settings'
  | 'logout'
  | 'copy'
  | 'eye'
  | 'filter'
  | 'sort'
  | 'navigation'
  | 'droplet'
  | 'spray'
  | 'crowd'
  | 'thumb'
  | 'medal'
  | 'bag';

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3.2 10.7 12 3.5l8.8 7.2" />
      <path d="M5.2 9.4V20a.8.8 0 0 0 .8.8h4.2v-5.6h3.6v5.6H18a.8.8 0 0 0 .8-.8V9.4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.2h12v18l-3-2-3 2-3-2-3 2v-18Z" />
      <path d="M9 8h6M9 12h6M9 16h3.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.8 20.2c.8-3.7 3.6-5.6 7.2-5.6s6.4 1.9 7.2 5.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m16 16 4.2 4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  chevronRight: <path d="m9.5 5 7 7-7 7" />,
  chevronLeft: <path d="m14.5 5-7 7 7 7" />,
  chevronDown: <path d="m5 9.5 7 7 7-7" />,
  close: <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />,
  check: <path d="m5 12.5 4.5 4.5L19.5 6.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m8.2 12.2 2.6 2.6 5.2-5.6" />
    </>
  ),
  star: <path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1.1 6-5.5-2.9-5.5 2.9 1.1-6-4.4-4.3 6.1-.9L12 3.4Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.1 1.9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.3 19 6v5.5c0 4.3-3 7.3-7 9.2-4-1.9-7-4.9-7-9.2V6l7-2.7Z" />
      <path d="m8.7 12 2.2 2.2 4.4-4.6" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.3 19 6v5.5c0 4.3-3 7.3-7 9.2-4-1.9-7-4.9-7-9.2V6l7-2.7Z" />
      <path d="m8.7 12 2.2 2.2 4.4-4.6" />
    </>
  ),
  headset: (
    <>
      <path d="M4.4 13.2v-1.6a7.6 7.6 0 0 1 15.2 0v1.6" />
      <path d="M4.4 13h1.8a1.4 1.4 0 0 1 1.4 1.4v3.2a1.4 1.4 0 0 1-1.4 1.4H5.8A1.4 1.4 0 0 1 4.4 17.6V13ZM19.6 13h-1.8a1.4 1.4 0 0 0-1.4 1.4v3.2a1.4 1.4 0 0 0 1.4 1.4h1.8a1.4 1.4 0 0 0 1.4-1.4V13Z" />
      <path d="M19.6 18.8c0 1.5-1.4 2.2-3.2 2.2" />
    </>
  ),
  phone: (
    <>
      <path d="M7.1 3.6 9 7.8 6.9 9.6c.7 2.8 2.7 4.8 5.5 5.5l1.8-2.1 4.2 1.9v3.2c0 .8-.7 1.5-1.5 1.4C9.1 18.8 5.2 14.9 4.5 5.1c0-.8.6-1.5 1.4-1.5h1.2Z" />
    </>
  ),
  edit: (
    <>
      <path d="M4.5 19.5h4l10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16.5v3Z" />
      <path d="m13.6 7.4 3 3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M5 7h14M10 7V4.8h4V7M7 7l.8 13h8.4L17 7" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.8 8.2V6.4h16.4v1.8a2.4 2.4 0 0 0 0 4.8v4.6H3.8v-4.6a2.4 2.4 0 0 0 0-4.8Z" />
      <path d="M14 7.2v9.4" strokeDasharray="1.6 2.2" />
    </>
  ),
  heart: <path d="M12 20s-7.6-4.5-7.6-9.4A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.6 2.9C19.6 15.5 12 20 12 20Z" />,
  share: (
    <>
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="17.5" cy="5.8" r="2.3" />
      <circle cx="17.5" cy="18.2" r="2.3" />
      <path d="m8.2 10.9 7.1-4M8.2 13.1l7.1 4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
      <path d="M8 14h2M14 14h2M8 17.5h2M14 17.5h2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11.5H6a2 2 0 0 1-2-2V7.5Z" />
      <path d="M4 8.5h13.5M16 12.5h4v3h-4a1.5 1.5 0 0 1 0-3Z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.5M12 7.6v.2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.2c.4 4.7 2.1 6.4 6.8 6.8-4.7.4-6.4 2.1-6.8 6.8-.4-4.7-2.1-6.4-6.8-6.8 4.7-.4 6.4-2.1 6.8-6.8Z" />
      <path d="M18.4 15.4c.2 2.1 1 2.9 3.1 3.1-2.1.2-2.9 1-3.1 3.1-.2-2.1-1-2.9-3.1-3.1 2.1-.2 2.9-1 3.1-3.1Z" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5A8 8 0 1 0 18.2 17" />
      <path d="M20 5v6.5h-6.3" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v10.5H4V8.5Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  wechat: (
    <>
      <path d="M10 4.2c-4 0-7 2.5-7 5.6 0 1.7.9 3.2 2.4 4.2l-.5 2 2.3-1.2c.9.2 1.8.4 2.8.4 4 0 7-2.5 7-5.4S14 4.2 10 4.2Z" />
      <path d="M14.5 10.5c.6-.1 1.2-.2 1.8-.2 3 0 5.2 1.9 5.2 4.2 0 1.3-.7 2.5-1.8 3.3l.4 1.6-1.8-1c-.7.2-1.4.3-2 .3-2.4 0-4.4-1.2-5-3" />
      <path d="M7.5 8.7h.1M12 8.7h.1M16 13h.1M19 13h.1" strokeWidth="2.4" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v11H9l-4.5 3v-3H4v-11Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  map: (
    <>
      <path d="m3.5 6.2 5-2 7 2 5-2v13.6l-5 2-7-2-5 2V6.2Z" />
      <path d="M8.5 4.2v13.6M15.5 6.2v13.6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10.5" rx="2" />
      <path d="M8 10V7.6a4 4 0 0 1 8 0V10M12 14v2.8" />
    </>
  ),
  comment: (
    <>
      <path d="M20 12.2c0 4-3.6 7.2-8 7.2-1 0-2-.2-2.9-.5L4.5 20l1.2-3.4A6.9 6.9 0 0 1 4 12.2C4 8.2 7.6 5 12 5s8 3.2 8 7.2Z" />
    </>
  ),
  gift: (
    <>
      <path d="M4 9.5h16V20H4V9.5ZM3 9.5h18M12 9.5V20" />
      <path d="M12 9.5H8.2a2.1 2.1 0 1 1 0-4.2c2.4 0 3.8 2.2 3.8 4.2ZM12 9.5h3.8a2.1 2.1 0 1 0 0-4.2C13.4 5.3 12 7.5 12 9.5Z" />
    </>
  ),
  scan: (
    <>
      <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15M3 12h18" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21 19H3L12 3.5Z" />
      <path d="M12 9v4.5M12 16.8v.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.2 12c0-.5-.1-1-.2-1.4l1.8-1.4-1.8-3.1-2.1.8c-.7-.6-1.5-1-2.3-1.3L14.2 3h-4.4l-.4 2.6c-.8.3-1.6.7-2.3 1.3l-2.1-.8-1.8 3.1L5 10.6a7.7 7.7 0 0 0 0 2.8l-1.8 1.4 1.8 3.1 2.1-.8c.7.6 1.5 1 2.3 1.3l.4 2.6h4.4l.4-2.6c.8-.3 1.6-.7 2.3-1.3l2.1.8 1.8-3.1-1.8-1.4c.1-.4.2-.9.2-1.4Z" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H6v15h8" />
      <path d="M12 12h9M17.5 8.5 21 12l-3.5 3.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6.3 6.5 12 6.5 21.2 12 21.2 12 17.7 17.5 12 17.5 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7h16M7 12h10M10 17h4" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  sort: (
    <>
      <path d="M8 4v16M5 17l3 3 3-3M16 20V4M13 7l3-3 3 3" />
    </>
  ),
  navigation: <path d="m21 3-8.4 18-2.2-7.4L3 11.4 21 3Z" />,
  droplet: <path d="M12 3.5s6.5 7 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 10.5 12 3.5 12 3.5Z" />,
  spray: (
    <>
      <path d="M8 9.5h6v11H8v-11ZM9.5 9.5V7h3v2.5" />
      <path d="M16 5h4M16 8h3M16 11h4" />
      <path d="M11 5.5h2.5a2 2 0 0 0 2-2V3" />
    </>
  ),
  crowd: (
    <>
      <circle cx="9" cy="8" r="2.6" />
      <path d="M3.8 19c.5-3.2 2.6-4.8 5.2-4.8s4.7 1.6 5.2 4.8" />
      <circle cx="17" cy="9" r="2.1" />
      <path d="M15.5 14.7c2.5-.5 4.4 1.1 4.8 3.8" />
    </>
  ),
  thumb: (
    <>
      <path d="M7 10v10H4V10h3ZM7 19.5h9.6a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 17.6 9.5H14V6a2.5 2.5 0 0 0-2.5-2.5L9 9.5" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14" r="5.2" />
      <path d="m8.5 9.5-2-6M15.5 9.5l2-6M12 12l.8 1.7 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3.8-1.7Z" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  filled?: boolean;
  title?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
  style,
  filled = false,
  title,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
