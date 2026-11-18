import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { CATEGORY_MAP, PROVIDERS, SERVICE_MAP, SERVICES } from '../data/catalog';
import { ProviderCard } from '../components/Cards';
import { Avatar } from '../components/Brand';
import { Icon } from '../components/Icon';
import type { Provider } from '../data/types';

type SortKey = 'recommend' | 'rating' | 'distance' | 'orders';

const distanceValue = (distance: string) => Number.parseFloat(distance);

export default function ProviderList() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, ensureDraft, updateDraft, toast } = useApp();
  const [sort, setSort] = useState<SortKey>('recommend');

  const serviceId = params.get('serviceId');
  const categoryId = params.get('categoryId');
  const service = serviceId ? SERVICE_MAP[serviceId] : undefined;
  const category = categoryId ? CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP] : undefined;

  const providers = useMemo<Provider[]>(() => {
    let list = PROVIDERS;
    if (service) {
      list = PROVIDERS.filter((p) => service.providerIds.includes(p.id));
    } else if (category) {
      const ids = new Set(
        SERVICES.filter((s) => s.categoryId === category.id).flatMap((s) => s.providerIds),
      );
      list = PROVIDERS.filter((p) => ids.has(p.id));
    }
    const sorted = [...list];
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'orders') sorted.sort((a, b) => b.orders - a.orders);
    if (sort === 'distance') sorted.sort((a, b) => distanceValue(a.distance) - distanceValue(b.distance));
    return sorted;
  }, [service, category, sort]);

  const selectedId =
    service && state.draft?.serviceId === service.id ? state.draft.providerId : null;

  const choose = (provider: Provider | null) => {
    if (!service) {
      if (provider) navigate(`/provider/${provider.id}`);
      return;
    }
    ensureDraft(service.id);
    updateDraft({ providerId: provider?.id ?? null });
    toast(provider ? `已选择 ${provider.name} 师傅` : '已选择平台优选师傅', 'success');
    if (location.key !== 'default') navigate(-1);
    else navigate(`/service/detail/${service.id}`);
  };

  return (
    <div className="page provider-list-page">
      <NavBar title={service ? '选择师傅' : category ? `选择${category.name}师傅` : '服务师傅'} />
      <main className="providers-main">
        <section className="providers-head">
          <div>
            <h1>{service ? service.name : category ? category.name : '全部清洗师傅'}</h1>
            <p>
              {service
                ? `共 ${providers.length} 位师傅可服务，支持按评分、距离与可约时间指定`
                : '平台认证师傅，均可查看资质与历史评价'}
            </p>
          </div>
          <span className="providers-head-badge">
            <Icon name="shieldCheck" size={15} /> 认证
          </span>
        </section>

        <div className="provider-filter" role="tablist" aria-label="师傅排序">
          {([
            ['recommend', '综合推荐'],
            ['rating', '评分最高'],
            ['distance', '距离最近'],
            ['orders', '接单最多'],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={sort === key}
              className={`filter-chip${sort === key ? ' is-active' : ''}`}
              onClick={() => setSort(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {service ? (
          <button
            type="button"
            className={`provider-auto${selectedId === null ? ' is-selected' : ''}`}
            onClick={() => choose(null)}
          >
            <span className="provider-auto-icon"><Icon name="sparkle" size={20} /></span>
            <span className="provider-auto-copy">
              <strong>平台优选师傅</strong>
              <span>不指定师傅，按距离、评分与接单情况为你匹配</span>
            </span>
            {selectedId === null ? (
              <span className="provider-auto-check"><Icon name="checkCircle" size={20} /></span>
            ) : (
              <Icon name="chevronRight" size={16} />
            )}
          </button>
        ) : null}

        <div className="provider-list">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              selected={selectedId === provider.id}
              onSelect={() => choose(provider)}
              href={
                service
                  ? `/provider/${provider.id}?serviceId=${service.id}`
                  : `/provider/${provider.id}`
              }
            />
          ))}
        </div>

        <section className="provider-note">
          <h3><Icon name="info" size={15} /> 指定师傅说明</h3>
          <p>
            指定师傅后，订单会优先派给该师傅；若师傅临时无法接单，平台会与你沟通改派或改期，你也可以免费取消。
            师傅上门时会出示平台工牌，请注意核验。
          </p>
          <div className="provider-note-avatars">
            {PROVIDERS.slice(0, 4).map((p) => <Avatar key={p.id} seed={p.avatar} size={28} />)}
            <span>平台已认证 {providers.length} 位师傅</span>
          </div>
        </section>
      </main>
    </div>
  );
}
