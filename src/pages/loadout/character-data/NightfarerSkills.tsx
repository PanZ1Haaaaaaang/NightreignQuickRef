import React, { useMemo, useState } from 'react';
import { Input, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import skillJson from '../../../data/zh-CN/nightfarer-skills.json';
import type { NightfarerSkillData, NightfarerSkillRow } from '../../../types';
import { abilityKindOf } from '../../../assets/icons/abilities';
import AbilityIcon from '../../../components/common/AbilityIcon';
import CharacterAvatar from '../../../components/common/CharacterAvatar';
import { renderImpulseText } from '../../../components/common/renderImpulseText';
import styles from './nightfarerSkills.module.css';

const DATA = skillJson as unknown as NightfarerSkillData;

/** 连续同一角色的行合并 */
const groupSpans = (rows: NightfarerSkillRow[]) => {
  const spans: Record<number, number> = {};
  let i = 0;
  while (i < rows.length) {
    let j = i;
    while (j + 1 < rows.length && rows[j + 1].character === rows[i].character) j += 1;
    spans[i] = j - i + 1;
    i = j + 1;
  }
  return spans;
};

const NightfarerSkills: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  const rows = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return DATA.rows;
    return DATA.rows.filter(
      (row) => row.character.includes(kw) || row.skill.includes(kw) || row.note.includes(kw) || row.base.includes(kw),
    );
  }, [keyword]);

  const spans = useMemo(() => groupSpans(rows), [rows]);

  const columns: TableColumnsType<NightfarerSkillRow> = [
    {
      title: '角色',
      dataIndex: 'character',
      key: 'character',
      width: '8%',
      align: 'center',
      onCell: (_, index) => ({ rowSpan: spans[index ?? 0] ?? 0 }),
      render: (name: string) => <CharacterAvatar name={name} size={18} className={styles.character} />,
    },
    {
      title: '技能',
      dataIndex: 'skill',
      key: 'skill',
      width: '21%',
      render: (skill: string, record) => {
        const separator = skill.indexOf('：');
        const type = separator < 0 ? skill : skill.slice(0, separator);
        const name = skill.slice(separator + 1);
        const kind = abilityKindOf(type);
        return (
          <Tooltip title={type} placement="top" mouseEnterDelay={0.2}>
            <span className={`${styles.skill}${kind ? '' : ' ' + styles.skillNoIcon}`}>
              {kind && <AbilityIcon character={record.character} kind={kind} size={22} />}
              <span>{name}</span>
            </span>
          </Tooltip>
        );
      },
    },
    { title: '基础值', dataIndex: 'base', key: 'base', width: '16%' },
    { title: '补正', dataIndex: 'scaling', key: 'scaling', width: '19%' },
    { title: '削韧', dataIndex: 'poise', key: 'poise', width: '12%' },
    { title: '救人值', dataIndex: 'rescue', key: 'rescue', width: '9%', align: 'center' },
    { title: '备注', dataIndex: 'note', key: 'note', render: renderImpulseText },
  ];

  return (
    <div className={styles.wrap} id="nightfarer-skills">
      <div className={styles.toolbar}>
        <span className={styles.hint}>共 {DATA.rows.length} 条技能数据</span>
        <Input
          allowClear
          placeholder="搜索角色 / 技能 / 备注"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 220 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(row) => `${row.character}-${row.skill}`}
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: '没有匹配的技能' }}
      />

      <div className={styles.source}>
        数据来自「{DATA.meta.title}」（作者：{DATA.meta.author}，{DATA.meta.version}）。
        {DATA.meta.patchNote ? <div className={styles.patchNote}>{DATA.meta.patchNote}</div> : null}
      </div>
    </div>
  );
};

export default NightfarerSkills;
