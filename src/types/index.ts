// 定义数据接口
export interface EntryData {
  entry_id: string;
  entry_name: string;
  entry_type?: string | null;
  explanation: string | null;
  superposability?: string | null;
  talisman?: string;
  notes?: string | null;
  /** 词条名称/词条类型栏要展示的标签，如「未实装」 */
  tags?: string[];
  /** 「局内-潜在能力」的潜在能力池：normal / purple / night1 / night1b / night2 */
  pools?: string[];
  /** 护符词条的分类：属性抗性类 / 增伤类 / 杂项类 / 其他 */
  category?: string;
}

// Boss数据接口
export interface BossData {
  id: number;
  name: string;
  baseHealth: number | string;
  /** 普通形态的额外缩放（会显示在括号里，如头领的 ×3.75）；缺省视为 1 */
  baseHealthMultiplier?: number | number[];
  /** DLC 全局缩放（仅两支 DLC 夜王使用，参与计算但不显示） */
  dlcMultiplier?: number;
  /** 单人/双人/三人的人数倍率覆盖（默认 [1,2,3]，来自 MultiPlayCorrectionParam） */
  basePlayerMultipliers?: number[];
  nightreignHealth: number | string;
  /** 永夜王倍率（[Everdark Sovereign Scaling] 等，永夜列照此显示；支持多个因子数组） */
  nightreignHealthMultiplier: number | number[] | string;
  /** 永夜王血量列的人数倍率覆盖（默认 [1,2,3]） */
  nightreignPlayerMultipliers?: number[];
  /**
   * 深夜模式基础额外血量倍率（深度 1~5，相对当前普通血量）。
   * DLC 夜王还要再乘 deepNightDlcMultiplier（0.8）。
   */
  deepNightHealthMultipliers?: number[];
  /** 深夜 DLC 归一化系数（0.8），与 deepNightHealthMultipliers 相乘；无 DLC 的行不填 */
  deepNightDlcMultiplier?: number;
  /** 深夜原始削韧承受倍率（深度 1~5，0.88~0.84） */
  deepNightPoiseDamageRate?: number[];
  /** 深夜 DLC 原始削韧承受倍率（1.136），与 deepNightPoiseDamageRate 相乘 */
  deepNightDlcPoiseMultiplier?: number;
  /** 深夜档位说明，如 "4a" */
  deepNightTier?: string;
  /** 深夜倍率的额外说明（机制特例、数据来源等） */
  deepNightNote?: string;
  normalAbsorption: number | string;
  slashAbsorption: number | string;
  strikeAbsorption: number | string;
  pierceAbsorption: number | string;
  magicAbsorption: number | string;
  fireAbsorption: number | string;
  lightningAbsorption: number | string;
  holyAbsorption: number | string;
  poisonResistance: number | string;
  scarletRotResistance: number | string;
  bleedResistance: number | string;
  deathBlightResistance: number | string;
  frostResistance: number | string;
  sleepResistance: number | string;
  madnessResistance: number | string;
  basePoise: number | string;
  nightreignPoise: number | string;
}

// 野生Boss数据接口
export interface WildBossData {
  name: string;
  normal: number;
  strike: number;
  slash: number;
  pierce: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
  basePoise: number | string;
  bleed: number | string;
  poison: number | string;
  scarletRot: number | string;
  frost: number | string;
  location: string;
}

// 圆桌厅堂人物数据接口
export interface CharacterData {
  name: string;
  normal: number;
  strike: number;
  slash: number;
  pierce: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
  basePoise: number | string;
  bleed: number | string;
  poison: number | string;
  scarletRot: number | string;
  frost: number | string;
  location: string;
}

// ===== 官方更新公告（src/data/news/） =====

/** 公告分类：更新文件 / 规则文件 / DLC / 其他通知 */
export type NewsCategory = 'update' | 'regulation' | 'dlc' | 'notice';

/**
 * 公告正文块：按官网原文的段落结构逐块录入（保留原文，不做二次改写），
 * 后续加翻译时按块对应即可。
 * - section：原文 h1 级大标题
 * - subsection：原文 h2/h3/h4 级小标题
 * - label：原文里加粗的独立行（角色名、対象プラットフォーム等）
 * - p：正文段落
 * - ul：列表（items 里的对象形式表示带缩进子项）
 * - kv：键值行（如 App Ver. 1.03.4）
 * - image：原文配图（直接引用官网图床，懒加载）
 */
export type NewsListItem = string | { text: string; sub: string[]; tail?: string };

