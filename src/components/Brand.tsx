import type { ServiceArtKind } from '../data/types';

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="净到家 logo"
    >
      <rect width="48" height="48" rx="14" fill="#f14a41" />
      <circle cx="12.5" cy="11.5" r="10" fill="#ff7f6c" opacity=".5" />
      <circle cx="40" cy="40" r="12" fill="#d93b39" opacity=".28" />
      <path
        d="M24 8.5c0 0-11.2 12.2-11.2 20.1a11.2 11.2 0 0 0 22.4 0C35.2 20.7 24 8.5 24 8.5Z"
        fill="#fff"
      />
      <path
        d="M18.4 29.6 24 23.2l5.6 6.4"
        fill="none"
        stroke="#f14a41"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="20.3" y="29" width="7.4" height="6.8" rx="1.4" fill="#f14a41" />
      <circle cx="33.4" cy="14.6" r="1.5" fill="#fff" opacity=".8" />
      <circle cx="15.2" cy="19.4" r="1" fill="#fff" opacity=".65" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`wordmark${light ? ' wordmark-light' : ''}`}>
      <span className="wordmark-jing">净</span>
      <span className="wordmark-rest">到家</span>
      <span className="wordmark-dot" />
    </span>
  );
}

const artTitles: Record<ServiceArtKind, string> = {
  sofa: '沙发清洗插画',
  curtain: '窗帘清洗插画',
  carpet: '地毯清洗插画',
  mattress: '床垫清洗插画',
  ac: '空调清洗插画',
};

