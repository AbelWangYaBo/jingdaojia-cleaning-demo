import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useApp } from '../store/AppStore';

export function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  return (
    <div className={`statusbar statusbar-${tone}`} aria-hidden="true">
      <span className="statusbar-time">{`${hh}:${mm}`}</span>
      <span className="statusbar-island" />
      <span className="statusbar-icons">
        <span className="statusbar-signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <svg width="15" height="11" viewBox="0 0 15 11" className="statusbar-wifi">
          <path
            d="M1 4.2a9.8 9.8 0 0 1 13 0M3.4 6.7a6.2 6.2 0 0 1 8.2 0M5.8 9.1a2.6 2.6 0 0 1 3.4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="statusbar-battery">
          <span className="statusbar-battery-fill" />
        </span>
      </span>
    </div>
  );
}

interface NavBarProps {
  title?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export function NavBar({ title, back = true, onBack, right, transparent = false, className = '' }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (location.key !== 'default' && window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  return (
    <header className={`navbar${transparent ? ' navbar-transparent' : ''}${className ? ` ${className}` : ''}`}>
      <div className="navbar-side navbar-left">
        {back ? (
          <button type="button" className="icon-btn" aria-label="返回" onClick={goBack}>
            <Icon name="chevronLeft" size={22} />
          </button>
        ) : null}
      </div>
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-side navbar-right">{right}</div>
    </header>
  );
}

export function TabBar() {
  const { state } = useApp();
  const location = useLocation();
  const pendingPay = state.orders.filter((o) => o.status === 'pending_payment').length;
  const activeOrders = state.orders.filter((o) =>
    ['pending_accept', 'pending_service', 'on_the_way', 'in_service', 'pending_review'].includes(o.status),
  ).length;
  const notifications = state.notices.filter((n) => !n.read).length;
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const items = [
    { path: '/', label: '首页', icon: 'home' as const, badge: 0 },
    { path: '/orders', label: '订单', icon: 'receipt' as const, badge: state.user ? pendingPay || activeOrders : 0 },
    { path: '/mine', label: '我的', icon: 'user' as const, badge: state.user ? notifications : 0 },
  ];

  return (
    <nav className="tabbar" aria-label="底部导航">
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`tabbar-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              const scroller = document.getElementById('app-scroll');
              if (scroller) scroller.scrollTop = 0;
            }}
          >
            <span className="tabbar-icon">
              <Icon name={item.icon} size={23} strokeWidth={active ? 2.1 : 1.75} />
              {item.badge ? <span className="tabbar-dot" aria-hidden="true" /> : null}
            </span>
            <span className="tabbar-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppHeaderHome({
  city,
  onCity,
  onSearch,
  onBell,
  unread,
}: {
  city: string;
  onCity: () => void;
  onSearch: () => void;
  onBell: () => void;
  unread: number;
}) {
  return (
    <div className="home-head">
      <div className="home-head-row">
        <button type="button" className="city-btn" onClick={onCity} aria-label="切换城市">
          <Icon name="pin" size={17} />
          <span>{city}</span>
          <Icon name="chevronDown" size={14} />
        </button>
        <span className="home-head-slogan">专业清洗 · 安心到家</span>
        <button type="button" className="home-bell" onClick={onBell} aria-label="消息">
          <Icon name="bell" size={21} />
          {unread > 0 ? <span className="home-bell-dot" /> : null}
        </button>
      </div>
      <button type="button" className="home-search" onClick={onSearch}>
        <Icon name="search" size={18} />
        <span>搜索 沙发清洗 / 空调清洗</span>
        <span className="home-search-tag">清洗季</span>
      </button>
      <div className="home-trust">
        <span><Icon name="shieldCheck" size={13} /> 平台认证师傅</span>
        <span><Icon name="clock" size={13} /> 准时上门</span>
        <span><Icon name="refresh" size={13} /> 不满意重做</span>
      </div>
    </div>
  );
}
