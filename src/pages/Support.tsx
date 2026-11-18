import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/Overlays';
import { LogoMark } from '../components/Brand';
import { uid } from '../lib/format';

const FAQS = [
  {
    q: '预约后可以改时间吗？',
    a: '待服务订单可在订单详情中点击「修改时间」，重新选择未来 7 天的日期与时段。距服务开始 4 小时以上改期免费；不足 4 小时建议先联系客服。',
  },
  {
    q: '取消订单会扣钱吗？',
    a: '距服务开始 4 小时以上取消可全额退款；不足 4 小时收取订单金额 20% 的违约金（最高 50 元）；师傅已出发后取消收取 30%（最高 80 元）。服务开始后无法直接取消。',
  },
  {
    q: '清洗效果不满意怎么办？',
    a: '请在服务完成后 72 小时内联系在线客服，说明具体问题并保留现场照片。平台核实后会优先安排原师傅返工，无法返工的将协调其他师傅处理。',
  },
  {
    q: '师傅会自带清洁剂和设备吗？',
    a: '会。师傅自带专业清洗设备、清洁剂、防尘垫与鞋套。如果你对清洁剂有特殊要求（如母婴、宠物家庭），请在下单备注中说明。',
  },
  {
    q: '可以开发票吗？',
    a: '演示环境不提供真实发票。真实业务中，可在订单完成后通过客服申请电子普通发票，具体开票主体以支付页面展示为准。',
  },
  {
    q: '服务包含保险吗？',
    a: '每笔订单包含平台履约保障。因师傅操作不当造成的物品损坏，可拍照留证并通过客服申请定损赔付；现金、首饰、证件等贵重物品请提前妥善保管。',
  },
];

interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: string;
}

const nowTime = () =>
  `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

const botReply = (text: string) => {
  if (text.includes('改期') || text.includes('时间')) {
    return '可以在「我的 - 订单」中打开订单详情，点击「修改时间」重新选择日期与时段。距服务开始 4 小时以上改期免费；如果订单已出发，建议直接联系师傅协商。';
  }
  if (text.includes('退款') || text.includes('取消')) {
    return '取消与退款按时间分档：服务开始前 4 小时以上全额退款；4 小时内收 20% 违约金（最高 50 元）；师傅已出发后收 30%（最高 80 元）。你可以在订单详情查看预计退款金额。';
  }
  if (text.includes('发票')) {
    return '演示环境暂不支持真实开票。真实订单完成后，可向客服提供抬头与税号申请电子普通发票。';
  }
  if (text.includes('投诉') || text.includes('不满')) {
    return '很抱歉给你带来不好的体验。请告诉我订单号与具体问题，并尽量保留现场照片。平台会在 2 小时内响应，核实后安排返工或按规则处理。';
  }
  return '收到，我已经记录你的问题。演示环境下我可以帮你了解改期、退款、售后与开票规则；如需人工处理，请拨打 400-800-1234（演示号码）。';
};

export default function Support() {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', from: 'bot', text: '你好，我是净到家客服小净。请问有什么可以帮你？', time: nowTime() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chatOpen) return;
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [chatOpen, messages, typing]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { id: uid('msg'), from: 'user', text: q, time: nowTime() }]);
    setInput('');
    setTyping(true);
    timerRef.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: uid('msg'), from: 'bot', text: botReply(q), time: nowTime() },
      ]);
    }, 750);
  };

  const openChat = (topic?: string) => {
    setChatOpen(true);
    if (topic) window.setTimeout(() => ask(topic), 250);
  };

  const copyPhone = () => {
    navigator.clipboard?.writeText('400-800-1234').then(
      () => toast('客服电话已复制', 'success'),
      () => toast('演示环境无法复制，请手动记录', 'info'),
    );
  };

  return (
    <div className="page support-page">
      <NavBar title="联系客服" />
      <main className="support-main">
        <section className="support-hero">
          <div className="support-hero-top">
            <span className="support-avatar"><LogoMark size={46} /></span>
            <div>
              <h1>净到家客服</h1>
              <p><span className="support-online-dot" /> 在线服务中 · 8:00-22:00</p>
            </div>
          </div>
          <p className="support-desc">订单改期、退款、售后与清洗咨询，都可以找我们。</p>
          <div className="support-actions">
            <button type="button" className="btn btn-primary" onClick={() => openChat()}>
              <Icon name="chat" size={17} /> 在线客服
            </button>
            <button type="button" className="btn btn-outline" onClick={copyPhone}>
              <Icon name="phone" size={16} /> 400-800-1234
            </button>
          </div>
          <p className="support-demo-note">演示环境：在线客服为模拟对话，电话不会真实拨出。</p>
        </section>

        <section className="support-quick">
          <h2>常见问题快速咨询</h2>
          <div className="support-quick-grid">
            {[
              { label: '我想改期', icon: 'calendar' as const, topic: '我想修改预约时间，怎么操作？' },
              { label: '取消与退款', icon: 'refresh' as const, topic: '取消订单会怎么退款？' },
              { label: '服务不满意', icon: 'alert' as const, topic: '我对清洗效果不满意，想投诉' },
              { label: '开发票', icon: 'receipt' as const, topic: '清洗订单可以开发票吗？' },
            ].map((item) => (
              <button key={item.label} type="button" className="support-quick-item" onClick={() => openChat(item.topic)}>
                <span><Icon name={item.icon} size={20} /></span>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="support-order-link">
          <div>
            <strong>需要查询具体订单？</strong>
            <span>在订单详情中联系客服，可自动带上订单信息</span>
          </div>
          <button type="button" className="btn btn-outline btn-small" onClick={() => navigate('/orders')}>查看订单</button>
        </section>

        <section className="support-faq">
          <h2>常见问题</h2>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>{faq.q}<Icon name="chevronDown" size={16} /></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="support-links">
          <button type="button" onClick={() => openChat('我想了解服务保障和保险')}>
            <Icon name="shieldCheck" size={17} /> 服务保障说明 <Icon name="chevronRight" size={14} />
          </button>
          <button type="button" onClick={() => openChat('我对订单有投诉建议')}>
            <Icon name="comment" size={17} /> 投诉与建议 <Icon name="chevronRight" size={14} />
          </button>
        </section>

        <p className="support-foot">客服热线 400-800-1234 · 仅用于演示<br />净到家 · 让每一次上门都值得托付</p>
      </main>

      <Sheet
        open={chatOpen}
        title="在线客服"
        subtitle="客服小净 · 演示对话"
        onClose={() => setChatOpen(false)}
        full
        footer={
          <div className="chat-input-bar">
            <input
              value={input}
              placeholder="描述你的问题…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask(input);
              }}
              aria-label="输入客服消息"
            />
            <button type="button" className="btn btn-primary btn-small" onClick={() => ask(input)} disabled={!input.trim()}>
              发送
            </button>
          </div>
        }
      >
        <div className="chat-body">
          <div className="chat-date">今天</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg chat-${msg.from}`}>
              {msg.from === 'bot' ? <span className="chat-avatar"><LogoMark size={28} /></span> : null}
              <div className="chat-bubble-wrap">
                <div className="chat-bubble">{msg.text}</div>
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {typing ? (
            <div className="chat-msg chat-bot">
              <span className="chat-avatar"><LogoMark size={28} /></span>
              <div className="chat-bubble chat-typing"><i /><i /><i /></div>
            </div>
          ) : null}
          <div className="chat-quick">
            {['怎么改期？', '退款规则是什么？', '可以开发票吗？'].map((q) => (
              <button key={q} type="button" onClick={() => ask(q)}>{q}</button>
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
      </Sheet>
    </div>
  );
}
