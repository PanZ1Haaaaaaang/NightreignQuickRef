import React from 'react';
import { Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import impulseJson from '../data/zh-CN/impulse_data.json';
import type { ImpulseData, ImpulseRow } from '../types';
import styles from '../styles/impulseView.module.css';

const DATA = impulseJson as unknown as ImpulseData;

const DASH = <span className={styles.muted}>—</span>;

const ImpulseView: React.FC = () => {
  const columns: TableColumnsType<ImpulseRow> = [
    {
      title: '冲击力',
      dataIndex: 'level',
      key: 'level',
      width: '7%',
      align: 'center',
      render: (level: number) => <span className={styles.level}>{level}</span>,
    },
    {
      title: '效果',
      dataIndex: 'effect',
      key: 'effect',
      width: '12%',
      render: (effect: string, record) => (
        <span className={record.level === 12 ? styles.deprecated : undefined}>{effect}</span>
      ),
    },
    {
      title: '硬直动画编号',
      dataIndex: 'anim',
      key: 'anim',
      width: '10%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: '玩家模型硬直长度',
      children: [
        {
          title: '到可翻滚',
          dataIndex: 'roll',
          key: 'roll',
          width: '7%',
          align: 'right',
          render: (v: number | null) => (v === null ? DASH : <span className={styles.mono}>{v} 帧</span>),
        },
        {
          title: '到可使用战技',
          dataIndex: 'skill',
          key: 'skill',
          width: '8%',
          align: 'right',
          render: (v: number | null) => (v === null ? DASH : <span className={styles.mono}>{v} 帧</span>),
        },
      ],
    },
    {
      title: '硬直动画无敌帧',
      dataIndex: 'invuln',
      key: 'invuln',
      width: '9%',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    { title: '示例', dataIndex: 'examples', key: 'examples', width: '27%' },
    {
      title: '可否打断敌方动作',
      dataIndex: 'interrupt',
      key: 'interrupt',
      width: '10%',
      render: (v: string) => (v === '可打断' ? <Tag color="green">可打断</Tag> : <Tag color="default">{v}</Tag>),
    },
    {
      title: '无视韧性系统',
      dataIndex: 'ignorePoise',
      key: 'ignorePoise',
      width: '9%',
      align: 'center',
      render: (ignore: boolean) => (ignore ? <Tag color="red">无视</Tag> : <Tag color="default">不无视</Tag>),
    },
  ];

  return (
    <div className={styles.wrap} id="impulse-mechanics">
      <div className={styles.notes}>
        {DATA.notes.map((note) => (
          <div key={note} className={styles.noteItem}>
            {note}
          </div>
        ))}
      </div>

      <Table
        columns={columns}
        dataSource={DATA.rows}
        rowKey="level"
        size="small"
        bordered
        pagination={false}
        rowClassName={(record) =>
          record.level === 12 ? styles.deprecatedRow : [4, 7, 10].includes(record.level) ? styles.knockdownRow : ''
        }
      />

      <div className={styles.source}>
        数据来自 {DATA.meta.source} 的冲击力视频；4/7/10 号行标红底，表示受击方为玩家时「无视韧性、但改为站立硬直」。
        具体说明见{' '}
        <a href={DATA.meta.videoUrl} target="_blank" rel="noreferrer">
          bilibili 视频
        </a>
        。
      </div>
    </div>
  );
};

export default ImpulseView;
