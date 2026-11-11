import React from 'react';
import { Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import flameJson from '../data/zh-CN/black_flame_data.json';
import type { BlackFlameData, BlackFlameMaxHpRow, BlackFlameRow, BossHpEffectRow } from '../types';
import styles from '../styles/blackFlameView.module.css';

const DATA = flameJson as unknown as BlackFlameData;

const BlackFlameView: React.FC = () => {
  const columns: TableColumnsType<BlackFlameRow> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (id: string) => <span className={styles.mono}>{id}</span>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '22%',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '8%',
      align: 'center',
      render: (type: string) =>
        type === '黑焰' ? <Tag color="volcano">黑焰</Tag> : <Tag color="purple">死亡灼烧</Tag>,
    },
    {
      title: '每跳伤害',
      dataIndex: 'tick',
      key: 'tick',
      width: '14%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: '跳间隔',
      dataIndex: 'interval',
      key: 'interval',
      width: '10%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: '持续',
      dataIndex: 'duration',
      key: 'duration',
      width: '10%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    { title: '说明', dataIndex: 'note', key: 'note' },
  ];

  const maxHpColumns: TableColumnsType<BlackFlameMaxHpRow> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (id: string) => <span className={styles.mono}>{id}</span>,
    },
    { title: '来源', dataIndex: 'source', key: 'source', width: '24%' },
    {
      title: '效果',
      dataIndex: 'effect',
      key: 'effect',
      width: '14%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: '持续',
      dataIndex: 'duration',
      key: 'duration',
      width: '10%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    { title: '说明', dataIndex: 'note', key: 'note' },
  ];

  const bossColumns: TableColumnsType<BossHpEffectRow> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: '12%',
      render: (id: string) => <span className={styles.mono}>{id}</span>,
    },
    { title: '来源', dataIndex: 'source', key: 'source', width: '22%' },
    {
      title: '效果',
      dataIndex: 'effect',
      key: 'effect',
      width: '18%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: '持续',
      dataIndex: 'duration',
      key: 'duration',
      width: '9%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    { title: '说明', dataIndex: 'note', key: 'note' },
  ];

  return (
    <div className={styles.wrap} id="black-flame-mechanics">
      <p className={styles.intro}>{DATA.intro}</p>

      <Table columns={columns} dataSource={DATA.rows} rowKey="id" size="small" bordered pagination={false} />

      <h4 className={styles.subtitle}>扣血上限（Destined Death）</h4>
      <p className={styles.subIntro}>{DATA.maxHp.intro}</p>
      <Table columns={maxHpColumns} dataSource={DATA.maxHp.rows} rowKey="id" size="small" bordered pagination={false} />

      <h4 className={styles.subtitle}>Boss 施加的扣血上限</h4>
      <p className={styles.subIntro}>{DATA.bossEffects.intro}</p>
      <Table
        columns={bossColumns}
        dataSource={DATA.bossEffects.rows}
        rowKey="id"
        size="small"
        bordered
        pagination={false}
      />

      <div className={styles.source}>
        数据来自 {DATA.meta.source}；{DATA.meta.verified}。{DATA.meta.note}
      </div>
    </div>
  );
};

export default BlackFlameView;
