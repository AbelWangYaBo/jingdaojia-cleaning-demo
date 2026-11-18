import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { PROVIDER_MAP } from '../data/catalog';
import { Icon } from '../components/Icon';
import { EmptyState, Spinner, Tag } from '../components/Bits';
import { Sheet } from '../components/Overlays';
import { Avatar } from '../components/Brand';
import {
  appointmentText,
  formatFullDateTime,
  maskPhone,
  money,
} from '../lib/format';

type PayMethod = 'wechat' | 'balance';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state, payOrder, cancelOrder, toast } = useApp();
  const order = state.orders.find((o) => o.id === orderId);
  const [method, setMethod] = useState<PayMethod>('wechat');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const expired = useRef(false);

  const expireAt = order ? new Date(order.createdAt).getTime() + 15 * 60 * 1000 : 0;

  useEffect(() => {
    if (!order || order.status !== 'pending_payment') return;
    expired.current = false;
    const tick = () => {
      const ms = expireAt - Date.now();
      setRemaining(Math.max(0, ms));
      if (ms <= 0 && !expired.current) {
        expired.current = true;
        cancelOrder(order.id, '支付超时');
        toast('支付超时，订单已自动取消', 'info');
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [order, expireAt, cancelOrder, toast]);

  if (!order) {
    return (
      <div className="page">
        <NavBar title="收银台" />
        <EmptyState
          title="订单不存在"
          desc="订单可能已被删除，请返回订单列表查看"
          action={<Link to="/orders" className="btn btn-primary">查看订单</Link>}
        />
      </div>
    );
  }

  if (order.status !== 'pending_payment') {
    return (
      <div className="page">
        <NavBar title="收银台" onBack={() => navigate(`/order/${order.id}`, { replace: true })} />
        <div className="pay-state">
          <div className="pay-state-icon">
            <Icon name={order.status === 'cancelled' ? 'alert' : 'checkCircle'} size={38} />
          </div>
          <h1>{order.status === 'cancelled' ? '订单已取消' : '订单已支付'}</h1>
          <p>
            {order.status === 'cancelled'
              ? '支付超时或订单已取消，可重新预约服务。'
              : `支付状态已更新，无需重复支付。`}
          </p>
          <Link to={`/order/${order.id}`} className="btn btn-primary btn-block">查看订单详情</Link>
          <Link to="/" className="btn btn-ghost btn-block">返回首页</Link>
        </div>
      </div>
    );
  }

  const assignedProvider = order.providerId ? PROVIDER_MAP[order.providerId] : null;
  const preferredProvider = order.preferredProviderId
    ? PROVIDER_MAP[order.preferredProviderId]
    : null;
  const provider = assignedProvider ?? preferredProvider;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const countdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const methodLabel = method === 'wechat' ? '微信支付' : '余额支付';

  const confirmPay = () => {
    setPaying(true);
    window.setTimeout(() => {
      payOrder(order.id, methodLabel);
      setPaying(false);
      setSheetOpen(false);
      navigate(`/pay-success/${order.id}`, { replace: true });
    }, 900);
  };

  return (
    <div className="page payment-page">
      <NavBar
        title="收银台"
        onBack={() => navigate(`/order/${order.id}`, { replace: true })}
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label="支付帮助"
            onClick={() => toast('演示环境不会真实扣款，如有疑问请联系客服', 'info')}
          >
            <Icon name="headset" size={20} />
          </button>
        }
      />
      <main className="payment-main">
        <div className={`pay-countdown${remaining < 5 * 60000 ? ' is-urgent' : ''}`}>
          <Icon name="clock" size={15} />
          剩余支付时间 <strong>{countdown}</strong>
          <span>超时订单将自动取消</span>
        </div>

        <section className="pay-amount-card">
          <span className="pay-amount-label">需支付</span>
          <strong className="pay-amount">{money(order.total)}</strong>
          {order.discount > 0 ? <span className="pay-save">已优惠 {money(order.discount)}</span> : null}
          <div className="pay-amount-service">
            <span>{order.serviceName}</span>
            <span>{order.optionLabel} × {order.qty} {order.unit}</span>
          </div>
        </section>

        <section className="payment-card">
          <h2>订单信息</h2>
          <div className="pay-info-row"><span>预约时间</span><strong>{appointmentText(order.date, order.slot)}</strong></div>
          <div className="pay-info-row"><span>服务地址</span><strong>{order.address.city} {order.address.district} {order.address.detail}</strong></div>
          <div className="pay-info-row"><span>联系人</span><strong>{order.contactName} {maskPhone(order.contactPhone)}</strong></div>
          <div className="pay-info-row">
            <span>服务师傅</span>
            <strong className="pay-provider">
              {provider ? (
                <>
                  <Avatar seed={provider.avatar} size={20} /> {provider.name} ·{' '}
                  {assignedProvider ? '已接单' : '已指定'}
                </>
              ) : (
                <>
                  <Icon name="sparkle" size={14} /> 平台优选（支付后匹配）
                </>
              )}
            </strong>
          </div>
          <div className="pay-info-row"><span>订单编号</span><strong>{order.no}</strong></div>
          <div className="pay-info-row"><span>下单时间</span><strong>{formatFullDateTime(order.createdAt)}</strong></div>
        </section>

        <section className="payment-card">
          <h2>支付方式</h2>
          <button
            type="button"
            className={`pay-method${method === 'wechat' ? ' is-active' : ''}`}
            onClick={() => setMethod('wechat')}
          >
            <span className="pay-method-icon pay-wechat"><Icon name="wechat" size={22} /></span>
            <span className="pay-method-copy">
              <strong>微信支付</strong>
              <span>推荐使用，安全快捷</span>
            </span>
            <span className="pay-radio">{method === 'wechat' ? <Icon name="check" size={12} strokeWidth={3} /> : null}</span>
          </button>
          <button
            type="button"
            className={`pay-method${method === 'balance' ? ' is-active' : ''}`}
            onClick={() => setMethod('balance')}
          >
            <span className="pay-method-icon pay-balance"><Icon name="wallet" size={21} /></span>
            <span className="pay-method-copy">
              <strong>余额支付</strong>
              <span>演示余额 ¥999.00</span>
            </span>
            <Tag tone="soft">演示</Tag>
            <span className="pay-radio">{method === 'balance' ? <Icon name="check" size={12} strokeWidth={2.6} /> : null}</span>
          </button>
        </section>

        <div className="pay-security">
          <Icon name="lock" size={14} />
          <span>支付由支付渠道提供安全保障。演示环境不会产生真实扣款。</span>
        </div>
        <div className="pay-links">
          <button type="button" className="text-link" onClick={() => toast('已为你记录问题，请稍后联系客服', 'info')}>支付遇到问题</button>
          <i />
          <button type="button" className="text-link" onClick={() => navigate('/agreements')}>支付与服务协议</button>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-block pay-later"
          onClick={() => navigate(`/order/${order.id}`, { replace: true })}
        >
          暂不支付，稍后再说
        </button>
      </main>

      <div className="action-bar pay-bar">
        <div className="pay-bar-amount">
          <span>需支付</span>
          <strong>{money(order.total)}</strong>
        </div>
        <button type="button" className="btn btn-primary pay-submit" onClick={() => setSheetOpen(true)}>
          立即支付
        </button>
      </div>

      <Sheet
        open={sheetOpen}
        title={method === 'wechat' ? '微信支付' : '余额支付'}
        subtitle="演示支付 · 不会真实扣款"
        onClose={() => {
          if (!paying) setSheetOpen(false);
        }}
        footer={
          <div className="pay-sheet-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setSheetOpen(false)} disabled={paying}>
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmPay} disabled={paying}>
              {paying ? <Spinner size={16} light /> : null}
              {paying ? '支付中…' : `确认支付 ${money(order.total)}`}
            </button>
          </div>
        }
      >
        <div className="pay-confirm">
          <span className={`pay-confirm-icon${method === 'balance' ? ' is-balance' : ''}`}>
            <Icon name={method === 'wechat' ? 'wechat' : 'wallet'} size={28} />
          </span>
          <span className="pay-confirm-merchant">净到家 · 家政清洗服务</span>
          <strong className="pay-confirm-amount">{money(order.total)}</strong>
          <span className="pay-confirm-method">{methodLabel}</span>
          <p>
            {method === 'wechat'
              ? '确认后将模拟微信支付成功，订单进入「待接单」状态。'
              : '确认后将使用演示余额支付，余额不会真实扣减。'}
          </p>
        </div>
      </Sheet>
    </div>
  );
}