export type NewsBlock =
  | { type: 'section'; text: string }
  | { type: 'subsection'; text: string }
  | { type: 'label'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: NewsListItem[] }
  | { type: 'kv'; items: Array<{ label: string; value: string }> }
  | { type: 'image'; src: string; alt?: string };

/** 公告索引项（列表页只要这些字段，正文按需单独加载） */
export interface NewsAnnouncementMeta {
  /** 文件名，对应 src/data/news/<id>.json，如 "260918_1" */
  id: string;
  /** 发布日期，格式 YYYY.MM.DD */
  date: string;
  category: NewsCategory;
  /** 原文标题 */
  title: string;
}

/** src/data/news/index.json */
export interface NewsIndexData {
  /** 官方公告列表页 */
  source: string;
  announcements: NewsAnnouncementMeta[];
}

/** 单篇公告正文 */
export interface NewsArticle extends NewsAnnouncementMeta {
  /** 官网原文链接 */
  sourceUrl: string;
  /** 原文语言，如 "ja" */
  lang?: string;
  blocks: NewsBlock[];
}

/**
 * 公告译文正文（src/data/news/zh-CN/<id>.json）。
 * 结构与原文 blocks 完全一致（同顺序、同类型），只把文案换成中文；
 * 渲染器不区分原文/译文，直接按 blocks 渲染。标题不放在这里，见 NewsTitleMap。
 */
export interface NewsTranslation {
  /** 译者/校对署名（可选，会显示在文章头部） */
  translator?: string;
  blocks: NewsBlock[];
}

/**
 * src/data/news/zh-CN/index.json：
 * 公告 id → 中文标题。列表页只加载这一份小文件就能显示中文标题，
 * 不用为了标题把 20 篇正文都拉下来；没有条目的公告回退显示原文标题。
 */
export interface NewsTitleMap {
  titles: Record<string, string>;
}

// 词条类型颜色映射
export const typeColorMap: Record<string, string> = {
  // 局外词条
  能力值: 'blue',
  攻击力: 'red',
  '技艺/绝招': 'orange',
  '魔法/祷告': 'purple',
  减伤率: 'default',
  对异常状态的抵抗力: 'cyan',
  恢复: 'lime',
  行动: 'geekblue',
  队伍成员: 'magenta',
  仅限特定角色: 'gold',
  仅限特定武器: 'volcano',
  '出击时的武器（战技）': 'geekblue',
  '出击时的武器（魔法）': 'purple',
  '出击时的武器（祷告）': 'yellow',
  '出击时的武器（附加）': 'blue',
  出击时的道具: 'orange',
  场地环境: 'green',
  专属遗物: 'magenta',
  武器固有: 'cyan',
  // 局内词条
  庇佑: 'purple',
  不甘: 'volcano',
  额外效果: 'cyan',
  武器属性: 'geekblue',
  附加异常状态: 'yellow',
  强化: 'magenta',
  // 特殊事件及地形效果
  特殊事件: 'green',
  '特殊地形：隐城': 'purple',
  '特殊地形：腐败森林': 'red',
  '特殊地形：山顶': 'cyan',
  '特殊地形：火山口': 'volcano',
  '特殊地形：大空洞': 'magenta',
  // 道具效果分类
  圣杯瓶: 'red',
  采集: 'green',
  道具: 'cyan',
  苔药: 'orange',
  露滴: 'purple',
  壶: 'blue',
  飞刀: 'volcano',
  石: 'geekblue',
  香: 'magenta',
  油脂: 'gold',
  // 深夜模式词条
  '出击时的道具(结晶露滴)': 'green',
  '减益(减伤率)': 'magenta',
  '减益(能力值)': 'red',
  '减益(行动)': 'geekblue',
  // 深夜模式局内词条
  '减益(恢复)': 'volcano',
  特殊效果: 'cyan',
  法术触媒专属: 'purple',
  盾牌专属: 'magenta',
  弓弩专属: 'volcano',
};

// ===== 泪滴转职（src/data/zh-CN/teardrop_conversion.json） =====

/** 泪滴转职词条（局外词条 6640000~6647500）：boost/reduce 为 Lv12 满值的属性增减 */
export interface TeardropAffix {
  /** 局外词条 id */
  entryId: string;
  /** 原文词条名，如「【追踪者】提升智力、信仰，但降低力气、灵巧」 */
  name: string;
  /** 提升的属性 → 数值 */
  boost: Record<string, number>;
  /** 降低的属性 → 数值（正数） */
  reduce: Record<string, number>;
  /** 词条原文说明（等级 1 → 12 的变化） */
  explanation: string;
}

