import type { NightfarerName } from '@/types';
import duchess from './char/Duchess.svg';
import executor from './char/Executor.svg';
import guardian from './char/Guardian.svg';
import ironeye from './char/Ironeye.svg';
import raider from './char/Raider.svg';
import recluse from './char/Recluse.svg';
import revenant from './char/Revenant.svg';
import scholar from './char/Scholar.svg';
import undertaker from './char/Undertaker.svg';
import wylder from './char/Wylder.svg';

/**
 * 渡夜者图标（src/assets/icons/char/*.svg）。
 * 键是站内数据里的中文名（能力评级、逐级属性和泪滴转职统一用「铁之眼」）。
 */
const CHARACTERS: Record<NightfarerName, { assetName: string; avatar: string }> = {
  追踪者: { assetName: 'Wylder', avatar: wylder },
  女爵: { assetName: 'Duchess', avatar: duchess },
  复仇者: { assetName: 'Revenant', avatar: revenant },
  守护者: { assetName: 'Guardian', avatar: guardian },
  学者: { assetName: 'Scholar', avatar: scholar },
  执行者: { assetName: 'Executor', avatar: executor },
  铁之眼: { assetName: 'Ironeye', avatar: ironeye },
  无赖: { assetName: 'Raider', avatar: raider },
  隐士: { assetName: 'Recluse', avatar: recluse },
  送葬者: { assetName: 'Undertaker', avatar: undertaker },
};

const characterAssetsOf = (name: string) =>
  Object.hasOwn(CHARACTERS, name) ? CHARACTERS[name as NightfarerName] : undefined;

export const characterIconOf = (name: string): string | undefined => characterAssetsOf(name)?.avatar;

export const characterAssetNameOf = (name: string): string | undefined => characterAssetsOf(name)?.assetName;
