import { Button, Drawer, InputNumber, Segmented, Switch } from 'antd';
import type { DiscoverySetup } from './discoveryConfig';
import {
  calcDiscovery,
  DEFAULT_DISCOVERY_SETUP,
  DISCOVERY_ARCANE_MAX,
  DISCOVERY_BASE,
  FORTRESS_MAX_STACK,
  normalizeDiscoveryArcane,
  weaponCount,
  WEAPON_SLOT_LIMIT,
} from './discoveryConfig';
import CharacterAvatar from '../../../components/common/CharacterAvatar';
import CharacterStatLabel from '../../../components/common/CharacterStatLabel';
import AbilityIcon from '../../../components/common/AbilityIcon';
import { useNightfarerLevel15 } from '../../../features/nightfarers/useNightfarerLevel15';
import type { NightfarerName } from '../../../types';
import styles from './dropPoolView.module.css';

interface DiscoveryDrawerProps {
  open: boolean;
  onClose: () => void;
  setup: DiscoverySetup;
  onChange: (next: DiscoverySetup) => void;
}

/** 三个武器档位：取值时不能超过 6 把 */
const WEAPON_FIELDS: Array<{ key: 'weapon20' | 'weapon30' | 'weapon40'; label: string; value: number }> = [
  { key: 'weapon20', label: '+20', value: 20 },
  { key: 'weapon30', label: '+30', value: 30 },
  { key: 'weapon40', label: '+40', value: 40 },
];

const ARCANE_PRESET_ORDER: NightfarerName[] = [
  '追踪者',
  '守护者',
  '铁之眼',
  '女爵',
  '无赖',
  '隐士',
  '复仇者',
  '执行者',
  '学者',
  '送葬者',
];

