import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import skillsJson from '@/data/zh-CN/everdark-lipula-skills.json';
import type { LipulaSkill, LipulaSkillsData } from '@/types';
import styles from './lipula.module.css';

const DATA = skillsJson as unknown as LipulaSkillsData;

const skillFooter = () => (
  <div className="footer-text">
    {DATA.notes.map((note) => (
      <div key={note.title}>
        ◦ {note.title}：{note.desc}
      </div>
    ))}
  </div>
);

const LipulaSkills: React.FC = () => {
  const columns: ColumnsType<LipulaSkill> = [
    {
      title: '#',
      key: 'index',
      width: 56,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '技能提示',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (title: string) => (
        <div className={styles.skillTitleCell}>
          <strong>{title}</strong>
        </div>
      ),
    },
    {
      title: '效果',
      dataIndex: 'desc',
      key: 'desc',
      render: (desc: string) => <div className={styles.skillDescCell}>{desc}</div>,
    },
    {
      title: '数值 / 来源',
      dataIndex: 'values',
      key: 'values',
      width: '32%',
      render: (values?: string[]) => (
        <div className={styles.skillValueList}>
          {(values ?? []).map((value) => (
            <Tag key={value} color={/待查|待确认/.test(value) ? 'warning' : 'default'} className={styles.skillValueTag}>
              {value}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div id="lipula-skills">
      <p className={styles.skillHint}>永夜形态追加的诅咒技能；数值来自 Smithbox 解包，技能提示保留原文。</p>
      <Table
        columns={columns}
        dataSource={DATA.skills}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
        footer={skillFooter}
      />
    </div>
  );
};

export default LipulaSkills;
