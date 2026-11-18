import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { CouponCard } from '../components/Cards';
import { EmptyState } from '../components/Bits';
import { Icon } from '../components/Icon';
import { money } from '../lib/format';

type CouponTab = 'available' | 'used' | 'expired';

export default function Coupons() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<CouponTab>('available');

  const now = Date.now();
  const available = useMemo(
    () => state.coupons.filter((c) => !c.used && new Date(c.expiresAt).getTime() >= now),
    [state.coupons, now],
  );
  const used = useMemo(() => state.coupons.filter((c) => c.used), [state.coupons]);
  const expired = useMemo(
    () => state.coupons.filter((c) => !c.used && new Date(c.expiresAt).getTime() < now),
    [state.coupons, now],
  );
  const list = tab === 'available' ? available : tab === 'used' ? used : expired;
  const maxSave = available.reduce((max, c) => Math.max(max, c.amount), 0);

  const useCoupon = (scope: typeof state.coupons[number]['scope']) => {
    if (scope && scope.length === 1) navigate(`/service/${scope[0]}`);
    else navigate('/');
  };

  return (
    <div className="page coupons-page">
      <NavBar title="我的优惠券" right={<Link to="/agreements" className="text-link">规则</Link>} />
      <main className="coupons-main">
        <section className="coupon-hero">
          <div>
            <span>可用优惠券</span>
            <strong>{available.length}<em>张</em></strong>
            <p>最高可省 {money(maxSave)}</p>
          </div>
          <span className="coupon-hero-icon"><Icon name="ticket" size={46} /></span>
        </section>

        <div className="coupon-tabs" role="tablist" aria-label="优惠券状态">
          {([
            ['available', '可用', available.length],
            ['used', '已使用', used.length],
            ['expired', '已过期', expired.length],
          ] as [CouponTab, string, number][]).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`coupon-tab${tab === key ? ' is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}{count ? <em>{count}</em> : null}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            title={tab === 'available' ? '暂无可用优惠券' : tab === 'used' ? '还没有使用过优惠券' : '没有过期的优惠券'}
            desc={tab === 'available' ? '完成服务评价可获得 5 元无门槛券' : undefined}
            action={tab === 'available' ? <Link to="/" className="btn btn-primary">去预约服务</Link> : undefined}
          />
        ) : (
          <div className="coupon-list">
            {list.map((coupon) => (
              <div key={coupon.id} className="coupon-item">
                <CouponCard coupon={coupon} expired={tab === 'expired'} />
                {tab === 'available' ? (
                  <button type="button" className="coupon-use-btn" onClick={() => useCoupon(coupon.scope)}>
                    去使用
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <section className="coupon-rules">
          <h3><Icon name="info" size={15} /> 使用说明</h3>
          <ul>
            <li>优惠券在订单金额达到门槛后可用，每单限用一张。</li>
            <li>优惠券不可兑换现金，不与其他满减活动叠加使用。</li>
            <li>订单取消后，优惠券在有效期内退回账户。</li>
            <li>演示环境中的优惠券不涉及真实资金。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
