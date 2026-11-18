import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { Icon, type IconName } from '../components/Icon';
import { Dialog } from '../components/Overlays';
import { Tag } from '../components/Bits';
import { maskPhone } from '../lib/format';
import { LogoMark } from '../components/Brand';

const serviceEntries: { label: string; icon: IconName; path?: string; action?: string; tone: string }[] = [
  { label: '地址管理', icon: 'pin', path: '/addresses', tone: 'red' },
  { label: '优惠券', icon: 'ticket', path: '/coupons', tone: 'gold' },
  { label: '我的收藏', icon: 'heart', path: '/favorites', tone: 'purple' },
  { label: '联系客服', icon: 'headset', path: '/support', tone: 'blue' },
];

const settingEntries: { label: string; icon: IconName; path?: string; action?: string }[] = [
  { label: '服务保障', icon: 'shieldCheck', action: 'guarantee' },
  { label: '协议中心', icon: 'receipt', path: '/agreements' },
  { label: '关于净到家', icon: 'info', path: '/about' },
  { label: '联系客服', icon: 'headset', path: '/support' },
];

export default function Mine() {
  const { state, logout, openAgreement, openPhoneAuth, resetDemo, toast } = useApp();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const user = state.user;
  const completed = user ? state.orders.filter((o) => o.status === 'completed').length : 0;
  const counts = {
    pending_payment: user ? state.orders.filter((o) => o.status === 'pending_payment').length : 0,
    to_serve: user ? state.orders.filter((o) => ['pending_accept', 'pending_service', 'on_the_way'].includes(o.status)).length : 0,
    in_service: user ? state.orders.filter((o) => o.status === 'in_service').length : 0,
    pending_review: user ? state.orders.filter((o) => o.status === 'pending_review').length : 0,
  };
  const unread = user ? state.notices.filter((n) => !n.read).length : 0;
  const availableCoupons = user
    ? state.coupons.filter((c) => !c.used && new Date(c.expiresAt) > new Date()).length
    : 0;
  const savedAmount = user
    ? state.orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.discount, 0)
    : 0;

  const requireLogin = (action: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action();
  };

  return (
    <div className="page mine-page">
      <header className="mine-head">
        <div className="mine-head-bg" aria-hidden="true" />
        <div className="mine-head-top">
          <span className="mine-brand"><LogoMark size={22} /> 净到家</span>
          <div className="mine-head-actions">
            <button type="button" className="mine-icon-btn" aria-label="消息" onClick={() => navigate('/notices')}>
              <Icon name="bell" size={20} />
              {unread ? <span className="mine-icon-dot" /> : null}
            </button>
            <button type="button" className="mine-icon-btn" aria-label="设置" onClick={() => toast('演示环境设置项见下方列表', 'info')}>
              <Icon name="settings" size={20} />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mine-user"
          onClick={() => (user ? openPhoneAuth('用于接收订单通知与售后联系', undefined) : navigate('/login'))}
        >
          <span className={`mine-avatar${user ? '' : ' is-guest'}`}>
            {user ? user.name.slice(0, 1) : <Icon name="user" size={26} />}
          </span>
          <span className="mine-user-copy">
            {user ? (
              <>
                <span className="mine-name-line">
                  <strong>{user.name}</strong>
                  <Tag tone="gold">Lv.{user.memberLevel} 洁净会员</Tag>
                </span>
                <span className="mine-phone">
                  {user.phone ? maskPhone(user.phone) : '点击获取手机号'}
                  {user.phoneVerified ? <Icon name="checkCircle" size={12} /> : null}
                </span>
              </>
            ) : (
              <>
                <strong className="mine-login-title">点击登录 / 注册</strong>
                <span className="mine-phone">登录后查看订单、优惠券与售后进度</span>
              </>
            )}
          </span>
          <Icon name="chevronRight" size={18} className="mine-user-arrow" />
        </button>
        <div className="mine-head-stats">
          <div><strong>{completed}</strong><span>已完成</span></div>
          <div><strong>{user ? state.favorites.length : 0}</strong><span>收藏</span></div>
          <div><strong>{availableCoupons}</strong><span>可用券</span></div>
          <div><strong>{`¥${savedAmount}`}</strong><span>累计节省</span></div>
        </div>
      </header>

      <main className="mine-main">
        <section className="mine-order-card">
          <div className="mine-card-head">
            <h2>我的订单</h2>
            <button type="button" className="link-more" onClick={() => requireLogin(() => navigate('/orders'))}>
              全部订单 <Icon name="chevronRight" size={13} />
            </button>
          </div>
          <div className="mine-order-grid">
            {[
              { key: 'pending_payment', label: '待付款', icon: 'wallet' as IconName, count: counts.pending_payment, tab: 'pending_payment' },
              { key: 'to_serve', label: '待服务', icon: 'calendar' as IconName, count: counts.to_serve, tab: 'to_serve' },
              { key: 'in_service', label: '服务中', icon: 'spray' as IconName, count: counts.in_service, tab: 'in_service' },
              { key: 'pending_review', label: '待评价', icon: 'star' as IconName, count: counts.pending_review, tab: 'pending_review' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className="mine-order-item"
                onClick={() => requireLogin(() => navigate(`/orders?tab=${item.tab}`))}
              >
                <span className="mine-order-icon">
                  <Icon name={item.icon} size={21} />
                  {item.count ? <em>{item.count}</em> : null}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mine-service-card">
          <div className="mine-card-head"><h2>我的服务</h2></div>
          <div className="mine-service-grid">
            {serviceEntries.map((entry) => (
              <button
                key={entry.label}
                type="button"
                className="mine-service-item"
                onClick={() => {
                  if (entry.path === '/addresses' || entry.path === '/coupons' || entry.path === '/favorites') {
                    requireLogin(() => navigate(entry.path!));
                  } else if (entry.path) {
                    navigate(entry.path);
                  }
                }}
              >
                <span className={`mine-service-icon tone-${entry.tone}`}><Icon name={entry.icon} size={20} /></span>
                <span>{entry.label}</span>
                {entry.label === '优惠券' && user && availableCoupons ? (
                  <em className="mine-service-badge">{availableCoupons}</em>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        <section className="mine-vip-card">
          <div className="mine-vip-copy">
            <span className="mine-vip-label"><Icon name="sparkle" size={13} /> 洁净会员</span>
            <strong>{user ? `Lv.${user.memberLevel} · 专属清洗管家` : '登录解锁会员权益'}</strong>
            <span>专属优惠 · 优先派单 · 售后加速</span>
          </div>
          <button
            type="button"
            className="mine-vip-btn"
            onClick={() => requireLogin(() => toast('会员权益为演示内容，敬请期待', 'info'))}
          >
            查看权益
          </button>
        </section>

        <section className="mine-menu">
          {settingEntries.map((entry) => (
            <button
              key={entry.label}
              type="button"
              className="mine-menu-row"
              onClick={() => {
                if (entry.action === 'guarantee') openAgreement('guarantee');
                else if (entry.path) navigate(entry.path);
              }}
            >
              <span className="mine-menu-icon"><Icon name={entry.icon} size={18} /></span>
              <span>{entry.label}</span>
              <Icon name="chevronRight" size={16} />
            </button>
          ))}
        </section>

        <section className="mine-menu">
          {user ? (
            <button type="button" className="mine-menu-row" onClick={() => setLogoutOpen(true)}>
              <span className="mine-menu-icon"><Icon name="logout" size={18} /></span>
              <span>退出登录</span>
              <Icon name="chevronRight" size={16} />
            </button>
          ) : (
            <button type="button" className="mine-menu-row" onClick={() => navigate('/login')}>
              <span className="mine-menu-icon"><Icon name="user" size={18} /></span>
              <span>登录 / 注册</span>
              <Icon name="chevronRight" size={16} />
            </button>
          )}
          <button type="button" className="mine-menu-row" onClick={() => setResetOpen(true)}>
            <span className="mine-menu-icon"><Icon name="refresh" size={18} /></span>
            <span>重置演示数据</span>
            <Icon name="chevronRight" size={16} />
          </button>
        </section>

        <footer className="mine-footer">
          <LogoMark size={26} />
          <span>净到家 · 家政清洗演示</span>
          <em>v1.0.0 · 前端模拟数据</em>
          <p>本产品为内部演示，非真实商业产品</p>
        </footer>
      </main>

      <Dialog
        open={logoutOpen}
        title="退出登录"
        description="退出后订单与地址仍会保留在演示数据中，下次登录可继续查看。"
        confirmText="确认退出"
        cancelText="取消"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          logout();
          setLogoutOpen(false);
        }}
      />
      <Dialog
        open={resetOpen}
        title="重置演示数据"
        description="将清除你创建的所有订单、地址、评价与登录状态，恢复初始演示数据。此操作不可撤销。"
        confirmText="重置"
        cancelText="取消"
        tone="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
          navigate('/', { replace: true });
        }}
      />
    </div>
  );
}
