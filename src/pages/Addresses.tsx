import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Icon } from '../components/Icon';
import { EmptyState, Tag } from '../components/Bits';
import { Dialog } from '../components/Overlays';
import { prettyPhone } from '../lib/format';

export default function Addresses() {
  const { state, setAddress, setDefaultAddress, deleteAddress, toast } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectMode = params.get('select') === '1';
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setAddress(id);
    toast('服务地址已更新', 'success');
    if (location.key !== 'default') navigate(-1);
    else navigate('/checkout');
  };

  const addPath = selectMode ? '/address-edit?from=checkout' : '/address-edit?from=addresses';

  return (
    <div className="page addresses-page">
      <NavBar
        title={selectMode ? '选择服务地址' : '地址管理'}
        right={
          <button type="button" className="icon-btn" aria-label="新增地址" onClick={() => navigate(addPath)}>
            <Icon name="plus" size={21} />
          </button>
        }
      />
      <main className="addresses-main">
        {selectMode ? (
          <div className="address-select-tip">
            <Icon name="info" size={14} />
            选择后将返回确认订单，可随时更换地址
          </div>
        ) : null}

        {state.addresses.length === 0 ? (
          <EmptyState
            title="还没有服务地址"
            desc="添加常用地址，下单时可直接选择"
            action={<button type="button" className="btn btn-primary" onClick={() => navigate(addPath)}>新增地址</button>}
          />
        ) : (
          <div className="address-list">
            {state.addresses.map((address) => {
              const selected = selectMode && state.selectedAddressId === address.id;
              return (
                <article key={address.id} className={`address-card${selected ? ' is-selected' : ''}`}>
                  <button
                    type="button"
                    className="address-card-main"
                    onClick={() => (selectMode ? handleSelect(address.id) : navigate(`/address-edit/${address.id}?from=addresses`))}
                  >
                    <span className="address-card-top">
                      <Tag tone={address.isDefault ? 'red' : 'soft'}>{address.tag}</Tag>
                      <strong>{address.name}</strong>
                      <span className="address-phone">{prettyPhone(address.phone)}</span>
                      {address.isDefault ? <em className="address-default">默认</em> : null}
                      {selected ? <span className="address-check"><Icon name="checkCircle" size={21} /></span> : null}
                    </span>
                    <span className="address-detail">
                      {address.city} {address.district} {address.detail}
                    </span>
                    <span className="address-city-note">
                      <Icon name="pin" size={12} /> {address.city} · 上门服务
                    </span>
                  </button>
                  <div className="address-card-actions">
                    {address.isDefault ? (
                      <span className="address-action-muted"><Icon name="check" size={12} /> 默认地址</span>
                    ) : (
                      <button type="button" onClick={() => { setDefaultAddress(address.id); toast('已设为默认地址', 'success'); }}>
                        设为默认
                      </button>
                    )}
                    <button type="button" onClick={() => navigate(`/address-edit/${address.id}?from=addresses`)}>编辑</button>
                    <button type="button" className="is-danger" onClick={() => setDeleteId(address.id)}>删除</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="address-tip-card">
          <h3><Icon name="shieldCheck" size={15} /> 地址与隐私</h3>
          <p>地址仅用于师傅上门服务，师傅只能看到服务所需的联系人、手机号与门牌信息。你可以随时修改或删除地址。</p>
          <p>如小区需要门禁登记，请在备注中说明，师傅会提前联系你。</p>
        </section>
      </main>

      <div className="action-bar address-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(addPath)}>
          <Icon name="plus" size={17} /> 新增服务地址
        </button>
      </div>

      <Dialog
        open={Boolean(deleteId)}
        title="删除这个地址？"
        description="删除后，历史订单中的地址记录仍会保留，但下单时将无法再选择该地址。"
        confirmText="删除"
        cancelText="取消"
        tone="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteAddress(deleteId);
            toast('地址已删除');
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
