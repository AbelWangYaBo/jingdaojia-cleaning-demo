import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp, DEMO_USER_PHONE } from '../store/AppStore';
import { Icon } from '../components/Icon';
import { LogoMark, ServiceArt } from '../components/Brand';
import { Checkbox, Spinner } from '../components/Bits';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, login, openAgreement, toast } = useApp();
  const [mode, setMode] = useState<'wechat' | 'phone'>('wechat');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const from = (location.state as { from?: string } | null)?.from ?? '/mine';

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const finish = (phoneValue?: string) => {
    login({ name: '林小满', phone: phoneValue });
    navigate(from, { replace: true });
  };

  const ensureAgreed = () => {
    if (!agreed) {
      toast('请先阅读并同意用户协议与隐私政策', 'error');
      return false;
    }
    return true;
  };

  const wechatLogin = () => {
    if (!ensureAgreed()) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      finish();
    }, 750);
  };

  const sendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast('请输入正确的 11 位手机号', 'error');
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    toast('验证码已发送，演示验证码：123456', 'info');
  };

  const phoneLogin = () => {
    if (!ensureAgreed()) return;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast('请输入正确的手机号', 'error');
      return;
    }
    if (code !== '123456') {
      toast('验证码不正确，演示验证码为 123456', 'error');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      finish(phone);
    }, 500);
  };

  if (state.user) {
    return (
      <div className="page login-page">
        <header className="login-nav">
          <button type="button" className="icon-btn" aria-label="返回" onClick={() => navigate(-1)}>
            <Icon name="chevronLeft" size={22} />
          </button>
        </header>
        <div className="login-logged">
          <div className="login-logo"><LogoMark size={62} /></div>
          <h1>你已登录</h1>
          <p>{state.user.name}，欢迎回来</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(from, { replace: true })}>
            继续
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page login-page">
      <header className="login-nav">
        <button type="button" className="icon-btn" aria-label="关闭" onClick={() => navigate(-1)}>
          <Icon name="close" size={21} />
        </button>
        <span className="login-nav-help" />
      </header>
      <main className="login-main">
        <div className="login-brand">
          <div className="login-logo"><LogoMark size={58} /></div>
          <h1><span>净</span>到家</h1>
          <p>专业清洗，安心到家</p>
        </div>
        <div className="login-art" aria-hidden="true">
          <span className="login-art-bubble login-art-bubble-1" />
          <span className="login-art-bubble login-art-bubble-2" />
          <div className="login-art-item login-art-item-1"><ServiceArt kind="sofa" /></div>
          <div className="login-art-item login-art-item-2"><ServiceArt kind="ac" /></div>
          <div className="login-art-item login-art-item-3"><ServiceArt kind="mattress" /></div>
        </div>

        <div className="login-panel">
          <div className="login-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'wechat'}
              className={mode === 'wechat' ? 'is-active' : ''}
              onClick={() => setMode('wechat')}
            >
              微信登录
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'phone'}
              className={mode === 'phone' ? 'is-active' : ''}
              onClick={() => setMode('phone')}
            >
              手机号登录
            </button>
          </div>

          {mode === 'wechat' ? (
            <div className="login-wechat-panel">
              <p className="login-desc">一键登录，订单与售后随时可查。登录后可再授权手机号。</p>
              <button type="button" className="btn btn-wechat btn-block login-main-btn" onClick={wechatLogin} disabled={loading}>
                {loading ? <Spinner size={17} light /> : <Icon name="wechat" size={20} />}
                {loading ? '登录中…' : '微信一键登录'}
              </button>
              <p className="login-demo-note">演示环境：模拟微信登录，不会真实授权或获取头像昵称。</p>
            </div>
          ) : (
            <div className="login-phone-panel">
              <div className="login-field">
                <span className="login-field-prefix">+86</span>
                <input
                  value={phone}
                  inputMode="tel"
                  maxLength={11}
                  placeholder="请输入手机号"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  aria-label="手机号"
                />
              </div>
              <div className="login-field">
                <input
                  value={code}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="请输入验证码"
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-label="验证码"
                />
                <button type="button" className="login-code-btn" onClick={sendCode} disabled={countdown > 0}>
                  {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
              {codeSent ? <p className="login-code-hint">演示验证码：123456</p> : null}
              <button type="button" className="btn btn-primary btn-block login-main-btn" onClick={phoneLogin} disabled={loading}>
                {loading ? <Spinner size={17} light /> : null}
                {loading ? '登录中…' : '登录'}
              </button>
              <p className="login-demo-note">
                演示号码：{DEMO_USER_PHONE}，验证码 123456。仅用于本地演示。
              </p>
            </div>
          )}
        </div>

        <div className="login-agreement">
          <div className="agreement-check-line">
            <Checkbox checked={agreed} onChange={setAgreed} ariaLabel="同意用户协议与隐私政策">
              我已阅读并同意
            </Checkbox>
            <span className="agreement-links">
              <button type="button" className="inline-link" onClick={() => openAgreement('user')}>《用户协议》</button>
              <button type="button" className="inline-link" onClick={() => openAgreement('privacy')}>《隐私政策》</button>
            </span>
          </div>
          <p>未注册的手机号登录后将自动创建演示账号</p>
        </div>

        <button type="button" className="login-browse" onClick={() => navigate('/')}>
          先随便看看 <Icon name="chevronRight" size={13} />
        </button>
      </main>
    </div>
  );
}
