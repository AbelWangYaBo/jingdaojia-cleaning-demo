import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { AppHeaderHome } from '../components/Layout';
import { Icon } from '../components/Icon';
import { ServiceArt } from '../components/Brand';
import { CategoryTile, ProviderCard } from '../components/Cards';
import { SectionHeader, Tag } from '../components/Bits';
import { CATEGORIES, HOME_FAQS, HOME_TIPS, PROVIDERS } from '../data/catalog';
import { Sheet } from '../components/Overlays';

export default function Home() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tipId, setTipId] = useState<string | null>(null);
  const unread = state.user ? state.notices.filter((n) => !n.read).length : 0;
  const tip = HOME_TIPS.find((t) => t.id === tipId) ?? null;
  const totalOrders = state.orders.filter((o) => o.status !== 'cancelled').length;

  return (
    <div className="page home-page">
      <AppHeaderHome
        city={state.city.name}
        onCity={() => navigate('/city')}
        onSearch={() => navigate('/search')}
        onBell={() => navigate('/notices')}
        unread={unread}
      />
      <main className="home-main">
        <section className="hero-banner" aria-label="空调清洗季活动">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <Icon name="sparkle" size={12} /> 空调清洗季
            </span>
            <h2>
              空调深度清洗
              <br />
              <em>首单立减 ¥20</em>
            </h2>
            <p>全拆深洗 · 高温消毒 · 排水检查</p>
            <Link to="/service/ac" className="hero-cta">
              立即预约
              <Icon name="arrowRight" size={15} />
            </Link>
            <span className="hero-price">
              <b>¥119</b> 起 / 台
            </span>
          </div>
          <div className="hero-art">
            <span className="hero-art-ring" aria-hidden="true" />
            <ServiceArt kind="ac" />
          </div>
          <span className="hero-bubble hero-bubble-b" aria-hidden="true" />
        </section>

        <Link to="/coupons" className="coupon-strip">
          <span className="coupon-strip-icon"><Icon name="ticket" size={19} /></span>
          <span className="coupon-strip-copy">
            <strong>换季清洗券</strong>
            <span>满 ¥199 减 ¥30 · 新用户再减 ¥20</span>
          </span>
          <span className="coupon-strip-cta">去使用 <Icon name="chevronRight" size={13} /></span>
        </Link>

        <section className="home-section">
          <SectionHeader
            title="清洗服务"
            subtitle="5 大项目，按需预约，专业设备上门"
            action={<Link to="/search" className="link-more">全部 <Icon name="chevronRight" size={13} /></Link>}
          />
          <div className="category-grid">
            {CATEGORIES.map((category, index) => (
              <CategoryTile key={category.id} category={category} wide={index === CATEGORIES.length - 1} />
            ))}
          </div>
        </section>

        <section className="trust-card" aria-label="服务保障">
          <div className="trust-item">
            <span className="trust-icon"><Icon name="shieldCheck" size={19} /></span>
            <strong>认证师傅</strong>
            <span>实名 · 健康证</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><Icon name="clock" size={19} /></span>
            <strong>准时上门</strong>
            <span>迟到可取消</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><Icon name="refresh" size={19} /></span>
            <strong>不满意重做</strong>
            <span>72 小时售后</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><Icon name="shield" size={19} /></span>
            <strong>订单保障</strong>
            <span>损坏可按责赔付</span>
          </div>
        </section>

        <section className="home-section">
          <SectionHeader
            title="人气师傅"
            subtitle="按评分与距离优选，也可指定师傅"
            action={<Link to="/providers" className="link-more">查看全部 <Icon name="chevronRight" size={13} /></Link>}
          />
          <div className="provider-scroll">
            {PROVIDERS.slice(0, 5).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} variant="mini" />
            ))}
          </div>
        </section>

        <section className="home-section tips-section">
          <SectionHeader title="清洗小课堂" subtitle="关于家里那些看不见的脏" />
          <div className="tip-list">
            {HOME_TIPS.map((item) => (
              <button key={item.id} type="button" className="tip-card" onClick={() => setTipId(item.id)}>
                <span className="tip-copy">
                  <Tag tone="soft">{item.tag}</Tag>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </span>
                <span className="tip-art">
                  <ServiceArt kind={item.art} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-section faq-section">
          <SectionHeader title="常见问题" subtitle="下单前你可能想知道的" />
          <div className="faq-list">
            {HOME_FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>
                  {faq.q}
                  <Icon name="chevronDown" size={16} />
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <span>净到家</span>
            <em>·</em>
            <span>专业清洗</span>
          </div>
          <p>
            已服务 {totalOrders + 128600} 个家庭 · 覆盖 26 个城市
            <br />
            本页面为内部演示，所有数据均为前端模拟
          </p>
          <div className="home-footer-links">
            <button type="button" onClick={() => navigate('/agreements')}>服务协议</button>
            <i />
            <button type="button" onClick={() => navigate('/about')}>关于演示</button>
            <i />
            <button type="button" onClick={() => navigate('/support')}>联系客服</button>
          </div>
        </footer>
      </main>

      <Sheet
        open={Boolean(tip)}
        title={tip?.title ?? ''}
        subtitle={tip?.tag}
        onClose={() => setTipId(null)}
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={() => setTipId(null)}>
            我知道了
          </button>
        }
      >
        {tip ? (
          <div className="tip-article">
            <div className="tip-article-art" style={{ background: '#f6f7f9' }}>
              <ServiceArt kind={tip.art} />
            </div>
            <p>{tip.desc}</p>
            <p>
              家务清洁并不只是把表面擦干净。以{tip.tag.replace('必看', '').replace('指南', '')}为例，真正影响体验的是纤维深层的灰尘、
              皮屑与潮气。日常吸尘能处理表层，定期专业清洗才能带走深层的污垢与异味。
            </p>
            <p>
              如果你不确定家里的材质适合哪种清洗方式，可以在服务详情页先选择对应项目，或通过在线客服把材质与照片发给师傅评估。
              演示环境中的建议仅供参考。
            </p>
            <button type="button" className="text-link" onClick={() => { setTipId(null); navigate('/service/ac'); }}>
              看看空调清洗服务 <Icon name="chevronRight" size={13} />
            </button>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
