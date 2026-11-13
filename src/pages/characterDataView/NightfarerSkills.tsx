import React, { useMemo, useState } from 'react';
import { Input, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import skillJson from '../../data/zh-CN/nightfarer_skill_data.json';
import type { NightfarerSkillData, NightfarerSkillRow } from '../../types';
import { characterIconOf } from './characterIcons';
import styles from '../../styles/nightfarerSkills.module.css';

const DATA = skillJson as unknown as NightfarerSkillData;

// 渡夜者能力 / 技艺 / 绝招图标（文件名：<英文名><PassiveAbility|CharacterSkill|UltimateArt>.png）
const CHAR_EN: Record<string, string> = {
  追踪者: 'Wylder',
  守护者: 'Guardian',
  无赖: 'Raider',
  女爵: 'Duchess',
  隐士: 'Recluse',
  铁之眼: 'Ironeye',
  执行者: 'Executor',
  复仇者: 'Revenant',
  学者: 'Scholar',
  送葬者: 'Undertaker',
};

const CHAR_IMAGES = import.meta.glob('../../assets/char/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const SKILL_SUFFIX: Record<string, string> = {
  能力: 'PassiveAbility',
  技艺: 'CharacterSkill',
  绝招: 'UltimateArt',
};

const skillIconOf = (character: string, type: string) => {
  const en = CHAR_EN[character];
  const suffix = SKILL_SUFFIX[type];
  return en && suffix ? CHAR_IMAGES[`../../assets/char/${en}${suffix}.png`] : undefined;
};

const SKILL_TYPE_COLOR: Record<string, string> = {
  能力: 'blue',
  技艺: 'green',
  绝招: 'volcano',
  遗物效果: 'purple',
  遗物: 'purple',
};

const skillTypeOf = (skill: string) => {
  const type = skill.split('：')[0];
  return { type, color: SKILL_TYPE_COLOR[type] ?? 'default' };
};

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
      render: (name: string) => {
        const icon = characterIconOf(name);
        return (
          <span className={styles.character}>
            {icon ? <img src={icon} alt="" className={styles.characterIcon} /> : null}
            <span>{name}</span>
          </span>
        );
      },
    },
    {
      title: '技能',
      dataIndex: 'skill',
      key: 'skill',
      width: '21%',
      render: (skill: string, record) => {
        const { type } = skillTypeOf(skill);
        const name = skill.includes('：') ? skill.slice(skill.indexOf('：') + 1) : skill;
        const icon = skillIconOf(record.character, type);
        return (
          <Tooltip title={type} placement="top" mouseEnterDelay={0.2}>
            <span className={`${styles.skill}${icon ? '' : ' ' + styles.skillNoIcon}`}>
              {icon ? <img src={icon} alt="" className={styles.skillIcon} /> : null}
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
    { title: '备注', dataIndex: 'note', key: 'note' },
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
