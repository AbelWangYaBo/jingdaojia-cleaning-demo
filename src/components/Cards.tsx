import { Link } from 'react-router-dom';
import type { Category, Coupon, Order, Provider, Service } from '../data/types';
import { CATEGORY_MAP, PROVIDER_MAP, SERVICES } from '../data/catalog';
import { appointmentText, compactNumber, nextProviderSlot } from '../lib/format';
import { Avatar, ServiceArt } from './Brand';
import { Icon } from './Icon';
import { Price, RatingStars, Tag } from './Bits';

export function CategoryTile({ category, wide = false }: { category: Category; wide?: boolean }) {
  const count = SERVICES.filter((s) => s.categoryId === category.id).length;
  return (
    <Link
      to={`/service/${category.id}`}
      className={`category-tile${wide ? ' category-tile-wide' : ''}`}
      style={{ background: category.soft }}
    >
      <div className="category-tile-copy">
        <h3>{category.name}</h3>
        <p>{category.tagline}</p>
        <div className="category-tile-meta">
          <span className="category-price">
            <em>¥</em>
            {category.fromPrice}
            <small>起</small>
          </span>
          <span className="category-count">{count} 项服务</span>
        </div>
      </div>
      <div className="category-tile-art" style={{ color: category.accent }}>
        <ServiceArt kind={category.art} />
      </div>
      <span className="category-tile-arrow">
        <Icon name="chevronRight" size={14} />
      </span>
    </Link>
  );
}