export function ServiceArt({
  kind,
  className,
  size,
  muted = false,
}: {
  kind: ServiceArtKind;
  className?: string;
  size?: number;
  muted?: boolean;
}) {
  const common = {
    className,
    style: size ? { width: size, height: size } : undefined,
    viewBox: '0 0 200 160',
    role: 'img' as const,
    'aria-label': artTitles[kind],
  };
  const opacity = muted ? 0.55 : 1;

  if (kind === 'sofa') {
    return (
      <svg {...common} style={{ ...common.style, opacity }}>
        <ellipse cx="100" cy="139" rx="72" ry="9" fill="#ef6655" opacity=".12" />
        <path d="M40 46c0-9 7-16 16-16h88c9 0 16 7 16 16v50H40V46Z" fill="#e85e4f" />
        <rect x="50" y="54" width="44" height="34" rx="13" fill="#f47a67" />
        <rect x="106" y="54" width="44" height="34" rx="13" fill="#f47a67" />
        <rect x="31" y="77" width="26" height="48" rx="13" fill="#d94f41" />
        <rect x="143" y="77" width="26" height="48" rx="13" fill="#d94f41" />
        <rect x="43" y="91" width="114" height="34" rx="15" fill="#f58a74" />
        <rect x="49" y="98" width="49" height="20" rx="10" fill="#ffdac9" />
        <rect x="102" y="98" width="49" height="20" rx="10" fill="#ffdac9" />
        <rect x="55" y="79" width="28" height="24" rx="9" fill="#fff1e8" transform="rotate(-7 69 91)" />
        <path d="M69 88c-2.5-3.5-7.5-1.5-7 2 .5 3 5 5.5 7 7 2-1.5 6.5-4 7-7 .5-3.5-4.5-5.5-7-2Z" fill="#ef6655" />
        <rect x="43" y="124" width="7" height="11" rx="3" fill="#9b5a43" />
        <rect x="72" y="124" width="7" height="11" rx="3" fill="#9b5a43" />
        <rect x="121" y="124" width="7" height="11" rx="3" fill="#9b5a43" />
        <rect x="150" y="124" width="7" height="11" rx="3" fill="#9b5a43" />
        <path d="M168 42c0 0-7 7.7-7 12.6a7 7 0 0 0 14 0c0-4.9-7-12.6-7-12.6Z" fill="#fff" opacity=".9" />
        <circle cx="43" cy="47" r="5" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
        <circle cx="136" cy="39" r="3.5" fill="#fff" opacity=".8" />
        <path d="M34 104c-3-3-8-1-8 3 0 3 5 6 8 8 3-2 8-5 8-8 0-4-5-6-8-3Z" fill="#fff" opacity=".6" />
      </svg>
    );
  }

  if (kind === 'curtain') {
    return (
      <svg {...common} style={{ ...common.style, opacity }}>
        <ellipse cx="100" cy="140" rx="66" ry="8" fill="#17a98f" opacity=".1" />
        <rect x="48" y="28" width="104" height="105" rx="10" fill="#fbfffd" stroke="#cfeae2" strokeWidth="2" />
        <path d="M48 66h104M100 28v105" stroke="#dcefe9" strokeWidth="2" />
        <circle cx="76" cy="48" r="10" fill="#ffe9a8" opacity=".8" />
        <path d="M100 28c-10 20-14 47-14 74 0 12 2 22 5 31H48V28h52ZM100 28c10 20 14 47 14 74 0 12-2 22-5 31h43V28h-52Z" fill="#4fc3ad" />
        <path d="M68 28c-5 24-5 54-1 82M82 28c-3 26-3 52 0 77M118 28c3 26 3 52 0 77M132 28c4 24 5 52 1 82" stroke="#2ea891" strokeWidth="2" opacity=".55" fill="none" />
        <path d="M45 26h110" stroke="#8c6549" strokeWidth="5" strokeLinecap="round" />
        <circle cx="45" cy="26" r="4" fill="#8c6549" />
        <circle cx="155" cy="26" r="4" fill="#8c6549" />
        <path d="M34 58c-3-3-8-1-8 3 0 3 5 6 8 8 3-2 8-5 8-8 0-4-5-6-8-3Z" fill="#8fdccd" />
        <circle cx="169" cy="82" r="5" fill="none" stroke="#8fdccd" strokeWidth="2" />
        <circle cx="160" cy="109" r="3.5" fill="#ffe9a8" />
      </svg>
    );
  }

  if (kind === 'carpet') {
    return (
      <svg {...common} style={{ ...common.style, opacity }}>
        <ellipse cx="100" cy="140" rx="72" ry="8" fill="#3f7be0" opacity=".1" />
        <path d="M44 54h112l22 67H22L44 54Z" fill="#5b8def" />
        <path d="M50 60h100l18 55H32L50 60Z" fill="#7aa4f4" opacity=".7" />
        <path d="M58 70h84l12 39H46l12-39Z" fill="none" stroke="#fff" strokeWidth="2.5" opacity=".8" />
        <path d="m100 73 13 14-13 14-13-14 13-14Z" fill="none" stroke="#fff" strokeWidth="2.5" />
        <path d="M33 121h134" stroke="#3f7be0" strokeWidth="4" strokeLinecap="round" opacity=".5" />
        <path d="M32 127v8M40 127v8M48 127v8M56 127v8M64 127v8M72 127v8M80 127v8M88 127v8M96 127v8M104 127v8M112 127v8M120 127v8M128 127v8M136 127v8M144 127v8M152 127v8M160 127v8M168 127v8" stroke="#3f7be0" strokeWidth="2" opacity=".45" />
        <path d="M159 38c-3-3-8-1-8 3 0 3 5 6 8 8 3-2 8-5 8-8 0-4-5-6-8-3Z" fill="#a9c6ff" />
        <circle cx="42" cy="44" r="5" fill="none" stroke="#a9c6ff" strokeWidth="2" />
        <circle cx="135" cy="38" r="3.5" fill="#fff" opacity=".9" />
      </svg>
    );
  }

  if (kind === 'mattress') {
    return (
      <svg {...common} style={{ ...common.style, opacity }}>
        <ellipse cx="100" cy="139" rx="68" ry="8" fill="#8668dd" opacity=".1" />
        <rect x="40" y="28" width="120" height="38" rx="14" fill="#8f76e6" />
        <rect x="52" y="38" width="96" height="18" rx="9" fill="#a894f0" opacity=".6" />
        <rect x="31" y="63" width="138" height="58" rx="16" fill="#fff" stroke="#e4dcf8" strokeWidth="2" />
        <rect x="37" y="74" width="126" height="40" rx="12" fill="#f4efff" />
        <path d="M55 74v40M73 74v40M91 74v40M109 74v40M127 74v40M145 74v40M37 94h126" stroke="#ddd2f5" strokeWidth="1.6" />
        <rect x="48" y="52" width="42" height="22" rx="10" fill="#fff" />
        <rect x="56" y="57" width="26" height="12" rx="6" fill="#e9e1fb" />
        <path d="M31 115h138" stroke="#d8ccef" strokeWidth="6" strokeLinecap="round" />
        <rect x="43" y="121" width="9" height="12" rx="3" fill="#8f76e6" />
        <rect x="148" y="121" width="9" height="12" rx="3" fill="#8f76e6" />
        <path d="M162 45c0 0-7 7.7-7 12.6a7 7 0 0 0 14 0c0-4.9-7-12.6-7-12.6Z" fill="#cbbcf4" />
        <circle cx="43" cy="47" r="5" fill="none" stroke="#cbbcf4" strokeWidth="2" />
        <path d="M34 99c-3-3-8-1-8 3 0 3 5 6 8 8 3-2 8-5 8-8 0-4-5-6-8-3Z" fill="#e3daf8" />
      </svg>
    );
  }

  return (
    <svg {...common} style={{ ...common.style, opacity }}>
      <ellipse cx="100" cy="139" rx="68" ry="8" fill="#0e9fb7" opacity=".1" />
      <path d="M30 32h140" stroke="#d6eef2" strokeWidth="3" strokeLinecap="round" />
      <rect x="42" y="45" width="116" height="48" rx="14" fill="#fff" stroke="#cfe9ee" strokeWidth="2" />
      <path d="M55 78h90" stroke="#bfe2e8" strokeWidth="3" strokeLinecap="round" />
      <path d="M55 84h70" stroke="#d9eef2" strokeWidth="2" strokeLinecap="round" />
      <path d="M55 61h44" stroke="#e8f5f7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="141" cy="62" r="3" fill="#20c4d8" />
      <path d="M139 56c2-3 6-4 9-3" stroke="#b7e4ea" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M59 99c-4 10-2 19 6 25M86 99c-3 12 1 23 10 29M113 99c0 10 5 19 14 24M140 99c3 9 2 17-2 24" stroke="#7fd6e2" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M167 88c0 0-6 6.6-6 10.8a6 6 0 0 0 12 0c0-4.2-6-10.8-6-10.8Z" fill="#9fe4ec" />
      <circle cx="34" cy="75" r="5" fill="none" stroke="#9fe4ec" strokeWidth="2" />
      <circle cx="54" cy="34" r="3" fill="#fff" />
      <path d="M31 115c-3-3-8-1-8 3 0 3 5 6 8 8 3-2 8-5 8-8 0-4-5-6-8-3Z" fill="#c4eef3" />
    </svg>
  );
}

