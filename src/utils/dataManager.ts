// 数据管理器 - 按页面分组按需加载 JSON
import { message } from './feedback';
import type { EntryData } from '../types';

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
  attributeIcon: string; // 属性图标
  mixedMagic: string; // 混合魔法
  totalDamage: string; // 总伤害
  duration: string; // 持续时间
  mixedMagicEffect: string; // 混合魔法效果
  // 兼容中文键名
  [key: string]: string;
}

export interface InvincibleFrame {
  name: string;
  type: string;
  value: number;
}

// 道具效果数据接口
export interface ItemEffect {
  name: string;
  effect: string;
  singleGridQty: string;
  type: string;
}

// 角色等级数据接口
export interface CharacterLevelData {
  level: number; // 等级
  HP: number;
  FP: number;
  ST: number;
  [key: string]: string | number;
}

// 角色详细数据接口
export interface CharacterDetailData {
  [characterName: string]: CharacterLevelData[];
}

// 缓存数据类型
type CacheData =
  | EntryData[]
  | WeaponCharacter
  | WeaponEffect
  | CharacterData
  | MagicMove[]
  | InvincibleFrame[]
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
    { key: 'outsiderEntries', load: () => import('../data/zh-CN/outsider_entries_zh-CN.json') },
    { key: 'talismanEntries', load: () => import('../data/zh-CN/talisman_entries_zh-CN.json') },
    { key: 'inGameEntries', load: () => import('../data/zh-CN/in-game_entries_zh-CN.json') },
    {
      key: 'inGamePotentialEntries',
      load: () => import('../data/zh-CN/in-game_potential_entries_zh-CN.json'),
    },
    { key: 'enhancementCategories', load: () => import('../data/zh-CN/enhancement_categories.json') },
    { key: 'itemEffects', load: () => import('../data/zh-CN/item_effect.json') },
    { key: 'deepNightEntries', load: () => import('../data/zh-CN/deep_night_entries.json') },
    { key: 'inGameDeepNightEntries', load: () => import('../data/zh-CN/in-game_deep_night_entries.json') },
  ],
  // 角色数据页（含 10 个角色等级文件，见 CHARACTER_FILES）
  character: [
    { key: 'characterStates', load: () => import('../data/zh-CN/character_states.json') },
    { key: 'invincibleFrames', load: () => import('../data/zh-CN/invincible_frames.json') },
    { key: 'magicMoveList', load: () => import('../data/zh-CN/magic_move_list.json') },
  ],
  // 传说武器详情页
  weapon: [
    { key: 'weaponCharacter', load: () => import('../data/zh-CN/weapon_character.json') },
    { key: 'weaponEffect', load: () => import('../data/zh-CN/weapon_effect.json') },
  ],
  // 夜王Boss数据页
  boss: [{ key: 'inGameSpecialBuff', load: () => import('../data/zh-CN/in-game_special_buff.json') }],
};

// 角色详细数据文件（英文文件名 → 中文名）
const CHARACTER_FILES: Array<{ name: string; load: () => Promise<{ default: Record<string, unknown> }> }> = [
  { name: '追踪者', load: () => import('../data/character-info/tracker.json') },
  { name: '女爵', load: () => import('../data/character-info/duchess.json') },
  { name: '隐士', load: () => import('../data/character-info/hermit.json') },
  { name: '铁之眼', load: () => import('../data/character-info/iron-eye.json') },
  { name: '无赖', load: () => import('../data/character-info/rogue.json') },
  { name: '执行者', load: () => import('../data/character-info/executor.json') },
  { name: '守护者', load: () => import('../data/character-info/guardian.json') },
  { name: '复仇者', load: () => import('../data/character-info/avenger.json') },
  { name: '学者', load: () => import('../data/character-info/scholar.json') },
  { name: '送葬者', load: () => import('../data/character-info/undertaker.json') },
];

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

  // 该组是否已加载完成
  public isGroupLoaded(group: DataGroup): boolean {
    return this.loadedGroups.has(group);
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

    // 角色页额外需要 10 个角色等级文件，合并成一个 characterDetailData
    if (group === 'character') {
      this.dataCache.set('characterDetailData', await this.loadCharacterDetails());
    }
  }

  private async loadCharacterDetails(): Promise<CharacterDetailData> {
    const result: CharacterDetailData = {};

    await Promise.all(
      CHARACTER_FILES.map(async (item) => {
        try {
          const mod = await item.load();
          const moduleData = mod.default;
          if (moduleData[item.name]) {
            result[item.name] = moduleData[item.name] as CharacterLevelData[];
          }
        } catch (error) {
          console.warn(`无法加载角色详细数据文件 ${item.name}:`, error);
        }
      }),
    );

    return result;
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

  public getInvincibleFrames(): InvincibleFrame[] {
    return (this.dataCache.get('invincibleFrames') as InvincibleFrame[]) || [];
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
            if (entry && typeof entry === 'object' && entry !== null) {
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
    const rawData = this.dataCache.get('inGameDeepNightEntries') || [];
    // 处理深夜模式局内词条的数据格式
    const processedData: EntryData[] = [];

    if (Array.isArray(rawData)) {
      rawData.forEach((group) => {
        if (typeof group === 'object' && group !== null) {
          Object.values(group).forEach((entry: unknown) => {
            if (entry && typeof entry === 'object' && entry !== null) {
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
}

export default DataManager;
