import type { NightfarerName } from '../../types';
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
 * 键是站内数据里的中文名（character_states / character-info / 泪滴转职统一用「铁之眼」）。
 */
const CHARACTER_ICONS: Record<NightfarerName, string> = {
  追踪者: wylder,
  女爵: duchess,
  复仇者: revenant,
  守护者: guardian,
  学者: scholar,
  执行者: executor,
  铁之眼: ironeye,
  无赖: raider,
  隐士: recluse,
  送葬者: undertaker,
};

export const characterIconOf = (name: string): string | undefined =>
  Object.hasOwn(CHARACTER_ICONS, name) ? CHARACTER_ICONS[name as NightfarerName] : undefined;
