import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { EmptyArt } from './Brand';

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-head-main">
        <h2 className="section-title">
          {icon ? <span className="section-icon">{icon}</span> : null}
          {title}
        </h2>
        {subtitle ? <p className="section-sub">{subtitle}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

export type TagTone = 'soft' | 'red' | 'mint' | 'gold' | 'blue' | 'purple' | 'outline' | 'grey';

export function Tag({ children, tone = 'soft' }: { children: ReactNode; tone?: TagTone }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function RatingStars({
  value,
  size = 13,
  showValue = false,
  count,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  const starRow = (
    <span className="stars-row">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} strokeWidth={1.2} filled />
      ))}
    </span>
  );
  return (
    <span className="rating" aria-label={`评分 ${value} 分`}>
      <span className="stars" style={{ width: `${size * 5 + 4}px` }}>
        <span className="stars-base">{starRow}</span>
        <span className="stars-fill" style={{ width: `${percent}%` }}>
          {starRow}
        </span>
      </span>
      {showValue ? <strong className="rating-value">{value.toFixed(1)}</strong> : null}
      {typeof count === 'number' ? <span className="rating-count">({count})</span> : null}
    </span>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  suffix,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  suffix?: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={label ?? '数量'}>
      <button
        type="button"
        className="stepper-btn"
        disabled={value <= min}
        aria-label="减少数量"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="minus" size={15} />
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
        {suffix ? <em>{suffix}</em> : null}
      </span>
      <button
        type="button"
        className="stepper-btn"
        disabled={value >= max}
        aria-label="增加数量"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children?: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`checkbox${checked ? ' is-checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="checkbox-box">
        {checked ? <Icon name="check" size={12} strokeWidth={2.6} /> : null}
      </span>
      {children ? <span className="checkbox-label">{children}</span> : null}
    </button>
  );
}

export function EmptyState({
  title,
  desc,
  action,
  variant = 'order',
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  variant?: 'order' | 'search' | 'favorite';
}) {
  return (
    <div className="empty-state">
      <EmptyArt variant={variant} />
      <h3>{title}</h3>
      {desc ? <p>{desc}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function Spinner({ size = 18, light = false }: { size?: number; light?: boolean }) {
  return <span className={`spinner${light ? ' spinner-light' : ''}`} style={{ width: size, height: size }} aria-label="加载中" />;
}

export function Price({
  value,
  original,
  unit,
  size = 'md',
}: {
  value: number;
  original?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span className={`price price-${size}`}>
      <span className="price-symbol">¥</span>
      <strong className="price-value">{value}</strong>
      {unit ? <span className="price-unit">/{unit}</span> : null}
      {original && original > value ? <del className="price-original">¥{original}</del> : null}
    </span>
  );
}

export function Divider({ text }: { text?: string }) {
  return (
    <div className="divider">
      {text ? <span>{text}</span> : null}
    </div>
  );
}

export function ToastIcon({ tone }: { tone: string }) {
  if (tone === 'success') return <Icon name="checkCircle" size={17} />;
  if (tone === 'error') return <Icon name="alert" size={17} />;
  if (tone === 'info') return <Icon name="info" size={17} />;
  return <Icon name="sparkle" size={16} />;
}
