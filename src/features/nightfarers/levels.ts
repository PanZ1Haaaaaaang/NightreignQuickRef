import type {
  CharacterDetailData,
  CharacterLevelData,
  NightfarerLevel15,
  NightfarerName,
  NightfarerStats,
} from '../../types';

// 顺序与原来的角色文件 glob 一致，保留适配度与感应对照的同值排序。
const LEVEL_FILES = {
  复仇者: () => import('../../data/character-info/avenger.json'),
  女爵: () => import('../../data/character-info/duchess.json'),
  执行者: () => import('../../data/character-info/executor.json'),
  守护者: () => import('../../data/character-info/guardian.json'),
  隐士: () => import('../../data/character-info/hermit.json'),
  铁之眼: () => import('../../data/character-info/iron-eye.json'),
  无赖: () => import('../../data/character-info/rogue.json'),
  学者: () => import('../../data/character-info/scholar.json'),
  追踪者: () => import('../../data/character-info/tracker.json'),
  送葬者: () => import('../../data/character-info/undertaker.json'),
} satisfies Record<NightfarerName, () => Promise<{ default: Record<string, CharacterLevelData[]> }>>;

const names = Object.keys(LEVEL_FILES) as NightfarerName[];

// 等级成长使用原角色数据页的读取顺序。
const growthOrder: NightfarerName[] = [
  '追踪者',
  '女爵',
  '隐士',
  '铁之眼',
  '无赖',
  '执行者',
  '守护者',
  '复仇者',
  '学者',
  '送葬者',
];

export const findCharacterLevel = (rows: CharacterLevelData[] | undefined, level: number) =>
  rows?.find((row) => (row.等级 ?? row.level) === level);

const readStats = (row: CharacterLevelData): NightfarerStats => ({
  生命: Number(row.生命力),
  集中: Number(row.集中力),
  耐力: Number(row.耐力),
  力气: Number(row.力气),
  灵巧: Number(row.敏捷 ?? row.灵巧),
  智力: Number(row.智力),
  信仰: Number(row.信仰),
  感应: Number(row.感应),
});

interface NightfarerLevels {
  levels: CharacterDetailData;
  level15: ReadonlyMap<NightfarerName, NightfarerLevel15>;
}

let pending: Promise<NightfarerLevels> | undefined;

export const loadNightfarerLevels = (): Promise<NightfarerLevels> => {
  pending ??= Promise.all(
    names.map(async (name) => {
      try {
        const { default: data } = await LEVEL_FILES[name]();
        const rows = (data as Record<string, CharacterLevelData[]>)[name];
        return rows?.length ? rows : undefined;
      } catch (error) {
        console.warn(`无法加载角色详细数据文件 ${name}:`, error);
        return undefined;
      }
    }),
  ).then((results) => {
    const loaded = new Map<NightfarerName, CharacterLevelData[]>();
    const level15 = new Map<NightfarerName, NightfarerLevel15>();
    names.forEach((name, index) => {
      const rows = results[index];
      if (!rows) return;
      loaded.set(name, rows);
      const row = findCharacterLevel(rows, 15);
      if (!row) return;
      const stats = readStats(row);
      if (Object.values(stats).every(Number.isFinite)) level15.set(name, { row, stats });
    });
    const levels: CharacterDetailData = {};
    for (const name of growthOrder) {
      const rows = loaded.get(name);
      if (rows) levels[name] = rows;
    }

    // 保留可用角色，后续访问仍可尝试补齐加载失败的文件。
    if (results.some((rows) => !rows)) pending = undefined;
    return { levels, level15 };
  });

  return pending;
};
