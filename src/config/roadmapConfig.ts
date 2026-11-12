// 更新记录与 TODO 清单。
//
// 这里的 TODO 按「完成后挂在哪个页面」分组：面板显示为「【页面名】条目」
export interface RoadmapTodoGroup {
  page: string;
  items: string[];
}

export const LATEST_UPDATES: string[] = [
  '大盾数值 + 防御强度说明',
  '夜王弱点累积值',
  '冲击力机制',
  '黑焰烧血机制',
  '学者能力',
  '渡夜者能力/技艺/绝招效果',
];

export const ROADMAP_TODO: RoadmapTodoGroup[] = [
  {
    page: '游戏机制',
    items: ['异常值说明', '救人值'],
  },
  {
    page: '角色数据',
    items: ['送葬者开启技艺后无敌帧变化', '执行者技艺'],
  },
  {
    page: '对局内容',
    items: ['仇恨机制'],
  },
  {
    page: '机制',
    items: ['大盾与防御强度待补充'],
  },
  {
    page: '夜王弱点累积值',
    items: ['补充Supuritto的视频更多细节内容'],
  },
  {
    page: '渡夜者能力/技艺/绝招效果',
    items: ['需要用 smithbox 验证数据'],
  },
];
