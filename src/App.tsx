import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppStore';
import { StatusBar, TabBar } from './components/Layout';
import { AgreementSheet, Dialog, LocationRequest, PhoneAuthSheet, ToastViewport } from './components/Overlays';
import { Icon } from './components/Icon';
import { LogoMark, Wordmark } from './components/Brand';
import { Tag } from './components/Bits';
import { maskPhone } from './lib/format';
import Home from './pages/Home';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import ProviderList from './pages/ProviderList';
import ProviderDetail from './pages/ProviderDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaySuccess from './pages/PaySuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Review from './pages/Review';
import Mine from './pages/Mine';
import Login from './pages/Login';
import Addresses from './pages/Addresses';
import AddressEdit from './pages/AddressEdit';
import CityPicker from './pages/CityPicker';
import Coupons from './pages/Coupons';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import Notices from './pages/Notices';
import Agreements from './pages/Agreements';
import Support from './pages/Support';
import About from './pages/About';
import NotFound from './pages/NotFound';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Demo error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="crash-screen">
          <LogoMark size={56} />
          <h1>页面遇到了一点问题</h1>
          <p>演示数据仍在本地保存，你可以刷新页面或重置演示数据。</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              try {
                window.localStorage.removeItem('jingdaojia_demo_state_v1');
              } catch {
                /* ignore */
              }
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            重置并返回首页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DemoStage() {
  const { state, login, logout, resetDemo, requestLocation } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const tabVisible = ['/', '/orders', '/mine'].includes(location.pathname);
  const tone: 'dark' | 'light' = location.pathname === '/' || location.pathname === '/mine' ? 'light' : 'dark';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    if (state.locationAsked || location.pathname !== '/') return;
    const timer = window.setTimeout(requestLocation, 650);
    return () => window.clearTimeout(timer);
  }, [state.locationAsked, requestLocation, location.pathname]);

  const pendingReview = state.orders.filter((o) => o.status === 'pending_review').length;
  const activeOrders = state.orders.filter((o) =>
    ['pending_accept', 'pending_service', 'on_the_way', 'in_service'].includes(o.status),
  ).length;

  return (
    <div className="stage">
      <aside className="stage-intro" aria-label="项目介绍">
        <div className="stage-brand">
          <LogoMark size={38} />
          <Wordmark />
        </div>
        <span className="stage-eyebrow">HOME CLEANING · APP DEMO</span>
        <h1>把清洗，<br />交给专业的人。</h1>
        <p className="stage-lead">
          参考天鹅到家的服务结构与下单链路，重新设计的家政清洗预约演示。
          从选服务、选师傅，到手机号授权、选地址、支付与订单状态，全流程可走通。
        </p>
        <div className="stage-chips">
          <Tag tone="red">5 大清洗项目</Tag>
          <Tag tone="mint">指定师傅</Tag>
          <Tag tone="soft">前端模拟数据</Tag>
        </div>
        <ol className="stage-steps">
          <li><span>01</span><div><strong>选服务</strong><p>沙发 / 窗帘 / 地毯 / 床垫 / 空调</p></div></li>
          <li><span>02</span><div><strong>选师傅与时间</strong><p>看评分、距离、可约时段</p></div></li>
          <li><span>03</span><div><strong>授权与下单</strong><p>手机号、地址、优惠券、支付</p></div></li>
          <li><span>04</span><div><strong>订单与售后</strong><p>状态流转、改期、取消、评价</p></div></li>
        </ol>
        <div className="stage-intro-foot">
          <a
            href={`${import.meta.env.BASE_URL}wireframes.html`}
            target="_blank"
            rel="noreferrer"
            className="stage-wire-link"
          >
            <Icon name="map" size={16} /> 查看低保真框线图 <Icon name="arrowRight" size={14} />
          </a>
          <span>仅用于内部演示 · 非真实商业产品</span>
        </div>
      </aside>

      <div className="phone-wrap">
        <div className="phone" aria-label="净到家演示手机界面">
          <div className="phone-buttons" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="phone-screen">
            <StatusBar tone={tone} />
            <div className="app-scroll" id="app-scroll" ref={scrollRef}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/service/:categoryId" element={<ServiceList />} />
                <Route path="/service/detail/:serviceId" element={<ServiceDetail />} />
                <Route path="/providers" element={<ProviderList />} />
                <Route path="/provider/:providerId" element={<ProviderDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/:orderId" element={<Payment />} />
                <Route path="/pay-success/:orderId" element={<PaySuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order/:orderId" element={<OrderDetail />} />
                <Route path="/review/:orderId" element={<Review />} />
                <Route path="/mine" element={<Mine />} />
                <Route path="/login" element={<Login />} />
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/address-edit" element={<AddressEdit />} />
                <Route path="/address-edit/:addressId" element={<AddressEdit />} />
                <Route path="/city" element={<CityPicker />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/search" element={<Search />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/agreements" element={<Agreements />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            {tabVisible ? <TabBar /> : null}
            <div id="demo-overlay-root" className="overlay-root" />
            <ToastViewport />
            <AgreementSheet />
            <PhoneAuthSheet />
            <LocationRequest />
          </div>
        </div>
        <p className="phone-caption">
          <span className="phone-caption-dot" /> 桌面端手机壳预览 · 手机访问自动全屏
        </p>
      </div>

      <aside className="stage-guide" aria-label="演示控制">
        <div className="guide-card">
          <div className="guide-head">
            <span className="guide-kicker">DEMO GUIDE</span>
            <h2>演示控制</h2>
          </div>
          <div className="guide-user">
            <span className="guide-user-avatar">{state.user ? state.user.name.slice(0, 1) : <Icon name="user" size={18} />}</span>
            <div>
              <strong>{state.user ? state.user.name : '未登录状态'}</strong>
              <span>{state.user ? (state.user.phone ? maskPhone(state.user.phone) : '微信已登录 · 未绑定手机号') : '点击下方按钮一键登录'}</span>
            </div>
          </div>
          <div className="guide-actions">
            {state.user ? (
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                切换账号
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-small" onClick={() => login()}>
                一键登录
              </button>
            )}
            <button type="button" className="btn btn-outline btn-small" onClick={() => setResetOpen(true)}>
              重置数据
            </button>
          </div>
          <div className="guide-stats">
            <div><strong>{state.orders.length}</strong><span>演示订单</span></div>
            <div><strong>{activeOrders}</strong><span>进行中</span></div>
            <div><strong>{pendingReview}</strong><span>待评价</span></div>
          </div>
        </div>

        <div className="guide-card">
          <h3>快速跳转</h3>
          <div className="guide-links">
            <button type="button" onClick={() => navigate('/')}>首页</button>
            <button type="button" onClick={() => navigate('/service/ac')}>空调清洗</button>
            <button type="button" onClick={() => navigate('/orders')}>订单</button>
            <button type="button" onClick={() => navigate('/mine')}>我的</button>
          </div>
        </div>

        <div className="guide-card">
          <h3>推荐体验路径</h3>
          <ol className="guide-flow">
            <li><span>1</span>首页选「空调清洗」</li>
            <li><span>2</span>详情页选规格与师傅</li>
            <li><span>3</span>确认订单，点「获取手机号」</li>
            <li><span>4</span>提交订单并模拟支付</li>
            <li><span>5</span>订单详情推进状态</li>
            <li><span>6</span>评价后去「我的」查看</li>
          </ol>
          <p className="guide-note">
            手机号授权、定位与支付均为前端模拟；订单数据保存在 localStorage。
          </p>
        </div>

        <div className="guide-card guide-capability">
          <h3>已实现能力</h3>
          <ul>
            <li><Icon name="checkCircle" size={13} /> 手机号授权 + 验证码验证</li>
            <li><Icon name="checkCircle" size={13} /> 当前城市 / 城市切换</li>
            <li><Icon name="checkCircle" size={13} /> 多地址新增与选择</li>
            <li><Icon name="checkCircle" size={13} /> 指定师傅 / 平台优选</li>
            <li><Icon name="checkCircle" size={13} /> 优惠券、支付、退款估算</li>
            <li><Icon name="checkCircle" size={13} /> 订单状态机与评价</li>
          </ul>
        </div>
      </aside>

      <Dialog
        open={resetOpen}
        title="重置演示数据"
        description="将清除订单、地址、评价、登录状态与聊天记录，恢复初始演示数据。"
        confirmText="重置"
        cancelText="取消"
        tone="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
          navigate('/');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <DemoStage />
      </AppProvider>
    </ErrorBoundary>
  );
}
