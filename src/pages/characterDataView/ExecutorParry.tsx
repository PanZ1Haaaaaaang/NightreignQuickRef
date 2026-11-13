import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import parryJson from '../../data/zh-CN/executor_parry_data.json';
import type {
  ExecutorParryData,
  ExecutorParryFrameRow,
  ExecutorParryImpactRow,
  ExecutorParryOtherRow,
} from '../../types';
import styles from '../../styles/executorParry.module.css';

const DATA = parryJson as unknown as ExecutorParryData;

const frameColumns: TableColumnsType<ExecutorParryFrameRow> = [
  { title: '动作', dataIndex: 'action', key: 'action', width: '20%' },
  { title: '弹刀窗口', dataIndex: 'window', key: 'window', width: '14%', align: 'center' },
  { title: '实际时间', dataIndex: 'time', key: 'time', width: '12%', align: 'center' },
  { title: '可衔接下一次防御', dataIndex: 'next', key: 'next', width: '18%', align: 'center' },
  { title: '备注', dataIndex: 'note', key: 'note' },
];

const impactColumns: TableColumnsType<ExecutorParryImpactRow> = [
  { title: '冲击力', dataIndex: 'impact', key: 'impact', width: '26%' },
  { title: '示例', dataIndex: 'example', key: 'example', width: '30%' },
  { title: '弹刀成功动画', dataIndex: 'anim', key: 'anim', width: '22%', align: 'center' },
  { title: '开刃累积值', dataIndex: 'accum', key: 'accum', width: '22%', align: 'center' },
];

const otherColumns: TableColumnsType<ExecutorParryOtherRow> = [
  { title: '其他动作', dataIndex: 'action', key: 'action' },
  { title: '开刃累积值', dataIndex: 'accum', key: 'accum', width: '30%', align: 'center' },
];

const ExecutorParry: React.FC = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        {DATA.intro.map((text) => (
          <p key={text} className={styles.paragraph}>
            {text}
          </p>
        ))}
      </div>

      <div className={styles.statGrid}>
        {DATA.basics.map((item) => (
          <div key={item.label} className={styles.statCard}>
            <span className={styles.statLabel}>{item.label}</span>
            <span className={styles.statValue}>{item.value}</span>
            {item.note ? <span className={styles.statNote}>{item.note}</span> : null}
          </div>
        ))}
      </div>
      <p className={styles.paragraph}>{DATA.basicsNote}</p>

      <h4 className={styles.heading}>弹刀帧一览（30 帧基准）</h4>
      <Table
        columns={frameColumns}
        dataSource={DATA.frameRows}
        rowKey={(row) => row.action}
        size="small"
        bordered
        pagination={false}
      />
      <p className={styles.paragraph}>{DATA.frameNote}</p>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h4 className={styles.heading}>抖刀限制</h4>
          <ul className={styles.list}>
            {DATA.shakerNotes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
        <section className={styles.card}>
          <h4 className={styles.heading}>连续弹刀</h4>
          <ul className={styles.list}>
            {DATA.comboNotes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.card}>
        <h4 className={styles.heading}>妖刀开刃</h4>
        <p className={styles.paragraph}>{DATA.blade.summary}</p>
        <p className={styles.paragraph}>{DATA.blade.effect}</p>
        <Table
          columns={impactColumns}
          dataSource={DATA.blade.rows}
          rowKey={(row) => row.impact}
          size="small"
          bordered
          pagination={false}
        />
        <div className={styles.otherTable}>
          <Table
            columns={otherColumns}
            dataSource={DATA.blade.otherRows}
            rowKey={(row) => row.action}
            size="small"
            bordered
            pagination={false}
          />
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.heading}>结论</h4>
        <ol className={styles.list}>
          {DATA.conclusions.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
      </section>

      <div className={styles.source}>
        资料整理：{DATA.meta.author}
        <a href={DATA.meta.url} target="_blank" rel="noreferrer">
          《{DATA.meta.title}》
        </a>
        ；动作为 {DATA.meta.frameBase} 帧基准，数据对应 App Ver. {DATA.meta.appVersion}。
      </div>
    </div>
  );
};

export default ExecutorParry;