export function ServiceRowCard({ service }: { service: Service }) {
  const category = CATEGORY_MAP[service.categoryId];
  return (
    <Link to={`/service/detail/${service.id}`} className="service-row">
      <div className="service-row-art" style={{ background: category.soft }}>
        <ServiceArt kind={service.art} />
      </div>
      <div className="service-row-main">
        <div className="service-row-title-line">
          <h3>{service.name}</h3>
          {service.badge ? <Tag tone="red">{service.badge}</Tag> : null}
        </div>
        <p className="service-row-sub">{service.subtitle}</p>
        <div className="service-row-tags">
          {service.tags.slice(0, 3).map((t) => (
            <Tag key={t} tone="soft">{t}</Tag>
          ))}
        </div>
        <div className="service-row-bottom">
          <Price value={service.options[0].price} original={service.options[0].originalPrice} unit={service.unit} size="md" />
          <span className="service-row-sales">已售 {compactNumber(service.sales)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ProviderCard({
  provider,
  variant = 'row',
  selected = false,
  onSelect,
  href,
  serviceId,
}: {
  provider: Provider;
  variant?: 'row' | 'mini' | 'inline';
  selected?: boolean;
  onSelect?: () => void;
  href?: string;
  serviceId?: string;
}) {
  const content = (
    <>
      <div className="provider-avatar">
        <Avatar seed={provider.avatar} size={variant === 'mini' ? 46 : 54} />
        <span className="provider-verified" title="平台认证">
          <Icon name="check" size={9} strokeWidth={3} />
        </span>
      </div>
      <div className="provider-main">
        <div className="provider-name-line">
          <strong>{provider.name}</strong>
          <span className="provider-title">{provider.title}</span>
          {variant !== 'mini' ? <Tag tone="mint">{provider.years} 年经验</Tag> : null}
        </div>
        <div className="provider-stats">
          <RatingStars value={provider.rating} size={11} />
          <span className="provider-score">{provider.rating.toFixed(2)}</span>
          <span className="provider-sep">·</span>
          <span>接单 {provider.orders}</span>
          <span className="provider-sep">·</span>
          <span>好评 {provider.goodRate}%</span>
        </div>
        {variant === 'mini' ? (
          <div className="provider-mini-foot">
            <span className="provider-distance"><Icon name="navigation" size={11} /> {provider.distance}</span>
            <span className="provider-available-dot" /> 可预约
          </div>
        ) : (
          <>
            <div className="provider-tags">
              {provider.tags.slice(0, 3).map((t) => (
                <Tag key={t} tone="outline">{t}</Tag>
              ))}
            </div>
            <div className="provider-avail">
              <Icon name="clock" size={12} />
              最近可约：{nextProviderSlot(provider.available)}
              <span className="provider-distance"><Icon name="navigation" size={11} /> {provider.distance}</span>
            </div>
          </>
        )}
      </div>
    </>
  );

  if (variant === 'mini') {
    return (
      <Link to={href ?? `/provider/${provider.id}${serviceId ? `?serviceId=${serviceId}` : ''}`} className="provider-mini">
        {content}
      </Link>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="provider-inline">
        {href ? <Link to={href} className="provider-inline-main">{content}</Link> : <div className="provider-inline-main">{content}</div>}
        <Icon name="chevronRight" size={16} className="provider-inline-arrow" />
      </div>
    );
  }

  return (
    <div className={`provider-row${selected ? ' is-selected' : ''}`}>
      {href ? <Link to={href} className="provider-row-main">{content}</Link> : <div className="provider-row-main">{content}</div>}
      <div className="provider-row-action">
        {selected ? (
          <span className="provider-selected-label">
            <Icon name="checkCircle" size={16} /> 已选择
          </span>
        ) : (
          <button type="button" className="btn btn-small btn-primary" onClick={onSelect}>
            选择 TA
          </button>
        )}
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  onPay,
  onCancel,
  onReview,
  onReorder,
}: {
  order: Order;
  onPay?: () => void;
  onCancel?: () => void;
  onReview?: () => void;
  onReorder?: () => void;
}) {
  const provider = order.providerId ? PROVIDER_MAP[order.providerId] : null;
  const preferredProvider =
    !provider && order.preferredProviderId ? PROVIDER_MAP[order.preferredProviderId] : null;
  const statusTone =
    order.status === 'pending_payment'
      ? 'amber'
      : order.status === 'pending_accept'
        ? 'blue'
        : order.status === 'cancelled'
          ? 'grey'
          : order.status === 'pending_review'
            ? 'purple'
            : 'red';
  const statusLabel =
    order.status === 'pending_payment'
      ? '待付款'
      : order.status === 'pending_accept'
        ? '待接单'
        : order.status === 'pending_service'
          ? '待服务'
          : order.status === 'on_the_way'
            ? '师傅已出发'
            : order.status === 'in_service'
              ? '服务中'
              : order.status === 'pending_review'
                ? '待评价'
                : order.status === 'completed'
                  ? '已完成'
                  : '已取消';

  return (
    <article className="order-card">
      <Link to={`/order/${order.id}`} className="order-card-head">
        <span className="order-card-service">
          <span className={`order-status-tag status-${statusTone}`}>{statusLabel}</span>
          <span className="order-no">订单 {order.no}</span>
        </span>
        <span className="order-head-more">
          查看详情 <Icon name="chevronRight" size={14} />
        </span>
      </Link>
      <Link to={`/order/${order.id}`} className="order-card-body">
        <span className="order-art">
          <ServiceArt kind={order.art} />
        </span>
        <span className="order-info">
          <strong>{order.serviceName}</strong>
          <span className="order-option">{order.optionLabel} × {order.qty} {order.unit}</span>
          <span className="order-time"><Icon name="calendar" size={12} /> {appointmentText(order.date, order.slot)}</span>
          {provider ? (
            <span className="order-provider">
              <Avatar seed={provider.avatar} size={20} />
              {provider.name} 师傅 · {provider.rating.toFixed(2)} 分
            </span>
          ) : preferredProvider ? (
            <span className="order-provider muted">
              <Avatar seed={preferredProvider.avatar} size={20} />
              等待 {preferredProvider.name} 师傅接单
            </span>
          ) : (
            <span className="order-provider muted">正在为你匹配师傅</span>
          )}
        </span>
      </Link>
      <div className="order-card-foot">
        <span className="order-amount">
          {order.status === 'cancelled' ? (
            order.refund ? (
              <>已退款 <strong>{`¥${order.refund}`}</strong></>
            ) : (
              <>已取消 <em>无扣款</em></>
            )
          ) : (
            <>实付 <strong>{`¥${order.total}`}</strong>{order.discount > 0 ? <em>已优惠 ¥{order.discount}</em> : null}</>
          )}
        </span>
        <div className="order-actions">
          {order.status === 'pending_payment' ? (
            <>
              <button type="button" className="btn btn-ghost btn-small" onClick={onCancel}>取消订单</button>
              <button type="button" className="btn btn-primary btn-small" onClick={onPay}>去支付</button>
            </>
          ) : null}
          {order.status === 'pending_accept' || order.status === 'pending_service' ? (
            <>
              <Link to={`/order/${order.id}`} className="btn btn-ghost btn-small">查看进度</Link>
              <Link to={`/order/${order.id}`} className="btn btn-outline btn-small">联系师傅</Link>
            </>
          ) : null}
          {order.status === 'on_the_way' || order.status === 'in_service' ? (
            <Link to={`/order/${order.id}`} className="btn btn-primary btn-small">查看进度</Link>
          ) : null}
          {order.status === 'pending_review' ? (
            <>
              <button type="button" className="btn btn-ghost btn-small" onClick={onReorder}>再次购买</button>
              <button type="button" className="btn btn-primary btn-small" onClick={onReview}>去评价</button>
            </>
          ) : null}
          {order.status === 'completed' || order.status === 'cancelled' ? (
            <>
              <Link to={`/order/${order.id}`} className="btn btn-ghost btn-small">查看详情</Link>
              <button type="button" className="btn btn-outline btn-small" onClick={onReorder}>再次购买</button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CouponCard({
  coupon,
  selected = false,
  onSelect,
  disabled = false,
  expired = false,
}: {
  coupon: Coupon;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  expired?: boolean;
}) {
  const content = (
    <>
      <span className="coupon-value">
        <em>¥</em>
        <strong>{coupon.amount}</strong>
        <small>{coupon.threshold > 0 ? `满 ${coupon.threshold} 可用` : '无门槛'}</small>
      </span>
      <span className="coupon-info">
        <strong>{coupon.title}</strong>
        <span>{coupon.note}</span>
        <span className="coupon-expire">
          {expired ? '已过期' : `${new Date(coupon.expiresAt).getFullYear()}.${new Date(coupon.expiresAt).getMonth() + 1}.${new Date(coupon.expiresAt).getDate()} 到期`}
        </span>
      </span>
      {selected ? (
        <span className="coupon-check">
          <Icon name="checkCircle" size={22} />
        </span>
      ) : null}
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        className={`coupon-card${selected ? ' is-selected' : ''}${disabled || expired ? ' is-disabled' : ''}`}
        onClick={onSelect}
        disabled={disabled || expired}
      >
        {content}
      </button>
    );
  }
  return <div className={`coupon-card${expired ? ' is-disabled' : ''}`}>{content}</div>;
}

export function MiniServiceCard({ service }: { service: Service }) {
  const provider = PROVIDER_MAP[service.providerIds[0]];
  return (
    <Link to={`/service/detail/${service.id}`} className="mini-service">
      <span className="mini-service-art">
        <ServiceArt kind={service.art} />
      </span>
      <span className="mini-service-name">{service.name}</span>
      <span className="mini-service-meta">
        <Price value={service.options[0].price} unit={service.unit} size="sm" />
        {provider ? <span>{provider.name} 可约</span> : null}
      </span>
    </Link>
  );
}
