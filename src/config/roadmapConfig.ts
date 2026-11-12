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
];

export const ROADMAP_TODO: RoadmapTodoGroup[] = [
  {
    page: '游戏机制',
    items: ['异常值说明', '救人值'],
  },
  {
    page: '角色数据',
    items: ['渡夜者绝招、技艺效果，送葬者开启技艺后无敌帧变化', '执行者技艺'],
  },
  {
    page: '对局内容',
    items: ['仇恨机制'],
  },
  {
    page: '机制',
    items: ['两处待验证'],
  },
  {
    page: '夜王弱点累积值',
    items: ['补充视频的细节内容'],
  },
];
