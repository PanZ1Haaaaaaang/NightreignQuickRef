import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Drawer, Modal, Segmented, Select, Statistic, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { ExperimentOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import CharacterAvatar from '../components/common/CharacterAvatar';
import scalingJson from '../data/zh-CN/weapon_scaling_data.json';
import uniqueWeaponArts from '../data/zh-CN/unique_weapon_arts.json';
import weaponArtCategoryHints from '../data/zh-CN/weapon_art_category_hints.json';
import teardropJson from '../data/zh-CN/teardrop_conversion.json';
import lipulaStatsJson from '../data/zh-CN/lipula_trade_stats.json';
import type { TeardropAffix, TeardropConversionData, TeardropLipulaOption } from '../types';
import { getCurrentTheme } from '../utils/themeUtils';
import type { WeaponScalingCurve, WeaponScalingDamageType, WeaponScalingData, WeaponScalingRow } from '../types';
import styles from '../styles/weaponScalingView.module.css';

const DATA = scalingJson as unknown as WeaponScalingData;

const STAT_KEYS = ['力气', '敏捷', '智力', '信仰', '感应'] as const;
const STAT_LABELS = ['力量', '灵巧', '智力', '信仰', '感应'] as const;
const SCALING_STATS = ['str', 'dex', 'int', 'faith', 'arc'] as const;
const CURVE_LABELS: Record<WeaponScalingCurve, string> = { physical: '0 号曲线', elemental: '4 号曲线' };
const STATUS_AFFINITY_BASE_SCALE = 0.8;
const DAMAGE_LABELS: Record<WeaponScalingDamageType, string> = {
  physical: '物理',
  magic: '魔力',
  fire: '火焰',
  lightning: '雷电',
  holy: '神圣',
};

interface ScalingPart {
  damage?: WeaponScalingDamageType;
  share: number;
  curve: WeaponScalingCurve;
  weights: number[];
}

interface CalcRow {
  key: string;
  damage?: WeaponScalingDamageType;
  attr: string;
  stat: number;
  weight: number;
  growth: number;
  coefficient: number;
  contribution: number;
}

const calcColumns: TableColumnsType<CalcRow> = [
  { title: '属性', dataIndex: 'attr', key: 'attr', width: 90 },
  { title: '角色属性', dataIndex: 'stat', key: 'stat', width: 90, align: 'center' },
  {
    title: '补正权重',
    dataIndex: 'weight',
    key: 'weight',
    width: 90,
    align: 'center',
    render: (value: number) => `${value}%`,
  },
  {
    title: '曲线值',
    dataIndex: 'growth',
    key: 'growth',
    width: 90,
    align: 'right',
    render: (value: number) => `${value.toFixed(2)}%`,
  },
  {
    title: '系数',
    dataIndex: 'coefficient',
    key: 'coefficient',
    width: 90,
    align: 'right',
    render: (value: number) => value.toFixed(4),
  },
  {
    title: '贡献',
    dataIndex: 'contribution',
    key: 'contribution',
    width: 100,
    align: 'right',
    render: (value: number) => value.toFixed(4),
  },
];

const damageColumn = {
  title: '伤害分项',
  key: 'damage',
  width: 90,
  render: (_: unknown, row: CalcRow) => (row.damage ? DAMAGE_LABELS[row.damage] : null),
};

const CHARACTER_MODULES = import.meta.glob('../data/character-info/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, Array<Record<string, number | string>>>>;

interface CharacterRow {
  key: string;
  name: string;
  stats: number[];
}

interface ConversionState {
  affixA?: string;
  affixB?: string;
  lipula?: string;
}

const CHARACTERS: CharacterRow[] = Object.entries(CHARACTER_MODULES)
  .filter(([path]) => !path.includes('character_data'))
  .map(([, data]) => {
    const name = Object.keys(data)[0];
    const levels = data[name];
    const last = levels[levels.length - 1];
    return {
      key: name,
      name,
      stats: STAT_KEYS.map((key) => Number(last[key])),
    };
  });

const TEARDROP_DATA = teardropJson as unknown as TeardropConversionData;
const LIPULA_OPTIONS = lipulaStatsJson.options as unknown as TeardropLipulaOption[];
const TEARDROP_BY_NAME = new Map(TEARDROP_DATA.characters.map((character) => [character.name, character]));
const AFFIX_STAT_KEYS = ['力气', '灵巧', '智力', '信仰', '感应'] as const;

const shortAffixName = (name: string) => name.replace(/^【.*?】/, '');

const applyAffixes = (base: number[], affixes: TeardropAffix[]): number[] => {
  const result = [...base];
  for (const affix of affixes) {
    for (const [attr, value] of Object.entries(affix.boost)) {
      const index = AFFIX_STAT_KEYS.indexOf(attr as (typeof AFFIX_STAT_KEYS)[number]);
      if (index >= 0) result[index] += value;
    }
    for (const [attr, value] of Object.entries(affix.reduce)) {
      const index = AFFIX_STAT_KEYS.indexOf(attr as (typeof AFFIX_STAT_KEYS)[number]);
      if (index >= 0) result[index] -= value;
    }
  }
  return result;
};

/** 成长曲线：分段线性插值，结果按百分比处理 */
const curveValue = (curveKey: WeaponScalingCurve, stat: number) => {
  const curve = DATA.curves[curveKey];
  const { stages, growth } = curve;
  if (stat <= stages[0]) return growth[0];
  for (let i = 1; i < stages.length; i += 1) {
    if (stat <= stages[i]) {
      const ratio = (stat - stages[i - 1]) / (stages[i] - stages[i - 1]);
      return growth[i - 1] + ratio * (growth[i] - growth[i - 1]);
    }
  }
  return growth[growth.length - 1];
};

const calculatePart = (part: ScalingPart, stats: number[]) => {
  const rows: CalcRow[] = STAT_LABELS.map((attr, index) => {
    const growth = curveValue(part.curve, stats[index]);
    const coefficient = growth / 100;
    const weight = part.weights[index] ?? 0;
    return {
      key: `${part.damage ?? part.curve}-${attr}`,
      damage: part.damage,
      attr,
      stat: stats[index],
      weight,
      growth,
      coefficient,
      contribution: (weight / 100) * coefficient,
    };
  });
  return { ...part, rows, value: 1 + rows.reduce((sum, row) => sum + row.contribution, 0) };
};

const formatShare = (share: number) => `${Number((share * 100).toFixed(2))}%`;

/** 把「力敏智12/63/26」「B类补正：力25」「信80」解析成 5 维补正占比 */
const parseScaling = (text: string): number[] => {
  const body = text.replace(/\n/g, '').split('（')[0].trim();
  const payload = body.includes('：') ? body.slice(body.lastIndexOf('：') + 1) : body;
  const statChars = payload.match(/^[力敏智信感]+/)?.[0] ?? '';
  const numeric = payload.slice(statChars.length).match(/\d+(?:\s*\/\s*\d+)*/)?.[0] ?? '';
  const values = numeric.replace(/\s/g, '').split('/').filter(Boolean).map(Number);
  const weights = [0, 0, 0, 0, 0];
  [...statChars].forEach((char, index) => {
    const statIndex = '力敏智信感'.indexOf(char);
    if (statIndex >= 0) weights[statIndex] += values[index] ?? 0;
  });
  return weights;
};

const AFFINITIES = [
  { key: 'none', label: '无质变', field: 'physical', damage: 'physical' },
  { key: 'fire', label: '火焰质变', field: 'physical', damage: 'fire' },
  { key: 'lightning', label: '雷电质变', field: 'physical', damage: 'lightning' },
  { key: 'magic', label: '魔力质变', field: 'elemental', damage: 'magic', third: 'int' },
  {
    key: 'cold',
    label: '寒冷质变',
    field: 'elemental',
    damage: 'magic',
    third: 'int',
    baseScale: STATUS_AFFINITY_BASE_SCALE,
  },
  { key: 'holy', label: '神圣质变', field: 'elemental', damage: 'holy', third: 'faith' },
  { key: 'blood', label: '血质变', field: 'status', damage: 'physical', baseScale: STATUS_AFFINITY_BASE_SCALE },
  { key: 'poison', label: '毒质变', field: 'status', damage: 'physical', baseScale: STATUS_AFFINITY_BASE_SCALE },
] as const;

type Affinity = (typeof AFFINITIES)[number];
type ScalingField = 'physical' | 'elemental' | 'status';

const B_HINT_OPTIONS = Object.entries(weaponArtCategoryHints as Record<string, string>).map(([name, hint]) => ({
  value: name,
  label: `${name}（${hint.replace('B类补正：', '')}）`,
  weights: parseScaling(hint),
}));

const SELECTABLE_WEAPONS = DATA.weapons.filter(
  (weapon) => !weapon.pending && (weapon.specialAffinities || weapon.physical || weapon.elemental || weapon.status),
);
const NORMAL_SELECTABLE = SELECTABLE_WEAPONS.filter((weapon) => !weapon.name.startsWith('特殊：'));
const SPECIAL_SELECTABLE = SELECTABLE_WEAPONS.filter((weapon) => weapon.name.startsWith('特殊：'));
const NORMAL_WEAPONS = DATA.weapons.filter((weapon) => !weapon.name.startsWith('特殊：'));
const SPECIAL_WEAPONS = DATA.weapons.filter((weapon) => weapon.name.startsWith('特殊：'));

const affinitiesForWeapon = (weapon: WeaponScalingRow | undefined) =>
  weapon?.specialAffinities ? AFFINITIES.filter((affinity) => affinity.key in weapon.specialAffinities!) : AFFINITIES;

/** 通用战技：按武器类型 + 质变取武器补正分布 */
const weaponWeights = (weapon: WeaponScalingRow | undefined, affinity: Affinity): number[] => {
  const weights = [0, 0, 0, 0, 0];
  if (!weapon) return weights;
  const special = weapon.specialAffinities?.[affinity.key];
  if (special) return [...special];
  const raw = weapon[affinity.field as ScalingField];
  if (!raw) return weights;
  const values = (raw.match(/\d+/g) ?? []).map(Number);
  weights[0] = values[0] ?? 0;
  weights[1] = values[1] ?? 0;
  if (affinity.field === 'elemental') {
    const statIndex = 'third' in affinity && affinity.third === 'faith' ? 3 : 2;
    weights[statIndex] = values[2] ?? 0;
  } else if (affinity.field === 'status') {
    weights[4] = values[2] ?? 0;
  }
  return weights;
};

const weaponScaling = (weapon: WeaponScalingRow | undefined, affinity: Affinity) => {
  const weights = weaponWeights(weapon, affinity);
  const layout = weapon?.damageLayouts?.[affinity.key];
  const base =
    layout?.base ?? (affinity.damage === 'physical' ? { physical: 1 } : { physical: 1, [affinity.damage]: 1 });
  const entries = Object.entries(base) as [WeaponScalingDamageType, number][];
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const originalBase = weapon?.damageLayouts?.none?.base;
  const baseScale = 'baseScale' in affinity ? affinity.baseScale : 1;
  const parts: ScalingPart[] = entries.map(([damage, value]) => {
    const stats = weapon?.damageStats?.[damage];
    return {
      damage,
      share: value / total,
      curve: layout?.curves?.[damage] ?? (damage === 'physical' ? 'physical' : 'elemental'),
      weights: stats ? weights.map((weight, index) => (stats.includes(SCALING_STATS[index]) ? weight : 0)) : weights,
    };
  });
  return {
    parts,
    baseScale:
      baseScale < 1 && layout && originalBase
        ? total / Object.values(originalBase).reduce((sum, value) => sum + value, 0)
        : baseScale,
  };
};

interface ArtOption {
  value: string;
  label: string;
  desc?: string;
  weights: number[];
  installed: boolean;
  group?: string;
}

const UNIQUE_OPTIONS: ArtOption[] = (() => {
  const map = new Map<string, ArtOption>();
  for (const row of uniqueWeaponArts as Array<Record<string, string>>) {
    if (!row['战技']) continue;
    const key = `${row['战技']}|${row['武器']}`;
    if (map.has(key)) continue;
    const correction = (row['补正'] ?? '').replace(/\s+/g, ' ').trim();
    map.set(key, {
      value: `unique:${key}`,
      label: `${row['战技']}（${row['武器']}）`,
      desc: `${row['分类']} · ${row['类型'] || '?'}类 · 补正 ${correction || '未标注'}`,
      weights: parseScaling(correction),
      installed: Boolean(correction),
      group: row['分类'],
    });
  }
  return [...map.values()];
})();

const CurveChart: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const data = [
    ...DATA.curves.physical.stages.map((stat, index) => ({
      stat,
      value: DATA.curves.physical.growth[index],
      curve: '0 号曲线（物理面板）',
    })),
    ...DATA.curves.elemental.stages.map((stat, index) => ({
      stat,
      value: DATA.curves.elemental.growth[index],
      curve: '4 号曲线（魔火雷圣面板）',
    })),
  ];
  const config = {
    data,
    xField: 'stat',
    yField: 'value',
    colorField: 'curve',
    theme,
    height: 340,
    autoFit: true,
    point: { sizeField: 4, shapeField: 'circle' },
    scale: {
      color: { range: ['#1677ff', '#fa8c16'] },
    },
    axis: {
      x: { title: '属性值' },
      y: { title: '成长值（%）' },
    },
    legend: { color: { position: 'bottom' as const } },
  };
  return <Line {...config} />;
};

const specialScalingGroups = (affinities: Record<string, number[]>) => {
  const groups = new Map<string, string[]>();
  for (const [key, values] of Object.entries(affinities)) {
    const label = AFFINITIES.find((item) => item.key === key)?.label ?? key;
    const value = values.join('/');
    groups.set(value, [...(groups.get(value) ?? []), label]);
  }
  return [...groups.entries()].map(([value, labels]) => ({ value, labels }));
};

const specialColumns: TableColumnsType<WeaponScalingRow> = [
  {
    title: '武器',
    dataIndex: 'name',
    key: 'name',
    width: '16%',
    render: (name: string, record) => (
      <span className={styles.nameCell}>
        <span>{name.replace(/^特殊：/, '')}</span>
        {record.pending ? <Tag color="warning">待确认</Tag> : null}
      </span>
    ),
  },
  { title: '类别', dataIndex: 'category', key: 'category', width: 80, align: 'center' },
  { title: '基础削韧', dataIndex: 'poise', key: 'poise', width: 90, align: 'center' },
  {
    title: '补正分布（力/敏/智/信/感）',
    key: 'scaling',
    render: (_, record) => {
      if (record.specialAffinities) {
        return (
          <div className={styles.affinityLines}>
            {specialScalingGroups(record.specialAffinities).map((group) => (
              <div key={group.value}>
                {group.labels.join('、')}：{group.value}
              </div>
            ))}
          </div>
        );
      }
      const parts = [
        record.physical ? `物理 ${record.physical}` : '',
        record.elemental ? `元素 ${record.elemental}` : '',
        record.status ? `异常 ${record.status}` : '',
      ].filter(Boolean);
      return parts.join(' · ') || '—';
    },
  },
  { title: '备注', dataIndex: 'note', key: 'note', width: '30%', render: (v?: string) => v ?? '' },
];

const weaponColumns: TableColumnsType<WeaponScalingRow> = [
  { title: '武器', dataIndex: 'name', key: 'name', width: '17%' },
  { title: '基础削韧', dataIndex: 'poise', key: 'poise', width: 90, align: 'center' },
  {
    title: (
      <div>
        <div>力/敏</div>
        <div className={styles.colSub}>无质变 / 火焰 / 雷电质变</div>
      </div>
    ),
    dataIndex: 'physical',
    key: 'physical',
    align: 'center',
    render: (v?: string) => v ?? '—',
  },
  {
    title: (
      <div>
        <div>力/敏/智or信</div>
        <div className={styles.colSub}>力/敏/智：魔力 / 寒冷质变</div>
        <div className={styles.colSub}>力/敏/信：神圣质变</div>
      </div>
    ),
    dataIndex: 'elemental',
    key: 'elemental',
    align: 'center',
    render: (v?: string) => v ?? '—',
  },
  {
    title: (
      <div>
        <div>力/敏/感</div>
        <div className={styles.colSub}>血 / 毒质变</div>
      </div>
    ),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (v?: string) => v ?? '—',
  },
];

const WeaponScalingView: React.FC = () => {
  const [curveKey, setCurveKey] = useState<WeaponScalingCurve>('physical');
  const [mode, setMode] = useState<'universal' | 'unique'>('universal');
  const [selectedKey, setSelectedKey] = useState('');
  const [weaponName, setWeaponName] = useState('短剑');
  const [affinityKey, setAffinityKey] = useState('none');
  const [skillClass, setSkillClass] = useState<'A' | 'B'>('A');
  const [bHintKey, setBHintKey] = useState('厚重');
  const [bCurveKey, setBCurveKey] = useState<WeaponScalingCurve>('physical');
  const [showUnreleased, setShowUnreleased] = useState(false);
  const [conversionOpen, setConversionOpen] = useState(false);
  const [conversions, setConversions] = useState<Record<string, ConversionState>>({});
  const [calcName, setCalcName] = useState<string | null>(null);
  const [curveOpen, setCurveOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['tomato-theme'] });
    return () => observer.disconnect();
  }, []);

  const availableUnique = useMemo(
    () => UNIQUE_OPTIONS.filter((option) => showUnreleased || option.installed),
    [showUnreleased],
  );

  const selected = useMemo(
    () => availableUnique.find((option) => option.value === selectedKey) ?? availableUnique[0],
    [availableUnique, selectedKey],
  );

  const weapon = SELECTABLE_WEAPONS.find((item) => item.name === weaponName) ?? SELECTABLE_WEAPONS[0];
  const allowedAffinities = affinitiesForWeapon(weapon);
  const affinity = allowedAffinities.find((item) => item.key === affinityKey) ?? allowedAffinities[0] ?? AFFINITIES[0];
  const bHint = B_HINT_OPTIONS.find((item) => item.value === bHintKey) ?? B_HINT_OPTIONS[0];
  const isUniversalA = mode === 'universal' && skillClass === 'A';
  const { parts: activeParts, baseScale }: ReturnType<typeof weaponScaling> = isUniversalA
    ? weaponScaling(weapon, affinity)
    : {
        baseScale: 1,
        parts: [
          {
            share: 1,
            curve: mode === 'universal' ? bCurveKey : curveKey,
            weights: mode === 'universal' ? bHint.weights : selected.weights,
          },
        ],
      };
  const curveDescription = activeParts
    .map(({ damage, share, curve }) =>
      damage ? `${DAMAGE_LABELS[damage]} ${formatShare(share)} · ${CURVE_LABELS[curve]}` : DATA.curves[curve].name,
    )
    .join(' / ');
  const scalingDescription =
    baseScale === 1 ? curveDescription : `${curveDescription} · 基础攻击力 ${formatShare(baseScale)}`;
  const activeLabel =
    mode === 'universal'
      ? skillClass === 'A'
        ? `${weapon?.name ?? '武器'} · ${affinity.label} · A类`
        : `B类（${bHintKey}）`
      : selected.label;
  const activeDesc =
    mode === 'universal'
      ? isUniversalA
        ? scalingDescription
        : `${DATA.curves[bCurveKey].name} · B类特殊补正`
      : selected.desc;

  const uniqueGroups = useMemo(() => {
    const map = new Map<string, ArtOption[]>();
    for (const option of availableUnique) {
      const group = option.group ?? '其他';
      const list = map.get(group) ?? [];
      list.push(option);
      map.set(group, list);
    }
    return [...map.entries()].map(([label, options]) => ({ label: `${label}（${options.length}）`, options }));
  }, [availableUnique]);

  const handleWeaponChange = (name: string) => {
    setWeaponName(name);
    const next = SELECTABLE_WEAPONS.find((item) => item.name === name);
    const allowed = affinitiesForWeapon(next);
    if (!allowed.some((item) => item.key === affinityKey)) {
      setAffinityKey(allowed[0]?.key ?? 'none');
    }
  };

  const handleModeChange = (nextMode: 'universal' | 'unique') => {
    setMode(nextMode);
    if (nextMode === 'unique' && !selectedKey) {
      setSelectedKey(availableUnique[0]?.value ?? '');
    }
  };

  const convertedCharacters = useMemo(
    () =>
      CHARACTERS.map((character) => {
        const conversion = conversions[character.name];
        if (!conversion) return character;
        const teardrop = TEARDROP_BY_NAME.get(character.name);
        if (conversion.lipula) {
          const option = LIPULA_OPTIONS.find((item) => item.key === conversion.lipula);
          if (option) {
            return {
              ...character,
              stats: AFFIX_STAT_KEYS.map((key) => Number(option.stats[key] ?? 0)),
            };
          }
        }
        const affixes = [conversion.affixA, conversion.affixB]
          .map((id) => teardrop?.affixes.find((affix) => affix.entryId === id))
          .filter((affix): affix is TeardropAffix => Boolean(affix));
        return { ...character, stats: applyAffixes(character.stats, affixes) };
      }),
    [conversions],
  );

  const conversionCount = Object.values(conversions).filter((item) => item.affixA || item.affixB || item.lipula).length;

  const rankings = convertedCharacters
    .map((character) => {
      const parts = activeParts.map((part) => calculatePart(part, character.stats));
      return { ...character, parts, value: baseScale * parts.reduce((sum, part) => sum + part.share * part.value, 0) };
    })
    .sort((a, b) => b.value - a.value);

  const best = rankings[0];

  const calcRecord = rankings.find((character) => character.name === calcName);
  const calcParts = calcRecord?.parts ?? [];
  const splitDamage = calcParts.length > 1;
  const calcRows = calcParts.flatMap((part) => part.rows);
  const calcTerms = splitDamage
    ? calcParts.map(({ share, value }) => `${formatShare(share)} × ${value.toFixed(4)}`)
    : [
        '1',
        ...calcRows.filter((row) => row.weight > 0).map((row) => `${row.weight / 100} × ${row.coefficient.toFixed(4)}`),
      ];
  const calcSubtotal = calcTerms.join(' + ');
  const calcFormula = baseScale === 1 ? calcSubtotal : `${formatShare(baseScale)} × (${calcSubtotal})`;

  const rankingColumns: TableColumnsType<(typeof rankings)[number]> = [
    {
      title: '角色',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, _, index) => (
        <span className={styles.nameCell}>
          <CharacterAvatar name={name} size={22} className={styles.nameCell} />
          {index === 0 ? <Tag color="gold">最适配</Tag> : null}
          {conversions[name] && (conversions[name].affixA || conversions[name].affixB || conversions[name].lipula) ? (
            <Tag color="cyan">转职</Tag>
          ) : null}
        </span>
      ),
    },
    ...STAT_LABELS.map((label, index) => ({
      title: label,
      key: `stat-${label}`,
      width: 76,
      align: 'center' as const,
      render: (_: unknown, record: (typeof rankings)[number]) => record.stats[index],
    })),
    {
      title: '适配度',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      align: 'right' as const,
      sorter: (a: (typeof rankings)[number], b: (typeof rankings)[number]) => a.value - b.value,
      render: (value: number, record: (typeof rankings)[number]) => (
        <Button type="link" size="small" className={styles.calcLink} onClick={() => setCalcName(record.name)}>
          ×{value.toFixed(3)}
        </Button>
      ),
    },
  ];

  const updateConversion = (name: string, patch: Partial<ConversionState>) => {
    setConversions((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  };

  const conversionColumns: TableColumnsType<CharacterRow> = [
    {
      title: '角色',
      dataIndex: 'name',
      key: 'name',
      width: 130,
      render: (name: string) => <CharacterAvatar name={name} size={22} className={styles.nameCell} />,
    },
    {
      title: '泪滴词条 A',
      key: 'affixA',
      width: 220,
      render: (_, record) => {
        const conversion = conversions[record.name] ?? {};
        const teardrop = TEARDROP_BY_NAME.get(record.name);
        return (
          <Select
            allowClear
            value={conversion.affixA}
            placeholder="不装备"
            disabled={Boolean(conversion.lipula)}
            options={(teardrop?.affixes ?? [])
              .filter((affix) => affix.entryId !== conversion.affixB)
              .map((affix) => ({ value: affix.entryId, label: shortAffixName(affix.name) }))}
            onChange={(value) => updateConversion(record.name, { affixA: value })}
            style={{ width: '100%' }}
          />
        );
      },
    },
    {
      title: '泪滴词条 B',
      key: 'affixB',
      width: 220,
      render: (_, record) => {
        const conversion = conversions[record.name] ?? {};
        const teardrop = TEARDROP_BY_NAME.get(record.name);
        return (
          <Select
            allowClear
            value={conversion.affixB}
            placeholder="不装备"
            disabled={Boolean(conversion.lipula)}
            options={(teardrop?.affixes ?? [])
              .filter((affix) => affix.entryId !== conversion.affixA)
              .map((affix) => ({ value: affix.entryId, label: shortAffixName(affix.name) }))}
            onChange={(value) => updateConversion(record.name, { affixB: value })}
            style={{ width: '100%' }}
          />
        );
      },
    },
    {
      title: '利普拉交易',
      key: 'lipula',
      width: 170,
      render: (_, record) => {
        const conversion = conversions[record.name] ?? {};
        return (
          <Select
            allowClear
            value={conversion.lipula}
            placeholder="不交易"
            options={LIPULA_OPTIONS.map((item) => ({
              value: item.key,
              label: item.name,
            }))}
            onChange={(value) =>
              updateConversion(record.name, {
                lipula: value,
                affixA: undefined,
                affixB: undefined,
              })
            }
            style={{ width: '100%' }}
          />
        );
      },
    },
    {
      title: '修正后属性',
      key: 'stats',
      render: (_, record) => (
        <span className={styles.statsCell}>
          {record.stats.map((value, index) => `${STAT_LABELS[index]}${value}`).join(' / ')}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.wrap} id="weapon-scaling">
      <div className={styles.formulaCard}>
        <Button
          className={styles.curveButton}
          size="small"
          icon={<LineChartOutlined />}
          onClick={() => setCurveOpen(true)}
        >
          补正曲线
        </Button>
        <p className={styles.formulaTitle}>分项适配度 = 1 + Σ（属性补正权重 × 成长曲线系数）</p>
        <p className={styles.formulaText}>
          成长曲线系数是 15 级角色属性在对应曲线上的取值除以 100。分项适配度以 1.00 为基准。
        </p>
        <p className={styles.formulaText}>
          总适配度 = 质变基础倍率 × Σ（各分项基础攻击力占比 × 分项适配度）。强化系数和战技动作倍率另算。
        </p>
      </div>

      <div className={styles.affinityBox}>
        <p className={styles.affinityTitle}>出击携带属性、异常</p>
        <ul className={styles.affinityList}>
          {DATA.startingWeaponNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className={styles.affinityBox}>
        <p className={styles.affinityTitle}>质变</p>
        <ul className={styles.affinityList}>
          {DATA.affinityNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <h4 className={styles.heading}>武器/战技适配度</h4>
      <p className={styles.hint}>
        通用 A 类按武器类型和质变计算。纯物理用 0 号曲线，火焰、雷电、魔力、神圣和寒冷质变通常按物理 0 号与元素 4
        号各占一半加权。寒冷、血和毒另计基础攻击力折减，武器类别按 80% 估算，已有具体数据的武器按实际比例计算。 通用 B
        类使用所选补正类别和 0 / 4 号曲线。 专属战技按武器类别分组，支持搜索和手动切换补正曲线。
      </p>
      <div className={styles.toolbar}>
        <Segmented
          value={mode}
          onChange={(value) => handleModeChange(value as 'universal' | 'unique')}
          options={[
            { label: '通用战技', value: 'universal' },
            { label: '专属战技', value: 'unique' },
          ]}
        />
        {mode === 'universal' ? (
          <>
            <Segmented
              value={skillClass}
              onChange={(value) => setSkillClass(value as 'A' | 'B')}
              options={[
                { label: 'A类', value: 'A' },
                { label: 'B类', value: 'B' },
              ]}
            />
            <Select
              value={weaponName}
              onChange={handleWeaponChange}
              options={[
                {
                  label: '普通武器',
                  options: NORMAL_SELECTABLE.map((item) => ({ value: item.name, label: item.name })),
                },
                {
                  label: '特殊武器',
                  options: SPECIAL_SELECTABLE.map((item) => ({ value: item.name, label: item.name })),
                },
              ]}
              showSearch={{ optionFilterProp: 'label' }}
              disabled={skillClass === 'B'}
              style={{ minWidth: 180 }}
            />
            <Select
              value={affinity.key}
              onChange={setAffinityKey}
              options={allowedAffinities.map((item) => ({ value: item.key, label: item.label }))}
              disabled={skillClass === 'B'}
              style={{ minWidth: 150 }}
            />
            {skillClass === 'B' ? (
              <>
                <Segmented
                  value={bCurveKey}
                  onChange={(value) => setBCurveKey(value as WeaponScalingCurve)}
                  options={[
                    { label: CURVE_LABELS.physical, value: 'physical' },
                    { label: CURVE_LABELS.elemental, value: 'elemental' },
                  ]}
                />
                <Select value={bHintKey} onChange={setBHintKey} options={B_HINT_OPTIONS} style={{ minWidth: 190 }} />
              </>
            ) : null}
          </>
        ) : (
          <>
            <Segmented
              value={curveKey}
              onChange={(value) => setCurveKey(value as WeaponScalingCurve)}
              options={[
                { label: '0 号曲线 · 物理', value: 'physical' },
                { label: '4 号曲线 · 元素', value: 'elemental' },
              ]}
            />
            <Select
              value={selected.value}
              onChange={setSelectedKey}
              options={uniqueGroups}
              showSearch={{ optionFilterProp: 'label' }}
              optionRender={(option) => {
                const data = option.data as unknown as ArtOption;
                return (
                  <div className={styles.optionRow}>
                    <span>{option.label}</span>
                    {data.desc ? <span className={styles.optionDesc}>{data.desc}</span> : null}
                  </div>
                );
              }}
              style={{ minWidth: 360 }}
              popupMatchSelectWidth={460}
            />
            <Checkbox checked={showUnreleased} onChange={(e) => setShowUnreleased(e.target.checked)}>
              显示未实装
            </Checkbox>
          </>
        )}
        <Button icon={<ExperimentOutlined />} onClick={() => setConversionOpen(true)}>
          泪滴转职{conversionCount > 0 ? `（${conversionCount}）` : ''}
        </Button>
      </div>

      <div className={styles.summary}>
        <Statistic title={activeLabel} value={best.value.toFixed(3)} precision={3} prefix="×" />
        <span className={styles.summaryText}>
          最适配：{best.name}（{STAT_LABELS.map((label, i) => `${label}${best.stats[i]}`).join(' / ')}）
        </span>
        {activeDesc ? <span className={styles.summaryText}>{activeDesc}</span> : null}
      </div>

      <p className={styles.hint}>点击「适配度」倍率可查看逐项计算过程。</p>
      <Table columns={rankingColumns} dataSource={rankings} rowKey="key" size="small" bordered pagination={false} />

      <p className={styles.note}>
        专用战技的补正取自 「战技与魔法祷告」，同一战技多段动作只取第一条补正； 勾选「显示未实装」时会列出未标注补正（按
        1.000 计算）的专用战技。
      </p>

      <h4 className={styles.heading}>武器补正与基础削韧</h4>
      <p className={styles.hint}>
        补正分布按「力/敏（无质变、火焰、雷电）」「力/敏/智（魔力、寒冷）或
        力/敏/信（神圣）」「力/敏/感（血、毒）」排列；特殊武器单独列出。
      </p>
      <Table
        columns={weaponColumns}
        dataSource={NORMAL_WEAPONS.map((row) => ({ ...row, key: row.name }))}
        rowKey="key"
        size="small"
        bordered
        pagination={false}
        scroll={{ x: 900 }}
      />

      <h4 className={styles.heading}>特殊武器（{SPECIAL_WEAPONS.length}）</h4>
      <p className={styles.hint}>特殊武器单独列出，补正值来自 Smithbox 解包的武器参数；部分武器只支持特定质变。</p>
      <Table
        columns={specialColumns}
        dataSource={SPECIAL_WEAPONS.map((row) => ({ ...row, key: row.name }))}
        rowKey="key"
        size="small"
        bordered
        pagination={false}
        scroll={{ x: 900 }}
      />

      <Modal
        title={calcRecord ? `适配度计算 · ${calcRecord.name}` : '适配度计算'}
        open={Boolean(calcName)}
        onCancel={() => setCalcName(null)}
        footer={null}
        width={760}
      >
        {calcRecord ? (
          <>
            <p className={styles.hint}>{activeLabel}</p>
            <p className={styles.hint}>{scalingDescription}</p>
            <Table
              className={styles.calcTable}
              columns={splitDamage ? [damageColumn, ...calcColumns] : calcColumns}
              dataSource={calcRows}
              rowKey="key"
              size="small"
              bordered
              pagination={false}
              scroll={{ x: splitDamage ? 640 : 550 }}
            />
            <p className={styles.calcFormula}>
              适配度 = {calcFormula} ≈ ×{calcRecord.value.toFixed(3)}
            </p>
            <p className={styles.note}>
              每个分项从 1.00 起算，加上各属性的贡献（补正权重 × 曲线系数）。按基础攻击力占比合计后乘质变基础倍率。
            </p>
          </>
        ) : null}
      </Modal>

      <Drawer title="补正曲线" size={760} open={curveOpen} onClose={() => setCurveOpen(false)}>
        <p className={styles.hint}>
          横轴为属性值，纵轴为成长值（%）；适配度系数 = 成长值 ÷ 100。两条曲线放在同一坐标系中对比： 0 号曲线按 5
          个节点分段，4 号曲线为 0 → 99 的单段直线。
        </p>
        <CurveChart theme={theme} />
        <p className={styles.hint}>
          0 号节点：属性 0 / 24 / 49 / 74 / 99 → 成长 0 / 96 / 168 / 216 / 240；4 号节点：属性 0 → 99， 成长 0 → 300。
        </p>
      </Drawer>

      <Drawer
        title="泪滴转职"
        size={1000}
        open={conversionOpen}
        onClose={() => setConversionOpen(false)}
        extra={<Button onClick={() => setConversions({})}>全部重置</Button>}
      >
        <p className={styles.hint}>
          给角色选择泪滴转职词条后，上表的属性与适配度会实时变化；同一角色最多装备两条词条，利普拉交易会覆盖词条。
        </p>
        <Table
          columns={conversionColumns}
          dataSource={convertedCharacters}
          rowKey="name"
          size="small"
          bordered
          pagination={false}
        />
        <p className={styles.note}>
          基础属性取站内角色数据 15 级；词条数值为 Lv12 满值。利普拉的交易（平衡律法）会强制替换属性分配。
        </p>
      </Drawer>

      <div className={styles.source}>
        资料整理：{DATA.meta.author}《{DATA.meta.title}》；{DATA.meta.note}
      </div>
    </div>
  );
};

export default WeaponScalingView;
