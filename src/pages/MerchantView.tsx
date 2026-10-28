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
  /** 该金武组对应的普通商人编号（来自源表「快速检索」sheet 的权威映射） */
  merchantNos?: number[];
  /** 金武组简称（如「剑骸」），用于商人编号列的 Tag 展示 */
  tag?: string;
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

// 商人编号 -> 大空洞金武组（每个普通商人都固定对应一组，来自源表「快速检索」的权威映射）
const MERCHANT_HOLLOW_LINKS: Record<string, HollowRow> = {};
merchantData.hollowLegendary.forEach((row) => {
  (row.merchantNos ?? []).forEach((no) => {
    MERCHANT_HOLLOW_LINKS[`${no}号`] = row;
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

// 消耗品出现规则是否覆盖指定商人编号。
// 仅解析「出现于X商人0号~6号、14号~20号」这类区间；固定出现/固定不出现交由 available 逻辑处理。
const ruleMatchesMerchantNo = (rule: string | null, merchantNo: string): boolean => {
  const ranges = [...(rule ?? '').matchAll(/(\d+)号~(\d+)号/g)];
  if (ranges.length === 0) return true;
  const num = parseInt(merchantNo, 10);
  if (Number.isNaN(num)) return true;
  return ranges.some(([, a, b]) => num >= Number(a) && num <= Number(b));
};

// ---- 消耗品表 ----
const ConsumableSection: React.FC<{ rows: ConsumableRow[]; merchantNo?: string | null }> = ({
  rows,
  merchantNo = null,
}) => {
  const [keyword, setKeyword] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      if (!showUnavailable && !row.available) return false;
      if (merchantNo && !ruleMatchesMerchantNo(row.rule, merchantNo)) return false;
      if (!k) return true;
      return [row.name, row.rule, row.effect].some((v) => (v ?? '').toLowerCase().includes(k));
    });
  }, [rows, keyword, showUnavailable, merchantNo]);

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
  onHollowJump?: (merchantNo: string) => void;
  merchantNo?: string | null;
}> = ({ merchant, showHollowLink = false, onHollowJump, merchantNo = null }) => {
  const allRows = useMemo(() => merchantData.weapons[merchant] ?? [], [merchant]);
  const rows = useMemo(
    () => (merchantNo ? allRows.filter((row) => row.merchantNo === merchantNo) : allRows),
    [allRows, merchantNo],
  );
  const notes = merchantData.meta.weaponTypeNotes[merchant] ?? [];

  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [deepNight, setDeepNight] = useState(true);
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
  }, [keyword, selectedTypes, selectedHighlights, deepNight, merchantNo]);

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
      render: (value: string | null) => {
        if (!value) return DASH;
        const link = showHollowLink ? MERCHANT_HOLLOW_LINKS[value] : undefined;
        if (!link) return value;
        const content = (
          <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>大空洞金武商店必定出售：</div>
            <div>
              {link.goldenItems.map((item) => `${item.name}${item.effect ? `（${item.effect}）` : ''}`).join('、')}
            </div>
            <div style={{ color: '#8c8c8c', marginTop: 6 }}>触发武器：{link.smallWeapons.join('、')}</div>
          </div>
        );
        return (
          <Popover content={content} title="大空洞联动" placement="right">
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => onHollowJump?.(value)}>
                {value}
              </span>
              {link.tag && (
                <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                  {link.tag}
                </Tag>
              )}
            </div>
          </Popover>
        );
      },
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
      render: (_value, record) => {
        // 深夜模式：诅咒词条覆盖显示（空=没改动，仍显示普通词条）
        // 第三行为负面词条，红色区分
        if (deepNight && record.deepNightAffix) {
          const lines = record.deepNightAffix.split('\n');
          return (
            <div style={{ whiteSpace: 'pre-line' }}>
              {lines.map((line, index) => (
                <div key={index} style={{ color: index === 2 ? '#ff4d4f' : '#d46b08' }}>
                  · {line}
                </div>
              ))}
            </div>
          );
        }
        if (record.affix) return <span style={{ whiteSpace: 'pre-line' }}>{record.affix}</span>;
        return DASH;
      },
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
  ];

  const handleReset = () => {
    setKeyword('');
    setSelectedTypes([]);
    setSelectedHighlights([]);
    setDeepNight(true);
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
  onHollowJump?: (merchantNo: string) => void;
  merchantNo?: string | null;
}> = ({ merchant, showHollowLink, onHollowJump, merchantNo }) => {
  const [mode, setMode] = useState<string>('武器');

  return (
    <div>
      <Segmented options={['武器', '消耗品']} value={mode} onChange={setMode} style={{ marginBottom: 16 }} />
      {mode === '武器' ? (
        <WeaponSection
          merchant={merchant}
          showHollowLink={showHollowLink}
          onHollowJump={onHollowJump}
          merchantNo={merchantNo}
        />
      ) : (
        <ConsumableSection rows={merchantData.consumables[merchant] ?? []} merchantNo={merchantNo} />
      )}
    </div>
  );
};

