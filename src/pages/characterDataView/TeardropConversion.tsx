import { useMemo, useState } from 'react';
import { Alert, Collapse, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ThunderboltTwoTone } from '@ant-design/icons';
import styles from '../../styles/characterDataView.module.css';
import DataSourceTooltip from '../../components/DataSourceTooltip';
import teardropJson from '../../data/zh-CN/teardrop_conversion.json';
import type { TeardropAffix, TeardropConversionData } from '../../types';

const { Title, Text } = Typography;

const TEARDROP_DATA = teardropJson as unknown as TeardropConversionData;

const POSITIVE_COLOR = '#52c41a';
const NEGATIVE_COLOR = '#ff4d4f';

/** 修正后的一行属性 */
interface StatRow {
  key: string;
  attr: string;
  base: number;
  value: number;
  diff: number;
  isTotal?: boolean;
}

/** 把若干条泪滴词条的增减叠到基础属性上（同一属性多条叠加） */
const applyAffixes = (base: Record<string, number>, affixes: TeardropAffix[]): Record<string, number> => {
  const result = { ...base };
  affixes.forEach((affix) => {
    Object.entries(affix.boost).forEach(([attr, value]) => {
      result[attr] = (result[attr] ?? 0) + value;
    });
    Object.entries(affix.reduce).forEach(([attr, value]) => {
      result[attr] = (result[attr] ?? 0) - value;
    });
  });
  return result;
};

const diffColor = (diff: number) => (diff > 0 ? POSITIVE_COLOR : diff < 0 ? NEGATIVE_COLOR : 'var(--color-text-3)');
const formatDiff = (diff: number) => (diff > 0 ? `+${diff}` : `${diff}`);

/** 去掉词条名里的「【角色】」前缀（角色已经单独选了） */
const shortAffixName = (name: string): string => name.replace(/^【.*?】/, '');

/** 词条满值文字，如「Lv12 满值：智力+15、信仰+15，力气-7、灵巧-5」 */
const affixSummary = (affix: TeardropAffix): string => {
  const plus = Object.entries(affix.boost)
    .map(([attr, value]) => `${attr}+${value}`)
    .join('、');
  const minus = Object.entries(affix.reduce)
    .map(([attr, value]) => `${attr}-${value}`)
    .join('、');
  const body = [plus, minus].filter(Boolean).join('，');
  return `Lv12 满值：${body}`;
};

/**
 * 泪滴转职（属性修正）
 *
 * 遗物带「【角色】提升…但降低…」的局外词条 = 该角色泪滴转职。
 * 同一角色的两条词条可叠加、同一条不可重复；数值为 Lv12+ 满值，基础属性取 Lv15。
 * 利普拉的交易（平衡律法）会强制覆盖属性，无视词条。
 */
