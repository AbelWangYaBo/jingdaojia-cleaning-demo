import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { CATEGORIES, CATEGORY_MAP, SERVICES } from '../data/catalog';
import { ServiceRowCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/Bits';

const HOT_SEARCHES = ['空调清洗', '沙发除螨', '窗帘免拆', '床垫除螨', '地毯去渍', '真皮保养'];

export default function Search() {
  const { state, addRecentSearch, clearRecentSearches } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const results = useMemo(() => {
    const q = (submitted || query).trim().toLowerCase();
    if (!q) return [];
    return SERVICES.filter((service) => {
      const haystack = [
        service.name,
        service.subtitle,
        ...service.tags,
        CATEGORY_MAP[service.categoryId].name,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => b.sales - a.sales);
  }, [query, submitted]);

  const activeQuery = (submitted || query).trim();

  const doSearch = (value?: string) => {
    const q = (value ?? query).trim();
    setQuery(q);
    setSubmitted(q);
    if (q) addRecentSearch(q);
  };

  return (
    <div className="page search-page">
      <header className="search-head">
        <button type="button" className="icon-btn" aria-label="返回" onClick={() => navigate(-1)}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <form
          className="search-input-wrap"
          onSubmit={(e) => {
            e.preventDefault();
            doSearch();
          }}
        >
          <Icon name="search" size={17} />
          <input
            autoFocus
            value={query}
            placeholder="搜索清洗服务，如：空调清洗"
            aria-label="搜索清洗服务"
            onChange={(e) => {
              setQuery(e.target.value);
              setSubmitted('');
            }}
          />
          {query ? (
            <button type="button" className="search-clear" aria-label="清空搜索" onClick={() => { setQuery(''); setSubmitted(''); }}>
              <Icon name="close" size={13} />
            </button>
          ) : null}
        </form>
        <button type="button" className="search-cancel" onClick={() => (activeQuery ? doSearch() : navigate(-1))}>
          {activeQuery ? '搜索' : '取消'}
        </button>
      </header>

      <main className="search-main">
        {!activeQuery ? (
          <>
            {state.recentSearches.length ? (
              <section className="search-section">
                <div className="search-section-head">
                  <h2>最近搜索</h2>
                  <button type="button" className="search-clear-history" onClick={clearRecentSearches}>
                    <Icon name="trash" size={14} /> 清空
                  </button>
                </div>
                <div className="search-chips">
                  {state.recentSearches.map((item) => (
                    <button key={item} type="button" className="search-chip" onClick={() => doSearch(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="search-section">
              <h2>热门搜索</h2>
              <div className="search-chips">
                {HOT_SEARCHES.map((item, index) => (
                  <button key={item} type="button" className={`search-chip${index < 3 ? ' is-hot' : ''}`} onClick={() => doSearch(item)}>
                    {index < 3 ? <em>{index + 1}</em> : null}
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="search-section">
              <h2>按服务分类找</h2>
              <div className="search-category-list">
                {CATEGORIES.map((category) => (
                  <Link key={category.id} to={`/service/${category.id}`} className="search-category" style={{ background: category.soft }}>
                    <span>{category.name}</span>
                    <em>¥{category.fromPrice}起</em>
                    <Icon name="chevronRight" size={14} style={{ color: category.accent }} />
                  </Link>
                ))}
              </div>
            </section>

            <section className="search-note">
              <Icon name="sparkle" size={16} />
              <p>试试搜索「空调」「除螨」「沙发」，或直接浏览服务分类。</p>
            </section>
          </>
        ) : results.length === 0 ? (
          <EmptyState
            variant="search"
            title={`没有找到「${activeQuery}」`}
            desc="换个关键词试试，或直接浏览清洗分类"
            action={
              <div className="search-empty-actions">
                {CATEGORIES.slice(0, 3).map((c) => (
                  <Link key={c.id} to={`/service/${c.id}`} className="btn btn-ghost btn-small">{c.name}</Link>
                ))}
              </div>
            }
          />
        ) : (
          <section className="search-results">
            <div className="search-result-head">
              <h2>搜索结果</h2>
              <span>{results.length} 项服务</span>
            </div>
            <div className="service-list">
              {results.map((service) => <ServiceRowCard key={service.id} service={service} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