// ---- 大空洞传说商人（金武商店对应表，支持联动查询）----
interface HollowFocus {
  label: string;
  base: string;
  /** 精确定位到某一行（按商人编号跳转时使用，避免同名武器多行误匹配） */
  rowIndex?: number;
}

const HollowLegendarySection: React.FC<{
  focus: HollowFocus | null;
  onFocusChange: (focus: HollowFocus | null) => void;
  selectedMerchantNo?: string | null;
}> = ({ focus, onFocusChange, selectedMerchantNo = null }) => {
  const rows = merchantData.hollowLegendary;

  const options = useMemo(
    () => rows.flatMap((row) => row.smallWeapons).map((value) => ({ value, label: value })),
    [rows],
  );

  // 手动查询优先；未查询时按全局商人编号自动定位对应金武组
  const activeFocus = useMemo(() => {
    if (focus) return focus;
    if (selectedMerchantNo) {
      const num = parseInt(selectedMerchantNo, 10);
      const index = rows.findIndex((row) => row.merchantNos?.includes(num));
      if (index >= 0) {
        const row = rows[index];
        return { label: row.smallWeapons[0], base: stripVariant(row.smallWeapons[0]), rowIndex: index };
      }
    }
    return null;
  }, [focus, selectedMerchantNo, rows]);

  const matchedIndexes = useMemo(() => {
    if (!activeFocus) return null;
    if (activeFocus.rowIndex != null) return new Set([activeFocus.rowIndex]);
    const set = new Set<number>();
    rows.forEach((row, index) => {
      if (row.smallWeapons.some((weapon) => stripVariant(weapon) === activeFocus.base)) {
        set.add(index);
      }
    });
    return set;
  }, [activeFocus, rows]);

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
          value={activeFocus?.label ?? null}
          onChange={(value) => onFocusChange(value ? { label: value, base: stripVariant(value) } : null)}
          style={{ width: 400 }}
        />
        {focus && <Button onClick={() => onFocusChange(null)}>清除</Button>}
      </div>
      {activeFocus && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          title={selectedMerchantNo && !focus ? `${selectedMerchantNo} 联动结果` : '联动结果'}
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

const MERCHANT_NO_OPTIONS = Array.from({ length: 21 }, (_, i) => ({ value: `${i}号`, label: `${i}号` }));

const MerchantView: React.FC<MerchantViewProps> = ({ activeSubTab }) => {
  const [activeTab, setActiveTab] = useState('普通商人');
  const [hollowFocus, setHollowFocus] = useState<HollowFocus | null>(null);
  // 本局商人编号：同一对局内普通/村落/黄金树商人为同一编号，并联动大空洞金武组
  const [merchantNo, setMerchantNo] = useState<string | null>(null);

  // 普通商人武器表点击编号：跳到大空洞传说商人并精确定位对应金武组
  const handleHollowJump = (no: string) => {
    const num = parseInt(no, 10);
    const index = merchantData.hollowLegendary.findIndex((row) => row.merchantNos?.includes(num));
    if (index >= 0) {
      const row = merchantData.hollowLegendary[index];
      setHollowFocus({ label: row.smallWeapons[0], base: stripVariant(row.smallWeapons[0]), rowIndex: index });
    } else {
      setHollowFocus(null);
    }
    setActiveTab('大空洞传说商人');
  };

  useEffect(() => {
    if (activeSubTab && TAB_KEYS.includes(activeSubTab)) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="content-wrapper">
      <div
        style={{
          marginTop: '20px',
          marginBottom: '4px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 600 }}>本局商人编号</span>
        <Select
          allowClear
          placeholder="全部"
          options={MERCHANT_NO_OPTIONS}
          value={merchantNo}
          onChange={setMerchantNo}
          style={{ width: 120 }}
        />
      </div>
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: '普通商人',
            label: '🧾 普通商人',
            children: (
              <div id="merchant-normal">
                <MerchantTab
                  merchant="普通商人"
                  showHollowLink
                  onHollowJump={handleHollowJump}
                  merchantNo={merchantNo}
                />
              </div>
            ),
          },
          {
            key: '村落商人',
            label: '🏘️ 村落商人',
            children: (
              <div id="merchant-village">
                <MerchantTab merchant="村落商人" merchantNo={merchantNo} />
              </div>
            ),
          },
          {
            key: '黄金树商人',
            label: '🌳 黄金树商人',
            children: (
              <div id="merchant-golden-tree">
                <ConsumableSection rows={merchantData.consumables['黄金树商人'] ?? []} merchantNo={merchantNo} />
              </div>
            ),
          },
          {
            key: '大空洞传说商人',
            label: '🕳️ 大空洞传说商人',
            children: (
              <div id="merchant-hollow-legendary">
                <HollowLegendarySection
                  focus={hollowFocus}
                  onFocusChange={setHollowFocus}
                  selectedMerchantNo={merchantNo}
                />
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
