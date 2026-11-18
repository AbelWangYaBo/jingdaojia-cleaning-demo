import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { NavBar } from '../components/Layout';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/Overlays';
import { CitySelector } from '../components/CitySelector';
import { CITY_DISTRICTS, DISTRICTS_FALLBACK } from '../data/catalog';
import type { AddressTag } from '../data/types';
import { isValidPhone, prettyPhone } from '../lib/format';

const TAGS: AddressTag[] = ['家', '公司', '父母家', '其他'];

interface Errors {
  name?: string;
  phone?: string;
  district?: string;
  detail?: string;
}

export default function AddressEdit() {
  const { addressId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, addAddress, updateAddress, toast } = useApp();
  const existing = addressId ? state.addresses.find((a) => a.id === addressId) : undefined;
  const from = params.get('from') ?? 'addresses';

  const defaultCity = existing?.city ?? state.city.name;
  const [name, setName] = useState(existing?.name ?? state.user?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? state.user?.phone ?? '');
  const [city, setCity] = useState(defaultCity);
  const [district, setDistrict] = useState(
    existing?.district ?? (CITY_DISTRICTS[defaultCity] ?? DISTRICTS_FALLBACK)[0],
  );
  const [detail, setDetail] = useState(existing?.detail ?? '');
  const [tag, setTag] = useState<AddressTag>(existing?.tag ?? '家');
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? state.addresses.length === 0);
  const [cityOpen, setCityOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const districts = useMemo(() => CITY_DISTRICTS[city] ?? DISTRICTS_FALLBACK, [city]);
  const editing = Boolean(existing);

  if (addressId && !existing) {
    return (
      <div className="page">
        <NavBar title="编辑地址" />
        <div className="pad center-block">
          <h2>地址不存在</h2>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/addresses')}>返回地址列表</button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = '请填写联系人姓名';
    if (!isValidPhone(phone)) next.phone = '请输入正确的 11 位手机号';
    if (!district) next.district = '请选择所在区域';
    if (detail.trim().length < 3) next.detail = '请填写详细地址，至少 3 个字';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) {
      toast('请完善地址信息', 'error');
      return;
    }
    const payload = {
      name: name.trim(),
      phone,
      city,
      district,
      detail: detail.trim(),
      tag,
      isDefault,
    };
    if (editing && existing) {
      updateAddress(existing.id, payload);
      toast('地址已更新', 'success');
    } else {
      addAddress(payload);
      toast('地址已保存', 'success');
    }
    if (from === 'checkout') {
      navigate('/checkout', { replace: true });
    } else if (from === 'detail') {
      // 服务详情 → 地址列表 → 新增地址；保存后直接回到服务详情
      navigate(-2);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/addresses', { replace: true });
    }
  };

  const fillCurrentCity = () => {
    if (!state.city.located) {
      toast('可先在首页开启定位，或直接选择城市', 'info');
    }
    setCity(state.city.name);
    const first = (CITY_DISTRICTS[state.city.name] ?? DISTRICTS_FALLBACK)[0];
    setDistrict(first);
    toast(`已使用当前城市：${state.city.name}`, 'success');
  };

  return (
    <div className="page address-edit-page">
      <NavBar title={editing ? '编辑地址' : '新增地址'} />
      <main className="address-edit-main">
        <section className="address-form-card">
          <div className="form-field">
            <label htmlFor="addr-name">联系人</label>
            <input
              id="addr-name"
              value={name}
              maxLength={12}
              placeholder="请填写联系人姓名"
              onChange={(e) => {
                setName(e.target.value);
                setErrors((err) => ({ ...err, name: undefined }));
              }}
            />
          </div>
          {errors.name ? <p className="form-error">{errors.name}</p> : null}

          <div className="form-field">
            <label htmlFor="addr-phone">手机号</label>
            <input
              id="addr-phone"
              value={prettyPhone(phone)}
              inputMode="tel"
              maxLength={13}
              placeholder="师傅联系你的号码"
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                setErrors((err) => ({ ...err, phone: undefined }));
              }}
            />
          </div>
          {errors.phone ? <p className="form-error">{errors.phone}</p> : null}

          <div className="form-field form-field-button">
            <label>所在城市</label>
            <button type="button" className="form-select" onClick={() => setCityOpen(true)}>
              <span>{city}</span>
              <span className="form-select-right">
                <em>已开通</em>
                <Icon name="chevronRight" size={16} />
              </span>
            </button>
          </div>
          <button type="button" className="use-location" onClick={fillCurrentCity}>
            <Icon name="navigation" size={13} /> 使用当前定位城市
          </button>

          <div className="form-field form-field-button">
            <label>所在区域</label>
            <button type="button" className="form-select" onClick={() => setDistrictOpen(true)}>
              <span>{district}</span>
              <Icon name="chevronRight" size={16} />
            </button>
          </div>
          {errors.district ? <p className="form-error">{errors.district}</p> : null}

          <div className="form-field form-field-textarea">
            <label htmlFor="addr-detail">详细地址</label>
            <textarea
              id="addr-detail"
              rows={3}
              maxLength={60}
              value={detail}
              placeholder="小区 / 写字楼、楼栋、单元、门牌号"
              onChange={(e) => {
                setDetail(e.target.value);
                setErrors((err) => ({ ...err, detail: undefined }));
              }}
            />
            <span className="form-counter">{detail.length}/60</span>
          </div>
          {errors.detail ? <p className="form-error">{errors.detail}</p> : null}

          <div className="form-field">
            <label>地址标签</label>
            <div className="address-tag-row">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`address-tag${tag === t ? ' is-active' : ''}`}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="address-default-row">
            <div>
              <strong>设为默认地址</strong>
              <span>下单时优先使用该地址</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDefault}
              className={`switch${isDefault ? ' is-on' : ''}`}
              onClick={() => {
                if (editing && existing?.isDefault && isDefault) {
                  toast('如需取消默认，请将其他地址设为默认', 'info');
                  return;
                }
                setIsDefault((v) => !v);
              }}
            >
              <span />
            </button>
          </div>
        </section>

        <div className="address-privacy-note">
          <Icon name="lock" size={14} />
          地址信息仅用于本次上门服务，师傅只能看到服务所需的联系人与门牌信息。
        </div>
      </main>

      <div className="action-bar address-edit-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={save}>
          {from === 'addresses' ? '保存地址' : '保存并使用此地址'}
        </button>
      </div>

      <Sheet open={cityOpen} title="选择城市" onClose={() => setCityOpen(false)} full>
        <CitySelector
          compact
          current={city}
          onSelect={(nameValue) => {
            setCity(nameValue);
            const nextDistricts = CITY_DISTRICTS[nameValue] ?? DISTRICTS_FALLBACK;
            setDistrict(nextDistricts[0]);
            setCityOpen(false);
          }}
        />
      </Sheet>

      <Sheet open={districtOpen} title={`选择区域 · ${city}`} onClose={() => setDistrictOpen(false)}>
        <div className="district-grid">
          {districts.map((d) => (
            <button
              key={d}
              type="button"
              className={`district-item${district === d ? ' is-active' : ''}`}
              onClick={() => {
                setDistrict(d);
                setDistrictOpen(false);
                setErrors((err) => ({ ...err, district: undefined }));
              }}
            >
              {d}
              {district === d ? <Icon name="check" size={13} /> : null}
            </button>
          ))}
        </div>
        <p className="sheet-note">演示环境仅展示主要城区，实际服务范围以下单时评估为准。</p>
      </Sheet>
    </div>
  );
}
