import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { CitySelector } from '../components/CitySelector';
import { Icon } from '../components/Icon';

export default function CityPicker() {
  const { state, setCity, requestLocation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="page city-page">
      <NavBar title="选择城市" />
      <main className="city-main">
        <div className="city-page-intro">
          <Icon name="pin" size={18} />
          <p>切换城市后，首页将展示该城市的可服务项目。演示数据对所有城市开放。</p>
        </div>
        <CitySelector
          current={state.city.name}
          located={state.city.located}
          onLocate={requestLocation}
          onSelect={(name, code) => {
            setCity(name, code);
            if (location.key !== 'default') navigate(-1);
            else navigate('/');
          }}
        />
      </main>
    </div>
  );
}
