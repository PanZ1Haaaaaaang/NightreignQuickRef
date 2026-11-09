// 统一的站点导航与页面元数据配置。
//
// 顶部「分组目录卡」、左下角功能菜单、页面头（面包屑 / 角标 / 一句话定位）全部由这里生成，
// 新增页面或页内子项只需要改这一个文件，不必再在两处各写一遍。
//
// 分组口径（按游戏内核）：对局规则 → 局外构筑 → 对局内容 → 局内实战 → 武器
// 角标口径：
//   通用 / 工具  —— 与单局进度无关的规则页、可交互计算器
//   局外 / 局内  —— 内容生效的时机（出击前确定的角色与遗物 / 对局中获取的装备与道具）
//   固定 / 种子  —— 是否由地图种子决定（夜王每局开局即确定，野怪与地形随种子）

export type NavBadge = '通用' | '工具' | '局外' | '局内' | '固定' | '种子';

// 页内子项：对应一个锚点，可选联动页内子 Tab / Step
export interface NavSection {
  key: string;
  label: string;
  anchorId: string;
  tabKey?: string;
  stepIndex?: number;
}

export interface NavPage {
  key: string;
  label: string;
  icon: string;
  // 一句话定位：目录卡 tooltip、页面头副标题共用
  desc: string;
  badges: NavBadge[];
  group: string;
  sections: NavSection[];
}

export interface NavGroup {
  key: string;
  label: string;
  note: string;
}

// 默认页面设置
export const DEFAULT_PAGE = '游戏机制';

export const NAV_GROUPS: NavGroup[] = [
  { key: '对局规则', label: '对局规则', note: '时间轴 · 评分 · 计算器' },
  { key: '局外构筑', label: '局外构筑', note: '角色 · 遗物词条' },
  { key: '对局内容', label: '对局内容', note: '夜王固定 · 地图随种子' },
  { key: '局内实战', label: '局内实战', note: '词条 · 掉落 · 商人' },
  { key: '武器', label: '武器', note: '传说武器 · 战技 · 魔法祷告' },
];

