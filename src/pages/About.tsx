import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { LogoMark } from '../components/Brand';
import { Icon } from '../components/Icon';
import { Tag } from '../components/Bits';

export default function About() {
  const navigate = useNavigate();
  const { state } = useApp();
  const version = '1.0.0';

  return (
    <div className="page about-page">
      <NavBar title="关于净到家" />
      <main className="about-main">
        <section className="about-hero">
          <LogoMark size={68} />
          <h1>净到家</h1>
          <p>专业清洗 · 安心到家</p>
          <Tag tone="soft">内部演示版 v{version}</Tag>
        </section>

        <section className="about-card">
          <h2>这是什么</h2>
          <p>
            净到家是一套面向客户的家政清洗预约小程序演示，覆盖沙发、窗帘、地毯、床垫与空调清洗。
            你可以浏览服务、查看并指定师傅、选择地址与时间、下单支付，并在「我的」中查看订单、评价与协议。
          </p>
          <p>
            产品结构参考了天鹅到家的服务分类、下单链路、师傅展示与售后规则，结合常见本地生活小程序习惯重新设计，
            所有视觉与文案均为演示用途。
          </p>
        </section>

        <section className="about-card">
          <h2>演示范围</h2>
          <ul className="about-list">
            <li><Icon name="checkCircle" size={15} /> 5 大清洗项目、15 个服务、6 位认证师傅</li>
            <li><Icon name="checkCircle" size={15} /> 微信登录 / 手机号验证码登录与手机号授权模拟</li>
            <li><Icon name="checkCircle" size={15} /> 当前城市定位、城市切换、地址新增与选择</li>
            <li><Icon name="checkCircle" size={15} /> 规格、数量、优惠券、服务时间与师傅选择</li>
            <li><Icon name="checkCircle" size={15} /> 模拟支付、订单状态流转、改期、取消退款与评价</li>
            <li><Icon name="checkCircle" size={15} /> 我的订单、优惠券、收藏、消息、客服与协议中心</li>
          </ul>
        </section>

        <section className="about-card">
          <h2>小程序能力对照</h2>
          <div className="about-capability">
            <div><span>手机号授权</span><em>模拟 getPhoneNumber</em></div>
            <div><span>当前城市</span><em>模拟 getLocation / 城市定位</em></div>
            <div><span>地址选择</span><em>模拟 chooseAddress / 地址簿</em></div>
            <div><span>支付</span><em>模拟微信支付收银台</em></div>
            <div><span>数据存储</span><em>localStorage 本地持久化</em></div>
            <div><span>分享 / 相册</span><em>演示环境未接入，点击有提示</em></div>
          </div>
        </section>

        <section className="about-card">
          <h2>数据与免责声明</h2>
          <p>
            页面中的价格、师傅信息、评价、优惠券与协议文本均为前端模拟数据，不代表真实服务或报价。
            演示环境不接入后端、不产生真实支付、不会获取你的真实手机号或位置。
          </p>
          <p className="about-warning">
            <Icon name="info" size={15} />
            本产品仅用于内部演示与设计评审，非真实商业产品。「天鹅到家」为其权利人商标，本演示仅作结构参考。
          </p>
        </section>

        <section className="about-card about-links">
          <h2>设计资料</h2>
          <a href={`${import.meta.env.BASE_URL}wireframes.html`} target="_blank" rel="noreferrer">
            <span><Icon name="map" size={18} /> 低保真框线图</span>
            <Icon name="chevronRight" size={16} />
          </a>
          <a href={`${import.meta.env.BASE_URL}wireframes.pdf`} target="_blank" rel="noreferrer">
            <span><Icon name="receipt" size={18} /> 框线图 PDF</span>
            <Icon name="chevronRight" size={16} />
          </a>
          <button type="button" onClick={() => navigate('/agreements')}>
            <span><Icon name="receipt" size={18} /> 服务协议与规则</span>
            <Icon name="chevronRight" size={16} />
          </button>
          <a href="https://www.daojia.com" target="_blank" rel="noreferrer">
            <span><Icon name="info" size={18} /> 天鹅到家官网（外部参考）</span>
            <Icon name="chevronRight" size={16} />
          </a>
        </section>

        <section className="about-meta">
          <span>净到家 · 家政清洗预约演示</span>
          <span>v{version} · 前端模拟 · {state.orders.length} 个演示订单</span>
          <span>Make home feel new again.</span>
        </section>
      </main>
    </div>
  );
}
