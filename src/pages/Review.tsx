import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Avatar, ServiceArt } from '../components/Brand';
import { Icon } from '../components/Icon';
import { EmptyState, RatingStars, Tag } from '../components/Bits';
import { PROVIDER_MAP, SERVICE_MAP, REVIEW_TAGS } from '../data/catalog';
import { appointmentText, formatDateTime } from '../lib/format';

const ratingLabels = ['', '很不满意', '不太满意', '一般', '满意', '非常满意'];

export default function Review() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state, submitReview, toast } = useApp();
  const order = state.orders.find((o) => o.id === orderId);
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!order) {
    return (
      <div className="page">
        <NavBar title="评价服务" />
        <EmptyState
          title="订单不存在"
          desc="请从订单列表进入评价"
          action={<Link to="/orders" className="btn btn-primary">查看订单</Link>}
        />
      </div>
    );
  }

  const existingReview = order.reviewId ? state.reviews.find((r) => r.id === order.reviewId) : null;
  const service = SERVICE_MAP[order.serviceId];
  const provider = order.providerId ? PROVIDER_MAP[order.providerId] : null;

  if (existingReview) {
    return (
      <div className="page">
        <NavBar title="我的评价" />
        <div className="review-done">
          <Icon name="checkCircle" size={44} />
          <h1>评价已完成</h1>
          <p>感谢你的反馈，5 元无门槛券已放入账户。</p>
          <div className="review-done-card">
            <div className="review-done-head">
              <Avatar seed={existingReview.avatar} size={38} />
              <div>
                <strong>{existingReview.anonymous ? '匿名用户' : existingReview.userName}</strong>
                <span>{formatDateTime(existingReview.createdAt)}</span>
              </div>
              <RatingStars value={existingReview.rating} size={13} />
            </div>
            <p>{existingReview.content || '这次没有填写文字评价'}</p>
            <div className="review-tags">
              {existingReview.tags.map((t) => <Tag key={t} tone="soft">{t}</Tag>)}
            </div>
          </div>
          <Link to={`/order/${order.id}`} className="btn btn-primary btn-block">返回订单</Link>
        </div>
      </div>
    );
  }

  if (order.status !== 'pending_review') {
    return (
      <div className="page">
        <NavBar title="评价服务" />
        <EmptyState
          title="当前订单暂不可评价"
          desc="服务完成后即可评价，如有疑问请联系客服"
          action={<Link to={`/order/${order.id}`} className="btn btn-primary">查看订单</Link>}
        />
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const submit = () => {
    if (!rating) {
      toast('请先给师傅评分', 'error');
      return;
    }
    setSubmitting(true);
    try {
      submitReview({
        orderId: order.id,
        rating,
        tags,
        content,
        anonymous,
      });
      navigate(`/order/${order.id}`, { replace: true });
    } catch {
      setSubmitting(false);
      toast('评价提交失败，请重试', 'error');
    }
  };

  return (
    <div className="page review-page">
      <NavBar title="评价服务" />
      <main className="review-main">
        <section className="review-hero">
          <span className="review-hero-art" style={{ background: service ? undefined : '#f7f8fa' }}>
            <ServiceArt kind={order.art} />
          </span>
          <div>
            <h1>{order.serviceName}</h1>
            <p>{appointmentText(order.date, order.slot)}</p>
            {provider ? (
              <span className="review-provider">
                <Avatar seed={provider.avatar} size={24} />
                {provider.name} 师傅 · {provider.title}
              </span>
            ) : null}
          </div>
        </section>

        <section className="review-card">
          <h2>这次服务怎么样？</h2>
          <p className="review-rating-label">{ratingLabels[rating]}</p>
          <div className="review-star-input" role="radiogroup" aria-label="服务评分">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} 星`}
                onClick={() => setRating(value)}
              >
                <Icon name="star" size={34} filled={value <= rating} strokeWidth={1.3} />
              </button>
            ))}
          </div>
          <div className="review-tag-select">
            {REVIEW_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`review-tag-btn${tags.includes(tag) ? ' is-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tags.includes(tag) ? <Icon name="check" size={12} strokeWidth={2.6} /> : null}
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="review-card">
          <div className="review-text-head">
            <h2>说说你的体验</h2>
            <span>{content.length}/200</span>
          </div>
          <textarea
            className="review-textarea"
            rows={5}
            maxLength={200}
            value={content}
            placeholder="师傅是否准时？清洗效果如何？你的真实评价能帮助更多家庭。"
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="review-upload">
            <button type="button" className="review-upload-btn" onClick={() => toast('演示环境未接入相册上传', 'info')}>
              <Icon name="camera" size={20} />
              <span>添加图片</span>
            </button>
            <span className="muted-text">选填 · 演示环境暂不支持上传</span>
          </div>
        </section>

        <section className="review-card review-anon-row">
          <div>
            <strong>匿名评价</strong>
            <span>开启后不会展示你的昵称与头像</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={anonymous}
            className={`switch${anonymous ? ' is-on' : ''}`}
            onClick={() => setAnonymous((v) => !v)}
          >
            <span />
          </button>
        </section>

        <div className="review-reward">
          <Icon name="gift" size={18} />
          <div>
            <strong>评价完成可得 5 元无门槛券</strong>
            <span>优惠券将在提交后自动放入你的账户，30 天内有效</span>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-block review-submit" onClick={submit} disabled={submitting}>
          {submitting ? '提交中…' : '提交评价'}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate(-1)}>
          稍后评价
        </button>
        <p className="review-disclaimer">评价内容会展示在服务详情与师傅主页（演示数据）</p>
      </main>
    </div>
  );
}
