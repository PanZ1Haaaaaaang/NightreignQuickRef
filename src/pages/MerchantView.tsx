import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Checkbox, Input, Popover, Segmented, Select, Switch, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import CustomPagination from '../components/CustomPagination';
import merchantJson from '../data/zh-CN/merchant_data.json';

// ---- 数据类型（对应 src/data/zh-CN/merchant_data.json 结构）----
interface ConsumableRow {
  name: string;
  rule: string | null;
  price: number | null;
  limit: string | number | null;
  effect: string | null;
  available: boolean;
}

interface WeaponRow {
  merchantNo: string | null;
  name: string;
  affinity: string | null;
  type: string | null;
  price: number | null;
  deepNightPrice: number | null;
  skill: string | null;
  affix: string | null;
  deepNightAffix: string | null;
  highlight: string | null;
}

interface TearRow {
  name: string;
  effect: string | null;
}

interface GoldenItem {
  name: string;
  effect: string | null;
  highlighted: boolean;
}

interface HollowRow {
  smallWeapons: string[];
  goldenItems: GoldenItem[];
}

interface MerchantData {
  meta: {
    sourceNote: string;
    weaponTypeNotes: Record<string, string[]>;
  };
  consumables: Record<string, ConsumableRow[]>;
  unpurchasableTears: TearRow[];
  weapons: Record<string, WeaponRow[]>;
  hollowLegendary: HollowRow[];
}

const merchantData = merchantJson as unknown as MerchantData;

const TAB_KEYS = ['普通商人', '村落商人', '黄金树商人', '大空洞传说商人', '不可购买露滴'];

// 去掉武器名后的变体括注（如「志留亚的树矛(强化防御反击)」→「志留亚的树矛」）
const stripVariant = (name: string): string => name.replace(/[（(][^（(）)]*[）)]/g, '').trim();

// 大空洞联动索引：小商店武器基础名 -> 在 hollowLegendary 中出现的位置
const HOLLOW_LINKS: Record<string, { index: number; label: string }[]> = {};
merchantData.hollowLegendary.forEach((row, index) => {
  row.smallWeapons.forEach((label) => {
    const base = stripVariant(label);
    (HOLLOW_LINKS[base] ??= []).push({ index, label });
  });
});

const DASH = '—';

const HIGHLIGHT_COLORS: Record<string, string> = {
  // 旧版标注（保留兼容）
  核心: 'gold',
  重要被动: 'orange',
  弹反: 'blue',
  双异常: 'purple',
  // v1.03.4 DLC版标注体系
  buff: 'cyan',
  增伤词条: 'volcano',
  发射器: 'purple',
  蓝泪: 'geekblue',
  雷武器: 'gold',
  祷告: 'green',
  魔法: 'blue',
  圣律: 'lime',
  减仇恨: 'magenta',
  增减仇恨: 'magenta',
  损减: 'default',
  满减: 'default',
  蓄减: 'default',
  连减: 'default',
  防减: 'default',
};

// 重点标注可能是组合值（如「雷武器/增伤词条」），按 / 空格 、 等分隔为多个 Tag
const highlightTagsOf = (highlight: string | null): string[] =>
  highlight ? highlight.split(/[\s、,，/]+/).filter(Boolean) : [];

const RULE_COLORS: Record<string, string> = {
  固定出现: 'green',
  仅单人模式固定出现: 'orange',
  固定不出现: 'red',
};

// ---- 消耗品表 ----
const ConsumableSection: React.FC<{ rows: ConsumableRow[] }> = ({ rows }) => {
  const [keyword, setKeyword] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      if (!showUnavailable && !row.available) return false;
      if (!k) return true;
      return [row.name, row.rule, row.effect].some((v) => (v ?? '').toLowerCase().includes(k));
    });
  }, [rows, keyword, showUnavailable]);

  const columns: ColumnsType<ConsumableRow> = [
    { title: '物品名称', dataIndex: 'name', key: 'name', width: 160 },
    {
      title: '出现规则',
      dataIndex: 'rule',
      key: 'rule',
      width: 180,
      render: (value: string | null) => (value ? <Tag color={RULE_COLORS[value] || 'default'}>{value}</Tag> : DASH),
    },
    { title: '价格', dataIndex: 'price', key: 'price', width: 90, render: (value: number | null) => value ?? DASH },
    {
      title: '限购规则',
      dataIndex: 'limit',
      key: 'limit',
      width: 140,
      render: (value: string | number | null) => value ?? DASH,
    },
    { title: '效果说明', dataIndex: 'effect', key: 'effect', render: (value: string | null) => value ?? DASH },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索物品名称 / 效果"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 260 }}
        />
        <Checkbox checked={showUnavailable} onChange={(e) => setShowUnavailable(e.target.checked)}>
          显示固定不出现的物品
        </Checkbox>
      </div>
      <Table<ConsumableRow>
        columns={columns}
        dataSource={filtered}
        rowKey={(record, index) => `${record.name}-${index}`}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
        locale={{ emptyText: '没有匹配的数据' }}
        onRow={(record) => (record.available ? {} : { style: { opacity: 0.55 } })}
      />
    </div>
  );
};

