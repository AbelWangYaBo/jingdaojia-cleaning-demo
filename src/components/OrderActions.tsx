import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store/AppStore';
import type { Order } from '../data/types';
import { PROVIDER_MAP, SLOTS } from '../data/catalog';
import { Avatar } from './Brand';
import { Icon } from './Icon';
import { Tag } from './Bits';
import { Sheet } from './Overlays';
import {
  appointmentText,
  defaultAppointment,
  estimateCancel,
  isSlotPast,
  money,
  upcomingDays,
} from '../lib/format';

const CANCEL_REASONS = ['时间冲突，暂时不需要', '想改约其他时间', '想更换服务项目', '价格超出预算', '下错地址或数量', '其他原因'];

export function CancelOrderSheet({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const { cancelOrder, toast } = useApp();
  const [reason, setReason] = useState('');
  const estimate = useMemo(() => estimateCancel(order), [order]);

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const confirm = () => {
    if (!reason) {
      toast('请选择取消原因', 'error');
      return;
    }
    const result = cancelOrder(order.id, reason);
    if (result.ok) onClose();
  };

  return (
    <Sheet
      open={open}
      title="取消订单"
      subtitle={`${order.serviceName} · ${appointmentText(order.date, order.slot)}`}
      onClose={onClose}
      footer={
        <div className="sheet-two-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>再想想</button>
          <button type="button" className="btn btn-danger" onClick={confirm} disabled={!estimate.cancellable}>
            确认取消
          </button>
        </div>
      }
    >
      <div className={`cancel-estimate${estimate.cancellable ? '' : ' is-blocked'}`}>
        <div className="cancel-estimate-head">
          <Icon name={estimate.cancellable ? 'info' : 'alert'} size={17} />
          <strong>{estimate.cancellable ? '取消与退款说明' : '该订单暂不支持直接取消'}</strong>
        </div>
        <p>{estimate.note}</p>
        {estimate.cancellable && order.status !== 'pending_payment' ? (
          <div className="cancel-estimate-nums">
            <div><span>订单金额</span><strong>{money(order.total)}</strong></div>
            <div><span>违约金</span><strong>{estimate.fee > 0 ? `-${money(estimate.fee)}` : '¥0'}</strong></div>
            <div className="cancel-refund"><span>预计退款</span><strong>{money(estimate.refund)}</strong></div>
          </div>
        ) : null}
      </div>

      <div className="cancel-reasons">
        <h3>请选择取消原因</h3>
        {CANCEL_REASONS.map((item) => (
          <button
            key={item}
            type="button"
            className={`reason-option${reason === item ? ' is-active' : ''}`}
            onClick={() => setReason(item)}
          >
            <span className="reason-radio">{reason === item ? <Icon name="check" size={11} strokeWidth={3} /> : null}</span>
            {item}
          </button>
        ))}
      </div>
      <p className="sheet-note">
        退款将原路退回，演示环境不产生真实退款。使用优惠券的订单取消后，优惠券会在有效期内退回。
      </p>
    </Sheet>
  );
}

export function RescheduleSheet({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const { rescheduleOrder, toast } = useApp();
  const days = useMemo(() => upcomingDays(7), []);
  const initial = defaultAppointment();
  const [date, setDate] = useState(order.date);
  const [slot, setSlot] = useState(order.slot);

  useEffect(() => {
    if (!open) return;
    if (isSlotPast(order.date, order.slot)) {
      setDate(initial.date);
      setSlot(initial.slot);
    } else {
      setDate(order.date);
      setSlot(order.slot);
    }
  }, [open, order.date, order.slot, initial.date, initial.slot]);

  const slotsAvailable = SLOTS.some((s) => !isSlotPast(date, s.label));

  return (
    <Sheet
      open={open}
      title="修改预约时间"
      subtitle="改期后师傅会重新确认上门时间"
      onClose={onClose}
      footer={
        <div className="sheet-two-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!date || !slot}
            onClick={() => {
              if (!date || !slot) {
                toast('请选择新的上门时间', 'error');
                return;
              }
              rescheduleOrder(order.id, date, slot);
              onClose();
            }}
          >
            确认改期
          </button>
        </div>
      }
    >
      <div className="reschedule-now">
        <Icon name="calendar" size={16} />
        当前预约：<strong>{appointmentText(order.date, order.slot)}</strong>
      </div>
      <div className="date-strip" role="tablist" aria-label="选择改期日期">
        {days.map((d) => {
          const disabled = !SLOTS.some((s) => !isSlotPast(d.key, s.label));
          return (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={date === d.key}
              disabled={disabled}
              className={`date-chip${date === d.key ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
              onClick={() => {
                setDate(d.key);
                const first = SLOTS.find((s) => !isSlotPast(d.key, s.label));
                if (first) setSlot(first.label);
              }}
            >
              <span className="date-label">{d.label}</span>
              <span className="date-sub">{d.sub}</span>
            </button>
          );
        })}
      </div>
      <div className="slot-grid">
        {SLOTS.map((s) => {
          const past = isSlotPast(date, s.label);
          return (
            <button
              key={s.label}
              type="button"
              disabled={past || !slotsAvailable}
              className={`slot-chip${slot === s.label ? ' is-active' : ''}${past ? ' is-disabled' : ''}`}
              onClick={() => setSlot(s.label)}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <p className="sheet-note">
        距离服务开始 4 小时以上可免费改期；不足 4 小时请先联系客服。演示环境每单可无限次改期。
      </p>
    </Sheet>
  );
}

export function ContactProviderSheet({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useApp();
  const provider = order.providerId ? PROVIDER_MAP[order.providerId] : null;
  return (
    <Sheet
      open={open}
      title="联系师傅"
      subtitle="服务期间请通过平台隐私号联系"
      onClose={onClose}
      footer={<button type="button" className="btn btn-primary btn-block" onClick={onClose}>我知道了</button>}
    >
      {provider ? (
        <>
          <div className="contact-sheet">
            <Avatar seed={provider.avatar} size={56} />
            <div>
              <strong>{provider.name} · {provider.title}</strong>
              <span>{provider.rating.toFixed(2)} 分 · 已服务 {provider.orders} 单</span>
              <div className="contact-sheet-tags">
                {provider.tags.slice(0, 2).map((t) => <Tag key={t} tone="mint">{t}</Tag>)}
              </div>
            </div>
          </div>
          <div className="contact-phone-row">
            <span>平台隐私号</span>
            <strong>400-800-1234 转 8231</strong>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                navigator.clipboard?.writeText('400-800-1234').then(
                  () => toast('号码已复制', 'success'),
                  () => toast('演示环境无法复制，请手动记录', 'info'),
                );
              }}
            >
              复制
            </button>
          </div>
          <p className="sheet-note">
            演示环境不会真实拨号。师傅接单后可通过平台隐私号联系，服务结束后号码自动失效。
          </p>
        </>
      ) : (
        <div className="contact-empty">
          <Icon name="sparkle" size={28} />
          <strong>师傅还在匹配中</strong>
          <p>平台正在通知附近师傅，接单后会通过消息通知你。</p>
        </div>
      )}
    </Sheet>
  );
}
