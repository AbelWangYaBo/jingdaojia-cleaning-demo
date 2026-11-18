import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../store/AppStore';
import { AGREEMENT_MAP } from '../data/agreements';
import { Icon } from './Icon';
import { LogoMark } from './Brand';
import { Spinner, ToastIcon } from './Bits';
import { DEMO_USER_PHONE } from '../store/AppStore';


function OverlayPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById('demo-overlay-root'));
  }, []);
  if (!target) return null;
  return createPortal(children, target);
}

export function Sheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  full = false,
  className = '',
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  full?: boolean;
  className?: string;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const closeCb = useRef(onClose);
  closeCb.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCb.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <OverlayPortal>
      <div className="sheet-layer" role="presentation">
        <div className="sheet-overlay" onClick={onClose} />
        <section
          className={`sheet${full ? ' sheet-full' : ''}${className ? ` ${className}` : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <span className="sheet-grabber" aria-hidden="true" />
          <header className="sheet-head">
            <div>
              <h2>{title}</h2>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            <button ref={closeRef} type="button" className="icon-btn sheet-close" onClick={onClose} aria-label="关闭">
              <Icon name="close" size={20} />
            </button>
          </header>
          <div className="sheet-body">{children}</div>
          {footer ? <footer className="sheet-footer">{footer}</footer> : null}
        </section>
      </div>
    </OverlayPortal>
  );
}

export function Dialog({
  open,
  title,
  description,
  children,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  tone = 'primary',
  loading = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="dialog-layer" role="presentation">
        <div className="dialog-overlay" onClick={onCancel} />
        <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
          <div className="dialog-icon">
            <Icon name={tone === 'danger' ? 'alert' : 'info'} size={24} />
          </div>
          <h2>{title}</h2>
          {description ? <p className="dialog-desc">{description}</p> : null}
          {children ? <div className="dialog-body">{children}</div> : null}
          <div className="dialog-actions">
            {onCancel ? (
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                {cancelText}
              </button>
            ) : null}
            {onConfirm ? (
              <button
                type="button"
                className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? <Spinner size={16} light /> : null}
                {confirmText}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}

export function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast-${toast.tone}`}
          onClick={() => dismissToast(toast.id)}
        >
          <ToastIcon tone={toast.tone} />
          <span>{toast.text}</span>
        </button>
      ))}
    </div>
  );
}

export function AgreementSheet() {
  const { agreementKey, closeAgreement } = useApp();
  const doc = agreementKey ? AGREEMENT_MAP[agreementKey] : null;
  return (
    <Sheet
      open={Boolean(doc)}
      title={doc?.title ?? '服务协议'}
      subtitle={doc ? `更新于 ${doc.updated}` : undefined}
      onClose={closeAgreement}
      full
      className="agreement-sheet"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={closeAgreement}>
          我已阅读并知晓
        </button>
      }
    >
      {doc ? (
        <div className="agreement-doc">
          <span className="agreement-demo-badge">
            <Icon name="info" size={13} /> 演示文本 · 不构成法律文件
          </span>
          <p className="agreement-intro">{doc.intro}</p>
          {doc.sections.map((section) => (
            <section key={section.h} className="agreement-section">
              <h3>{section.h}</h3>
              {section.ps?.map((p) => <p key={p}>{p}</p>)}
              {section.list ? (
                <ul>
                  {section.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <p className="agreement-foot">
            净到家 · 演示产品
            <br />
            如对订单或协议有疑问，请在「我的 - 联系客服」中反馈。
          </p>
        </div>
      ) : null}
    </Sheet>
  );
}

export function PhoneAuthSheet() {
  const { state, phoneAuthOpen, phoneAuthReason, allowPhoneAuth, denyPhoneAuth } = useApp();
  const [allowing, setAllowing] = useState(false);
  useEffect(() => {
    if (phoneAuthOpen) setAllowing(false);
  }, [phoneAuthOpen]);

  if (!phoneAuthOpen) return null;
  const previewPhone = state.user?.phone || DEMO_USER_PHONE;

  return (
    <div className="sheet-layer auth-layer" role="presentation">
      <div className="sheet-overlay" onClick={denyPhoneAuth} />
      <section className="auth-sheet" role="dialog" aria-modal="true" aria-label="微信授权获取手机号">
        <span className="sheet-grabber" />
        <div className="auth-brand">
          <div className="auth-logo">
            <LogoMark size={44} />
          </div>
          <div className="auth-wechat">
            <Icon name="wechat" size={18} />
          </div>
        </div>
        <span className="auth-kicker">微信授权</span>
        <h2 className="auth-title">「净到家」申请获取你的手机号</h2>
        <p className="auth-desc">{phoneAuthReason}</p>
        <div className="auth-phone-preview">
          <Icon name="phone" size={15} />
          <span>{previewPhone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1 **** $2')}</span>
          <em>本机号码</em>
        </div>
        <p className="auth-note">
          演示环境：点击「允许」将模拟小程序 <code>getPhoneNumber</code> 能力，仅填入演示号码，不会真实读取你的手机号。
        </p>
        <div className="auth-actions">
          <button type="button" className="btn btn-ghost" onClick={denyPhoneAuth} disabled={allowing}>
            拒绝
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={allowing}
            onClick={() => {
              setAllowing(true);
              window.setTimeout(() => allowPhoneAuth(), 550);
            }}
          >
            {allowing ? <Spinner size={16} light /> : null}
            {allowing ? '授权中…' : '允许'}
          </button>
        </div>
      </section>
    </div>
  );
}

export function LocationRequest() {
  const { locationOpen, allowLocation, denyLocation } = useApp();
  const [locating, setLocating] = useState(false);
  useEffect(() => {
    if (locationOpen) setLocating(false);
  }, [locationOpen]);

  if (!locationOpen) return null;
  return (
    <div className="dialog-layer location-layer" role="presentation">
      <div className="dialog-overlay" />
      <div className="location-dialog" role="dialog" aria-modal="true" aria-label="获取当前位置">
        <div className="location-icon">
          <Icon name="pin" size={26} />
          <span className="location-pulse" />
        </div>
        <h2>「净到家」想获取你的位置信息</h2>
        <p>用于定位当前城市、推荐附近可上门师傅，不会持续追踪你的位置。</p>
        <div className="location-preview">
          <span className="location-preview-dot" />
          <span>演示定位：深圳市 · 南山区</span>
        </div>
        <p className="location-note">模拟小程序 wx.getLocation / 城市定位能力</p>
        <div className="location-actions">
          <button type="button" className="btn btn-ghost" onClick={denyLocation} disabled={locating}>
            暂不开启
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={locating}
            onClick={() => {
              setLocating(true);
              window.setTimeout(() => allowLocation(), 800);
            }}
          >
            {locating ? <Spinner size={16} light /> : null}
            {locating ? '定位中…' : '允许'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingDialog({ open, text = '处理中…' }: { open: boolean; text?: string }) {
  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="dialog-layer">
        <div className="dialog-overlay" />
        <div className="loading-dialog" role="status" aria-live="polite">
          <Spinner size={26} />
          <span>{text}</span>
        </div>
      </div>
    </OverlayPortal>
  );
}