/** 单个渡夜者的泪滴转职数据 */
export interface TeardropCharacter {
  name: string;
  /** Lv15 基础属性，key 为属性名（生命/集中/耐力/力气/灵巧/智力/信仰/感应） */
  base: Record<string, number>;
  /** 该角色的两条泪滴转职词条 */
  affixes: TeardropAffix[];
}

/** 利普拉的交易（平衡律法）：强制替换的属性分配 */
export interface TeardropLipulaOption {
  key: string;
  /** 如「力气变强」 */
  name: string;
  /** 游戏内交易选项文字 */
  desire: string;
  stats: Record<string, number>;
}

export interface TeardropConversionData {
  /** 属性展示顺序 */
  attributes: string[];
  meta: {
    /** 基础属性所在等级 */
    baseLevel: number;
    /** 词条达到满值的等级 */
    affixMaxLevel: number;
    sourceNote: string;
  };
  characters: TeardropCharacter[];
  lipula: {
    name: string;
    options: TeardropLipulaOption[];
  };
}

// ===== 掉落池（src/data/zh-CN/drop_pools.json） =====

/** 球选项里一个槽位的掉落类型（解包按物品表判定；12 个基池 + 特殊槽位） */
export type DropKind =
  | 'blueWeapon'
  | 'blueChar'
  | 'purpleWeapon'
  | 'purpleChar'
  | 'redWeapon'
  | 'redChar'
  | 'goldWeapon'
  | 'goldChar'
  | 'narrowBlueWeapon'
  | 'narrowBlueChar'
  | 'narrowPurpleWeapon'
  | 'narrowRedWeapon'
  | 'buff'
  | 'accessory'
  | 'wending'
  | 'flameWeapon'
  | 'specialBuff'
  | 'weaponItem'
  | 'redWeaponItem'
  | 'forgeStone'
  | 'rune1w'
  | 'rune2w'
  | 'rune3w';

/**
 * 掉落段（紧凑数组，控制 JSON 体积）：[百分比, 掉落类型, 潜在能力池?, note?, detail?, luck?]
 * - kind 为上面的 22 种；标签文字在 `meta.kinds`
 * - 第三项仅 buff 段有：normal / purple / night1 / night1b / night2（见 config/potentialPoolConfig.ts）
 * - 第四项 note：元素变体（出血 / 冻伤 / 火焰…）、护符分类、特殊效果名等，部分 kind 会把它当标签
 * - 第五项 detail：悬停说明，只放池内拆分比例（癫火武器段放具体武器名）
 * - 第六项 luck：1 = 该槽位受「观察力」影响（解包 ItemLotParam_enemy 的 enableLuck），观察力越高权重越高
 */
export type DropSegment = [
  percent: number,
  kind: string,
  pool?: string | null,
  note?: string,
  detail?: string,
  luck?: 1,
];

export interface DropOption {
  id: number;
  /** 该选项的槽位分布（权重占比，合计 100） */
  segments: DropSegment[];
}

// ===== 黑焰烧血机制（src/data/zh-CN/black_flame_data.json） =====

export interface BlackFlameRow {
  /** SpEffectParam 编号 */
  id: string;
  name: string;
  type: '黑焰' | '死亡灼烧';
  /** 每跳伤害：最大生命百分比 + 固定值 */
  tick: string;
  interval: string;
  duration: string;
  note: string;
}

export interface BlackFlameMaxHpRow {
  id: string;
  source: string;
  effect: string;
  duration: string;
  note: string;
}

export interface BossHpEffectRow {
  id: string;
  source: string;
  effect: string;
  duration: string;
  note: string;
}

export interface BlackFlameData {
  meta: { source: string; verified: string; note: string };
  intro: string;
  rows: BlackFlameRow[];
  maxHp: { intro: string; rows: BlackFlameMaxHpRow[] };
  bossEffects: { intro: string; rows: BossHpEffectRow[] };
}
// ===== 冲击力机制（src/data/zh-CN/impulse_data.json） =====

export interface ImpulseRow {
  /** 冲击力编号（0~12，12 为废案） */
  level: number;
  effect: string;
  /** 玩家模型硬直动画编号区间 */
  anim: string;
  /** 到可翻滚的帧数（无硬直为 null） */
  roll: number | null;
  /** 到可使用战技的帧数（无硬直为 null） */
  skill: number | null;
  /** 硬直动画无敌帧 */
  invuln: string;
  examples: string;
  interrupt: string;
  /** 是否无视韧性系统强制产生硬直（受击方为玩家时） */
  ignorePoise: boolean;
}

