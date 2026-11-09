import duchess from '../../assets/icons/char/Duchess.svg';
import executor from '../../assets/icons/char/Executor.svg';
import guardian from '../../assets/icons/char/Guardian.svg';
import ironeye from '../../assets/icons/char/Ironeye.svg';
import raider from '../../assets/icons/char/Raider.svg';
import recluse from '../../assets/icons/char/Recluse.svg';
import revenant from '../../assets/icons/char/Revenant.svg';
import scholar from '../../assets/icons/char/Scholar.svg';
import undertaker from '../../assets/icons/char/Undertaker.svg';
import wylder from '../../assets/icons/char/Wylder.svg';

/**
 * 渡夜者图标（src/assets/icons/char/*.svg）。
 * 键是站内数据里的中文名（character_states / character-info / 泪滴转职统一用「铁之眼」）。
 */
export const CHARACTER_ICONS: Record<string, string> = {
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

export const characterIconOf = (name: string): string | undefined => CHARACTER_ICONS[name];