export function EmptyArt({ variant = 'order' }: { variant?: 'order' | 'search' | 'favorite' }) {
  return (
    <svg viewBox="0 0 220 170" role="img" aria-label="空状态插画" className="empty-art">
      <ellipse cx="110" cy="146" rx="66" ry="9" fill="#e9edf4" />
      <circle cx="110" cy="82" r="54" fill={variant === 'search' ? '#eef3ff' : variant === 'favorite' ? '#fff1f0' : '#f1f6f5'} />
      <path d="M73 94h74l-8 38H81l-8-38Z" fill="#fff" stroke="#dbe3ea" strokeWidth="2" />
      <path d="M73 94 84 68h52l11 26" fill="none" stroke="#dbe3ea" strokeWidth="2" />
      <path d="M84 68 90 54h40l6 14" fill="none" stroke="#dbe3ea" strokeWidth="2" />
      {variant === 'search' ? (
        <>
          <circle cx="105" cy="84" r="16" fill="none" stroke="#3f7be0" strokeWidth="4" />
          <path d="m117 96 13 13" stroke="#3f7be0" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : variant === 'favorite' ? (
        <path
          d="M111 112s-17-10-17-21a9.5 9.5 0 0 1 17-6.5 9.5 9.5 0 0 1 17 6.5c0 11-17 21-17 21Z"
          fill="#ffd9d3"
          stroke="#ef6655"
          strokeWidth="2.5"
        />
      ) : (
        <>
          <rect x="92" y="76" width="36" height="28" rx="7" fill="#e8f8f3" />
          <path d="M110 80c0 0-7 7.6-7 12.3a7 7 0 0 0 14 0C117 87.6 110 80 110 80Z" fill="#17a98f" />
          <path d="M100 124h20" stroke="#eef2f6" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <path d="M152 52c4 0 6 2 6 6s-2 6-6 6-6-2-6-6 2-6 6-6Z" fill="#ffe0b0" />
      <path d="M63 61c3 0 4.5 1.5 4.5 4.5S66 70 63 70s-4.5-1.5-4.5-4.5S60 61 63 61Z" fill="#cfe9f1" />
      <path d="M150 116h14M157 109v14" stroke="#d7dee8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const palettes = [
  { bg: '#ffe9e0', skin: '#f2c6a3', hair: '#372a26', shirt: '#1fb5a3' },
  { bg: '#e6f7f2', skin: '#e9b68d', hair: '#25201f', shirt: '#1fb5a3' },
  { bg: '#e9f0ff', skin: '#d9a077', hair: '#1f2329', shirt: '#2aa7b8' },
  { bg: '#f1ecff', skin: '#f4ceb0', hair: '#4a332b', shirt: '#1fb5a3' },
  { bg: '#e7f6fa', skin: '#c98f66', hair: '#2b2523', shirt: '#2aa7b8' },
  { bg: '#fff0e8', skin: '#eec0a0', hair: '#3a2c26', shirt: '#1fb5a3' },
];

export function Avatar({
  seed = 1,
  size = 52,
  className,
}: {
  seed?: number;
  size?: number;
  className?: string;
}) {
  const idx = ((Math.round(seed) - 1) % palettes.length + palettes.length) % palettes.length;
  const p = palettes[idx];
  const female = idx === 1 || idx === 3 || idx === 5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label="服务师傅头像"
    >
      <circle cx="40" cy="40" r="40" fill={p.bg} />
      <path d="M9 82c2.6-17 14-25 31-25s28.4 8 31 25H9Z" fill={p.shirt} />
      <path d="M31 57c3.4 5 6.4 7 9 7s5.6-2 9-7l-4-2h-10l-4 2Z" fill="#fff" opacity=".9" />
      <rect x="35" y="48" width="10" height="12" rx="4" fill={p.skin} />
      <circle cx="40" cy="35" r="15" fill={p.skin} />
      <circle cx="25.5" cy="36" r="2.6" fill={p.skin} />
      <circle cx="54.5" cy="36" r="2.6" fill={p.skin} />
      {female ? (
        <>
          <path
            d="M24 38c-1-15 7-24 16-24s17 9 16 24c-2-1-4-4-4-8-4 3-8 4-12 4s-8-1-12-4c0 4-2 7-4 8Z"
            fill={p.hair}
          />
          {idx === 1 && <circle cx="56" cy="24" r="7" fill={p.hair} />}
          {idx === 5 && <path d="M52 30c7 1 10 7 9 17-4-2-6-6-6-11" fill={p.hair} />}
        </>
      ) : (
        <>
          <path d="M25 34c1-12 7-19 15-19s14 7 15 19c-4-2-7-5-8-9-4 3-9 4-14 3-2 3-4 5-8 6Z" fill={p.hair} />
          {idx === 4 && <path d="M22 33h36c-1-4-4-6-8-6H30c-4 0-7 2-8 6Z" fill="#2aa7b8" />}
        </>
      )}
      <path d="M34.5 36v1.3M45.5 36v1.3" stroke="#41312b" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M35 42.5c1.7 1.4 3.4 2 5 2s3.3-.6 5-2" stroke="#b5745c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M40 22.5c4 0 7 1.4 9.5 4" stroke="#fff" strokeWidth="1.5" opacity=".25" strokeLinecap="round" fill="none" />
    </svg>
  );
}
