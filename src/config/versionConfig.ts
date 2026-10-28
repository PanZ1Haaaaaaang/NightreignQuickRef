/**
 * 黑夜君临版本配置
 * 集中管理版本信息，方便统一更新
 *
 * 官方更新公告的版本口径分为两个：
 * - App Ver.：客户端程序版本
 * - Regulation Ver.：数值 / 参数表（regulation.bin）版本，站内数据以此为准
 */

export interface VersionInfo {
  /** 客户端程序版本 */
  appVersion: string;
  /** 数值参数表版本（Regulation） */
  regulationVersion: string;
  /** 更新公告日期 */
  releaseDate: string;
  /** 本次版本对应的官方公告 id（src/data/news/<id>.json），用于首页「更新公告」定位 */
  newsId: string;
}

export const NIGHTREIGN_VERSION: VersionInfo = {
  appVersion: '1.03.4',
  regulationVersion: '1.03.5',
  releaseDate: '2026.09.18',
  newsId: '260918_1',
};

export const getVersionDisplayText = (): string => {
  const { appVersion, regulationVersion, releaseDate } = NIGHTREIGN_VERSION;
  return `Nightreign App Ver. ${appVersion} | Reg Ver. ${regulationVersion} | ${releaseDate}`;
};

export const getVersionNumber = (): string => {
  // 站内数据同步的是数值参数表（Regulation）版本
  return `v${NIGHTREIGN_VERSION.regulationVersion}`;
};