const TeardropConversion: React.FC = () => {
  const data = TEARDROP_DATA;
  const attrs = data.attributes;

  const [charName, setCharName] = useState(data.characters[0].name);
  const [affixA, setAffixA] = useState<string | undefined>(undefined);
  const [affixB, setAffixB] = useState<string | undefined>(undefined);
  const [lipulaKey, setLipulaKey] = useState<string | undefined>(undefined);

  const character = data.characters.find((item) => item.name === charName) ?? data.characters[0];
  const lipula = lipulaKey ? data.lipula.options.find((item) => item.key === lipulaKey) : undefined;

  const result = useMemo(() => {
    if (lipula) return { ...lipula.stats };
    const chosen = [affixA, affixB]
      .map((id) => character.affixes.find((affix) => affix.entryId === id))
      .filter((affix): affix is TeardropAffix => Boolean(affix));
    return applyAffixes(character.base, chosen);
  }, [character, affixA, affixB, lipula]);

  const rows: StatRow[] = attrs.map((attr) => ({
    key: attr,
    attr,
    base: character.base[attr] ?? 0,
    value: result[attr] ?? 0,
    diff: (result[attr] ?? 0) - (character.base[attr] ?? 0),
  }));
  const baseTotal = attrs.reduce((sum, attr) => sum + (character.base[attr] ?? 0), 0);
  const valueTotal = attrs.reduce((sum, attr) => sum + (result[attr] ?? 0), 0);
  rows.push({
    key: 'total',
    attr: '合计',
    base: baseTotal,
    value: valueTotal,
    diff: valueTotal - baseTotal,
    isTotal: true,
  });

  const columns: ColumnsType<StatRow> = [
    {
      title: '属性',
      dataIndex: 'attr',
      key: 'attr',
      width: 100,
      align: 'center',
      render: (attr: string, row) => (
        <span style={{ fontWeight: row.isTotal ? 600 : 500, color: 'var(--color-text-1)' }}>{attr}</span>
      ),
    },
    {
      title: `基础（Lv${data.meta.baseLevel}）`,
      dataIndex: 'base',
      key: 'base',
      width: 110,
      align: 'center',
      render: (value: number, row) => (
        <span style={{ fontWeight: row.isTotal ? 600 : 500, color: 'var(--color-text-2)' }}>{value}</span>
      ),
    },
    {
      title: lipula ? '交易后' : '修正后',
      dataIndex: 'value',
      key: 'value',
      width: 110,
      align: 'center',
      render: (value: number, row) => (
        <span style={{ fontWeight: 600, color: row.diff === 0 ? 'var(--color-text-1)' : diffColor(row.diff) }}>
          {value}
        </span>
      ),
    },
    {
      title: '变化',
      dataIndex: 'diff',
      key: 'diff',
      width: 90,
      align: 'center',
      render: (diff: number) =>
        diff === 0 ? (
          <span style={{ color: 'var(--color-text-3)' }}>—</span>
        ) : (
          <span style={{ color: diffColor(diff), fontWeight: 500 }}>{formatDiff(diff)}</span>
        ),
    },
  ];

  const handleCharacterChange = (name: string) => {
    setCharName(name);
    setAffixA(undefined);
    setAffixB(undefined);
  };

  const selectedAffixes = [affixA, affixB]
    .map((id) => character.affixes.find((affix) => affix.entryId === id))
    .filter((affix): affix is TeardropAffix => Boolean(affix));

  // 参考对照表：每位角色的基础 / 单条词条 / 双词条叠加
  const referenceRows = useMemo(() => {
    const list: Array<
      { key: string; character: string; scene: string; total: number } & Record<string, string | number>
    > = [];
    data.characters.forEach((item) => {
      const scenes: Array<[string, Record<string, number>]> = [
        ['基础', item.base],
        ...item.affixes.map((affix): [string, Record<string, number>] => [
          affix.name.replace(/^【.*?】/, ''),
          applyAffixes(item.base, [affix]),
        ]),
        ['双词条叠加', applyAffixes(item.base, item.affixes)],
      ];
      scenes.forEach(([scene, stats], index) => {
        const row: { key: string; character: string; scene: string; total: number } & Record<string, string | number> =
          {
            key: `${item.name}-${index}`,
            character: item.name,
            scene,
            total: attrs.reduce((sum, attr) => sum + (stats[attr] ?? 0), 0),
          };
        attrs.forEach((attr) => {
          row[attr] = stats[attr] ?? 0;
        });
        list.push(row);
      });
    });
    return list;
  }, [data.characters, attrs]);

  const referenceColumns: ColumnsType<Record<string, string | number>> = [
    {
      title: '角色',
      dataIndex: 'character',
      key: 'character',
      width: 90,
      align: 'center',
      fixed: 'left',
      render: (value: string) => <span style={{ fontWeight: 600, color: 'var(--color-text-1)' }}>{value}</span>,
      // 每位角色 4 行（基础 / 词条① / 词条② / 双词条），角色列合并显示
      onCell: (row) => ({ rowSpan: String(row.key).endsWith('-0') ? 4 : 0 }),
    },
    {
      title: '情况',
      dataIndex: 'scene',
      key: 'scene',
      width: 230,
      render: (value: string) => <span style={{ fontWeight: value === '双词条叠加' ? 600 : 400 }}>{value}</span>,
    },
    ...attrs.map((attr) => ({
      title: attr,
      dataIndex: attr,
      key: attr,
      width: 64,
      align: 'center' as const,
    })),
    {
      title: '合计',
      dataIndex: 'total',
      key: 'total',
      width: 70,
      align: 'center',
      render: (value: number) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
  ];

  return (
    <div className={`content-wrapper ${styles.cardItem}`} id="teardrop-conversion">
      <div className={styles.cardHeader}>
        <Title level={5} className="character-card-title">
          <ThunderboltTwoTone />
          泪滴转职（属性修正）
          <DataSourceTooltip
            links={[
              {
                text: '黑夜君临 泪滴转职属性修正一览（by 模组工艺）',
                url: 'https://www.bilibili.com/video/BV1EB2rBhERC',
              },
              {
                text: '渡夜者各等级属性点数一览（基础属性）',
                url: 'https://www.bilibili.com/video/BV1p5ThzfEy7',
              },
            ]}
          />
        </Title>
      </div>
      <div className={styles.cardBody}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="遗物携带「【角色】提升…但降低…」的局外词条，等于该渡夜者「泪滴转职」"
          description={
            <span style={{ fontSize: 12 }}>
              同一角色的两条词条可叠加、同一条不能重复装备；数值为 Lv12+ 满值，基础属性取 Lv{data.meta.baseLevel}。
              利普拉的交易（平衡律法）会强制覆盖属性，无视词条。
            </span>
          }
        />

        <div className={styles.teardropControls}>
          <div className={styles.teardropRow}>
            <span className={styles.teardropLabel}>渡夜者</span>
            <Select
              value={charName}
              onChange={handleCharacterChange}
              style={{ width: 180 }}
              options={data.characters.map((item) => ({ value: item.name, label: item.name }))}
            />
          </div>

          <div className={styles.teardropRow}>
            <span className={styles.teardropLabel}>泪滴转职词条</span>
            <Space wrap>
              <Select
                value={affixA}
                onChange={setAffixA}
                allowClear
                disabled={Boolean(lipula)}
                placeholder="词条①（不装备）"
                style={{ width: 320, maxWidth: '100%' }}
                options={character.affixes.map((affix) => ({
                  value: affix.entryId,
                  label: shortAffixName(affix.name),
                  disabled: affix.entryId === affixB,
                }))}
              />
              <Select
                value={affixB}
                onChange={setAffixB}
                allowClear
                disabled={Boolean(lipula)}
                placeholder="词条②（不装备）"
                style={{ width: 320, maxWidth: '100%' }}
                options={character.affixes.map((affix) => ({
                  value: affix.entryId,
                  label: shortAffixName(affix.name),
                  disabled: affix.entryId === affixA,
                }))}
              />
            </Space>
          </div>

          <div className={styles.teardropRow}>
            <span className={styles.teardropLabel}>利普拉的交易</span>
            <Select
              value={lipulaKey}
              onChange={(value) => setLipulaKey(value)}
              allowClear
              placeholder="不启用"
              style={{ width: 320, maxWidth: '100%' }}
              options={data.lipula.options.map((option) => ({
                value: option.key,
                label: `${option.name}（${option.desire}）`,
              }))}
            />
          </div>

          {(lipula || selectedAffixes.length > 0) && (
            <div className={styles.teardropDetail}>
              {lipula && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    交易已启用：属性强制替换为「{lipula.name}」，与词条无关
                  </Text>
                </div>
              )}
              {!lipula &&
                selectedAffixes.map((affix) => (
                  <div key={affix.entryId}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {shortAffixName(affix.name)} —— {affixSummary(affix)}
                    </Text>
                  </div>
                ))}
            </div>
          )}
        </div>

        <Table<StatRow>
          dataSource={rows}
          columns={columns}
          pagination={false}
          size="small"
          bordered
          style={{ maxWidth: 520 }}
          rowClassName={(row) => (row.isTotal ? 'table-row-even' : '')}
        />

        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-3)' }}>
          说明：泪滴转职数据取自局外词条解包（Lv12 满值），基础属性与角色页 Lv{data.meta.baseLevel} 属性表一致；
          资料图：模组工艺《泪滴转职》（复仇者 Lv{data.meta.baseLevel} 生命力按解包取 35，资料图为 34）。
        </div>

        <Collapse
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'reference',
              label: '全部角色对照表（基础 / 单条词条 / 双词条叠加）',
              children: (
                <Table
                  dataSource={referenceRows}
                  columns={referenceColumns}
                  pagination={false}
                  size="small"
                  bordered
                  scroll={{ x: 'max-content' }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TeardropConversion;
