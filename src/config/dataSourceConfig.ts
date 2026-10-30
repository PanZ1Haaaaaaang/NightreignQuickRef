/**
 * 数据来源配置
 * 集中管理数据来源链接，方便统一更新和维护
 */

export type DataSourceIcon = 'baidu' | 'bilibili' | 'link';

export interface DataSourceItem {
  /** 链接标题 */
  title: string;
  /** 链接地址 */
  url: string;
  /** 图标类型 */
  icon: DataSourceIcon;
}

export interface DataSourceGroup {
  /** 分组名称（可选，用于注释） */
  name?: string;
  /** 该分组下的链接列表 */
  items: DataSourceItem[];
  /** 是否在该分组前添加分隔线 */
  showDivider?: boolean;
}

/**
 * 数据来源链接配置
 * 按分组组织，支持自动添加分隔线
 */
export const DATA_SOURCE_CONFIG: DataSourceGroup[] = [
  {
    name: '百度贴吧',
    items: [
      {
        title: '黑夜君临 v1.01数据汇总',
        url: 'https://tieba.baidu.com/p/9906444262?pid=152430482433&cid=#152430482433',
        icon: 'baidu',
      },
      {
        title: '黑夜君临 新词条数据一览',
        url: 'https://tieba.baidu.com/p/9935090782?pid=152476350171&cid=#152476350171',
        icon: 'baidu',
      },
      {
        title: '全传说武器庇佑效果',
        url: 'https://tieba.baidu.com/p/9889921465?pid=152403477340&cid=#152403477340',
        icon: 'baidu',
      },
      {
        title: '黑夜君临1.02.2部分详细更新内容（包含深夜模式改动）',
        url: 'https://tieba.baidu.com/p/10026641416?pid=152611338073&cid=#152611338073',
        icon: 'baidu',
      },
      {
        title: '剑骸马雷1.02.2具体成长曲线',
        url: 'https://tieba.baidu.com/p/10027082782?share=9105&fr=sharewise&see_lz=0',
        icon: 'baidu',
      },
    ],
  },
  {
    name: 'Bilibili',
    showDivider: true,
    items: [
      {
        title: '【艾尔登法环：黑夜君临】全词条汇总！遗物+护符+武器固有效果+武器随机buff',
        url: 'https://www.bilibili.com/video/BV1GfMSzvE3V',
        icon: 'bilibili',
      },
      {
        title: '【艾尔登法环：黑夜君临】全角色回避翻滚动作，无敌帧分析对比！',
        url: 'https://www.bilibili.com/video/BV1LvuVzuEqo',
        icon: 'bilibili',
      },
      {
        title: '【黑夜君临】圣杯瓶恢复、缓回、群回机制解析及常见误区',
        url: 'https://www.bilibili.com/video/BV1M18jzQE9X',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临 永夜山羊罪人NPC预设一览+部分buff/debuff数值',
        url: 'https://www.bilibili.com/video/BV1wzvNzREYQ/?spm_id_from=333.1387.upload.video_card.click&vd_source=37640654dbdd4ab80b471a16ac6da3c0',
        icon: 'bilibili',
      },
      {
        title: '【黑夜君临】局内减伤词条叠加测试',
        url: 'https://www.bilibili.com/opus/1100871642065666054',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临：渡夜者各等级属性点数一览',
        url: 'https://www.bilibili.com/video/BV1p5ThzfEy7',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临：复活机制解析',
        url: 'https://www.bilibili.com/video/BV1TnNLzXESx',
        icon: 'bilibili',
      },
      {
        title: '【艾尔登法环：黑夜君临】深夜模式，全词条！（遗物+武器+负面词条机制）',
        url: 'https://www.bilibili.com/video/BV1JLpxzmEdv',
        icon: 'bilibili',
      },
      {
        title: '【艾尔登法环：黑夜君临】DLC全词条！（遗物+改动词条+可叠加性）见弃空洞者',
        url: 'https://www.bilibili.com/video/BV1sQmTBmEGP',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临 1.03.4更新内容(Reg版本)',
        url: 'https://www.bilibili.com/opus/1158092104127217697',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临商人表 v1.02.4 修正版v2（by 小辛）',
        url: 'https://www.bilibili.com/video/BV1weyMBMEN3',
        icon: 'bilibili',
      },
      {
        title: '最新版艾尔登法环黑夜君临全商人货物列表',
        url: 'https://www.bilibili.com/opus/1175087938239725592',
        icon: 'bilibili',
      },
      {
        title: '【艾尔登法环：黑夜君临】种族特攻？武器隐藏属性！夜王特殊机制分析！-哔哩哔哩',
        url: 'https://www.bilibili.com/video/BV17HWCzhEYz',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临 泪滴转职属性修正一览（by 模组工艺）',
        url: 'https://www.bilibili.com/video/BV1EB2rBhERC',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临 BOSS精英掉落解包数据 by：Supuritto',
        url: 'https://www.bilibili.com/opus/1088631358950998023',
        icon: 'bilibili',
      },
      {
        title: '黑夜君临DLC BOSS精英掉落数据 by：Supuritto',
        url: 'https://www.bilibili.com/opus/1145131756809093159',
        icon: 'bilibili',
      },
    ],
  },
  {
    name: '其他资源',
    showDivider: true,
    items: [
      {
        title: '黑夜君临官方网站（新闻 / 维护公告）',
        url: 'https://nightreign.eldenring.jp/news.html',
        icon: 'link',
      },
      {
        title: '每日缩圈时间',
        url: 'https://mobalytics.gg/elden-ring-nightreign/guides/day-length',
        icon: 'link',
      },
      {
        title: '角色升级所需卢恩',
        url: 'https://game8.co/games/Elden-Ring-Nightreign/archives/522643',
        icon: 'link',
      },
      {
        title: '官方 Wiki',
        url: 'https://eldenringnightreign.wiki.fextralife.com/Elden+Ring+Nightreign+Wiki',
        icon: 'link',
      },
      {
        title: 'Smithbox 2.2.6',
        url: 'https://github.com/vawser/Smithbox/releases#release-2.2.6',
        icon: 'link',
      },
      {
        title: '大空洞金武商店对应武器',
        url: 'https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?h_camp=link&h_session_id=WnAl0U54uSJoMc6y&h_src=YXBwX3NoYXJl&link_id=aa6371e96491&new_post_share_style_v2=0',
        icon: 'link',
      },
    ],
  },
];
