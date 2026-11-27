import lipulaStatsJson from '@/data/zh-CN/lipula-trade-stats.json';
import type { TeardropLipulaOption } from '@/types';

export const LIPULA_OPTIONS: TeardropLipulaOption[] = lipulaStatsJson.options;

const optionsByKey = new Map(LIPULA_OPTIONS.map((option) => [option.key, option]));

export const getLipulaOption = (key?: string) => (key ? optionsByKey.get(key) : undefined);
