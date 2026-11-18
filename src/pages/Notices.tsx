import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState } from '../components/Bits';
import { relativeTime } from '../lib/format';
import type { NoticeType } from '../data/types';

const typeMeta: Record<NoticeType, { label: string; icon: IconName; tone: string }> = {
  order: { label: '订单', icon: 'receipt', tone: 'red' },
  promo: { label: '活动', icon: 'gift', tone: 'gold' },
  system: { label: '系统', icon: 'info', tone: 'blue' },
};

export default function Notices() {
  const { state, login, markNoticesRead, markNoticeRead, openAgreement } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | NoticeType>('all');
  const unread = state.notices.filter((n) => !n.read).length;

  const notices = useMemo(() => {
    const list = filter === 'all' ? state.notices : state.notices.filter((n) => n.type === filter);
    return [...list].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [state.notices, filter]);

  if (!state.user) {
    return (
      <div className="page notices-page">
        <NavBar title="消息" />
        <EmptyState
          title="登录后查看消息"
          desc="订单状态、师傅接单与服务提醒会出现在这里"
          action={
            <button type="button" className="btn btn-primary" onClick={() => login()}>
              <Icon name="wechat" size={18} /> 微信一键登录
            </button>
          }
        />
        <p className="notices-terms">
          登录即代表你同意
          <button type="button" className="inline-link" onClick={() => openAgreement('user')}>《用户协议》</button>
          <button type="button" className="inline-link" onClick={() => openAgreement('privacy')}>《隐私政策》</button>
        </p>
        <p className="notices-note">消息是演示数据，登录后即可查看</p>
      </div>
    );
  }

  return (
    <div className="page notices-page">
      <NavBar
        title="消息"
        right={unread ? <button type="button" className="text-link" onClick={markNoticesRead}>全部已读</button> : undefined}
      />
      <main className="notices-main">
        <div className="notice-filters" role="tablist" aria-label="消息类型">
          {([
            ['all', '全部'],
            ['order', '订单'],
            ['promo', '活动'],
            ['system', '系统'],
          ] as ['all' | NoticeType, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`notice-filter${filter === key ? ' is-active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {notices.length === 0 ? (
          <EmptyState title="暂无消息" desc="订单状态变化与服务提醒会出现在这里" />
        ) : (
          <div className="notice-list">
            {notices.map((notice) => {
              const meta = typeMeta[notice.type];
              return (
                <button
                  key={notice.id}
                  type="button"
                  className={`notice-item${notice.read ? '' : ' is-unread'}`}
                  onClick={() => {
                    markNoticeRead(notice.id);
                    if (notice.orderId) navigate(`/order/${notice.orderId}`);
                    else if (notice.type === 'promo') navigate('/coupons');
                  }}
                >
                  <span className={`notice-icon tone-${meta.tone}`}><Icon name={meta.icon} size={20} /></span>
                  <span className="notice-copy">
                    <span className="notice-title-line">
                      <strong>{notice.title}</strong>
                      <em>{relativeTime(notice.time)}</em>
                    </span>
                    <span className="notice-body">{notice.body}</span>
                    <span className="notice-type">{meta.label}{notice.orderId ? ' · 点击查看订单' : ''}</span>
                  </span>
                  {notice.read ? null : <span className="notice-unread-dot" />}
                </button>
              );
            })}
          </div>
        )}

        <p className="notices-note">消息为演示数据，订单状态变化会自动生成新消息。</p>
      </main>
    </div>
  );
}
