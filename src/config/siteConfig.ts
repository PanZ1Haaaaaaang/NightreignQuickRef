/**
 * 站点个性化配置
 *
 * 本站基于 Cecilia（GitHub: xxiixi）的 NightreignQuickRef 修改而来，
 * 仅用于个人 GitHub Pages 部署。原作者的署名与原项目链接统一保留在此。
 */

export const SITE_CONFIG = {
  /** 本站（fork）信息 */
  fork: {
    owner: 'PanZ1Haaaaaaang',
    name: 'NightreignQuickRef',
    url: 'https://github.com/PanZ1Haaaaaaang/NightreignQuickRef',
    issuesUrl: 'https://github.com/PanZ1Haaaaaaang/NightreignQuickRef/issues',
    siteUrl: 'https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/',
    // 待 NightreignMapFilter 创建 self-deploy 分支并部署后生效
    mapFilterUrl: 'https://PanZ1Haaaaaaang.github.io/NightreignMapFilter/',
  },

  /** 原作者与原项目信息（保留署名） */
  original: {
    author: 'Cecilia',
    authorUrl: 'https://github.com/xxiixi',
    repoName: 'NightreignQuickRef',
    repoUrl: 'https://github.com/xxiixi/NightreignQuickRef',
    siteUrl: 'https://xxiixi.github.io/NightreignQuickRef/',
    mapFilterUrl: 'https://xxiixi.github.io/NightreignMapFilter/',
  },

  /**
   * giscus 评论配置（指向本站 fork）。
   *
   * 已确认：
   * 1. fork 已开启 Discussions；
   * 2. 已安装 giscus App；
   * 3. repoId / categoryId 来自 giscus.app 当前仓库配置。
   *
   * 若以后改名或转移仓库，需要在 giscus.app 重新生成这两个 ID。
   */
  giscus: {
    repo: 'PanZ1Haaaaaaang/NightreignQuickRef',
    repoId: 'R_kgDOVKTT0g',
    category: 'Announcements',
    categoryId: 'DIC_kwDOVKTT0s4DJZqb',
  },
} as const;