export const NAV_PAGES: NavPage[] = [
  {
    key: '游戏机制',
    label: '游戏机制',
    icon: '⚙️',
    desc: '时间轴、缩圈、卢恩、深夜评分与血量计算器',
    badges: ['通用', '工具'],
    group: '对局规则',
    sections: [
      { key: '游戏时间机制', label: '⏰ 游戏时间机制', anchorId: 'game-time-mechanism' },
      { key: '升级所需卢恩', label: '💰 升级所需卢恩统计', anchorId: 'runes-required' },
      { key: '游戏时间机制: 监牢/夜雨', label: '🌧️ 游戏时间机制: 监牢/夜雨', anchorId: 'prison-rain-mechanism' },
      { key: '深夜模式评分规则', label: '🌌 深夜模式评分规则', anchorId: 'deep-night-rating-rules' },
      { key: '血量恢复计算器', label: '❤️ 血量恢复计算器', anchorId: 'recovery-calculator' },
      { key: '评论与讨论', label: '💬 评论与讨论', anchorId: 'comments-discussion' },
    ],
  },
  {
    key: '角色数据',
    label: '角色数据',
    icon: '👤',
    // 角色在出击前就确定，属于局外；页内仍包含按局内需求查的成长与帧数数据
    desc: '渡夜者属性、等级成长、泪滴转职、无敌帧与人物抗性',
    badges: ['局外'],
    group: '局外构筑',
    sections: [
      { key: '角色属性数据', label: '📊 角色基础属性对比', anchorId: 'character-attributes' },
      { key: '角色详细数据', label: '📈 角色等级成长数据', anchorId: 'character-detail-data' },
      { key: '泪滴转职', label: '💧 泪滴转职（属性修正）', anchorId: 'teardrop-conversion' },
      { key: '无敌帧长度对比', label: '⚡ 翻滚/闪避无敌帧对比', anchorId: 'dodge-frames' },
      { key: '隐士出招表', label: '🔮 隐士混合魔法出招表', anchorId: 'hermit-magic-list' },
      {
        key: '圆桌厅堂人物数据',
        label: '🏛️ 圆桌厅堂人物数据',
        anchorId: 'roundtable-characters',
      },
    ],
  },
  {
    key: '遗物词条',
    label: '遗物词条',
    icon: '🌕',
    desc: '遗物随机词条、强化类别适用范围与深夜模式局外词条',
    badges: ['局外'],
    group: '局外构筑',
    sections: [
      { key: '局外词条', label: '🌕 局外词条', anchorId: 'outsider-entries', tabKey: '局外词条' },
      {
        key: '强化类别词条适用范围',
        label: '🌘 强化类别词条适用范围',
        anchorId: 'enhancement-categories',
        tabKey: '强化类别词条适用范围',
      },
      {
        key: '深夜模式-局外词条',
        label: '🌌 深夜模式-局外词条',
        anchorId: 'deep-night-entries',
        tabKey: '深夜模式局外词条',
      },
    ],
  },
  {
    key: '传说武器详情',
    label: '传说武器',
    icon: '⚔️',
    desc: '26 把传说武器的十角色面板与庇佑效果',
    badges: ['局内'],
    group: '武器',
    sections: [
      {
        key: '传说武器强度面板',
        label: '🛡️ 不同角色使用传说武器的强度面板',
        anchorId: 'weapon-strength-panel',
        stepIndex: 0,
      },
      { key: '武器庇佑效果', label: '🗡️ 传说武器的庇佑效果', anchorId: 'weapon-blessing-effects', stepIndex: 1 },
    ],
  },
  {
    key: '武器战技与魔法祷告',
    label: '战技与魔法祷告',
    icon: '✨',
    desc: '战技、专用战技、魔法、祷告与辅助类词条',
    badges: ['局内'],
    group: '武器',
    sections: [
      { key: '武器战技', label: '⚔️ 战技', anchorId: 'weapon-skills', tabKey: '战技' },
      { key: '专用战技', label: '🗡️ 专用战技', anchorId: 'unique-weapon-skills', tabKey: '专用战技' },
      { key: '魔法', label: '🔮 魔法', anchorId: 'sorceries', tabKey: '魔法' },
      { key: '祷告', label: '🙏 祷告', anchorId: 'incantations', tabKey: '祷告' },
      { key: '辅助类', label: '✨ 辅助类', anchorId: 'support-skills', tabKey: '辅助类' },
    ],
  },
  {
    key: '局内词条',
    label: '局内词条',
    icon: '🌖',
    desc: '局内词条、潜在能力、护符、道具采集与深夜模式局内词条',
    badges: ['局内'],
    group: '局内实战',
    sections: [
      { key: '局内词条', label: '🌖 局内词条', anchorId: 'in-game-entries', tabKey: '局内词条' },
      {
        key: '潜在能力',
        label: '🌖 局内-潜在能力',
        anchorId: 'in-game-potential-entries',
        tabKey: '潜在能力',
      },
      { key: '护符词条', label: '🌗 护符词条', anchorId: 'talisman-entries', tabKey: '护符词条' },
      { key: '道具/采集效果', label: '🌒 道具/采集效果', anchorId: 'item-effects', tabKey: '道具效果' },
      {
        key: '深夜模式-局内词条',
        label: '🌌 深夜模式-局内词条',
        anchorId: 'deep-night-in-game-entries',
        tabKey: '深夜模式局内词条',
      },
    ],
  },
  {
    key: '掉落池',
    label: '掉落池',
    icon: '🎁',
    desc: '133 组掉球的选项分布、概率与观察力模拟',
    badges: ['局内'],
    group: '局内实战',
    sections: [{ key: '掉球总览', label: '🎁 掉落池总览', anchorId: 'drop-pool-top' }],
  },
  {
    key: '商人数据',
    label: '商人数据',
    icon: '🏪',
    desc: '四类商人的货架、价格与不可购买的灵药露滴',
    badges: ['局内', '种子'],
    group: '局内实战',
    sections: [
      { key: '普通商人', label: '🧾 普通商人', anchorId: 'merchant-normal', tabKey: '普通商人' },
      { key: '村落商人', label: '🏘️ 村落商人', anchorId: 'merchant-village', tabKey: '村落商人' },
      { key: '黄金树商人', label: '🌳 黄金树商人', anchorId: 'merchant-golden-tree', tabKey: '黄金树商人' },
      {
        key: '大空洞传说商人',
        label: '🕳️ 大空洞传说商人',
        anchorId: 'merchant-hollow-legendary',
        tabKey: '大空洞传说商人',
      },
      {
        key: '不可购买露滴',
        label: '💧 不可购买的灵药露滴',
        anchorId: 'merchant-unpurchasable-tears',
        tabKey: '不可购买露滴',
      },
    ],
  },
  {
    key: '夜王数据',
    label: '夜王数据',
    icon: '🌙',
    desc: '每局开局即确定：血量抗性、永夜山羊召唤、利普拉交易',
    badges: ['固定'],
    group: '对局内容',
    sections: [
      { key: '夜王基础数据', label: '🌙 夜王基础数据', anchorId: 'night-king-basic', tabKey: 'boss-data' },
      {
        key: '永夜山羊召唤罪人详情',
        label: '🐐 永夜山羊召唤罪人详情',
        anchorId: 'sinner-details',
        tabKey: 'sinner-data',
      },
      {
        key: '利普拉的交易选项',
        label: '⚖️ 利普拉的交易(Boss战)',
        anchorId: 'lipula-trades',
        tabKey: 'lipula-trades',
      },
    ],
  },
  {
    key: '敌人与地图',
    label: '敌人与地图',
    icon: '🗺️',
    desc: '由地图种子决定：野生Boss、种族克制、特殊地形与事件',
    badges: ['种子'],
    group: '对局内容',
    sections: [
      { key: '野生Boss数据', label: '☠️ 野生Boss数据', anchorId: 'wild-boss-data', tabKey: 'wild-boss-data' },
      { key: '敌人种族说明', label: '🧬 敌人种族说明', anchorId: 'enemy-race-data', tabKey: 'enemy-race-data' },
      {
        key: '特殊事件及地形效果',
        label: '🌋 特殊事件及地形效果',
        anchorId: 'special-events',
        tabKey: 'special-events',
      },
    ],
  },
];

// 获取主导航项的顺序（按分组顺序展开，供功能菜单排序）
export const getMainNavigationOrder = (): string[] => {
  return NAV_PAGES.map((page) => page.key);
};

// 获取默认页面
export const getDefaultPage = (): string => {
  return DEFAULT_PAGE;
};

export const getPageByKey = (key: string): NavPage | undefined => {
  return NAV_PAGES.find((page) => page.key === key);
};

export const getGroupByKey = (key: string): NavGroup | undefined => {
  return NAV_GROUPS.find((group) => group.key === key);
};

// 分组 + 该组页面，目录卡直接消费
export const getNavigationGroups = (): (NavGroup & { pages: NavPage[] })[] => {
  return NAV_GROUPS.map((group) => ({
    ...group,
    pages: NAV_PAGES.filter((page) => page.group === group.key),
  }));
};
