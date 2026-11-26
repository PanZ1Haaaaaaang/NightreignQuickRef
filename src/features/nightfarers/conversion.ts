import teardropJson from '../../data/zh-CN/teardrop_conversion.json';
import type {
  NightfarerName,
  NightfarerStat,
  NightfarerStats,
  TeardropAffix,
  TeardropConversionData,
  TeardropLipulaOption,
} from '../../types';

export const TEARDROP_DATA = teardropJson as TeardropConversionData;

const teardropsByName = new Map(TEARDROP_DATA.characters.map((character) => [character.name, character]));

export const getTeardropAffixes = (name: NightfarerName) => teardropsByName.get(name)?.affixes ?? [];

export const shortAffixName = (name: string) => name.replace(/^【.*?】/, '');

export const findTeardropAffixes = (affixes: TeardropAffix[], ids: readonly (string | undefined)[]) =>
  ids.map((id) => affixes.find((affix) => affix.entryId === id)).filter((affix) => affix !== undefined);

export const convertNightfarerStats = (
  base: NightfarerStats,
  affixes: readonly TeardropAffix[],
  lipula?: TeardropLipulaOption,
): NightfarerStats => {
  if (lipula) return lipula.stats;

  const stats = { ...base };
  for (const key of Object.keys(base) as NightfarerStat[]) {
    for (const affix of affixes) {
      stats[key] += (affix.boost[key] ?? 0) - (affix.reduce[key] ?? 0);
    }
  }
  return stats;
};
