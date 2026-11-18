import type { CategoryId, Coupon, Order, OrderStatus } from '../data/types';
import { SERVICE_MAP } from '../data/catalog';

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const money = (n: number) => {
  const rounded = Math.round(n * 100) / 100;
  return `¥${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
};

export const compactNumber = (n: number) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万`;
  return String(n);
};

export const maskPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
};

export const maskName = (name: string) => {
  if (!name) return '';
  if (name.length <= 1) return `${name}*`;
  return `${name.slice(0, 1)}${'*'.repeat(Math.min(2, name.length - 1))}`;
};

export const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(0, 11);

export const prettyPhone = (phone: string) => {
  const p = normalizePhone(phone);
  if (p.length !== 11) return p;
  return `${p.slice(0, 3)} ${p.slice(3, 7)} ${p.slice(7)}`;
};

export const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export interface DayCell {
  key: string;
  date: Date;
  day: number;
  month: number;
  weekday: string;
  label: string;
  sub: string;
  isToday: boolean;
}

export const upcomingDays = (count = 7): DayCell[] => {
  const now = new Date();
  const out: DayCell[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const diff = i;
    const label = diff === 0 ? '今天' : diff === 1 ? '明天' : diff === 2 ? '后天' : `周${WEEKDAYS[d.getDay()].slice(1)}`;
    out.push({
      key: dateKey(d),
      date: d,
      day: d.getDate(),
      month: d.getMonth() + 1,
      weekday: WEEKDAYS[d.getDay()],
      label,
      sub: diff <= 2 ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getMonth() + 1}/${d.getDate()}`,
      isToday: diff === 0,
    });
  }
  return out;
};

export const longDate = (key: string) => {
  const d = parseDateKey(key);
  const diff = dayDiff(d, new Date());
  const prefix = diff === 0 ? '今天' : diff === 1 ? '明天' : diff === 2 ? '后天' : '';
  return `${prefix ? `${prefix} · ` : ''}${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
};

export const slotStart = (key: string, slot: string) => {
  const d = parseDateKey(key);
  const hour = Number(slot.slice(0, 2));
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0);
};

export const isSlotPast = (key: string, slot: string, now = new Date()) =>
  slotStart(key, slot).getTime() <= now.getTime() + 60 * 60 * 1000;

export const appointmentText = (key: string, slot: string) => `${longDate(key)} ${slot}`;

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const formatFullDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const relativeTime = (iso: string) => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (dayDiff(nowDate(now), d) === 0) return `今天 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (dayDiff(nowDate(now), d) === 1) return `昨天 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return formatDateTime(iso);
};

const nowDate = (ms: number) => new Date(ms);

export const isToday = (key: string) => key === dateKey(new Date());

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const makeOrderNo = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `JD${ymd}${seq}`;
};

export const orderTabs: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: 'all', label: '全部', statuses: [] },
  { key: 'pending_payment', label: '待付款', statuses: ['pending_payment'] },
  { key: 'to_serve', label: '待服务', statuses: ['pending_accept', 'pending_service', 'on_the_way'] },
  { key: 'in_service', label: '服务中', statuses: ['in_service'] },
  { key: 'pending_review', label: '待评价', statuses: ['pending_review'] },
];

export const orderMatchesTab = (order: Order, tab: string) => {
  const t = orderTabs.find((x) => x.key === tab);
  if (!t || t.key === 'all') return true;
  return t.statuses.includes(order.status);
};

export const couponScopeText = (coupon: Coupon) => {
  if (!coupon.scope || coupon.scope.length === 0) return '全部清洗服务可用';
  const names: Record<CategoryId, string> = {
    sofa: '沙发清洗',
    curtain: '窗帘清洗',
    carpet: '地毯清洗',
    mattress: '床垫清洗',
    ac: '空调清洗',
  };
  return `${coupon.scope.map((s) => names[s]).join('、')}可用`;
};

