import { useMemo, useState } from 'react';
import { CITIES, HOT_CITIES } from '../data/catalog';
import { Icon } from './Icon';

export function CitySelector({
  current,
  located,
  onSelect,
  onLocate,
  compact = false,
}: {
  current?: string;
  located?: boolean;
  onSelect: (city: string, code: string) => void;
  onLocate?: () => void;
  compact?: boolean;
}) {
  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return CITIES;
    return CITIES.filter((c) => c.name.includes(keyword.trim()) || c.pinyin.includes(k));
  }, [keyword]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof CITIES>();
    filtered.forEach((city) => {
      const list = map.get(city.letter) ?? [];
      list.push(city);
      map.set(city.letter, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const letters = groups.map(([letter]) => letter);

  return (
    <div className={`city-selector${compact ? ' is-compact' : ''}`}>
      <div className="city-search">
        <Icon name="search" size={16} />
        <input
          value={keyword}
          placeholder="搜索城市名称或拼音"
          onChange={(e) => setKeyword(e.target.value)}
          aria-label="搜索城市"
        />
        {keyword ? (
          <button type="button" className="city-search-clear" onClick={() => setKeyword('')} aria-label="清空">
            <Icon name="close" size={13} />
          </button>
        ) : null}
      </div>

      {current ? (
        <div className="city-current">
          <span className="city-current-icon">
            <Icon name={located ? 'navigation' : 'pin'} size={18} />
          </span>
          <div>
            <span>当前城市</span>
            <strong>{current}{located ? <em>已定位</em> : <em className="is-manual">手动选择</em>}</strong>
          </div>
          {onLocate ? (
            <button type="button" className="city-locate" onClick={onLocate}>
              <Icon name="refresh" size={13} /> 重新定位
            </button>
          ) : null}
        </div>
      ) : null}

      {!keyword ? (
        <section className="city-hot">
          <h3>热门城市</h3>
          <div className="city-hot-grid">
            {HOT_CITIES.map((city) => (
              <button
                key={city.code}
                type="button"
                className={`city-hot-item${current === city.name ? ' is-active' : ''}`}
                onClick={() => onSelect(city.name, city.code)}
              >
                {city.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="city-all">
        <h3>{keyword ? '搜索结果' : '全部城市'} <span>{filtered.length}</span></h3>
        {groups.length === 0 ? (
          <p className="city-empty">没有找到「{keyword}」，请换个关键词试试</p>
        ) : (
          <div className="city-groups">
            {groups.map(([letter, cities]) => (
              <div key={letter} className="city-group" id={`city-letter-${letter}`}>
                <span className="city-letter">{letter}</span>
                <div className="city-group-list">
                  {cities.map((city) => (
                    <button
                      key={city.code}
                      type="button"
                      className={`city-name${current === city.name ? ' is-active' : ''}`}
                      onClick={() => onSelect(city.name, city.code)}
                    >
                      {city.name}
                      {current === city.name ? <Icon name="check" size={14} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!keyword && letters.length > 6 ? (
        <div className="city-index" aria-label="城市字母索引">
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => {
                document.getElementById(`city-letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      ) : null}
      <p className="city-note">演示环境覆盖 26 个城市，服务范围以实际地址评估为准。</p>
    </div>
  );
}
