import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { PROVIDER_MAP, SERVICE_MAP } from '../data/catalog';
import { Avatar, ServiceArt } from '../components/Brand';
import { Icon } from '../components/Icon';
import {
  Price,
  RatingStars,
  SectionHeader,
  Stepper,
  Tag,
} from '../components/Bits';
import { ProviderCard } from '../components/Cards';
import { Sheet } from '../components/Overlays';
import type { Review } from '../data/types';
import { bestCouponFor, compactNumber, formatDateTime, money } from '../lib/format';

function ReviewItem({ review }: { review: Review }) {
  return (
    <article className="review-item">
      <header>
        <Avatar seed={review.avatar} size={36} />
        <div className="review-user">
          <strong>{review.anonymous ? '匿名用户' : review.userName}</strong>
          <span>{formatDateTime(review.createdAt)}</span>
        </div>
        <RatingStars value={review.rating} size={12} />
      </header>
      <p>{review.content}</p>
      {review.tags.length ? (
        <div className="review-tags">
          {review.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
        </div>
      ) : null}
    </article>
  );
}

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { state, ensureDraft, updateDraft, toggleFavorite, toast, openAgreement } = useApp();
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const service = serviceId ? SERVICE_MAP[serviceId] : undefined;

  useEffect(() => {
    if (service) ensureDraft(service.id);
  }, [service, ensureDraft]);

  const draft = service && state.draft?.serviceId === service.id ? state.draft : null;
  const option =
    service?.options.find((o) => o.id === draft?.optionId) ?? service?.options[0] ?? null;
  const qty = Math.max(service?.minQty ?? 1, draft?.qty ?? service?.minQty ?? 1);
  const provider = draft?.providerId ? PROVIDER_MAP[draft.providerId] : null;
  const amount = option ? option.price * qty : 0;

  const reviews = useMemo(() => {
    if (!service) return [];
    return state.reviews
      .filter((r) => r.serviceId === service.id)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [service, state.reviews]);

  const availableCoupons = useMemo(() => {
    if (!service) return [];
    return state.coupons.filter((c) => bestCouponFor([c], service.categoryId, amount) !== null);
  }, [service, state.coupons, amount]);
  const bestCoupon = service ? bestCouponFor(state.coupons, service.categoryId, amount) : null;

  if (!service || !option) {
    return (
      <div className="page">
        <NavBar title="服务详情" />
        <div className="pad center-block">
          <h2>服务不存在或已下架</h2>
          <Link className="btn btn-primary" to="/">返回首页</Link>
        </div>
      </div>
    );
  }

  const isFavorite = state.favorites.includes(service.id);
  const maxQty = service.categoryId === 'curtain' ? 20 : 9;
  const newReviews = reviews.filter((r) => !r.id.startsWith('rv_seed')).length;
  const reviewCount = service.reviewCount + newReviews;
  const defaultAddress =
    state.addresses.find((a) => a.id === state.selectedAddressId) ??
    state.addresses.find((a) => a.isDefault) ??
    state.addresses[0];

  const selectOption = (optionId: string) => {
    updateDraft({ optionId, qty: Math.max(service.minQty, draft?.qty ?? service.minQty) });
  };

  return (
    <div className="page service-detail-page">
      <NavBar
        title={service.name}
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label="分享服务"
            onClick={() => toast('演示环境未接入微信分享，可通过浏览器分享本页')}
          >
            <Icon name="share" size={20} />
          </button>
        }
      />
      <main>
        <section className="detail-hero">
          <div className="detail-hero-bg" aria-hidden="true" />
          <div className="detail-hero-art">
            <ServiceArt kind={service.art} />
          </div>
          <div className="detail-hero-top">
            {service.badge ? <Tag tone="red">{service.badge}</Tag> : null}
            <Tag tone="mint">平台保障</Tag>
            <Tag tone="outline">{service.duration}</Tag>
          </div>
          <h1>{service.name}</h1>
          <p>{service.subtitle}</p>
          <div className="detail-hero-meta">
            <RatingStars value={service.rating} size={12} showValue />
            <span>已售 {compactNumber(service.sales)}</span>
            <span>{reviewCount} 条评价</span>
          </div>
        </section>

        <div className="detail-price-panel">
          <div className="detail-price-main">
            <Price value={option.price} original={option.originalPrice} unit={service.unit} size="lg" />
            <span className="detail-price-save">已优惠 ¥{Math.max(0, option.originalPrice - option.price)}</span>
          </div>
          <div className="detail-price-tags">
            {service.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
          </div>
        </div>

        {bestCoupon ? (
          <Link to="/coupons" className="detail-coupon">
            <span className="detail-coupon-icon"><Icon name="ticket" size={17} /></span>
            <span>
              可用优惠券 {availableCoupons.length} 张，最高减 <strong>{money(bestCoupon.amount)}</strong>
            </span>
            <span className="detail-coupon-link">去使用 <Icon name="chevronRight" size={12} /></span>
          </Link>
        ) : null}

        <section className="detail-section">
          <SectionHeader title={service.optionLabel} subtitle={`${service.minQty > 1 ? `${service.minQty} ${service.unit}起订` : '按实际数量选择'}`} />
          <div className="option-grid">
            {service.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`option-chip${o.id === option.id ? ' is-active' : ''}`}
                onClick={() => selectOption(o.id)}
                aria-pressed={o.id === option.id}
              >
                <span className="option-label">{o.label}</span>
                {o.hint ? <span className="option-hint">{o.hint}</span> : null}
                <span className="option-price">¥{o.price}<em>/{service.unit}</em></span>
              </button>
            ))}
          </div>
          <div className="qty-row">
            <div>
              <strong>服务数量</strong>
              <span>{service.categoryId === 'curtain' ? '按窗帘片数计费，2 片起订' : '可按实际数量增减'}</span>
            </div>
            <Stepper
              value={qty}
              min={service.minQty}
              max={maxQty}
              onChange={(next) => updateDraft({ qty: next })}
              suffix={service.unit}
              label="服务数量"
            />
          </div>
          <div className="amount-line">
            <span>{money(option.price)} × {qty} {service.unit}</span>
            <strong>{money(amount)}</strong>
          </div>
        </section>

        <section className="detail-section">
          <SectionHeader
            title="服务师傅"
            subtitle="可指定，也可以由平台优选"
            action={
              <Link to={`/providers?serviceId=${service.id}`} className="link-more">
                查看全部 <Icon name="chevronRight" size={13} />
              </Link>
            }
          />
          {provider ? (
            <div className="detail-provider-box">
              <ProviderCard
                provider={provider}
                variant="inline"
                href={`/provider/${provider.id}?serviceId=${service.id}`}
              />
              <div className="detail-provider-actions">
                <span>已指定师傅 · 师傅接单后与你电话确认</span>
                <Link to={`/providers?serviceId=${service.id}`} className="text-link">
                  更换师傅 <Icon name="chevronRight" size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="detail-provider-box">
              <div className="auto-provider">
                <div className="auto-provider-avatars">
                  {service.providerIds.slice(0, 3).map((id) => {
                    const p = PROVIDER_MAP[id];
                    return p ? <Avatar key={id} seed={p.avatar} size={42} /> : null;
                  })}
                </div>
                <div className="auto-provider-copy">
                  <strong>平台优选师傅</strong>
                  <span>按距离、评分与接单情况为你匹配</span>
                </div>
                <Link to={`/providers?serviceId=${service.id}`} className="btn btn-outline btn-small">
                  自己选
                </Link>
              </div>
              <div className="detail-provider-actions">
                <span>未指定师傅时，支付后由平台按距离与评分匹配</span>
              </div>
            </div>
          )}
        </section>

        <section className="detail-section">
          <SectionHeader title="服务内容" subtitle="标准服务范围内包含" />
          <div className="include-grid">
            {service.includes.map((item) => (
              <div key={item} className="include-item">
                <span className="include-check"><Icon name="check" size={11} strokeWidth={2.8} /></span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <SectionHeader title="服务流程" subtitle="全程标准化，现场可验收" />
          <ol className="process-list">
            {service.process.map((step, index) => (
              <li key={step.title}>
                <span className="process-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="detail-section">
          <SectionHeader
            title="用户评价"
            subtitle={`好评率 99% · 共 ${reviewCount} 条`}
            action={
              <button type="button" className="link-more" onClick={() => setReviewsOpen(true)}>
                全部 <Icon name="chevronRight" size={13} />
              </button>
            }
          />
          <div className="review-highlight">
            <div className="review-score">
              <strong>{service.rating.toFixed(2)}</strong>
              <RatingStars value={service.rating} size={13} />
              <span>服务评分</span>
            </div>
            <div className="review-tag-cloud">
              {['准时上门', '服务专业', '清洗彻底', '态度很好'].map((tag) => (
                <Tag key={tag} tone="soft">{tag}</Tag>
              ))}
            </div>
          </div>
          <div className="review-list">
            {reviews.slice(0, 2).map((review) => <ReviewItem key={review.id} review={review} />)}
          </div>
          <button type="button" className="btn btn-ghost btn-block review-more" onClick={() => setReviewsOpen(true)}>
            查看全部 {reviewCount} 条评价
          </button>
        </section>

        <section className="detail-section">
          <SectionHeader title="服务须知" subtitle="下单前请仔细阅读" />
          <div className="notice-list">
            {service.notices.map((notice) => (
              <p key={notice}><span /> {notice}</p>
            ))}
          </div>
          <div className="detail-agreements">
            <button type="button" className="text-link" onClick={() => openAgreement('cleaning')}>
              《清洗服务协议》
            </button>
            <button type="button" className="text-link" onClick={() => openAgreement('refund')}>
              《取消与退款规则》
            </button>
            <button type="button" className="text-link" onClick={() => openAgreement('guarantee')}>
              《服务保障说明》
            </button>
          </div>
        </section>

        {service.faqs?.length ? (
          <section className="detail-section">
            <SectionHeader title="常见问题" />
            <div className="faq-list">
              {service.faqs.map((faq) => (
                <details key={faq.q} className="faq-item">
                  <summary>{faq.q}<Icon name="chevronDown" size={16} /></summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {defaultAddress ? (
          <div className="detail-address-hint">
            <Icon name="pin" size={14} />
            当前服务地址：{defaultAddress.city} {defaultAddress.district} {defaultAddress.detail}
            <Link to="/addresses" className="text-link">更换</Link>
          </div>
        ) : null}
      </main>

      <div className="action-bar detail-bar">
        <button type="button" className="detail-bar-icon" onClick={() => navigate('/support')}>
          <Icon name="headset" size={21} />
          <span>客服</span>
        </button>
        <button
          type="button"
          className={`detail-bar-icon${isFavorite ? ' is-favorite' : ''}`}
          onClick={() => toggleFavorite(service.id)}
        >
          <Icon name="heart" size={21} filled={isFavorite} />
          <span>{isFavorite ? '已收藏' : '收藏'}</span>
        </button>
        <div className="detail-bar-price">
          <span>合计</span>
          <strong>{money(amount)}</strong>
          <em>{qty} {service.unit}</em>
        </div>
        <button
          type="button"
          className="btn btn-primary detail-book-btn"
          onClick={() => {
            ensureDraft(service.id);
            navigate('/checkout');
          }}
        >
          立即预约
        </button>
      </div>

      <Sheet
        open={reviewsOpen}
        title="全部评价"
        subtitle={`共 ${reviewCount} 条，来自真实服务订单（演示数据）`}
        onClose={() => setReviewsOpen(false)}
        full
      >
        <div className="review-summary-large">
          <strong>{service.rating.toFixed(2)}</strong>
          <div>
            <RatingStars value={service.rating} size={15} />
            <span>好评率 99% · {reviewCount} 条评价</span>
          </div>
        </div>
        <div className="review-tag-cloud">
          {['准时上门', '服务专业', '清洗彻底', '态度很好', '收费透明'].map((tag) => (
            <Tag key={tag} tone="soft">{tag}</Tag>
          ))}
        </div>
        <div className="review-list review-list-all">
          {reviews.map((review) => <ReviewItem key={review.id} review={review} />)}
        </div>
      </Sheet>
    </div>
  );
}