const DiscoveryDrawer: React.FC<DiscoveryDrawerProps> = ({ open, onClose, setup, onChange }) => {
  const discovery = calcDiscovery(setup);
  const weapons = weaponCount(setup);
  const snapshots = useNightfarerLevel15(open);
  const presets = ARCANE_PRESET_ORDER.flatMap((name) => {
    const stats = snapshots?.get(name)?.stats;
    return stats ? [{ name, arcane: stats.感应 }] : [];
  });

  const update = (patch: Partial<DiscoverySetup>) => onChange({ ...setup, ...patch });

  const updateWeapon = (key: 'weapon20' | 'weapon30' | 'weapon40', next: number | null) => {
    const others = weapons - setup[key];
    const value = Math.max(0, Math.min(next ?? 0, WEAPON_SLOT_LIMIT - others));
    update({ [key]: value } as Partial<DiscoverySetup>);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="min(540px, 100vw)"
      // 与其它抽屉同因：避开左上角 fixed-logo（z-index 1050）
      zIndex={1100}
      title={
        <div className={styles.basePoolTitle}>
          <span className={styles.basePoolTitleMain}>观察力模拟</span>
          <span className={styles.basePoolTitleSub}>
            基础 {DISCOVERY_BASE} · 当前 {discovery}（×{(discovery / DISCOVERY_BASE).toFixed(2)}）
          </span>
        </div>
      }
      styles={{ body: { padding: '8px 16px 16px' } }}
    >
      <div className={styles.discList}>
        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <label className={styles.discLabel} htmlFor="discovery-arcane">
              <CharacterStatLabel stat="感应" />
            </label>
            <span className={styles.discNote} id="discovery-arcane-note">
              每点 +1 观察力 · 0～{DISCOVERY_ARCANE_MAX}
            </span>
          </div>
          <InputNumber
            id="discovery-arcane"
            aria-describedby="discovery-arcane-note"
            inputMode="numeric"
            size="small"
            min={0}
            max={DISCOVERY_ARCANE_MAX}
            precision={0}
            style={{ width: 64 }}
            value={setup.arcane}
            onChange={(value) => update({ arcane: normalizeDiscoveryArcane(value ?? 0) })}
          />
        </div>

        <div className={styles.discArcaneQuick}>
          <div className={styles.discArcaneQuickLabel}>快捷选择渡夜者默认感应</div>
          {presets.length === 0 && (
            <div className={styles.discNote}>{snapshots ? '暂无渡夜者感应数据' : '正在加载渡夜者感应…'}</div>
          )}
          <div className={styles.discArcaneAvatars}>
            {presets.map(({ name, arcane }) => (
              <button
                key={name}
                type="button"
                className={styles.discArcaneAvatar}
                title={`${name} · 感应 ${arcane}`}
                aria-label={`${name}，感应 ${arcane}`}
                onClick={() => update({ arcane })}
              >
                <CharacterAvatar
                  name={name}
                  size={28}
                  stacked
                  className={styles.discArcaneAvatarStack}
                  labelClassName={styles.discArcaneAvatarName}
                />
                <span className={styles.discArcaneAvatarValue}>{arcane}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>腌制白银鸟爪（遗物共享）</span>
            <span className={styles.discNote}>+20/层 · 最多 2 层（3 人队）</span>
          </div>
          <Segmented
            size="small"
            value={setup.fowlShare}
            onChange={(value) => update({ fowlShare: value as number })}
            options={[0, 1, 2]}
          />
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>腌制白银鸟爪</span>
            <span className={styles.discNote}>+30 · 持续 60 秒</span>
          </div>
          <Switch checked={setup.fowlItem} onChange={(checked) => update({ fowlItem: checked })} />
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>武器固有「提升观察力」</span>
            <span className={styles.discNote}>
              +20 / +30 / +40 自由组合 · 已选 {weapons}/{WEAPON_SLOT_LIMIT} 把
            </span>
          </div>
          <div className={styles.discWeapons}>
            {WEAPON_FIELDS.map((field) => (
              <label key={field.key} className={styles.discWeaponField}>
                <span>{field.label}</span>
                <InputNumber
                  size="small"
                  min={0}
                  max={WEAPON_SLOT_LIMIT}
                  style={{ width: 52 }}
                  value={setup[field.key]}
                  onChange={(value) => updateWeapon(field.key, value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>护符 银色粪金龟</span>
            <span className={styles.discNote}>+40 · 只能带一件</span>
          </div>
          <Switch checked={setup.silverScarab} onChange={(checked) => update({ silverScarab: checked })} />
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>护符 贪欲者的烙印</span>
            <span className={styles.discNote}>+40 · 与银色粪金龟是否叠加未实测，模拟按相加算</span>
          </div>
          <Switch checked={setup.greedEmblem} onChange={(checked) => update({ greedEmblem: checked })} />
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>
              <span className={styles.discLabelWithIcon}>
                <AbilityIcon character="铁之眼" kind="passive" size={16} />
                <span>铁之眼被动「观察入微」</span>
              </span>
            </span>
            <span className={styles.discNote}>+30/人 · 最多 3 人</span>
          </div>
          <Segmented
            size="small"
            value={setup.ironeye}
            onChange={(value) => update({ ironeye: value as number })}
            options={[0, 1, 2, 3]}
          />
        </div>

        <div className={styles.discRow}>
          <div className={styles.discInfo}>
            <span className={styles.discLabel}>小要塞遗物</span>
            <span className={styles.discNote}>
              +16/层 · 最多 {FORTRESS_MAX_STACK} 层（+{FORTRESS_MAX_STACK * 16}）
            </span>
          </div>
          <InputNumber
            size="small"
            min={0}
            max={FORTRESS_MAX_STACK}
            style={{ width: 64 }}
            value={setup.fortress}
            onChange={(value) => update({ fortress: value ?? 0 })}
          />
        </div>
      </div>

      <div className={styles.discTotal}>
        <span>模拟观察力</span>
        <b>{discovery}</b>
        <span className={styles.discTotalRate}>×{(discovery / DISCOVERY_BASE).toFixed(2)}</span>
      </div>

      <div className={styles.discFoot}>
        <div>
          带 👁 的槽位按 ×{discovery / DISCOVERY_BASE} 放大权重，其余槽位不变；卡片上会显示「原权重 → 换算后权重」。
        </div>
        <div>观察力 100 时与原权重一致。小要塞遗物解包只有 10 档（+160）。</div>
      </div>

      <Button autoInsertSpace={false} onClick={() => onChange(DEFAULT_DISCOVERY_SETUP)}>
        重置
      </Button>
    </Drawer>
  );
};

export default DiscoveryDrawer;
