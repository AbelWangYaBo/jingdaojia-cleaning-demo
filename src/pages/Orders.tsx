import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import type { Order } from '../data/types';
import { Icon } from '../components/Icon';
import { OrderCard } from '../components/Cards';
import { EmptyState } from '../components/Bits';
import { CancelOrderSheet } from '../components/OrderActions';
import { orderMatchesTab, orderTabs } from '../lib/format';

export default function Orders() {
  const { state, login, beginReorder, toast } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const tab = params.get('tab') || 'all';

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orderTabs.forEach((t) => {
      c[t.key] = t.key === 'all'
        ? state.orders.length
        : state.orders.filter((o) => orderMatchesTab(o, t.key)).length;
    });
    return c;
  }, [state.orders]);

  const orders = useMemo(() => {
    if (tab === 'all') return state.orders;
    return state.orders.filter((o) => orderMatchesTab(o, tab));
  }, [state.orders, tab]);

  if (!state.user) {
    return (
      <div className="page orders-page">
        <header className="page-head">
          <div>
            <h1>我的订单</h1>
            <p>登录后查看预约与售后进度</p>
          </div>
          <button type="button" className="icon-btn" aria-label="客服" onClick={() => navigate('/support')}>
            <Icon name="headset" size={21} />
          </button>
        </header>
        <div className="orders-login">
          <EmptyState
            title="登录后查看订单"
            desc="订单进度、师傅联系方式与服务保障都在这里"
            action={
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    login();
                  }}
                >
                  <Icon name="wechat" size={18} /> 微信一键登录
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/login', { state: { from: '/orders' } })}>
                  手机号登录
                </button>
              </>
            }
          />
          <p className="orders-login-note">
            演示账号内已有 {state.orders.length} 个订单（
            {new Set(state.orders.map((o) => o.status)).size} 种状态），登录后即可查看
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <header className="page-head">
        <div>
          <h1>我的订单</h1>
          <p>{state.user.name}，共 {state.orders.length} 个订单</p>
        </div>
        <button type="button" className="icon-btn" aria-label="客服" onClick={() => navigate('/support')}>
          <Icon name="headset" size={21} />
        </button>
      </header>

      <div className="orders-tabs" role="tablist" aria-label="订单状态筛选">
        {orderTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`orders-tab${tab === item.key ? ' is-active' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (item.key === 'all') next.delete('tab');
              else next.set('tab', item.key);
              setParams(next, { replace: true });
            }}
          >
            {item.label}
            {counts[item.key] ? <em>{counts[item.key]}</em> : null}
          </button>
        ))}
      </div>

      <main className="orders-main">
        {orders.length === 0 ? (
          <EmptyState
            title="这里还没有订单"
            desc="去看看沙发、空调、床垫清洗，给家里做个深呼吸"
            action={<button type="button" className="btn btn-primary" onClick={() => navigate('/')}>去预约清洗</button>}
          />
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPay={() => navigate(`/payment/${order.id}`)}
                onCancel={() => setCancelOrder(order)}
                onReview={() => navigate(`/review/${order.id}`)}
                onReorder={() => {
                  beginReorder(order);
                  toast('已带入上次服务，请确认预约信息', 'success');
                  navigate('/checkout');
                }}
              />
            ))}
          </div>
        )}

        <div className="orders-foot-note">
          <Icon name="shieldCheck" size={14} />
          订单数据为前端模拟，演示环境不产生真实交易
        </div>
      </main>

      {cancelOrder ? (
        <CancelOrderSheet order={cancelOrder} open onClose={() => setCancelOrder(null)} />
      ) : null}
    </div>
  );
}
