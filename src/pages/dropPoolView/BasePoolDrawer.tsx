import { Drawer, Grid, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import type { DropBasePool, DropKind } from '../../types';
import { KIND_CLASS } from './poolKinds';
import styles from '../../styles/dropPoolView.module.css';

/** 元素 / 异常码：取池 ID 末四位的前两位，如 2000952 = 冻伤版窄蓝 */
const ELEMENT_CODES: Array<[code: string, name: string]> = [
  ['05', '火焰'],
  ['06', '雷电'],
  ['07', '神圣'],
  ['08', '魔力'],
  ['09', '冻伤'],
  ['10', '中毒'],
  ['11', '出血'],
  ['13', '腐败'],
  ['14', '睡眠'],
  ['15', '癫火'],
];

interface BasePoolDrawerProps {
  open: boolean;
  onClose: () => void;
  basePools: DropBasePool[];
  kinds: Record<DropKind, string>;
}

/**
 * 基池对照表：12 个基池的名称 / 池 ID / 条目数 / 说明。
 * 放在抽屉里，页面本身只留一行入口，不占纵向空间；窄屏下把「名称 + ID + 条目数」并成一格。
 */
const BasePoolDrawer: React.FC<BasePoolDrawerProps> = ({ open, onClose, basePools, kinds }) => {
  const screens = Grid.useBreakpoint();
  const narrow = screens.md === false;

  const renderName = (pool: DropBasePool) => (
    <Tag className={`${styles.basePoolTag} ${KIND_CLASS[pool.kind] ?? ''}`}>{kinds[pool.kind]}</Tag>
  );

  const renderIds = (pool: DropBasePool) => <span className={styles.basePoolId}>{pool.ids.join(' / ')}</span>;

  const noteColumn = {
    title: '说明',
    dataIndex: 'note',
    key: 'note',
    render: (note: string) => <span className={styles.basePoolNote}>{note}</span>,
  };

  const columns: TableColumnsType<DropBasePool> = narrow
    ? [
        {
          title: '基池',
          key: 'kind',
          width: 126,
          render: (_, pool) => (
            <div className={styles.basePoolCell}>
              {renderName(pool)}
              <div className={styles.basePoolMeta}>
                {renderIds(pool)} · {pool.count}
              </div>
            </div>
          ),
        },
        noteColumn,
      ]
    : [
        {
          title: '名称',
          key: 'kind',
          width: 104,
          render: (_, pool) => renderName(pool),
        },
        {
          title: '池 ID',
          key: 'ids',
          width: 124,
          render: (_, pool) => renderIds(pool),
        },
        {
          title: '条目数',
          dataIndex: 'count',
          key: 'count',
          width: 68,
          align: 'right',
          render: (count: number) => <span className={styles.basePoolCount}>{count}</span>,
        },
        noteColumn,
      ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="min(660px, 100vw)"
      // 站内左上角的 fixed-logo 是 z-index 1050，默认 1000 的抽屉在窄屏会盖住关闭按钮
      zIndex={1100}
      title={
        <div className={styles.basePoolTitle}>
          <span className={styles.basePoolTitleMain}>基池对照表</span>
          <span className={styles.basePoolTitleSub}>12 个基池 · 条目数按基础武器 ID 去重，已剔除权重 0 的空占位</span>
        </div>
      }
      styles={{ body: { padding: '12px 16px 20px' } }}
    >
      <Table<DropBasePool>
        className="base-pool-table"
        columns={columns}
        dataSource={basePools}
        rowKey="kind"
        size="small"
        bordered
        pagination={false}
        tableLayout="fixed"
      />

      <div className={styles.basePoolNotes}>
        <div>武器池 / 角色池是同一套武器，角色池只是「按角色分配」；「窄」池 = 战灰可换的武器。</div>
        <div>
          蓝武器池另有一套权重 <b>7910020</b>（45/45/10，矿洞 / 监牢变异），页面统一标 <b>7910021</b>（20/40/40）。
        </div>
        <div>元素 / 异常码 = 池 ID 末四位的前两位：</div>
        <div className={styles.elementCodes}>
          {ELEMENT_CODES.map(([code, name]) => (
            <span key={code} className={styles.elementCode}>
              <b>{code}</b> {name}
            </span>
          ))}
        </div>
        <div>组合池（如 7010052）= 25% 原版 + 75% 变体，魔力档多一档 20% 触媒。</div>
      </div>
    </Drawer>
  );
};

export default BasePoolDrawer;
