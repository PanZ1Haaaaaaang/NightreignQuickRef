// 数据管理器 - 按页面分组按需加载 JSON
import { message } from './feedback';
import type { CharacterDetailData, DodgeFrameData, EntryData } from '../types';
import { loadNightfarerLevels } from '../features/nightfarers/levels';
import { loadPotentialEntries } from '../features/entries/potentialEntries';

// 词条数据类型统一由 src/types 定义（此处 re-export，避免两份定义漂移：
// 曾因这里的副本缺 tags，导致深夜模式词条的「未实装」标签与筛选失效）
export type { EntryData };

export interface EnhancementCategory {
  category: string;
  applicable_scope: {
    [key: string]: string[];
  };
  notes: string[];
}

export interface WeaponCharacter {
  [weaponName: string]: {
    [characterName: string]: number;
  };
}

export interface WeaponEffect {
  [weaponName: string]: {
    类型: string;
    特效: string;
    描述: string;
    削韧: string;
  };
}

export interface CharacterState {
  [key: string]: string;
}

export interface CharacterData {
  [characterName: string]: CharacterState;
}

export interface MagicMove {
  attributeMark: string; // 属性痕
  mixedMagic: string; // 混合魔法
  totalDamage: string; // 总伤害
  duration: string; // 持续时间
  mixedMagicEffect: string; // 混合魔法效果
  // 兼容中文键名
  [key: string]: string;
}

// 道具效果数据接口
export interface ItemEffect {
  name: string;
  effect: string;
  singleGridQty: string;
  type: string;
}

// 缓存数据类型
type CacheData =
  | EntryData[]
  | WeaponCharacter
  | WeaponEffect
  | CharacterData
  | MagicMove[]
  | DodgeFrameData
  | EnhancementCategory[]
  | ItemEffect[]
  | CharacterDetailData
  | unknown;

/**
 * 数据分组：按页面实际使用的数据划分，页面切到哪个 tab 就只加载对应组。
 *
 * 首屏默认页（游戏机制）不依赖任何一组，因此首屏无需等待任何 JSON。
 */
export type DataGroup = 'entries' | 'character' | 'weapon' | 'boss';

interface GroupFile {
  key: string;
  load: () => Promise<{ default: unknown }>;
}

const GROUP_FILES: Record<DataGroup, GroupFile[]> = {
  // 词条详细数据页
  entries: [
    { key: 'outsiderEntries', load: () => import('../data/zh-CN/out-of-run-entries.json') },
    { key: 'talismanEntries', load: () => import('../data/zh-CN/talisman_entries_zh-CN.json') },
    { key: 'inGameEntries', load: () => import('../data/zh-CN/in-game_entries_zh-CN.json') },
    {
      key: 'inGamePotentialEntries',
      load: async () => ({ default: await loadPotentialEntries() }),
    },
    { key: 'enhancementCategories', load: () => import('../data/zh-CN/enhancement-categories.json') },
    { key: 'itemEffects', load: () => import('../data/zh-CN/item_effect.json') },
    { key: 'deepNightEntries', load: () => import('../data/zh-CN/deep-night-out-of-run-entries.json') },
    {
      key: 'inGameDeepNightEntries',
      load: () => import('../data/zh-CN/in-game_deep_night_entries.json') satisfies Promise<{ default: EntryData[] }>,
    },
  ],
  // 角色数据页（也加载渡夜者逐级数据）
  character: [
    { key: 'characterStates', load: () => import('../data/zh-CN/nightfarer-stat-grades.json') },
    { key: 'dodgeFrames', load: () => import('../data/zh-CN/dodge-frames.json') },
    { key: 'magicMoveList', load: () => import('../data/zh-CN/recluse-mixed-magic.json') },
  ],
  // 传说武器详情页
  weapon: [
    { key: 'weaponCharacter', load: () => import('../data/zh-CN/weapon_character.json') },
    { key: 'weaponEffect', load: () => import('../data/zh-CN/weapon_effect.json') },
  ],
  // 夜王Boss数据页
  boss: [{ key: 'inGameSpecialBuff', load: () => import('../data/zh-CN/in-game-special-buffs.json') }],
};

