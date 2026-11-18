import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Bits';

export default function NotFound() {
  return (
    <div className="page">
      <div className="pad">
        <EmptyState
          title="页面走丢了"
          desc="这个页面不存在，返回首页继续预约清洗服务"
          action={<Link to="/" className="btn btn-primary">返回首页</Link>}
          variant="search"
        />
      </div>
    </div>
  );
}
