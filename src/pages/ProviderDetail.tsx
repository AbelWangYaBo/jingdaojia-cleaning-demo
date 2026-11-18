import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { PROVIDER_MAP, SERVICE_MAP, SERVICES } from '../data/catalog';
import { Avatar } from '../components/Brand';
import { Icon } from '../components/Icon';
import { RatingStars, SectionHeader, Tag } from '../components/Bits';
import { ServiceRowCard } from '../components/Cards';
import { Sheet } from '../components/Overlays';
import { availableProviderSlots, compactNumber, formatDateTime } from '../lib/format';

export default function ProviderDetail() {
  const { providerId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, ensureDraft, updateDraft, toast } = useApp();
  const [contactOpen, setContactOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const provider = providerId ? PROVIDER_MAP[providerId] : undefined;
  const serviceId = params.get('serviceId');
  const service = serviceId ? SERVICE_MAP[serviceId] : undefined;

  const services = useMemo(() => {
    if (!provider) return [];
    return SERVICES.filter((s) => s.providerIds.includes(provider.id));
  }, [provider]);

  const reviews = useMemo(() => {
    if (!provider) return [];
    return state.reviews.filter((r) => r.providerId === provider.id);
  }, [provider, state.reviews]);

  if (!provider) {
    return (
      <div className="page">
        <NavBar title="师傅主页" />
        <div className="pad center-block">
          <h2>师傅信息不存在</h2>
          <Link to="/providers" className="btn btn-primary">查看其他师傅</Link>
        </div>
      </div>
    );
  }

  const chooseProvider = () => {
    if (!service) {
      servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    ensureDraft(service.id);
    updateDraft({ providerId: provider.id });
    toast(`已选择 ${provider.name} 师傅`, 'success');
    const from = (location.state as { from?: string } | null)?.from;
    if (from) navigate(-1);
    else navigate(`/service/detail/${service.id}`, { replace: true });
  };

  const servicePrice = service ? Math.min(...service.options.map((o) => o.price)) : null;
  const fallbackService = services[0];

  return (
    <div className="page provider-detail-page">
      <NavBar
        title="师傅主页"
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label="联系师傅"
            onClick={() => setContactOpen(true)}
          >
            <Icon name="headset" size={20} />
          </button>
        }
      />
      <main>
        <section className="provider-hero">
          <div className="provider-hero-bg" aria-hidden="true" />
          <div className="provider-hero-top">
            <div className="provider-hero-avatar">
              <Avatar seed={provider.avatar} size={82} />
              <span className="provider-hero-badge"><Icon name="shieldCheck" size={13} /> 平台认证</span>
            </div>
            <div className="provider-hero-copy">
              <h1>{provider.name}</h1>
              <p>{provider.title} · 从业 {provider.years} 年</p>
              <div className="provider-hero-rating">
                <strong>{provider.rating.toFixed(2)}</strong>
                <RatingStars value={provider.rating} size={13} />
                <span>{compactNumber(provider.orders)} 单</span>
              </div>
              <div className="provider-hero-tags">
                {provider.tags.map((t) => <Tag key={t} tone="mint">{t}</Tag>)}
              </div>
            </div>
          </div>
          <div className="provider-hero-stats">
            <div><strong>{provider.orders}</strong><span>累计接单</span></div>
            <div><strong>{provider.goodRate}%</strong><span>好评率</span></div>
            <div><strong>{provider.years} 年</strong><span>从业经验</span></div>
            <div><strong>{provider.distance}</strong><span>距你</span></div>
          </div>
        </section>

        <section className="cert-strip">
          {provider.certs.map((cert) => (
            <div key={cert}>
              <Icon name="shieldCheck" size={15} />
              {cert}
            </div>
          ))}
        </section>

        <section className="detail-section">
          <SectionHeader title="关于师傅" />
          <p className="provider-intro">{provider.intro}</p>
          <div className="provider-promise">
            <div><Icon name="clock" size={16} /> {provider.response}</div>
            <div><Icon name="spray" size={16} /> 自带专业设备</div>
            <div><Icon name="thumb" size={16} /> 好评率 {provider.goodRate}%</div>
          </div>
        </section>

        <section className="detail-section">
          <SectionHeader title="近期可约" subtitle="以下时间仅供参考，下单后可再与师傅确认" />
          <div className="available-slots">
            {availableProviderSlots(provider.available).map((slot, index) => (
              <span key={slot} className={`available-slot${index === 0 ? ' is-first' : ''}`}>
                <Icon name="clock" size={12} />
                {slot}
              </span>
            ))}
          </div>
        </section>

        <section className="detail-section" ref={servicesRef} id="provider-services">
          <SectionHeader
            title={`TA 的服务 · ${services.length}`}
            subtitle="选择服务后即可指定该师傅"
          />
          <div className="provider-services">
            {services.map((s) => (
              <ServiceRowCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        <section className="detail-section">
          <SectionHeader
            title="用户评价"
            subtitle={`${reviews.length} 条精选评价`}
          />
          <div className="provider-review-list">
            {reviews.length === 0 ? (
              <p className="muted-text">暂时还没有该师傅的评价</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="review-item">
                  <header>
                    <Avatar seed={review.avatar} size={34} />
                    <div className="review-user">
                      <strong>{review.anonymous ? '匿名用户' : review.userName}</strong>
                      <span>{formatDateTime(review.createdAt)}</span>
                    </div>
                    <RatingStars value={review.rating} size={11} />
                  </header>
                  <p>{review.content}</p>
                  {review.tags.length ? (
                    <div className="review-tags">
                      {review.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <div className="detail-address-hint">
          <Icon name="shieldCheck" size={14} />
          平台为每笔订单提供履约保障，师傅上门请核验工牌
        </div>
      </main>

      <div className="action-bar provider-bar">
        <button type="button" className="btn btn-ghost provider-contact-btn" onClick={() => setContactOpen(true)}>
          <Icon name="headset" size={18} /> 联系师傅
        </button>
        <button type="button" className="btn btn-primary provider-choose-btn" onClick={chooseProvider}>
          {service ? `选择 TA · ¥${servicePrice}起` : fallbackService ? '查看 TA 的服务' : '返回服务列表'}
        </button>
      </div>

      <Sheet
        open={contactOpen}
        title="联系师傅"
        subtitle="为保护双方隐私，订单内使用平台隐私号"
        onClose={() => setContactOpen(false)}
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={() => setContactOpen(false)}>
            我知道了
          </button>
        }
      >
        <div className="contact-sheet">
          <Avatar seed={provider.avatar} size={56} />
          <div>
            <strong>{provider.name} · {provider.title}</strong>
            <span>接单后可在订单详情中一键联系师傅</span>
          </div>
        </div>
        <div className="contact-phone-row">
          <span>平台隐私号</span>
          <strong>400-800-1234 转 8231</strong>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              navigator.clipboard?.writeText('400-800-1234').then(
                () => toast('号码已复制', 'success'),
                () => toast('演示环境无法复制，请手动记录', 'info'),
              );
            }}
          >
            复制
          </button>
        </div>
        <p className="muted-text">
          演示环境不会真实拨号。实际服务中，师傅接单后会通过平台隐私号与你联系，服务完成后号码自动失效。
        </p>
      </Sheet>
    </div>
  );
}