export const couponApplicable = (coupon: Coupon, categoryId: CategoryId, amount: number) => {
  if (coupon.used) return false;
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return false;
  if (coupon.scope && !coupon.scope.includes(categoryId)) return false;
  if (amount < coupon.threshold) return false;
  return true;
};

export const bestCouponFor = (coupons: Coupon[], categoryId: CategoryId, amount: number) =>
  coupons
    .filter((c) => couponApplicable(c, categoryId, amount))
    .sort((a, b) => b.amount - a.amount)[0] ?? null;

export interface CancelEstimate {
  fee: number;
  refund: number;
  note: string;
  cancellable: boolean;
}

export const estimateCancel = (order: Order): CancelEstimate => {
  if (order.status === 'pending_payment') {
    return { fee: 0, refund: 0, note: '待付款订单可直接取消，不产生费用。', cancellable: true };
  }
  if (['in_service', 'pending_review', 'completed', 'cancelled'].includes(order.status)) {
    return {
      fee: 0,
      refund: 0,
      note: '服务已开始或已完成，无法直接取消，请联系客服处理。',
      cancellable: false,
    };
  }
  const start = slotStart(order.date, order.slot).getTime();
  const hours = (start - Date.now()) / 3600_000;
  if (order.status === 'on_the_way') {
    const fee = Math.min(80, Math.round(order.total * 0.3));
    return {
      fee,
      refund: Math.max(0, order.total - fee),
      note: '师傅已出发，取消将收取订单金额 30% 的违约金（最高 ¥80）。',
      cancellable: true,
    };
  }
  if (hours >= 4) {
    return {
      fee: 0,
      refund: order.total,
      note: '距服务开始超过 4 小时，可免费取消并全额退款，优惠券将退回。',
      cancellable: true,
    };
  }
  if (hours > 0) {
    const fee = Math.min(50, Math.round(order.total * 0.2));
    return {
      fee,
      refund: Math.max(0, order.total - fee),
      note: '距服务开始不足 4 小时，将收取订单金额 20% 的违约金（最高 ¥50）。',
      cancellable: true,
    };
  }
  return {
    fee: Math.min(50, Math.round(order.total * 0.2)),
    refund: Math.max(0, order.total - Math.min(50, Math.round(order.total * 0.2))),
    note: '已过预约开始时间，请联系客服协商取消。',
    cancellable: true,
  };
};

export const nextOrderStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case 'pending_service':
      return 'on_the_way';
    case 'on_the_way':
      return 'in_service';
    case 'in_service':
      return 'pending_review';
    default:
      return null;
  }
};

export const orderServiceOf = (order: Order) => SERVICE_MAP[order.serviceId];

export const fakeCall = (name: string, phone: string) => {
  // 演示环境不真正拨号，保留出口方便接入 tel: 链接
  return { name, phone };
};

export const defaultAppointment = (days = 7): { date: string; slot: string } => {
  const cells = upcomingDays(days);
  for (const cell of cells) {
    for (const s of ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '18:00-20:00']) {
      if (!isSlotPast(cell.key, s)) return { date: cell.key, slot: s };
    }
  }
  return { date: cells[1]?.key ?? cells[0].key, slot: '10:00-12:00' };
};


export const nextProviderSlot = (available: string[], now = new Date()) => {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const slot of available) {
    if (slot.startsWith('今天')) {
      const hm = slot.replace('今天', '').trim();
      const [hour, minute] = hm.split(':').map(Number);
      if (Number.isFinite(hour) && hour * 60 + (minute || 0) > nowMinutes + 60) return slot;
      continue;
    }
    return slot;
  }
  return '明天 08:00';
};

export const availableProviderSlots = (available: string[], now = new Date()) => {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const filtered = available.filter((slot) => {
    if (!slot.startsWith('今天')) return true;
    const [hour, minute] = slot.replace('今天', '').trim().split(':').map(Number);
    return Number.isFinite(hour) && hour * 60 + (minute || 0) > nowMinutes + 60;
  });
  return filtered.length ? filtered : ['明天 08:00', '明天 10:00'];
};
