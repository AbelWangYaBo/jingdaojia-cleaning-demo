import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { AGREEMENTS } from '../data/agreements';
import { Icon, type IconName } from '../components/Icon';
import { Tag } from '../components/Bits';

const icons: Record<string, IconName> = {
  user: 'user',
  privacy: 'lock',
  platform: 'shield',
  cleaning: 'spray',
  refund: 'refresh',
  guarantee: 'shieldCheck',
};

export default function Agreements() {
  const { openAgreement } = useApp();
  return (
    <div className="page agreements-page">
      <NavBar title="协议与规则" />
      <main className="agreements-main">
        <section className="agreements-hero">
          <span className="agreements-hero-icon"><Icon name="receipt" size={30} /></span>
          <div>
            <h1>服务协议与规则</h1>
            <p>下单前请阅读以下协议，了解服务范围、取消退款与售后保障。</p>
          </div>
        </section>

        <div className="agreement-list">
          {AGREEMENTS.map((doc) => (
            <button key={doc.key} type="button" className="agreement-item" onClick={() => openAgreement(doc.key)}>
              <span className={`agreement-item-icon tone-${doc.key === 'privacy' ? 'blue' : doc.key === 'refund' ? 'gold' : 'red'}`}>
                <Icon name={icons[doc.key] ?? 'receipt'} size={20} />
              </span>
              <span className="agreement-item-copy">
                <strong>{doc.title}</strong>
                <span>{doc.intro.slice(0, 44)}…</span>
                <em>更新于 {doc.updated}</em>
              </span>
              <Icon name="chevronRight" size={16} />
            </button>
          ))}
        </div>

        <section className="agreements-note">
          <Tag tone="soft">演示说明</Tag>
          <p>
            以上协议均为演示文本，参考家政服务行业常见规则编写，不构成真实法律文件。真实业务中，请以平台正式公示的协议为准。
          </p>
        </section>

        <div className="agreements-contact">
          <Icon name="headset" size={16} />
          对协议有疑问？可联系在线客服或拨打 400-800-1234（演示号码）
        </div>
      </main>
    </div>
  );
}