export interface ImpulseData {
  meta: { source: string; videoUrl: string };
  notes: string[];
  rows: ImpulseRow[];
}

// ===== 大盾页「防御强度机制」（src/data/zh-CN/guard_mechanic_data.json） =====

export interface GuardMechanicEntry {
  name: string;
  type: '1类' | '2类';
  effect: string;
  /** 解包 = 已用 Smithbox 核对；社区 = 来自社区旧表；待核对 = 数值已知过时但尚未核对 */
  source: '解包' | '社区' | '待核对';
}

export interface GuardMechanicData {
  meta: { source: string; verifiedAt: string; note: string };
  intro: string;
  types: { key: string; desc: string }[];
  entries: GuardMechanicEntry[];
  upgrade: { note: string; columns: string[]; rows: string[][] };
  notes: string[];
}

// ===== 黑夜入侵者武器词条（src/data/zh-CN/invader_affix_data.json） =====

export interface InvaderWeaponAffix {
  /** 词条 ID（与「局内词条」一致） */
  id: string;
  name: string;
  /** 该词条在原版（75%）武器上的出现概率，单位 % */
  percent: number;
}

export interface InvaderWeaponAffixData {
  meta: { source: string; note: string };
  byCharacter: Record<string, { weapon: string; poolId: string; affixes: InvaderWeaponAffix[] }>;
}

export interface DropGroup {
  /** 球 ID（选项位抹掉后的整数，如 6000000） */
  id: string;
  /** 地形 / 敌人 / 备注，按表格原始顺序 */
  names: string[];
  /** 黑夜入侵者掉落：只在「深夜 · 入侵据点」出现，且固定 2 个选项（第 1 个是入侵者武器） */
  invader?: boolean;
  /** 普通掉落 */
  options: DropOption[];
  /** 深夜 · 变异（红皮怪）：选项数不变，池子升级 */
  mutationOptions?: DropOption[];
  /** 深夜 · 入侵（灾域）：要塞 / 教堂变成 3 选项，boss 只用这套池 */
  invasionOptions?: DropOption[];
}

/** 12 个基池（「基池对照表」抽屉用，口径见 docs/verify/掉落池池子口径.md） */
export interface DropBasePool {
  /** 与 meta.kinds 的 key 一致，可直接取标签文字与配色 */
  kind: DropKind;
  /** 池 ID；窄蓝角色池有 3000250 / 3000251 两个等价 ID */
  ids: string[];
  /** 条目数：按基础武器 ID 去重，并剔除权重 0 的空占位条目 */
  count: number;
  /** 一句话说明 */
  note: string;
}

export interface DropPoolsData {
  meta: {
    sourceNote: string;
    states: Record<'normal' | 'mutation' | 'invasion', string>;
    kinds: Record<DropKind, string>;
    basePools: DropBasePool[];
  };
  groups: DropGroup[];
}

// ===== 潜在能力池（src/data/zh-CN/potential_pools.json） =====

export interface PotentialPoolEntry {
  /** 解包物品 ID（强化版为同名高级版 ID） */
  id: number;
  /** 对应的 43 条词条 ID */
  entryId: string;
  name: string;
  desc: string;
  /** 是否为同名高级版（稀有度 2） */
  upgraded: boolean;
}

export interface PotentialPool {
  /** normal / purple / night1 / night1b / night2 */
  key: string;
  name: string;
  tableId: number;
  note: string;
  entries: PotentialPoolEntry[];
}

/** 掉落 ID（= ItemLotParam_enemy ID）下的一个槽位 */
export interface LotSlot {
  percent: number;
  kind: 'buff' | 'wending' | 'other';
  tableId?: number;
  /** buff 槽所属池：normal / purple / night1 / night1b / night2 */
  pool?: string;
  itemId?: number;
}

export interface PotentialPoolsData {
  meta: {
    sourceNote: string;
    upgradedLabel: string;
    wendingNote: string;
  };
  pools: PotentialPool[];
  /** 掉落 ID → 槽位（用于给 buff 槽上色、识别徘徊赐福） */
  lotSlots: Record<string, LotSlot[]>;
  /** 词条 ID → 出现的池 */
  entryPools: Record<string, string[]>;
}
