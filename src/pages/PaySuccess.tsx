import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Brand';
import { ORDER_STATUS_META, PROVIDER_MAP } from '../data/catalog';
import { EmptyState } from '../components/Bits';
import { appointmentText, money } from '../lib/format';

export default function PaySuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const order = state.orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="page">
        <EmptyState
          title="订单不存在"
          desc="请返回订单列表查看"
          action={<Link to="/orders" className="btn btn-primary">查看订单</Link>}
        />
      </div>
    );
  }

  if (order.status === 'pending_payment') {
    return (
      <div className="page">
        <EmptyState
          title="订单尚未支付"
          desc="支付完成后可查看师傅匹配与上门进度"
          action={<Link to={`/payment/${order.id}`} className="btn btn-primary">去支付</Link>}
        />
      </div>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <div className="page">
        <EmptyState
          title="订单已取消"
          desc="可重新选择服务，或查看其他订单"
          action={<Link to="/" className="btn btn-primary">重新预约</Link>}
        />
      </div>
    );
  }

  const assignedProvider = order.providerId ? PROVIDER_MAP[order.providerId] : null;
  const preferredProvider = order.preferredProviderId
    ? PROVIDER_MAP[order.preferredProviderId]
    : null;
  const provider = assignedProvider ?? preferredProvider;

  return (
    <div className="page pay-success-page">
      <header className="success-nav">
        <button type="button" className="icon-btn" aria-label="返回首页" onClick={() => navigate('/', { replace: true })}>
          <Icon name="close" size={21} />
        </button>
        <h1>支付结果</h1>
        <Link to="/orders" className="success-nav-link">订单</Link>
      </header>
      <main className="success-main">
        <section className="success-hero">
          <div className="success-check-wrap">
            <span className="success-ring" aria-hidden="true" />
            <span className="success-ring success-ring-2" aria-hidden="true" />
            <span className="success-check">
              <Icon name="check" size={34} strokeWidth={2.4} />
            </span>
            {[
              ['#ff6a58', '18%', '22%'],
              ['#17a98f', '78%', '26%'],
              ['#f5b73b', '26%', '68%'],
              ['#6b8cf0', '74%', '64%'],
            ].map(([color, left, top], i) => (
              <i
                key={i}
                className="confetti"
                style={{ background: color, left, top, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
          <h2>支付成功</h2>
          <p className="success-amount">{money(order.total)}</p>
          <p className="success-sub">
            {assignedProvider
              ? '师傅已接单，将按预约时间上门'
              : preferredProvider
                ? '已通知指定师傅，等待接单确认'
                : '订单已提交，正在为你匹配服务师傅'}
          </p>
          <div className="success-actions">
            <Link to={`/order/${order.id}`} className="btn btn-primary">查看订单</Link>
            <Link to="/" className="btn btn-ghost">返回首页</Link>
          </div>
        </section>

        <section className="success-provider-card">
          {provider ? (
            <div className="success-provider">
              <Avatar seed={provider.avatar} size={50} />
              <div>
                <strong>
                  {assignedProvider
                    ? `${provider.name} 师傅已接单`
                    : `已通知 ${provider.name} 师傅`}
                </strong>
                <span>
                  {provider.title} · {provider.rating.toFixed(2)} 分 ·{' '}
                  {assignedProvider ? `${provider.orders} 单` : '等待接单确认'}
                </span>
              </div>
              {assignedProvider ? (
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() => navigate(`/provider/${provider.id}`)}
                >
                  查看
                </button>
              ) : (
                <span className="success-provider-waiting">待接单</span>
              )}
            </div>
          ) : (
            <div className="success-provider success-matching">
              <span className="matching-radar" aria-hidden="true"><i /><i /><i /></span>
              <div>
                <strong>正在匹配附近师傅</strong>
                <span>已通知 6 位认证师傅，预计 1 分钟内接单</span>
              </div>
            </div>
          )}
          <p className="success-provider-note">
            {assignedProvider
              ? '师傅会按预约时间上门，请保持电话畅通。'
              : preferredProvider
                ? '已优先通知你指定的师傅；若师傅临时无法接单，平台会联系你改派或改期。'
                : '接单后我们会通过消息与电话通知你，可在订单中查看进度。'}
          </p>
        </section>

        <section className="success-info-card">
          <div className="success-info-head">
            <span className="success-info-art">
              <Icon name="receipt" size={18} />
            </span>
            <div>
              <strong>{order.serviceName}</strong>
              <span>{order.optionLabel} × {order.qty} {order.unit}</span>
            </div>
            <span className="success-info-status">{ORDER_STATUS_META[order.status].label}</span>
          </div>
          <div className="success-info-row"><span>预约时间</span><strong>{appointmentText(order.date, order.slot)}</strong></div>
          <div className="success-info-row"><span>服务地址</span><strong>{order.address.city} {order.address.district} {order.address.detail}</strong></div>
          <div className="success-info-row"><span>联系人</span><strong>{order.contactName} {order.contactPhone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}</strong></div>
          <div className="success-info-row"><span>订单编号</span><strong>{order.no}</strong></div>
          {order.discount > 0 ? (
            <div className="success-info-row success-info-save"><span>本单已省</span><strong>{money(order.discount)}</strong></div>
          ) : null}
        </section>

        <section className="success-tips">
          <h3>接下来</h3>
          <ol>
            <li><span>1</span> 师傅接单后会电话与你确认上门时间</li>
            <li><span>2</span> 可在订单详情中联系师傅、改期或取消</li>
            <li><span>3</span> 服务完成后评价，可获得 5 元无门槛券</li>
          </ol>
        </section>

        <Link to="/support" className="success-support">
          <Icon name="headset" size={16} />
          需要帮助？联系在线客服
          <Icon name="chevronRight" size={14} />
        </Link>
        <p className="success-disclaimer">演示支付已完成，未产生真实扣款。</p>
      </main>
    </div>
  );
}
