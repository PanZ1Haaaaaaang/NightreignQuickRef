import styles from './combatTable.module.css';

const locationColorMap: Record<string, string> = {
  要塞: 'cyan',
  监牢: 'volcano',
  大教堂: 'orange',
  // DLC 新增据点
  湖沼: 'cyan',
  锻造村: 'volcano',
  大空洞主城: 'purple',
  神殿塔: 'geekblue',
  大空洞大教堂: 'orange',
  大空洞遗迹: 'magenta',
  大空洞异变: 'red',
  遗迹: 'magenta',
  营地: 'green',
  矿洞: 'magenta',
  主城: 'gold',
  主城地下: 'gold',
  主城楼顶: 'gold',
  野外蓝名: 'blue',
  野外红名: 'red',
  火山口: 'purple',
  山顶: 'purple',
  隐城: 'purple',
  腐败森林: 'purple',
  第一夜: 'geekblue',
  第二夜: 'cyan',
  突发事件: 'yellow',
  // 圆桌厅堂人物位置颜色
  训练场: 'green',
  可选角色: 'blue',
  执行者绝招: 'magenta',
  复仇者家人: 'cyan',
};

// 位置 → Tag 颜色
export const getLocationColor = (location: string | null | undefined): string => {
  if (!location) return 'default';
  return locationColorMap[location] || 'default';
};

// 抗性数值 → 颜色类名
export const getResistanceClass = (value: number | string): string => {
  if (value === '-' || value === null || value === undefined) {
    return '';
  }

  const numValue = typeof value === 'string' ? parseInt(value) : value;

  if (numValue <= 154) {
    return styles.resistanceLow;
  } else if (numValue <= 252) {
    return styles.resistanceMedium;
  } else if (numValue <= 542) {
    return styles.resistanceHigh;
  }
  return '';
};

// 吸收率 → 颜色类名
export const getAbsorptionClass = (value: number | string): string => {
  if (value === null || value === undefined || typeof value !== 'number') {
    return '';
  }

  if (value > 1) {
    return styles.absorption1;
  } else if (value < 1) {
    if (value <= 0.3) {
      return styles.absorption4;
    } else if (value <= 0.7) {
      return styles.absorption3;
    } else {
      return styles.absorption2;
    }
  }
  return '';
};
