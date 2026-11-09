// 更新记录与 TODO 清单。
//
// 这里的 TODO 按「完成后挂在哪个页面」分组：面板显示为「【页面名】条目」，
// 以后新增条目时，只在对应页面的 items 里加一行即可，不用再纠结放哪儿。
// 判定规则：这条内容讲的是哪一页的问题，就归哪一页。
//   数值 / 规则（异常值、冲击力、救人值、黑焰、大盾、仇恨）→ 游戏机制
//   角色能力（技艺、绝招、无敌帧、学者能力）→ 角色数据
//   Boss 招式与硬直 → 夜王Boss数据
//   武器 / 词条 → 词条详细数据、传说武器详情

export interface RoadmapTodoGroup {
  page: string;
  items: string[];
}

export const LATEST_UPDATES: string[] = ['新增官方更新公告以及翻译内容', '泪滴转职', '潜在能力池概率'];

export const ROADMAP_TODO: RoadmapTodoGroup[] = [
  {
    page: '游戏机制',
    items: ['大盾数值 + 防御强度说明', '异常值说明', '黑焰烧血效果', '冲击力说明 + 救人值', '仇恨机制'],
  },
  {
    page: '角色数据',
    items: ['渡夜者绝招、技艺效果，送葬者开启技艺后无敌帧变化', '学者能力'],
  },
  {
    page: '夜王Boss数据',
    items: ['夜王弱点硬直'],
  },
];
