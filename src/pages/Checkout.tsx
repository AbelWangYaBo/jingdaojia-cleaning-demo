import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, DEMO_USER_PHONE } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { CATEGORY_MAP, PROVIDER_MAP, SERVICE_MAP, SLOTS } from '../data/catalog';
import { ServiceArt, Avatar } from '../components/Brand';
import { Icon } from '../components/Icon';
import { Checkbox, EmptyState, Price, Spinner, Stepper, Tag } from '../components/Bits';
import { CouponCard } from '../components/Cards';
import { Dialog, Sheet } from '../components/Overlays';
import {
  bestCouponFor,
  couponApplicable,
  defaultAppointment,
  isSlotPast,
  isValidPhone,
  money,
  normalizePhone,
  prettyPhone,
  upcomingDays,
} from '../lib/format';
import type { Coupon } from '../data/types';

interface FormErrors {
  address?: string;
  name?: string;
  phone?: string;
  time?: string;
  agreement?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    state,
    ensureDraft,
    updateDraft,
    createOrder,
    login,
    openPhoneAuth,
    openAgreement,
    toast,
  } = useApp();

  const service = state.draft ? SERVICE_MAP[state.draft.serviceId] : undefined;
  const option = service && state.draft
    ? service.options.find((o) => o.id === state.draft?.optionId) ?? service.options[0]
    : null;
  const draft = state.draft;
  const qty = Math.max(service?.minQty ?? 1, draft?.qty ?? 1);
  const amount = option ? option.price * qty : 0;
  const address =
    state.addresses.find((a) => a.id === draft?.addressId) ??
    state.addresses.find((a) => a.isDefault) ??
    state.addresses[0] ??
    null;
  const provider = draft?.providerId ? PROVIDER_MAP[draft.providerId] : null;
  const days = useMemo(() => upcomingDays(7), []);

  const [name, setName] = useState(draft?.contactName || state.user?.name || address?.name || '');
  const [phone, setPhone] = useState(draft?.contactPhone || state.user?.phone || address?.phone || '');
  const [verified, setVerified] = useState(Boolean(draft?.phoneVerified));
  const [codeSent, setCodeSent] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [remark, setRemark] = useState(draft?.remark ?? '');
  const [couponChoice, setCouponChoice] = useState<string>(draft?.couponId ?? 'best');
  const [couponOpen, setCouponOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const date = draft?.date ?? '';
  const slot = draft?.slot ?? '';
  const bestCoupon = service ? bestCouponFor(state.coupons, service.categoryId, amount) : null;
  const selectedCoupon: Coupon | null =
    couponChoice === 'none'
      ? null
      : couponChoice === 'best'
        ? bestCoupon
        : state.coupons.find(
            (c) =>
              c.id === couponChoice &&
              service &&
              couponApplicable(c, service.categoryId, amount),
          ) ?? bestCoupon;
  const discount = selectedCoupon ? Math.min(selectedCoupon.amount, amount) : 0;
  const total = Math.max(0, amount - discount);

  useEffect(() => {
    if (!service) return;
    ensureDraft(service.id);
  }, [service, ensureDraft]);

  useEffect(() => {
    if (!draft) return;
    const validDates = days.map((d) => d.key);
    const dateOk = validDates.includes(draft.date);
    if (!dateOk || isSlotPast(draft.date, draft.slot)) {
      const next = defaultAppointment();
      updateDraft({ date: next.date, slot: next.slot });
    }
  }, [draft, days, updateDraft]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!draft) {
      setErrors({});
    }
  }, [draft]);

  const couponsAvailable = useMemo(() => {
    if (!service) return [] as Coupon[];
    return state.coupons
      .filter((c) => !c.used && new Date(c.expiresAt).getTime() >= Date.now())
      .slice()
      .sort((a, b) => {
        const aOk = couponApplicable(a, service.categoryId, amount) ? 0 : 1;
        const bOk = couponApplicable(b, service.categoryId, amount) ? 0 : 1;
        if (aOk !== bOk) return aOk - bOk;
        return b.amount - a.amount;
      });
  }, [state.coupons, service, amount]);

  if (!draft || !service || !option) {
    return (
      <div className="page">
        <NavBar title="确认订单" />
        <EmptyState
          title="预约信息已失效"
          desc="请返回服务详情重新选择服务与数量"
          action={<Link to="/" className="btn btn-primary">去选服务</Link>}
          variant="order"
        />
      </div>
    );
  }

  const updateContact = (patch: { name?: string; phone?: string; verified?: boolean }) => {
    if (patch.name !== undefined) {
      setName(patch.name);
      updateDraft({ contactName: patch.name });
    }
    if (patch.phone !== undefined) {
      setPhone(patch.phone);
      updateDraft({ contactPhone: patch.phone, phoneVerified: Boolean(patch.verified) });
    }
    if (patch.verified !== undefined) {
      setVerified(patch.verified);
      updateDraft({ phoneVerified: patch.verified });
    }
  };

  const handlePhoneChange = (value: string) => {
    const digits = normalizePhone(value);
    setPhone(digits);
    setVerified(false);
    setCodeSent(false);
    setCodeInput('');
    setCountdown(0);
    setErrors((e) => ({ ...e, phone: undefined }));
    updateDraft({ contactPhone: digits, phoneVerified: false });
  };

  const handleSendCode = () => {
    if (!isValidPhone(phone)) {
      setErrors((e) => ({ ...e, phone: '请输入正确的 11 位手机号' }));
      toast('请输入正确的手机号后再获取验证码', 'error');
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    setErrors((e) => ({ ...e, phone: undefined }));
    toast('验证码已发送，演示验证码：123456', 'info');
  };

  const handleVerifyCode = () => {
    if (codeInput !== '123456') {
      setErrors((e) => ({ ...e, phone: '验证码不正确，演示验证码为 123456' }));
      toast('验证码不正确', 'error');
      return;
    }
    setVerified(true);
    setErrors((e) => ({ ...e, phone: undefined }));
    updateContact({ phone, verified: true });
    toast('手机号验证通过', 'success');
  };

  const handleAuthPhone = () => {
    const authPhone = state.user?.phone || DEMO_USER_PHONE;
    openPhoneAuth('用于接收订单通知、师傅联系与售后服务', () => {
      const nextName = name || '林小满';
      setName(nextName);
      setPhone(authPhone);
      setVerified(true);
      setCodeSent(false);
      setCountdown(0);
      setErrors((e) => ({ ...e, phone: undefined }));
      updateDraft({
        contactName: nextName,
        contactPhone: authPhone,
        phoneVerified: true,
      });
    });
  };

  const toggleQuickTag = (tag: string) => {
    const next = remark.includes(tag)
      ? remark.replace(tag, '').replace(/^；|；$/g, '').replace(/；{2,}/g, '；')
      : remark
        ? `${remark}；${tag}`
        : tag;
    setRemark(next);
    updateDraft({ remark: next });
  };

  const availableSlotsFor = (key: string) => SLOTS.filter((s) => !isSlotPast(key, s.label));

  const selectDate = (key: string) => {
    const slots = availableSlotsFor(key);
    if (slots.length === 0) return;
    const keep = slots.some((s) => s.label === slot) ? slot : slots[0].label;
    updateDraft({ date: key, slot: keep });
    setErrors((e) => ({ ...e, time: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!address) next.address = '请选择服务地址';
    if (!name.trim()) next.name = '请填写联系人姓名';
    if (!isValidPhone(phone)) next.phone = '请输入正确的 11 位手机号';
    else if (!verified) next.phone = '请先完成手机号验证或微信授权';
    if (!date || !slot) next.time = '请选择上门日期与时间段';
    if (!agreed) next.agreement = '请阅读并同意服务协议';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast('请完善订单信息后再提交', 'error');
      window.setTimeout(() => {
        document.querySelector('.form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return false;
    }
    return true;
  };

  const finalizeOrder = () => {
    setSubmitting(true);
    try {
      const order = createOrder({
        serviceId: service.id,
        optionId: option.id,
        qty,
        providerId: provider?.id ?? null,
        addressId: address!.id,
        contactName: name.trim(),
        contactPhone: phone,
        date,
        slot,
        couponId: selectedCoupon?.id ?? null,
        remark,
      });
      navigate(`/payment/${order.id}`, { replace: true });
    } catch (error) {
      setSubmitting(false);
      toast(error instanceof Error ? error.message : '提交订单失败，请重试', 'error');
    }
  };

  const submitOrder = () => {
    if (!validate()) return;
    if (!state.user) {
      setLoginOpen(true);
      return;
    }
    finalizeOrder();
  };

  const handleLoginAndSubmit = () => {
    login({ name: name || '林小满', phone: isValidPhone(phone) ? phone : undefined });
    setLoginOpen(false);
    window.setTimeout(() => finalizeOrder(), 120);
  };

  const category = CATEGORY_MAP[service.categoryId];
  const dateCells = days.map((d) => ({
    ...d,
    disabled: availableSlotsFor(d.key).length === 0,
  }));
  return (
    <div className="page checkout-page">
      <NavBar title="确认订单" />
      <main className="checkout-main">
        <button
          type="button"
          className="checkout-address"
          onClick={() => navigate('/addresses?select=1')}
        >
          {address ? (
            <>
              <span className="checkout-address-icon"><Icon name="pin" size={20} /></span>
              <span className="checkout-address-main">
                <span className="checkout-address-top">
                  <Tag tone="red">{address.tag}</Tag>
                  <strong>{address.name}</strong>
                  <span>{prettyPhone(address.phone)}</span>
                  {address.isDefault ? <em>默认</em> : null}
                </span>
                <span className="checkout-address-detail">
                  {address.city} {address.district} {address.detail}
                </span>
                {address.city !== state.city.name ? (
                  <span className="checkout-address-note">
                    <Icon name="info" size={12} /> 地址位于{address.city}，将按地址所在城市派单
                  </span>
                ) : null}
              </span>
              <Icon name="chevronRight" size={18} className="checkout-address-arrow" />
            </>
          ) : (
            <>
              <span className="checkout-address-icon"><Icon name="plus" size={20} /></span>
              <span className="checkout-address-main">
                <strong>添加服务地址</strong>
                <span className="checkout-address-detail">请填写上门地址与联系人</span>
              </span>
              <Icon name="chevronRight" size={18} />
            </>
          )}
        </button>
        {errors.address ? <p className="form-error">{errors.address}</p> : null}

        <section className="checkout-card">
          <div className="checkout-service-head">
            <h2>服务信息</h2>
            <Link to={`/service/detail/${service.id}`} className="text-link">
              修改 <Icon name="chevronRight" size={12} />
            </Link>
          </div>
          <div className="checkout-service">
            <span className="checkout-service-art" style={{ background: category.soft }}>
              <ServiceArt kind={service.art} />
            </span>
            <span className="checkout-service-main">
              <strong>{service.name}</strong>
              <span>{option.label} · {service.duration}</span>
              <span className="checkout-service-tags">
                {service.tags.slice(0, 2).map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
              </span>
            </span>
            <Price value={option.price} unit={service.unit} size="sm" />
          </div>
          <div className="checkout-service-qty">
            <span>
              数量
              <em>{service.minQty > 1 ? `${service.minQty} ${service.unit}起订` : '按实际数量选择'}</em>
            </span>
            <Stepper
              value={qty}
              min={service.minQty}
              max={service.categoryId === 'curtain' ? 20 : 9}
              suffix={service.unit}
              onChange={(next) => updateDraft({ qty: next })}
            />
          </div>
        </section>

        <section className="checkout-card">
          <div className="checkout-card-head">
            <h2>上门时间</h2>
            <span>师傅将在所选时段内到达</span>
          </div>
          <div className="date-strip" role="tablist" aria-label="选择日期">
            {dateCells.map((d) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={date === d.key}
                className={`date-chip${date === d.key ? ' is-active' : ''}${d.disabled ? ' is-disabled' : ''}`}
                disabled={d.disabled}
                onClick={() => selectDate(d.key)}
              >
                <span className="date-label">{d.label}</span>
                <span className="date-sub">{d.sub}</span>
              </button>
            ))}
          </div>
          <div className="slot-grid">
            {SLOTS.map((s) => {
              const past = isSlotPast(date, s.label);
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`slot-chip${slot === s.label ? ' is-active' : ''}${past ? ' is-disabled' : ''}`}
                  disabled={past}
                  onClick={() => {
                    updateDraft({ slot: s.label });
                    setErrors((e) => ({ ...e, time: undefined }));
                  }}
                >
                  {s.label}
                  {past ? <em>已过</em> : null}
                </button>
              );
            })}
          </div>
          {errors.time ? <p className="form-error">{errors.time}</p> : null}
          <p className="checkout-tip">
            <Icon name="info" size={13} />
            可预约未来 7 天，最晚请提前 1 小时预约。师傅接单后会电话确认具体到达时间。
          </p>
        </section>

        <section className="checkout-card">
          <button
            type="button"
            className="checkout-row"
            onClick={() => navigate(`/providers?serviceId=${service.id}`)}
          >
            <span className="checkout-row-label">服务师傅</span>
            {provider ? (
              <span className="checkout-row-provider">
                <Avatar seed={provider.avatar} size={26} />
                <strong>{provider.name}</strong>
                <span>{provider.rating.toFixed(2)} 分</span>
              </span>
            ) : (
              <span className="checkout-row-provider">
                <span className="platform-match-icon"><Icon name="sparkle" size={16} /></span>
                <strong>平台优选</strong>
                <span>按距离与评分匹配</span>
              </span>
            )}
            <span className="checkout-row-action">
              更换 <Icon name="chevronRight" size={13} />
            </span>
          </button>
        </section>

        <section className="checkout-card">
          <div className="checkout-card-head">
            <h2>联系人信息</h2>
            <span>用于接收订单通知</span>
          </div>
          <div className="form-field">
            <label htmlFor="contact-name">联系人</label>
            <input
              id="contact-name"
              value={name}
              maxLength={12}
              placeholder="请填写联系人姓名"
              onChange={(e) => {
                setName(e.target.value);
                updateDraft({ contactName: e.target.value });
                setErrors((err) => ({ ...err, name: undefined }));
              }}
            />
          </div>
          {errors.name ? <p className="form-error">{errors.name}</p> : null}
          <div className="form-field">
            <label htmlFor="contact-phone">手机号</label>
            <input
              id="contact-phone"
              value={prettyPhone(phone)}
              inputMode="tel"
              maxLength={13}
              placeholder="请输入 11 位手机号"
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
            <button type="button" className="inline-auth" onClick={handleAuthPhone}>
              <Icon name="wechat" size={15} /> 获取手机号
            </button>
          </div>
          {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
          {verified ? (
            <p className="verify-ok">
              <Icon name="checkCircle" size={14} /> 手机号已验证，可用于接收订单通知
            </p>
          ) : (
            <div className="code-area">
              <div className="code-input-row">
                <input
                  value={codeInput}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="短信验证码"
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                  aria-label="短信验证码"
                />
                {codeSent ? (
                  <button type="button" className="btn btn-outline btn-small" onClick={handleVerifyCode}>
                    验证
                  </button>
                ) : (
                  <button type="button" className="btn btn-outline btn-small" onClick={handleSendCode}>
                    获取验证码
                  </button>
                )}
              </div>
              {codeSent ? (
                <div className="code-hint">
                  <span>演示验证码 123456</span>
                  <button
                    type="button"
                    className="text-link"
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                  >
                    {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送'}
                  </button>
                </div>
              ) : (
                <p className="code-hint-plain">也可以点击「获取手机号」模拟微信授权，一步完成验证</p>
              )}
            </div>
          )}
        </section>

        <section className="checkout-card">
          <button type="button" className="checkout-row" onClick={() => setCouponOpen(true)}>
            <span className="checkout-row-label">优惠券</span>
            <span className="checkout-row-value">
              {selectedCoupon ? (
                <>
                  <Tag tone="red">-¥{discount}</Tag>
                  <span className="muted-text">{selectedCoupon.title}</span>
                </>
              ) : couponsAvailable.length > 0 ? (
                <span>{couponsAvailable.filter((c) => service && couponApplicable(c, service.categoryId, amount)).length} 张可用</span>
              ) : (
                <span className="muted-text">暂无可用</span>
              )}
            </span>
            <Icon name="chevronRight" size={16} />
          </button>
          <div className="checkout-row checkout-row-static">
            <span className="checkout-row-label">上门费</span>
            <span className="checkout-row-value"><span className="muted-text">已包含</span> ¥0</span>
          </div>
        </section>

        <section className="checkout-card">
          <div className="checkout-card-head">
            <h2>备注</h2>
            <span>选填，最多 80 字</span>
          </div>
          <textarea
            className="remark-input"
            value={remark}
            maxLength={80}
            rows={2}
            placeholder="例如：家里有宠物，请带除毛工具；到门口请先电话联系"
            onChange={(e) => {
              setRemark(e.target.value);
              updateDraft({ remark: e.target.value });
            }}
          />
          <div className="quick-tags">
            {['家有宠物', '有老人小孩', '电梯房', '请提前联系'].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`quick-tag${remark.includes(tag) ? ' is-active' : ''}`}
                onClick={() => toggleQuickTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="checkout-card checkout-summary">
          <h2>费用明细</h2>
          <div className="summary-row"><span>{service.name}（{option.label}）× {qty} {service.unit}</span><span>{money(amount)}</span></div>
          <div className="summary-row"><span>上门服务费</span><span>¥0</span></div>
          {selectedCoupon ? (
            <div className="summary-row summary-discount">
              <span>优惠券 · {selectedCoupon.title}</span>
              <span>-{money(discount)}</span>
            </div>
          ) : null}
          <div className="summary-total">
            <span>合计</span>
            <strong>{money(total)}</strong>
          </div>
          {discount > 0 ? <p className="summary-save">已为你节省 {money(discount)}</p> : null}
        </section>

        <section className="checkout-agreement">
          <div className="agreement-check-line">
            <Checkbox
              checked={agreed}
              onChange={(next) => {
                setAgreed(next);
                setErrors((e) => ({ ...e, agreement: undefined }));
              }}
              ariaLabel="同意服务协议"
            >
              我已阅读并同意
            </Checkbox>
            <span className="agreement-links">
              <button type="button" className="inline-link" onClick={() => openAgreement('user')}>《用户协议》</button>
              <button type="button" className="inline-link" onClick={() => openAgreement('privacy')}>《隐私政策》</button>
              <button type="button" className="inline-link" onClick={() => openAgreement('cleaning')}>《清洗服务协议》</button>
              <button type="button" className="inline-link" onClick={() => openAgreement('refund')}>《取消与退款规则》</button>
            </span>
          </div>
          {errors.agreement ? <p className="form-error">{errors.agreement}</p> : null}
        </section>

        <div className="checkout-guarantee">
          <Icon name="shieldCheck" size={15} />
          平台认证 · 准时上门 · 不满意重做 · 订单售后保障
        </div>
        <p className="checkout-address-note checkout-disclaimer">
          演示环境：支付为模拟流程，不会产生真实扣款。服务地址为 {address?.city ?? state.city.name}{address?.district ?? ''}。
        </p>
      </main>

      <div className="action-bar checkout-bar">
        <div className="checkout-bar-price">
          <span>合计 <strong>{money(total)}</strong></span>
          {discount > 0 ? <em>已优惠 {money(discount)}</em> : <em>上门费已含</em>}
        </div>
        <button
          type="button"
          className="btn btn-primary checkout-submit"
          disabled={submitting}
          onClick={() => submitOrder()}
        >
          {submitting ? <Spinner size={16} light /> : null}
          提交订单
        </button>
      </div>

      <Sheet
        open={couponOpen}
        title="选择优惠券"
        subtitle={service ? `${service.name} · 当前订单 ${money(amount)}` : undefined}
        onClose={() => setCouponOpen(false)}
        footer={<button type="button" className="btn btn-ghost btn-block" onClick={() => setCouponOpen(false)}>取消</button>}
      >
        <div className="coupon-sheet-list">
          {couponsAvailable.length === 0 ? (
            <p className="muted-text">暂无可用优惠券</p>
          ) : (
            couponsAvailable.map((coupon) => {
              const applicable = couponApplicable(coupon, service.categoryId, amount);
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  selected={selectedCoupon?.id === coupon.id}
                  disabled={!applicable}
                  onSelect={() => {
                    setCouponChoice(coupon.id);
                    setCouponOpen(false);
                  }}
                />
              );
            })
          )}
          <button
            type="button"
            className={`no-coupon${selectedCoupon ? '' : ' is-selected'}`}
            onClick={() => {
              setCouponChoice('none');
              setCouponOpen(false);
            }}
          >
            不使用优惠券
            {selectedCoupon ? null : <Icon name="checkCircle" size={20} />}
          </button>
        </div>
      </Sheet>

      <Dialog
        open={loginOpen}
        title="登录后提交订单"
        description="使用微信登录后，可在「我的 - 订单」中查看服务进度、联系师傅与申请售后。"
        confirmText="微信一键登录"
        cancelText="再想想"
        onCancel={() => setLoginOpen(false)}
        onConfirm={handleLoginAndSubmit}
      />
    </div>
  );
}
