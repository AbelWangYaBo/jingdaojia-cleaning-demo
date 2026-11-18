import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Address,
  AppState,
  Coupon,
  Draft,
  Notice,
  Order,
  Review,
  User,
} from '../data/types';
import type { AgreementKey } from '../data/agreements';
import { ORDER_STATUS_META, PROVIDER_MAP, SERVICE_MAP } from '../data/catalog';
import { createSeedState } from '../data/seed';
import {
  appointmentText,
  couponApplicable,
  defaultAppointment,
  estimateCancel,
  isValidPhone,
  makeOrderNo,
  maskPhone,
  nextOrderStatus,
  uid,
} from '../lib/format';

const STORAGE_KEY = 'jingdaojia_demo_state_v1';
const DEMO_PHONE = '13800138000';

export type ToastTone = 'success' | 'error' | 'info' | 'default';
export interface ToastItem {
  id: string;
  text: string;
  tone: ToastTone;
}

export interface CreateOrderInput {
  serviceId: string;
  optionId: string;
  qty: number;
  providerId: string | null;
  addressId: string;
  contactName: string;
  contactPhone: string;
  date: string;
  slot: string;
  couponId: string | null;
  remark: string;
}

interface AppContextValue {
  state: AppState;
  toasts: ToastItem[];
  toast: (text: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
  locationOpen: boolean;
  requestLocation: () => void;
  allowLocation: () => void;
  denyLocation: () => void;
  phoneAuthOpen: boolean;
  phoneAuthReason: string;
  openPhoneAuth: (reason?: string, onAllowed?: () => void) => void;
  allowPhoneAuth: () => void;
  denyPhoneAuth: () => void;
  agreementKey: AgreementKey | null;
  openAgreement: (key: AgreementKey) => void;
  closeAgreement: () => void;
  login: (input?: { name?: string; phone?: string }) => void;
  logout: () => void;
  bindPhone: (phone: string) => void;
  setCity: (name: string, code: string) => void;
  setAddress: (id: string) => void;
  addAddress: (input: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => string;
  updateAddress: (id: string, patch: Partial<Omit<Address, 'id'>>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  ensureDraft: (serviceId: string) => Draft | null;
  updateDraft: (patch: Partial<Draft>) => void;
  clearDraft: () => void;
  createOrder: (input: CreateOrderInput) => Order;
  acceptOrder: (orderId: string) => void;
  payOrder: (orderId: string, method: string) => void;
  cancelOrder: (orderId: string, reason: string) => { ok: boolean; message: string };
  rescheduleOrder: (orderId: string, date: string, slot: string) => void;
  advanceOrder: (orderId: string) => void;
  submitReview: (input: {
    orderId: string;
    rating: number;
    tags: string[];
    content: string;
    anonymous: boolean;
  }) => string;
  beginReorder: (order: Order) => void;
  toggleFavorite: (serviceId: string) => void;
  addRecentSearch: (keyword: string) => void;
  clearRecentSearches: () => void;
  markNoticesRead: () => void;
  markNoticeRead: (id: string) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const loadState = (): AppState => {
  if (typeof window === 'undefined') return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.orders)) return createSeedState();
    const seed = createSeedState();
    return {
      ...seed,
      ...parsed,
      city: { ...seed.city, ...(parsed.city ?? {}) },
      notices: Array.isArray(parsed.notices) ? parsed.notices : seed.notices,
    };
  } catch {
    return createSeedState();
  }
};

const firstAvailableAppointment = () => defaultAppointment();

const buildDraft = (state: AppState, serviceId: string): Draft | null => {
  const service = SERVICE_MAP[serviceId];
  if (!service) return null;
  const { date, slot } = firstAvailableAppointment();
  const address =
    state.addresses.find((a) => a.id === state.selectedAddressId) ??
    state.addresses.find((a) => a.isDefault) ??
    state.addresses[0] ??
    null;
  const option = service.options[0];
  return {
    serviceId,
    optionId: option.id,
    qty: service.minQty,
    providerId: null,
    addressId: address?.id ?? null,
    date,
    slot,
    couponId: null,
    remark: '',
    contactName: state.user?.name || address?.name || '',
    contactPhone: state.user?.phone || address?.phone || '',
    phoneVerified: Boolean(state.user?.phoneVerified),
  };
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [phoneAuthOpen, setPhoneAuthOpen] = useState(false);
  const [phoneAuthReason, setPhoneAuthReason] = useState('用于接收订单通知、师傅联系与售后服务');
  const [agreementKey, setAgreementKey] = useState<AgreementKey | null>(null);
  const phoneAuthCallback = useRef<(() => void) | null>(null);
  const autoAccepting = useRef<Set<string>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (text: string, tone: ToastTone = 'default') => {
      const id = uid('toast');
      setToasts([{ id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2400);
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* 忽略隐私模式下的存储失败 */
      }
    }, 100);
    return () => window.clearTimeout(timer);
  }, [state]);

  const login = useCallback(
    (input?: { name?: string; phone?: string }) => {
      const now = new Date().toISOString();
      setState((prev) => {
        const phone = input?.phone ?? prev.user?.phone ?? '';
        const user: User = {
          name: input?.name || prev.user?.name || '林小满',
          phone,
          avatar: 1,
          phoneVerified: Boolean(phone),
          memberLevel: prev.user?.memberLevel ?? 2,
          joinedAt: prev.user?.joinedAt ?? now,
        };
        return { ...prev, user };
      });
      toast('登录成功，欢迎回来', 'success');
    },
    [toast],
  );

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, user: null }));
    toast('已退出登录');
  }, [toast]);

  const bindPhone = useCallback(
    (phone: string) => {
      if (!isValidPhone(phone)) {
        toast('请输入正确的 11 位手机号', 'error');
        return;
      }
      setState((prev) => {
        const user: User = prev.user
          ? { ...prev.user, phone, phoneVerified: true }
          : {
              name: '林小满',
              phone,
              avatar: 1,
              phoneVerified: true,
              memberLevel: 2,
              joinedAt: new Date().toISOString(),
            };
        return { ...prev, user };
      });
      toast('手机号已绑定', 'success');
    },
    [toast],
  );

  const requestLocation = useCallback(() => setLocationOpen(true), []);

  const allowLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      city: { name: '深圳', code: 'sz', located: true },
      locationAsked: true,
    }));
    setLocationOpen(false);
    toast('已定位到 深圳市 · 南山区', 'success');
  }, [toast]);

  const denyLocation = useCallback(() => {
    setState((prev) => ({ ...prev, locationAsked: true }));
    setLocationOpen(false);
    toast('已保留当前城市，可在首页手动切换');
  }, [toast]);

  const openPhoneAuth = useCallback((reason?: string, onAllowed?: () => void) => {
    if (reason) setPhoneAuthReason(reason);
    phoneAuthCallback.current = onAllowed ?? null;
    setPhoneAuthOpen(true);
  }, []);

  const allowPhoneAuth = useCallback(() => {
    const cb = phoneAuthCallback.current;
    phoneAuthCallback.current = null;
    setPhoneAuthOpen(false);
    const targetPhone = stateRef.current.user?.phone || DEMO_PHONE;
    setState((prev) => {
      const user: User = prev.user
        ? { ...prev.user, phone: targetPhone, phoneVerified: true }
        : {
            name: '林小满',
            phone: targetPhone,
            avatar: 1,
            phoneVerified: true,
            memberLevel: 2,
            joinedAt: new Date().toISOString(),
          };
      return { ...prev, user };
    });
    toast(`已获取手机号 ${maskPhone(targetPhone)}`, 'success');
    window.setTimeout(() => cb?.(), 60);
  }, [toast]);

  const denyPhoneAuth = useCallback(() => {
    phoneAuthCallback.current = null;
    setPhoneAuthOpen(false);
    toast('已取消手机号授权');
  }, [toast]);

  const openAgreement = useCallback((key: AgreementKey) => setAgreementKey(key), []);
  const closeAgreement = useCallback(() => setAgreementKey(null), []);

  const setCity = useCallback(
    (name: string, code: string) => {
      setState((prev) => ({ ...prev, city: { name, code, located: false } }));
      toast(`已切换到 ${name}`);
    },
    [toast],
  );

  const setAddress = useCallback((id: string) => {
    setState((prev) => {
      const address = prev.addresses.find((a) => a.id === id);
      return {
        ...prev,
        selectedAddressId: id,
        draft: prev.draft
          ? {
              ...prev.draft,
              addressId: id,
              contactName: address?.name ?? prev.draft.contactName,
              contactPhone: address?.phone ?? prev.draft.contactPhone,
              phoneVerified: Boolean(
                address?.phone &&
                  prev.user?.phone === address.phone &&
                  prev.user.phoneVerified,
              ),
            }
          : prev.draft,
      };
    });
  }, []);

  const addAddress = useCallback(
    (input: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => {
      const id = uid('addr');
      setState((prev) => {
        const makeDefault = input.isDefault || prev.addresses.length === 0;
        const address: Address = {
          ...input,
          id,
          isDefault: makeDefault,
        };
        return {
          ...prev,
          addresses: [
            ...prev.addresses.map((a) => (makeDefault ? { ...a, isDefault: false } : a)),
            address,
          ],
          selectedAddressId: id,
          draft: prev.draft
            ? {
                ...prev.draft,
                addressId: id,
                contactName: address.name,
                contactPhone: address.phone,
                phoneVerified: Boolean(prev.user?.phone === address.phone && prev.user.phoneVerified),
              }
            : prev.draft,
        };
      });
      return id;
    },
    [],
  );

  const updateAddress = useCallback((id: string, patch: Partial<Omit<Address, 'id'>>) => {
    setState((prev) => {
      const makeDefault = patch.isDefault === true;
      const nextAddresses = prev.addresses.map((a) => {
        if (a.id === id) return { ...a, ...patch, id };
        return makeDefault ? { ...a, isDefault: false } : a;
      });
      const updated = nextAddresses.find((a) => a.id === id);
      return {
        ...prev,
        addresses: nextAddresses,
        draft:
          prev.draft && prev.draft.addressId === id && updated
            ? {
                ...prev.draft,
                contactName: updated.name,
                contactPhone: updated.phone,
                phoneVerified: Boolean(
                  prev.user?.phone === updated.phone && prev.user.phoneVerified,
                ),
              }
            : prev.draft,
      };
    });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setState((prev) => {
      const nextAddresses = prev.addresses.filter((a) => a.id !== id);
      if (nextAddresses.length > 0 && !nextAddresses.some((a) => a.isDefault)) {
        nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
      }
      const selectedAddressId =
        prev.selectedAddressId === id ? nextAddresses[0]?.id ?? null : prev.selectedAddressId;
      return {
        ...prev,
        addresses: nextAddresses,
        selectedAddressId,
        draft:
          prev.draft && prev.draft.addressId === id
            ? { ...prev.draft, addressId: nextAddresses[0]?.id ?? null }
            : prev.draft,
      };
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }));
  }, []);

  const ensureDraft = useCallback((serviceId: string) => {
    const prev = stateRef.current;
    if (prev.draft && prev.draft.serviceId === serviceId) return prev.draft;
    const draft = buildDraft(prev, serviceId);
    if (!draft) return null;
    setState((s) => ({ ...s, draft }));
    return draft;
  }, []);

  const updateDraft = useCallback((patch: Partial<Draft>) => {
    setState((prev) => (prev.draft ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  }, []);

  const clearDraft = useCallback(() => {
    setState((prev) => ({ ...prev, draft: null }));
  }, []);

  const createOrder = useCallback((input: CreateOrderInput): Order => {
    const prev = stateRef.current;
    const service = SERVICE_MAP[input.serviceId];
    if (!service) throw new Error('服务不存在');
    const option = service.options.find((o) => o.id === input.optionId) ?? service.options[0];
    const address = prev.addresses.find((a) => a.id === input.addressId);
    if (!address) throw new Error('请选择服务地址');
    const qty = Math.max(service.minQty, Math.floor(input.qty) || service.minQty);
    const amount = option.price * qty;
    const coupon = input.couponId
      ? prev.coupons.find((c) => c.id === input.couponId && couponApplicable(c, service.categoryId, amount))
      : null;
    const discount = coupon ? Math.min(coupon.amount, amount) : 0;
    const total = Math.max(0, amount - discount);
    const now = new Date().toISOString();
    const orderId = uid('ord');
    const order: Order = {
      id: orderId,
      no: makeOrderNo(),
      status: 'pending_payment',
      serviceId: service.id,
      serviceName: service.name,
      categoryId: service.categoryId,
      art: service.art,
      optionId: option.id,
      optionLabel: option.label,
      unitPrice: option.price,
      qty,
      unit: service.unit,
      amount,
      fee: 0,
      discount,
      total,
      address: { ...address },
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      date: input.date,
      slot: input.slot,
      providerId: null,
      preferredProviderId: input.providerId,
      couponId: coupon?.id ?? null,
      remark: input.remark.trim(),
      createdAt: now,
      timeline: [{ status: 'created', label: '订单已提交', time: now }],
    };
    const notice: Notice = {
      id: uid('nt'),
      type: 'order',
      title: '订单已创建，等待支付',
      body: `${service.name} · ${appointmentText(input.date, input.slot)}，请在 15 分钟内完成支付。`,
      time: now,
      read: false,
      orderId,
    };
    setState((s) => ({
      ...s,
      orders: [order, ...s.orders],
      coupons: coupon
        ? s.coupons.map((c) => (c.id === coupon.id ? { ...c, used: true, usedOrderId: orderId } : c))
        : s.coupons,
      notices: [notice, ...s.notices],
      draft: null,
    }));
    return order;
  }, []);

  const acceptOrder = useCallback(
    (orderId: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order || order.status !== 'pending_accept') return;
      const service = SERVICE_MAP[order.serviceId];
      const providerId =
        order.preferredProviderId || service?.providerIds[0] || order.providerId || 'p1';
      const provider = PROVIDER_MAP[providerId];
      if (!provider) return;
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'pending_service',
                providerId,
                timeline: [
                  ...o.timeline,
                  {
                    status: 'pending_service',
                    label: `${provider.name} 师傅已接单`,
                    time: now,
                    note: '师傅会按预约时间上门，请保持电话畅通',
                  },
                ],
              }
            : o,
        ),
        notices: [
          {
            id: uid('nt'),
            type: 'order',
            title: `${provider.name} 师傅已接单`,
            body: `你的${order.serviceName}订单已确认，预约时间 ${appointmentText(order.date, order.slot)}。`,
            time: now,
            read: false,
            orderId,
          },
          ...s.notices,
        ],
      }));
      toast(`${provider.name} 师傅已接单`, 'success');
    },
    [toast],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      const due = current.orders.find(
        (o) =>
          o.status === 'pending_accept' &&
          o.paidAt &&
          Date.now() - new Date(o.paidAt).getTime() >= 8000 &&
          !autoAccepting.current.has(o.id),
      );
      if (!due) return;
      autoAccepting.current.add(due.id);
      acceptOrder(due.id);
      window.setTimeout(() => autoAccepting.current.delete(due.id), 5000);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [acceptOrder]);

  const payOrder = useCallback(
    (orderId: string, method: string) => {
      const now = new Date().toISOString();
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order || order.status !== 'pending_payment') {
        toast('订单状态已变化，请刷新后重试', 'error');
        return;
      }
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'pending_accept',
                paidAt: now,
                paymentMethod: method,
                timeline: [
                  ...o.timeline,
                  { status: 'pending_accept', label: '支付成功，正在匹配师傅', time: now },
                ],
              }
            : o,
        ),
        notices: [
          {
            id: uid('nt'),
            type: 'order',
            title: '支付成功，正在匹配师傅',
            body: `已为你优先匹配附近师傅，预计 1 分钟内接单。`,
            time: now,
            read: false,
            orderId,
          },
          ...s.notices,
        ],
      }));
      toast('支付成功', 'success');
    },
    [toast],
  );

  const cancelOrder = useCallback(
    (orderId: string, reason: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return { ok: false, message: '订单不存在' };
      if (order.status === 'cancelled') return { ok: false, message: '订单已取消' };
      if (['in_service', 'pending_review', 'completed'].includes(order.status)) {
        return { ok: false, message: '服务已开始或已完成，请联系客服处理' };
      }
      const estimate = estimateCancel(order);
      if (!estimate.cancellable) return { ok: false, message: estimate.note };
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'cancelled',
                cancelReason: reason,
                refund: estimate.refund,
                timeline: [
                  ...o.timeline,
                  {
                    status: 'cancelled',
                    label: '订单已取消',
                    time: now,
                    note:
                      estimate.fee > 0
                        ? `违约金 ¥${estimate.fee}，退款 ¥${estimate.refund} 原路退回`
                        : order.status === 'pending_payment'
                          ? '未支付订单取消，无扣款'
                          : '全额退款，1-3 个工作日原路退回',
                  },
                ],
              }
            : o,
        ),
        coupons: order.couponId
          ? s.coupons.map((c) =>
              c.id === order.couponId ? { ...c, used: false, usedOrderId: undefined } : c,
            )
          : s.coupons,
        notices: [
          {
            id: uid('nt'),
            type: 'order',
            title: '订单已取消',
            body:
              estimate.refund > 0
                ? `退款 ¥${estimate.refund} 将原路退回，优惠券已退回账户。`
                : '订单已取消，未产生扣款。',
            time: now,
            read: false,
            orderId,
          },
          ...s.notices,
        ],
      }));
      toast(estimate.refund > 0 ? `订单已取消，退款 ¥${estimate.refund}` : '订单已取消', 'success');
      return { ok: true, message: estimate.note };
    },
    [toast],
  );

  const rescheduleOrder = useCallback(
    (orderId: string, date: string, slot: string) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                date,
                slot,
                timeline: [
                  ...o.timeline,
                  {
                    status: o.status,
                    label: '预约时间已修改',
                    time: now,
                    note: `新预约时间：${appointmentText(date, slot)}`,
                  },
                ],
              }
            : o,
        ),
        notices: [
          {
            id: uid('nt'),
            type: 'order',
            title: '预约时间已修改',
            body: `新的上门时间为 ${appointmentText(date, slot)}，师傅会再次与你确认。`,
            time: now,
            read: false,
            orderId,
          },
          ...s.notices,
        ],
      }));
      toast('预约时间已更新', 'success');
    },
    [toast],
  );

  const advanceOrder = useCallback(
    (orderId: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return;
      const next = nextOrderStatus(order.status);
      if (!next) {
        toast('当前状态无法推进', 'info');
        return;
      }
      const now = new Date().toISOString();
      const labelMap: Record<string, string> = {
        on_the_way: '师傅已出发',
        in_service: '师傅开始服务',
        pending_review: '服务已完成，待评价',
      };
      const meta = ORDER_STATUS_META[next];
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: next,
                completedAt: next === 'pending_review' ? now : o.completedAt,
                timeline: [
                  ...o.timeline,
                  { status: next, label: labelMap[next] ?? meta.label, time: now },
                ],
              }
            : o,
        ),
        notices:
          next === 'pending_review'
            ? [
                {
                  id: uid('nt'),
                  type: 'order',
                  title: '服务已完成，去评价一下吧',
                  body: '你的评价能帮助更多家庭选到好师傅。',
                  time: now,
                  read: false,
                  orderId,
                },
                ...s.notices,
              ]
            : s.notices,
      }));
      toast(`已推进：${meta.label}`, 'success');
    },
    [toast],
  );

  const submitReview = useCallback(
    (input: { orderId: string; rating: number; tags: string[]; content: string; anonymous: boolean }) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === input.orderId);
      if (!order) throw new Error('订单不存在');
      const reviewId = uid('rv');
      const now = new Date().toISOString();
      const review: Review = {
        id: reviewId,
        orderId: order.id,
        serviceId: order.serviceId,
        providerId: order.providerId ?? order.preferredProviderId ?? 'p1',
        userName: input.anonymous ? '匿名用户' : prev.user?.name || order.contactName || '净到家用户',
        avatar: prev.user?.avatar ?? 1,
        rating: input.rating,
        tags: input.tags,
        content: input.content.trim(),
        anonymous: input.anonymous,
        createdAt: now,
      };
      const reward: Coupon = {
        id: `cp_review_${order.id}`,
        title: '评价奖励券',
        amount: 5,
        threshold: 0,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        scope: null,
        used: false,
        note: '感谢你的评价，下次清洗可抵扣',
      };
      setState((s) => ({
        ...s,
        reviews: [review, ...s.reviews],
        orders: s.orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: 'completed',
                reviewId,
                completedAt: now,
                timeline: [
                  ...o.timeline,
                  { status: 'completed', label: '评价完成，订单已完成', time: now },
                ],
              }
            : o,
        ),
        coupons: s.coupons.some((c) => c.id === reward.id) ? s.coupons : [reward, ...s.coupons],
        notices: [
          {
            id: uid('nt'),
            type: 'order',
            title: '感谢你的评价',
            body: '5 元无门槛评价奖励券已放入账户，30 天内有效。',
            time: now,
            read: false,
            orderId: order.id,
          },
          ...s.notices,
        ],
      }));
      toast('评价已提交，5 元券已到账', 'success');
      return reviewId;
    },
    [toast],
  );

  const beginReorder = useCallback((order: Order) => {
    const service = SERVICE_MAP[order.serviceId];
    if (!service) return;
    const appt = firstAvailableAppointment();
    const address =
      stateRef.current.addresses.find((a) => a.id === order.address.id) ??
      stateRef.current.addresses.find((a) => a.isDefault) ??
      stateRef.current.addresses[0] ??
      null;
    const draft: Draft = {
      serviceId: order.serviceId,
      optionId: order.optionId,
      qty: order.qty,
      providerId: order.providerId,
      addressId: address?.id ?? null,
      date: appt.date,
      slot: appt.slot,
      couponId: null,
      remark: '',
      contactName: order.contactName,
      contactPhone: order.contactPhone,
      phoneVerified: Boolean(
        stateRef.current.user?.phone &&
          stateRef.current.user.phone === order.contactPhone &&
          stateRef.current.user.phoneVerified,
      ),
    };
    setState((prev) => ({ ...prev, draft }));
  }, []);

  const toggleFavorite = useCallback(
    (serviceId: string) => {
      const exists = stateRef.current.favorites.includes(serviceId);
      setState((prev) => ({
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== serviceId)
          : [serviceId, ...prev.favorites],
      }));
      toast(exists ? '已取消收藏' : '已加入收藏', exists ? 'default' : 'success');
    },
    [toast],
  );

  const addRecentSearch = useCallback((keyword: string) => {
    const k = keyword.trim();
    if (!k) return;
    setState((prev) => ({
      ...prev,
      recentSearches: [k, ...prev.recentSearches.filter((x) => x !== k)].slice(0, 6),
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState((prev) => ({ ...prev, recentSearches: [] }));
  }, []);

  const markNoticesRead = useCallback(() => {
    setState((prev) => ({ ...prev, notices: prev.notices.map((n) => ({ ...n, read: true })) }));
  }, []);

  const markNoticeRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(createSeedState());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast('演示数据已重置', 'success');
  }, [toast]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      toasts,
      toast,
      dismissToast,
      locationOpen,
      requestLocation,
      allowLocation,
      denyLocation,
      phoneAuthOpen,
      phoneAuthReason,
      openPhoneAuth,
      allowPhoneAuth,
      denyPhoneAuth,
      agreementKey,
      openAgreement,
      closeAgreement,
      login,
      logout,
      bindPhone,
      setCity,
      setAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      ensureDraft,
      updateDraft,
      clearDraft,
      createOrder,
      acceptOrder,
      payOrder,
      cancelOrder,
      rescheduleOrder,
      advanceOrder,
      submitReview,
      beginReorder,
      toggleFavorite,
      addRecentSearch,
      clearRecentSearches,
      markNoticesRead,
      markNoticeRead,
      resetDemo,
    }),
    [
      state,
      toasts,
      toast,
      dismissToast,
      locationOpen,
      requestLocation,
      allowLocation,
      denyLocation,
      phoneAuthOpen,
      phoneAuthReason,
      openPhoneAuth,
      allowPhoneAuth,
      denyPhoneAuth,
      agreementKey,
      openAgreement,
      closeAgreement,
      login,
      logout,
      bindPhone,
      setCity,
      setAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      ensureDraft,
      updateDraft,
      clearDraft,
      createOrder,
      acceptOrder,
      payOrder,
      cancelOrder,
      rescheduleOrder,
      advanceOrder,
      submitReview,
      beginReorder,
      toggleFavorite,
      addRecentSearch,
      clearRecentSearches,
      markNoticesRead,
      markNoticeRead,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export const DEMO_USER_PHONE = DEMO_PHONE;
