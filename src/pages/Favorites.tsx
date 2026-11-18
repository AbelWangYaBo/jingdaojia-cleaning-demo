import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { EmptyState } from '../components/Bits';
import { ServiceRowCard } from '../components/Cards';
import { SERVICE_MAP } from '../data/catalog';

export default function Favorites() {
  const { state } = useApp();
  const navigate = useNavigate();
  const services = state.favorites.map((id) => SERVICE_MAP[id]).filter(Boolean);

  return (
    <div className="page favorites-page">
      <NavBar title="我的收藏" />
      <main className="favorites-main">
        {services.length === 0 ? (
          <EmptyState
            variant="favorite"
            title="还没有收藏的服务"
            desc="在服务详情点击收藏，下次预约更方便"
            action={<button type="button" className="btn btn-primary" onClick={() => navigate('/')}>去逛逛</button>}
          />
        ) : (
          <>
            <p className="favorites-count">已收藏 {services.length} 项服务</p>
            <div className="service-list">
              {services.map((service) => <ServiceRowCard key={service.id} service={service} />)}
            </div>
            <Link to="/" className="favorites-more">继续逛逛 <span>→</span></Link>
          </>
        )}
      </main>
    </div>
  );
}
