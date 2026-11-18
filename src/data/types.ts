export type CategoryId = 'sofa' | 'curtain' | 'carpet' | 'mattress' | 'ac';

export type ServiceArtKind = 'sofa' | 'curtain' | 'carpet' | 'mattress' | 'ac';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  fromPrice: number;
  art: ServiceArtKind;
  accent: string;
  soft: string;
}

export interface ServiceOption {
  id: string;
  label: string;
  price: number;
  originalPrice: number;
  hint?: string;
}

export interface ServiceStep {
  title: string;
  desc: string;
}

export interface Service {
  id: string;
  categoryId: CategoryId;
  name: string;
  subtitle: string;
  optionLabel: string;
  options: ServiceOption[];
  unit: string;
  minQty: number;
  duration: string;
  sales: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  art: ServiceArtKind;
  badge?: string;
  includes: string[];
  process: ServiceStep[];
  notices: string[];
  providerIds: string[];
  faqs?: { q: string; a: string }[];
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  avatar: number;
  rating: number;
  orders: number;
  goodRate: number;
  distance: string;
  years: number;
  tags: string[];
  certs: string[];
  intro: string;
  available: string[];
  response: string;
}

export type AddressTag = '家' | '公司' | '父母家' | '其他';

export interface Address {
  id: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  detail: string;
  tag: AddressTag;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  title: string;
  amount: number;
  threshold: number;
  expiresAt: string;
  scope: CategoryId[] | null;
  used: boolean;
  usedOrderId?: string;
  note: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_accept'
  | 'pending_service'
  | 'on_the_way'
  | 'in_service'
  | 'pending_review'
  | 'completed'
  | 'cancelled';

export interface TimelineItem {
  status: OrderStatus | 'created';
  label: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  no: string;
  status: OrderStatus;
  serviceId: string;
  serviceName: string;
  categoryId: CategoryId;
  art: ServiceArtKind;
  optionId: string;
  optionLabel: string;
  unitPrice: number;
  qty: number;
  unit: string;
  amount: number;
  fee: number;
  discount: number;
  total: number;
  address: Address;
  contactName: string;
  contactPhone: string;
  date: string;
  slot: string;
  providerId: string | null;
  preferredProviderId: string | null;
  couponId: string | null;
  remark: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  paymentMethod?: string;
  reviewId?: string;
  cancelReason?: string;
  refund?: number;
  timeline: TimelineItem[];
}

export interface Review {
  id: string;
  orderId: string;
  serviceId: string;
  providerId: string;
  userName: string;
  avatar: number;
  rating: number;
  tags: string[];
  content: string;
  anonymous: boolean;
  createdAt: string;
}

export type NoticeType = 'order' | 'system' | 'promo';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  orderId?: string;
}

export interface User {
  name: string;
  phone: string;
  avatar: number;
  phoneVerified: boolean;
  memberLevel: number;
  joinedAt: string;
}

export interface Draft {
  serviceId: string;
  optionId: string;
  qty: number;
  providerId: string | null;
  addressId: string | null;
  date: string;
  slot: string;
  couponId: string | null;
  remark: string;
  contactName: string;
  contactPhone: string;
  phoneVerified: boolean;
}

export interface CityInfo {
  name: string;
  code: string;
  pinyin: string;
  letter: string;
  hot?: boolean;
}

export interface CityState {
  name: string;
  code: string;
  located: boolean;
}

export interface AppState {
  version: number;
  user: User | null;
  city: CityState;
  addresses: Address[];
  selectedAddressId: string | null;
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  favorites: string[];
  notices: Notice[];
  recentSearches: string[];
  draft: Draft | null;
  locationAsked: boolean;
}