// ---- 武器表（含深夜模式切换）----
const WeaponSection: React.FC<{
  merchant: string;
  showHollowLink?: boolean;
  onHollowJump?: (base: string) => void;
}> = ({ merchant, showHollowLink = false, onHollowJump }) => {
  const rows = useMemo(() => merchantData.weapons[merchant] ?? [], [merchant]);
  const notes = merchantData.meta.weaponTypeNotes[merchant] ?? [];

  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [deepNight, setDeepNight] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => row.type && set.add(row.type));
    return [...set].map((value) => ({ value, label: value }));
  }, [rows]);

  const highlightOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => highlightTagsOf(row.highlight).forEach((tag) => set.add(tag)));
    return [...set].map((value) => ({ value, label: value }));
  }, [rows]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      if (selectedTypes.length > 0 && (!row.type || !selectedTypes.includes(row.type))) return false;
      if (selectedHighlights.length > 0) {
        const tags = highlightTagsOf(row.highlight);
        if (!selectedHighlights.some((tag) => tags.includes(tag))) return false;
      }
      if (!k) return true;
      return [row.merchantNo, row.name, row.affinity, row.type, row.skill, row.affix, row.deepNightAffix].some((v) =>
        (v ?? '').toLowerCase().includes(k),
      );
    });
  }, [rows, keyword, selectedTypes, selectedHighlights]);

  useEffect(() => {
    setPage(1);
  }, [keyword, selectedTypes, selectedHighlights, deepNight]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  // 商人编号列的纵向合并（按当前可见行分组）
  const merchantSpans = useMemo(() => {
    const spans = new Array<number>(paged.length).fill(1);
    let start = 0;
    while (start < paged.length) {
      const key = paged[start].merchantNo;
      let end = start + 1;
      while (end < paged.length && paged[end].merchantNo === key) {
        end += 1;
      }
      spans[start] = end - start;
      for (let index = start + 1; index < end; index += 1) {
        spans[index] = 0;
      }
      start = end;
    }
    return spans;
  }, [paged]);

  // 大空洞联动列：小商店武器命中联动表时，展示必定刷出的金武组
  const hollowLinkColumn: ColumnsType<WeaponRow>[number] = {
    title: '大空洞联动',
    key: 'hollowLink',
    width: 130,
    render: (_value, record) => {
      const entries = HOLLOW_LINKS[record.name];
      if (!entries || entries.length === 0) return null;
      const goldenSets = entries.map((entry) =>
        merchantData.hollowLegendary[entry.index].goldenItems.map((item) => item.name).join('、'),
      );
      const content = (
        <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>大空洞金武商店必定出售：</div>
          {entries.map((entry, index) => (
            <div key={entry.index}>
              {entries.length > 1 && <div style={{ color: '#8c8c8c' }}>{entry.label}</div>}
              <div>{goldenSets[index]}</div>
            </div>
          ))}
        </div>
      );
      return (
        <Popover content={content} title="大空洞联动" placement="left">
          <Tag
            color="geekblue"
            style={{ cursor: 'pointer', marginInlineEnd: 0 }}
            onClick={() => onHollowJump?.(record.name)}
          >
            {entries.length > 1
              ? `联动金武 ${entries.length}组`
              : `联动金武 ×${merchantData.hollowLegendary[entries[0].index].goldenItems.length}`}
          </Tag>
        </Popover>
      );
    },
  };

  const columns: ColumnsType<WeaponRow> = [
    {
      title: '商人编号',
      dataIndex: 'merchantNo',
      key: 'merchantNo',
      width: 90,
      onCell: (_record, index) => ({
        rowSpan: merchantSpans[index ?? 0] ?? 1,
        style: { verticalAlign: 'top' },
      }),
      render: (value: string | null) => value ?? DASH,
    },
    { title: '物品名称', dataIndex: 'name', key: 'name', width: 170 },
    {
      title: '武器质变',
      dataIndex: 'affinity',
      key: 'affinity',
      width: 90,
      render: (value: string | null) => value ?? DASH,
    },
    { title: '武器类型', dataIndex: 'type', key: 'type', width: 100, render: (value: string | null) => value ?? DASH },
    {
      title: deepNight ? '价格（深夜模式）' : '价格',
      key: 'price',
      width: 130,
      render: (_value, record) => {
        if (deepNight && record.deepNightPrice != null) {
          return <span style={{ color: '#d46b08', fontWeight: 600 }}>{record.deepNightPrice}</span>;
        }
        return record.price ?? DASH;
      },
    },
    {
      title: '战技 / 战灰 / 法术',
      dataIndex: 'skill',
      key: 'skill',
      width: 170,
      render: (value: string | null) => value ?? DASH,
    },
    {
      title: '武器词条',
      key: 'affix',
      width: 300,
      render: (_value, record) => (
        <div>
          {record.affix && <div style={{ whiteSpace: 'pre-line' }}>{record.affix}</div>}
          {deepNight && record.deepNightAffix && (
            <div
              style={{
                whiteSpace: 'pre-line',
                color: '#d46b08',
                marginTop: record.affix ? 6 : 0,
              }}
            >
              {record.deepNightAffix.split('\n').map((line, index) => (
                <div key={index}>· {line}</div>
              ))}
            </div>
          )}
          {!record.affix && !(deepNight && record.deepNightAffix) && DASH}
        </div>
      ),
    },
    {
      title: '重点标注',
      dataIndex: 'highlight',
      key: 'highlight',
      width: 160,
      render: (value: string | null) => {
        const tags = highlightTagsOf(value);
        if (tags.length === 0) return DASH;
        return (
          <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Tag key={tag} color={HIGHLIGHT_COLORS[tag] || 'default'} style={{ marginInlineEnd: 0 }}>
                {tag}
              </Tag>
            ))}
          </span>
        );
      },
    },
    ...(showHollowLink ? [hollowLinkColumn] : []),
  ];

  const handleReset = () => {
    setKeyword('');
    setSelectedTypes([]);
    setSelectedHighlights([]);
    setDeepNight(false);
    setPage(1);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索武器 / 战技 / 词条 / 编号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 260 }}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="武器类型"
          options={typeOptions}
          value={selectedTypes}
          onChange={setSelectedTypes}
          maxTagCount="responsive"
          style={{ minWidth: 180, maxWidth: 320 }}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="重点标注"
          options={highlightOptions}
          value={selectedHighlights}
          onChange={setSelectedHighlights}
          maxTagCount="responsive"
          style={{ minWidth: 160, maxWidth: 280 }}
        />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Switch checked={deepNight} onChange={setDeepNight} />
          <span style={{ color: 'var(--theme-text-secondary)', fontSize: 13 }}>深夜模式（改价 / 诅咒词条）</span>
        </span>
        <Button onClick={handleReset}>清除所有</Button>
      </div>
      <Table<WeaponRow>
        columns={columns}
        dataSource={paged}
        rowKey={(record, index) => `${record.merchantNo ?? ''}-${record.name}-${index}`}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
        locale={{ emptyText: '没有匹配的数据' }}
      />
      <CustomPagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      {notes.length > 0 && (
        <div className="weapon-skill-magic-notes">
          <div className="weapon-skill-magic-notes-title">说明</div>
          {notes.map((note, index) => (
            <div key={index} className="weapon-skill-magic-note">
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- 普通 / 村落商人：武器 + 消耗品切换 ----
const MerchantTab: React.FC<{
  merchant: '普通商人' | '村落商人';
  showHollowLink?: boolean;
  onHollowJump?: (base: string) => void;
}> = ({ merchant, showHollowLink, onHollowJump }) => {
  const [mode, setMode] = useState<string>('武器');

  return (
    <div>
      <Segmented options={['武器', '消耗品']} value={mode} onChange={setMode} style={{ marginBottom: 16 }} />
      {mode === '武器' ? (
        <WeaponSection merchant={merchant} showHollowLink={showHollowLink} onHollowJump={onHollowJump} />
      ) : (
        <ConsumableSection rows={merchantData.consumables[merchant] ?? []} />
      )}
    </div>
  );
};

// ---- 大空洞传说商人（金武商店对应表，支持联动查询）----
interface HollowFocus {
  label: string;
  base: string;
}

const HollowLegendarySection: React.FC<{
  focus: HollowFocus | null;
  onFocusChange: (focus: HollowFocus | null) => void;
}> = ({ focus, onFocusChange }) => {
  const rows = merchantData.hollowLegendary;

  const options = useMemo(
    () => rows.flatMap((row) => row.smallWeapons).map((value) => ({ value, label: value })),
    [rows],
  );

  const matchedIndexes = useMemo(() => {
    if (!focus) return null;
    const set = new Set<number>();
    rows.forEach((row, index) => {
      if (row.smallWeapons.some((weapon) => stripVariant(weapon) === focus.base)) {
        set.add(index);
      }
    });
    return set;
  }, [focus, rows]);

  const focusRows = useMemo(() => {
    if (!matchedIndexes) return [];
    return rows.filter((_row, index) => matchedIndexes.has(index));
  }, [rows, matchedIndexes]);

  const columns: ColumnsType<HollowRow> = [
    {
      title: '小商店武器',
      key: 'smallWeapons',
      width: 340,
      render: (_value, record) => (
        <div>
          {record.smallWeapons.map((weapon, index) => (
            <div key={index}>{weapon}</div>
          ))}
        </div>
      ),
    },
    {
      title: '金商店对应武器 / 效果',
      key: 'goldenItems',
      render: (_value, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {record.goldenItems.map((item, index) => {
            const label = `${item.name}${item.effect ? `（${item.effect}）` : ''}`;
            return item.highlighted ? (
              <Tag key={index} color="red" style={{ marginInlineEnd: 0, fontWeight: 600 }}>
                {label}
              </Tag>
            ) : (
              <Tag key={index} style={{ marginInlineEnd: 0 }}>
                {label}
              </Tag>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="大空洞金武商店对应规则"
        description="普通商人出售对应小商店武器时，大空洞的金武商店会必定刷出该行对应的金色传说武器（括号内为对应效果）。红色标签为资料图中红框标注的重点对应。数据来自黑环资料图（旧版本），v1.03.5 未对其改动。"
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Select
          allowClear
          showSearch
          placeholder="选择普通商人出售的武器 → 查看必定刷出的金武"
          options={options}
          value={focus?.label ?? null}
          onChange={(value) => onFocusChange(value ? { label: value, base: stripVariant(value) } : null)}
          style={{ width: 400 }}
        />
        {focus && <Button onClick={() => onFocusChange(null)}>清除</Button>}
      </div>
      {focus && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          title="联动结果"
          description={
            <div style={{ whiteSpace: 'pre-line' }}>
              {focusRows
                .map(
                  (row) => `${row.smallWeapons.join(' / ')} → ${row.goldenItems.map((item) => item.name).join('、')}`,
                )
                .join('\n')}
            </div>
          }
        />
      )}
      <Table<HollowRow>
        columns={columns}
        dataSource={rows}
        rowKey={(_record, index) => String(index)}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
        onRow={(_record, index) => {
          if (!matchedIndexes) return {};
          if (matchedIndexes.has(index ?? -1)) {
            return { style: { background: 'rgba(24, 144, 255, 0.12)' } };
          }
          return { style: { opacity: 0.35 } };
        }}
      />
    </div>
  );
};

// ---- 不可购买的灵药露滴 ----
const TearsSection: React.FC = () => {
  const rows = merchantData.unpurchasableTears;

  const columns: ColumnsType<TearRow> = [
    { title: '物品名称', dataIndex: 'name', key: 'name', width: 220 },
    { title: '效果说明', dataIndex: 'effect', key: 'effect', render: (value: string | null) => value ?? DASH },
  ];

  return (
    <div>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        title="以下灵药露滴无法通过商人购买"
        description="摘自小辛的商人表，供查询对照。"
      />
      <Table<TearRow>
        columns={columns}
        dataSource={rows}
        rowKey={(record, index) => `${record.name}-${index}`}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
      />
    </div>
  );
};

interface MerchantViewProps {
  activeSubTab?: string;
}

const MerchantView: React.FC<MerchantViewProps> = ({ activeSubTab }) => {
  const [activeTab, setActiveTab] = useState('普通商人');
  const [hollowFocus, setHollowFocus] = useState<HollowFocus | null>(null);

  // 普通商人武器表点击「联动金武」标签：跳到大空洞传说商人并定位对应行
  const handleHollowJump = (base: string) => {
    setHollowFocus({ label: base, base });
    setActiveTab('大空洞传说商人');
  };

  useEffect(() => {
    if (activeSubTab && TAB_KEYS.includes(activeSubTab)) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="content-wrapper">
      <Tabs
        type="card"
        style={{ marginTop: '20px' }}
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: '普通商人',
            label: '🧾 普通商人',
            children: (
              <div id="merchant-normal">
                <MerchantTab merchant="普通商人" showHollowLink onHollowJump={handleHollowJump} />
              </div>
            ),
          },
          {
            key: '村落商人',
            label: '🏘️ 村落商人',
            children: (
              <div id="merchant-village">
                <MerchantTab merchant="村落商人" />
              </div>
            ),
          },
          {
            key: '黄金树商人',
            label: '🌳 黄金树商人',
            children: (
              <div id="merchant-golden-tree">
                <ConsumableSection rows={merchantData.consumables['黄金树商人'] ?? []} />
              </div>
            ),
          },
          {
            key: '大空洞传说商人',
            label: '🕳️ 大空洞传说商人',
            children: (
              <div id="merchant-hollow-legendary">
                <HollowLegendarySection focus={hollowFocus} onFocusChange={setHollowFocus} />
              </div>
            ),
          },
          {
            key: '不可购买露滴',
            label: '💧 不可购买露滴',
            children: (
              <div id="merchant-unpurchasable-tears">
                <TearsSection />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default MerchantView;
