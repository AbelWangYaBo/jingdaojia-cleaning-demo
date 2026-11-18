import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Icon } from '../components/Icon';
import { Avatar, ServiceArt } from '../components/Brand';
import { Dialog, Sheet } from '../components/Overlays';
import { RatingStars, Tag } from '../components/Bits';
import {
  CancelOrderSheet,
  ContactProviderSheet,
  RescheduleSheet,
} from '../components/OrderActions';
import { CATEGORY_MAP, ORDER_STATUS_META, PROVIDER_MAP, SERVICE_MAP } from '../data/catalog';
import {
  appointmentText,
  formatDateTime,
  formatFullDateTime,
  maskPhone,
  money,
} from '../lib/format';

const STEP_LABELS = ['提交订单', '支付成功', '师傅接单', '上门服务', '服务完成'];

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    state,
    acceptOrder,
    advanceOrder,
    beginReorder,
    resetDemo,
    openAgreement,
    toast,
  } = useApp();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const order = state.orders.find((o) => o.id === orderId);
  const provider = order?.providerId ? PROVIDER_MAP[order.providerId] : null;
  const preferredProvider = order?.preferredProviderId
    ? PROVIDER_MAP[order.preferredProviderId]
    : null;
  const service = order ? SERVICE_MAP[order.serviceId] : undefined;
  const review = order?.reviewId ? state.reviews.find((r) => r.id === order.reviewId) : undefined;

  const steps = useMemo(() => {
    if (!order) return [] as { label: string; done: boolean; active: boolean }[];
    const idx =
      order.status === 'pending_payment'
        ? 0
        : order.status === 'pending_accept'
          ? 1
          : order.status === 'pending_service'
            ? 2
            : order.status === 'on_the_way' || order.status === 'in_service'
              ? 3
              : order.status === 'pending_review' || order.status === 'completed'
                ? 4
                : -1;
    if (order.status === 'cancelled') return [];
    return STEP_LABELS.map((label, index) => ({
      label,
      done: index <= idx,
      active: index === idx && order.status !== 'completed' && order.status !== 'pending_review',
    }));
  }, [order]);

  if (!order) {
    return (
      <div className="page">
        <NavBar title="订单详情" />
        <div className="pad center-block">
          <h2>订单不存在</h2>
          <Link to="/orders" className="btn btn-primary">返回订单列表</Link>
        </div>
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const iconByStatus: Record<string, 'wallet' | 'clock' | 'calendar' | 'navigation' | 'spray' | 'star' | 'checkCircle' | 'close'> = {
    pending_payment: 'wallet',
    pending_accept: 'clock',
    pending_service: 'calendar',
    on_the_way: 'navigation',
    in_service: 'spray',
    pending_review: 'star',
    completed: 'checkCircle',
    cancelled: 'close',
  };

  const copyOrderNo = () => {
    navigator.clipboard?.writeText(order.no).then(
      () => toast('订单号已复制', 'success'),
      () => toast('演示环境无法复制，请手动记录', 'info'),
    );
  };

  const copyAddress = () => {
    const text = `${order.address.city}${order.address.district}${order.address.detail}`;
    navigator.clipboard?.writeText(text).then(
      () => toast('地址已复制', 'success'),
      () => toast('演示环境无法复制', 'info'),
    );
  };

  const reOrder = () => {
    beginReorder(order);
    toast('已带入上次服务，请确认预约信息', 'success');
    navigate('/checkout');
  };

  const canCancel = ['pending_payment', 'pending_accept', 'pending_service', 'on_the_way'].includes(order.status);
  const canReschedule = ['pending_accept', 'pending_service'].includes(order.status);

  const renderActions = () => {
    switch (order.status) {
      case 'pending_payment':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setCancelOpen(true)}>取消订单</button>
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/payment/${order.id}`)}>去支付</button>
          </>
        );
      case 'pending_accept':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setCancelOpen(true)}>取消订单</button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/support')}>联系客服</button>
          </>
        );
      case 'pending_service':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setContactOpen(true)}>联系师傅</button>
            <button type="button" className="btn btn-primary" onClick={() => setRescheduleOpen(true)}>修改时间</button>
          </>
        );
      case 'on_the_way':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setCancelOpen(true)}>取消订单</button>
            <button type="button" className="btn btn-primary" onClick={() => setContactOpen(true)}>联系师傅</button>
          </>
        );
      case 'in_service':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setContactOpen(true)}>联系师傅</button>
            <button type="button" className="btn btn-primary" onClick={() => setCompleteOpen(true)}>确认服务完成</button>
          </>
        );
      case 'pending_review':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={reOrder}>再次购买</button>
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/review/${order.id}`)}>去评价</button>
          </>
        );
      case 'completed':
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/support')}>申请售后</button>
            <button type="button" className="btn btn-primary" onClick={reOrder}>再次购买</button>
          </>
        );
      default:
        return (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/support')}>联系客服</button>
            <button type="button" className="btn btn-primary" onClick={reOrder}>重新预约</button>
          </>
        );
    }
  };

  return (
    <div className="page order-detail-page">
      <NavBar
        title="订单详情"
        right={
          <button type="button" className="icon-btn" aria-label="客服" onClick={() => navigate('/support')}>
            <Icon name="headset" size={20} />
          </button>
        }
      />
      <main>
        <section className={`order-status-hero tone-${meta.tone}`}>
          <div className="order-status-copy">
            <span className="order-status-kicker">
              {order.status === 'pending_payment' ? '等待支付' : '订单状态'}
            </span>
            <h1>{meta.label}</h1>
            <p>{meta.desc}</p>
          </div>
          <span className="order-status-icon">
            <Icon name={iconByStatus[order.status]} size={34} />
          </span>
          {order.status === 'on_the_way' ? (
            <div className="order-route">
              <span className="order-route-dot" />
              <span className="order-route-line" />
              <span className="order-route-bike"><Icon name="navigation" size={15} /></span>
              <span className="order-route-dot order-route-dot-end" />
              <div className="order-route-labels">
                <span>师傅已出发</span>
                <span>{provider?.distance ?? '1.2km'} · 预计 30 分钟到达</span>
              </div>
            </div>
          ) : null}
        </section>

        {steps.length ? (
          <section className="order-steps">
            {steps.map((step, index) => (
              <div key={step.label} className={`order-step${step.done ? ' is-done' : ''}${step.active ? ' is-active' : ''}`}>
                <span className="order-step-dot">
                  {step.done ? <Icon name="check" size={10} strokeWidth={3} /> : index + 1}
                </span>
                <span>{step.label}</span>
              </div>
            ))}
          </section>
        ) : (
          <section className="order-cancelled-card">
            <Icon name="alert" size={19} />
            <div>
              <strong>订单已取消</strong>
              <p>{order.cancelReason ? `取消原因：${order.cancelReason}` : '订单已取消'}</p>
              {order.refund ? <p className="order-refund">退款金额：{money(order.refund)}，将原路退回</p> : null}
            </div>
          </section>
        )}

        <section className="order-appointment-card">
          <div className="order-appointment-icon"><Icon name="calendar" size={20} /></div>
          <div>
            <span>预约上门时间</span>
            <strong>{appointmentText(order.date, order.slot)}</strong>
          </div>
          {canReschedule ? (
            <button type="button" className="text-link" onClick={() => setRescheduleOpen(true)}>
              改期
            </button>
          ) : (
            <Tag tone="soft">{order.status === 'cancelled' ? '已取消' : meta.label}</Tag>
          )}
        </section>

        <section className="order-card-block">
          <div className="block-head">
            <h2>服务师傅</h2>
            {provider ? (
              <Link to={`/provider/${provider.id}`} className="text-link">
                查看主页 <Icon name="chevronRight" size={12} />
              </Link>
            ) : null}
          </div>
          {provider ? (
            <div className="order-provider-card">
              <Avatar seed={provider.avatar} size={52} />
              <div className="order-provider-main">
                <strong>{provider.name} <Tag tone="mint">{provider.title}</Tag></strong>
                <span><RatingStars value={provider.rating} size={11} /> {provider.rating.toFixed(2)} · 已服务 {provider.orders} 单</span>
                <span className="order-provider-certs">{provider.certs.slice(0, 2).join(' · ')}</span>
              </div>
              <button type="button" className="btn btn-outline btn-small" onClick={() => setContactOpen(true)}>
                联系
              </button>
            </div>
          ) : preferredProvider ? (
            <div className="order-provider-matching">
              <Avatar seed={preferredProvider.avatar} size={44} />
              <div>
                <strong>已优先通知 {preferredProvider.name} 师傅</strong>
                <span>等待师傅接单，预计 1 分钟内确认</span>
              </div>
              <Tag tone="gold">待接单</Tag>
            </div>
          ) : (
            <div className="order-provider-matching">
              <span className="matching-radar"><i /><i /><i /></span>
              <div>
                <strong>正在为你匹配师傅</strong>
                <span>已通知附近认证师傅，预计 1 分钟内接单</span>
              </div>
            </div>
          )}
        </section>

        <section className="order-card-block">
          <div className="block-head">
            <h2>服务信息</h2>
            <Link to={`/service/detail/${order.serviceId}`} className="text-link">查看服务</Link>
          </div>
          <div className="order-service-row">
            <span className="order-service-art" style={{ background: CATEGORY_MAP[order.categoryId].soft }}>
              <ServiceArt kind={order.art} />
            </span>
            <div>
              <strong>{order.serviceName}</strong>
              <span>{order.optionLabel} × {order.qty} {order.unit}</span>
              <span>{service?.duration}</span>
            </div>
            <span className="order-service-price">{money(order.amount)}</span>
          </div>
          {order.remark ? (
            <p className="order-remark"><span>备注</span>{order.remark}</p>
          ) : null}
        </section>

        <section className="order-card-block">
          <div className="block-head"><h2>服务地址与联系人</h2></div>
          <div className="order-address">
            <Icon name="pin" size={18} />
            <div>
              <strong>{order.address.city} {order.address.district} {order.address.detail}</strong>
              <span>{order.contactName} · {maskPhone(order.contactPhone)}</span>
            </div>
            <button type="button" className="icon-btn" aria-label="复制地址" onClick={copyAddress}>
              <Icon name="copy" size={17} />
            </button>
          </div>
        </section>

        <section className="order-card-block">
          <div className="block-head"><h2>费用明细</h2></div>
          <div className="order-price-row"><span>服务费 · {order.optionLabel} × {order.qty} {order.unit}</span><span>{money(order.amount)}</span></div>
          <div className="order-price-row"><span>上门服务费</span><span>¥0</span></div>
          {order.discount > 0 ? <div className="order-price-row is-discount"><span>优惠券</span><span>-{money(order.discount)}</span></div> : null}
          <div className="order-price-total"><span>{order.status === 'cancelled' ? '订单金额' : '实付金额'}</span><strong>{money(order.total)}</strong></div>
          {order.status === 'cancelled' && order.refund ? (
            <div className="order-price-row order-price-refund"><span>退款金额</span><span>{money(order.refund)}</span></div>
          ) : null}
        </section>

        <section className="order-card-block">
          <div className="block-head"><h2>订单信息</h2></div>
          <div className="order-info-row"><span>订单编号</span><span>{order.no}<button type="button" className="copy-inline" aria-label="复制订单号" onClick={copyOrderNo}><Icon name="copy" size={13} /></button></span></div>
          <div className="order-info-row"><span>下单时间</span><span>{formatFullDateTime(order.createdAt)}</span></div>
          {order.paidAt ? <div className="order-info-row"><span>支付时间</span><span>{formatFullDateTime(order.paidAt)}</span></div> : null}
          {order.paymentMethod ? <div className="order-info-row"><span>支付方式</span><span>{order.paymentMethod}</span></div> : null}
          <div className="order-info-links">
            <button type="button" className="text-link" onClick={() => openAgreement('cleaning')}>清洗服务协议</button>
            <button type="button" className="text-link" onClick={() => openAgreement('refund')}>取消与退款规则</button>
            <button type="button" className="text-link" onClick={() => openAgreement('guarantee')}>服务保障</button>
          </div>
        </section>

        <section className="order-card-block">
          <div className="block-head"><h2>订单进度</h2><span className="block-sub">共 {order.timeline.length} 条</span></div>
          <ol className="order-timeline">
            {order.timeline.map((item, index) => (
              <li key={`${item.time}-${index}`} className={index === order.timeline.length - 1 ? 'is-latest' : ''}>
                <span className="timeline-dot" />
                <div>
                  <strong>{item.label}</strong>
                  <span>{formatDateTime(item.time)}</span>
                  {item.note ? <p>{item.note}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {review ? (
          <section className="order-card-block order-review-preview">
            <div className="block-head">
              <h2>我的评价</h2>
              <button type="button" className="text-link" onClick={() => setReviewOpen(true)}>查看</button>
            </div>
            <div className="review-stars-line">
              <RatingStars value={review.rating} size={14} showValue />
              <span>{formatDateTime(review.createdAt)}</span>
            </div>
            <p>{review.content || '这次没有填写文字评价'}</p>
            <div className="review-tags">
              {review.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
            </div>
          </section>
        ) : null}

        <section className="order-service-links">
          <button type="button" className="order-service-link" onClick={() => navigate('/support')}>
            <Icon name="headset" size={18} /><span>联系客服</span><Icon name="chevronRight" size={15} />
          </button>
          {canCancel ? (
            <button type="button" className="order-service-link is-danger" onClick={() => setCancelOpen(true)}>
              <Icon name="close" size={18} /><span>取消订单</span><Icon name="chevronRight" size={15} />
            </button>
          ) : null}
          <button type="button" className="order-service-link" onClick={() => navigate('/agreements')}>
            <Icon name="receipt" size={18} /><span>服务协议与规则</span><Icon name="chevronRight" size={15} />
          </button>
        </section>

        <details className="demo-tools">
          <summary><Icon name="settings" size={14} /> 演示控制 · 仅演示环境</summary>
          <div className="demo-tool-body">
            <p>用于快速体验订单状态变化，真实业务中由师傅端驱动。</p>
            <div className="demo-tool-actions">
              {order.status === 'pending_accept' ? (
                <button type="button" className="btn btn-outline btn-small" onClick={() => acceptOrder(order.id)}>模拟师傅接单</button>
              ) : null}
              {['pending_service', 'on_the_way', 'in_service'].includes(order.status) ? (
                <button type="button" className="btn btn-outline btn-small" onClick={() => advanceOrder(order.id)}>推进到下一状态</button>
              ) : null}
              {order.status === 'pending_review' ? (
                <button type="button" className="btn btn-outline btn-small" onClick={() => navigate(`/review/${order.id}`)}>去完成评价</button>
              ) : null}
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setResetOpen(true)}>重置全部演示数据</button>
            </div>
          </div>
        </details>
      </main>

      <div className="action-bar order-detail-bar">{renderActions()}</div>

      <CancelOrderSheet order={order} open={cancelOpen} onClose={() => setCancelOpen(false)} />
      <RescheduleSheet order={order} open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} />
      <ContactProviderSheet order={order} open={contactOpen} onClose={() => setContactOpen(false)} />

      <Dialog
        open={completeOpen}
        title="确认服务已完成？"
        description="确认后订单将进入待评价状态。如对清洁效果有异议，建议先与师傅沟通或联系客服。"
        confirmText="确认完成"
        cancelText="还没有"
        onCancel={() => setCompleteOpen(false)}
        onConfirm={() => {
          setCompleteOpen(false);
          advanceOrder(order.id);
        }}
      />

      <Dialog
        open={resetOpen}
        title="重置演示数据"
        description="将清除你创建的所有订单、地址、评价与登录状态，恢复到初始演示数据。此操作不可撤销。"
        confirmText="重置"
        cancelText="取消"
        tone="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          setResetOpen(false);
          resetDemo();
          navigate('/', { replace: true });
        }}
      />

      <Sheet
        open={reviewOpen}
        title="我的评价"
        subtitle={review ? `评分 ${review.rating.toFixed(1)} · ${formatDateTime(review.createdAt)}` : undefined}
        onClose={() => setReviewOpen(false)}
      >
        {review ? (
          <div className="review-detail-sheet">
            <RatingStars value={review.rating} size={18} />
            <p>{review.content || '这次没有填写文字评价'}</p>
            <div className="review-tags">{review.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}</div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
