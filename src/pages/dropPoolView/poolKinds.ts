import styles from '../../styles/dropPoolView.module.css';

/** 12 个基池的 kind：这些槽位可以点开「基池对照表」并定位到对应行 */
export const BASE_POOL_KINDS = new Set([
  'blueWeapon',
  'blueChar',
  'purpleWeapon',
  'purpleChar',
  'redWeapon',
  'redChar',
  'goldWeapon',
  'goldChar',
  'narrowBlueWeapon',
  'narrowBlueChar',
  'narrowPurpleWeapon',
  'narrowRedWeapon',
]);

/**
 * 槽位种类 → 配色。
 * 卡片上的槽位 chip 与「基池对照表」抽屉共用，保证同一个池在两处颜色一致。
 */
export const KIND_CLASS: Record<string, string> = {
  // 12 个基池
  blueWeapon: styles.kindWeapon,
  blueChar: styles.kindWeapon,
  purpleWeapon: styles.kindWeaponPurple,
  purpleChar: styles.kindWeaponPurple,
  redWeapon: styles.kindCursed,
  redChar: styles.kindCharCursed,
  goldWeapon: styles.kindWending,
  goldChar: styles.kindWending,
  // 窄池：「窄」= 战灰可换
  narrowBlueWeapon: styles.kindWeapon,
  narrowBlueChar: styles.kindChar,
  narrowPurpleWeapon: styles.kindWeaponPurple,
  narrowRedWeapon: styles.kindCursed,
  // 其他池 / 具体条目
  buff: styles.kindBuff,
  accessory: styles.kindAccessory,
  wending: styles.kindWending,
  flameWeapon: styles.kindFlameWeapon,
  specialBuff: styles.kindAntique,
  weaponItem: styles.kindWeapon,
  redWeaponItem: styles.kindCursed,
  forgeStone: styles.kindBuffPurple,
  rune1w: styles.kindWeapon,
  rune2w: styles.kindBuffPurple,
  rune3w: styles.kindWending,
};
