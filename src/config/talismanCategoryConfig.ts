/**
 * 护符词条的「分类」标签配置
 *
 * 分类来源：恶魔商人护符池（ItemTableParam 4000201 / 4000202 / 4000203），
 * 即游戏内商人出售时的三档分类；两个不进池的护符归到「其他」。
 */
export interface TalismanCategoryMeta {
  label: string;
  /** antd Tag 颜色 */
  color: string;
  /** 下拉选项的右侧说明（HintOption） */
  hint: string;
}

export const TALISMAN_CATEGORY_ORDER = ['属性抗性类', '增伤类', '杂项类', '其他'] as const;

export const TALISMAN_CATEGORIES: Record<string, TalismanCategoryMeta> = {
  属性抗性类: { label: '属性抗性类', color: 'blue', hint: '提升各类抗性 / 异常耐性' },
  增伤类: { label: '增伤类', color: 'red', hint: '提升攻击、伤害或触发增伤' },
  杂项类: { label: '杂项类', color: 'purple', hint: '观察力、卢恩、恢复、功能性' },
  其他: { label: '其他', color: 'default', hint: '不进护符池：牺牲细枝、贪欲者的烙印' },
};