// 全局数据存储
class DataManager {
  private static instance: DataManager;
  private dataCache: Map<string, CacheData> = new Map();
  private groupPromises: Map<DataGroup, Promise<void>> = new Map();
  private loadedGroups: Set<DataGroup> = new Set();

  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * 按组加载数据。同一组重复调用会复用同一个 Promise，不会重复请求。
   * 失败时清空 Promise，允许重试。
   */
  public async loadGroup(group: DataGroup): Promise<void> {
    if (this.loadedGroups.has(group)) return;

    const pending = this.groupPromises.get(group);
    if (pending) return pending;

    const task = this.runGroup(group);
    this.groupPromises.set(group, task);

    try {
      await task;
      this.loadedGroups.add(group);
    } catch (error) {
      this.groupPromises.delete(group);
      console.error(`数据组 ${group} 加载失败:`, error);
      message.error('数据加载失败，请刷新页面重试');
      throw error;
    }
  }

  private async runGroup(group: DataGroup): Promise<void> {
    const files = GROUP_FILES[group];
    const modules = await Promise.all(files.map((file) => file.load()));

    modules.forEach((mod, index) => {
      this.dataCache.set(files[index].key, mod.default as CacheData);
    });

    if (group === 'character') {
      const { levels } = await loadNightfarerLevels();
      this.dataCache.set('characterDetailData', levels);
    }
  }

  // 获取数据的方法
  public getOutsiderEntries(): EntryData[] {
    return (this.dataCache.get('outsiderEntries') as EntryData[]) || [];
  }

  public getTalismanEntries(): EntryData[] {
    return (this.dataCache.get('talismanEntries') as EntryData[]) || [];
  }

  public getInGameEntries(): EntryData[] {
    return (this.dataCache.get('inGameEntries') as EntryData[]) || [];
  }

  public getInGamePotentialEntries(): EntryData[] {
    return (this.dataCache.get('inGamePotentialEntries') as EntryData[]) || [];
  }

  public getWeaponCharacter(): WeaponCharacter[] {
    return (this.dataCache.get('weaponCharacter') as WeaponCharacter[]) || [{}];
  }

  public getWeaponEffect(): WeaponEffect[] {
    return (this.dataCache.get('weaponEffect') as WeaponEffect[]) || [{}];
  }

  public getCharacterStates(): CharacterData[] {
    return (this.dataCache.get('characterStates') as CharacterData[]) || [];
  }

  public getMagicMoveList(): MagicMove[] {
    return (this.dataCache.get('magicMoveList') as MagicMove[]) || [];
  }

  public getDodgeFrames(): DodgeFrameData | undefined {
    return this.dataCache.get('dodgeFrames') as DodgeFrameData | undefined;
  }

  public getEnhancementCategories(): EnhancementCategory[] {
    return (this.dataCache.get('enhancementCategories') as EnhancementCategory[]) || [];
  }

  public getInGameSpecialBuff(): EntryData[] {
    return (this.dataCache.get('inGameSpecialBuff') as EntryData[]) || [];
  }

  public getCharacterDetailData(): CharacterDetailData {
    return (this.dataCache.get('characterDetailData') as CharacterDetailData) || {};
  }

  public getItemEffects(): ItemEffect[] {
    return (this.dataCache.get('itemEffects') as ItemEffect[]) || [];
  }

  public getDeepNightEntries(): EntryData[] {
    const rawData = this.dataCache.get('deepNightEntries') || [];
    // 处理深夜模式局外词条的数据格式
    const processedData: EntryData[] = [];

    if (Array.isArray(rawData)) {
      rawData.forEach((group) => {
        if (typeof group === 'object' && group !== null) {
          Object.values(group).forEach((entry: unknown) => {
            if (entry && typeof entry === 'object') {
              const entryObj = entry as Record<string, unknown>;
              processedData.push({
                entry_id: (entryObj.entry_id as string) || (entryObj.entry_entry_id as string) || '',
                entry_name: (entryObj.entry_name as string) || '',
                entry_type: (entryObj.entry_type as string) || null,
                explanation: (entryObj.explanation as string) || null,
                superposability: (entryObj.superposability as string) || null,
                notes: (entryObj.notes as string) || null,
                // tags 必须原样带上，否则「未实装」标签与筛选都会失效
                tags: (entryObj.tags as string[]) || undefined,
              });
            }
          });
        }
      });
    }

    return processedData;
  }

  public getInGameDeepNightEntries(): EntryData[] {
    return (this.dataCache.get('inGameDeepNightEntries') as EntryData[]) || [];
  }
}

export default DataManager;
