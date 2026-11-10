// 更新记录与 TODO 清单。
//
// 这里的 TODO 按「完成后挂在哪个页面」分组：面板显示为「【页面名】条目」
export interface RoadmapTodoGroup {
  page: string;
  items: string[];
}

export const LATEST_UPDATES: string[] = ['新增官方更新公告以及翻译内容', '泪滴转职', '潜在能力池概率'];

export const ROADMAP_TODO: RoadmapTodoGroup[] = [
  {
    page: '游戏机制',
    items: ['异常值说明', '救人值'],
  },
  {
    page: '角色数据',
    items: ['渡夜者绝招、技艺效果，送葬者开启技艺后无敌帧变化', '学者能力'],
  },
  {
    page: '对局内容',
    items: ['仇恨机制'],
  },
  {
    page: '夜王数据',
    items: ['夜王弱点硬直'],
  },
  {
    page: '武器',
    items: ['大盾数值 + 防御强度说明', '冲击力说明', '黑焰烧血效果'],
  },
];
