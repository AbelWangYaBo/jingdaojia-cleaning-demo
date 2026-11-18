import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { CATEGORIES, CATEGORY_MAP, PROVIDERS, SERVICES } from '../data/catalog';
import { ServiceArt, Avatar } from '../components/Brand';
import { ServiceRowCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { SectionHeader, Tag } from '../components/Bits';
import { compactNumber } from '../lib/format';

type SortKey = 'recommend' | 'sales' | 'price';

export default function ServiceList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useApp();
  const [sort, setSort] = useState<SortKey>('recommend');
  const category = categoryId ? CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP] : undefined;

  const services = useMemo(() => {
    if (!category) return [];
    const list = SERVICES.filter((s) => s.categoryId === category.id);
    if (sort === 'sales') return [...list].sort((a, b) => b.sales - a.sales);
    if (sort === 'price') return [...list].sort((a, b) => a.options[0].price - b.options[0].price);
    return list;
  }, [category, sort]);

  const providers = useMemo(() => {
    if (!category) return [];
    const ids = new Set(services.flatMap((s) => s.providerIds));
    return PROVIDERS.filter((p) => ids.has(p.id));
  }, [category, services]);

  if (!category) {
    return (
      <div className="page">
        <NavBar title="服务" />
        <div className="pad">
          <p>没有找到该服务分类</p>
          <Link className="btn btn-primary" to="/">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page service-list-page">
      <NavBar
        title={category.name}
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label="分享"
            onClick={() => toast('演示环境未接入微信分享，可通过浏览器分享本页')}
          >
            <Icon name="share" size={20} />
          </button>
        }
      />
      <main className="service-list-main">
        <section className="category-hero" style={{ background: category.soft }}>
          <div className="category-hero-copy">
            <span className="category-hero-kicker">专业清洗 · 上门服务</span>
            <h1>{category.name}</h1>
            <p>{category.tagline}</p>
            <div className="category-hero-badges">
              <Tag tone="mint">平台认证师傅</Tag>
              <Tag tone="soft">不满意重做</Tag>
              <Tag tone="soft">明码标价</Tag>
            </div>
          </div>
          <div className="category-hero-art" style={{ color: category.accent }}>
            <ServiceArt kind={category.art} />
          </div>
          <span className="category-hero-count">
            已服务 {compactNumber(services.reduce((sum, s) => sum + s.sales, 0))} 次
          </span>
        </section>

        <div className="category-switch" role="tablist" aria-label="服务分类">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === category.id}
              className={`category-switch-item${c.id === category.id ? ' is-active' : ''}`}
              onClick={() => navigate(`/service/${c.id}`)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="provider-entry"
          onClick={() => navigate(`/providers?categoryId=${category.id}`)}
        >
          <span className="provider-entry-avatars">
            {providers.slice(0, 3).map((p) => (
              <Avatar key={p.id} seed={p.avatar} size={34} />
            ))}
          </span>
          <span className="provider-entry-copy">
            <strong>{providers.length} 位认证师傅可服务</strong>
            <span>可按评分、距离、可约时间自由指定</span>
          </span>
          <span className="provider-entry-link">
            去选师傅 <Icon name="chevronRight" size={13} />
          </span>
        </button>

        <div className="sort-bar">
          <div className="sort-tabs" role="tablist" aria-label="排序">
            {([
              ['recommend', '推荐'],
              ['sales', '销量'],
              ['price', '价格'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={sort === key}
                className={`sort-tab${sort === key ? ' is-active' : ''}`}
                onClick={() => setSort(key)}
              >
                {label}
                {key === 'price' ? <Icon name="sort" size={12} /> : null}
              </button>
            ))}
          </div>
          <span className="sort-count">{services.length} 项服务</span>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <ServiceRowCard key={service.id} service={service} />
          ))}
        </div>

        <section className="list-guarantee">
          <SectionHeader title="服务保障" subtitle="每一单都包含以下保障" />
          <div className="guarantee-grid">
            <div><Icon name="shieldCheck" size={18} /><strong>实名认证</strong><span>健康证 + 技能证</span></div>
            <div><Icon name="clock" size={18} /><strong>准时上门</strong><span>迟到 30 分钟可免费取消</span></div>
            <div><Icon name="refresh" size={18} /><strong>不满意重做</strong><span>服务后 72 小时内可申请</span></div>
            <div><Icon name="wallet" size={18} /><strong>明码标价</strong><span>超出范围先确认再服务</span></div>
          </div>
        </section>

        <section className="list-note">
          <h3><Icon name="info" size={15} /> 预约须知</h3>
          <ul>
            <li>以上价格为标准服务参考价，实际以选择规格后的订单金额为准。</li>
            <li>特殊材质、严重污渍、高空作业等情况，师傅会先与你确认后再处理。</li>
            <li>如需指定师傅，可在师傅列表中选择；未指定则由平台按距离与评分优选。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
