/**
 * 潜在能力池的展示配置（池的 key 与「局内-潜在能力」词条里的 pools 字段一致）
 *
 * 池的 key 来源：解包 ItemTableParam
 * - normal 4200100 / purple 4200200 / night1 4200210 / night1b 4200220 / night2 4200300
 */
export interface PotentialPoolTagMeta {
  /** 标签文字（词条页、掉落池页面共用） */
  label: string;
  /** 悬停说明（仅词条页使用；掉落池页面不搭配悬停） */
  tip: string;
  /** antd Tag 颜色 */
  color: string;
}

export const POTENTIAL_POOL_TAGS: Record<string, PotentialPoolTagMeta> = {
  normal: { label: 'buff', tip: '普通 buff', color: 'blue' },
  purple: { label: '紫buff', tip: '高级 buff', color: 'purple' },
  night1: { label: '特殊buff池', tip: '初夜 BOSS', color: 'gold' },
  night1b: { label: '特殊buff池2', tip: '初夜 BOSS / 监牢', color: 'orange' },
  night2: { label: '特殊buff池3', tip: '次夜 BOSS / 变异', color: 'volcano' },
};

/** 标签文字表（掉落池页面按 key 取用） */
export const POTENTIAL_POOL_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(POTENTIAL_POOL_TAGS).map(([key, meta]) => [key, meta.label]),
);
