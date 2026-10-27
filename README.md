<div align="center">

# NightreignQuickRef

[![Elden Ring Nightreign](https://img.shields.io/badge/Elden_Ring-Nightreign-blue)](https://www.bandainamcoent.com/games/nightreign)
![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/PanZ1Haaaaaaang/NightreignQuickRef)
![Game Version](https://img.shields.io/badge/Game_Version-App%201.03.4%20%7C%20Reg%201.03.5-8B5CF6)

[![Reference Notebook](https://img.shields.io/badge/Reference%20Notebook-View%20Online-8B5CF6?style=for-the-badge&logo=github)](https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/)
[![Map Filter](https://img.shields.io/badge/Map%20Filter-View%20Online-FF1493?style=for-the-badge&logo=github)](https://PanZ1Haaaaaaang.github.io/NightreignMapFilter/)

**《艾尔登法环：黑夜君临》玩家速查手册** —— 数据、机制、词条一网打尽

</div>

> [!IMPORTANT]
> ## Fork 声明
> 本仓库是 [Cecilia（xxiixi）](https://github.com/xxiixi) 的原项目 [xxiixi/NightreignQuickRef](https://github.com/xxiixi/NightreignQuickRef) 的 **fork**。
> 原作者创建了项目并维护了核心结构与大部分初始数据，署名保留在网站页脚及 [src/config/siteConfig.ts](src/config/siteConfig.ts) 的 `original` 字段中。
> 如果本项目对你有帮助，欢迎也给[原项目点一个 Star ⭐](https://github.com/xxiixi/NightreignQuickRef)。

## 在线访问

| 站点 | 地址 |
| --- | --- |
| 速查手册（本项目） | <https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/> |
| 地图种子筛选器 | <https://PanZ1Haaaaaaang.github.io/NightreignMapFilter/> |
| 原作者站点 | <https://xxiixi.github.io/NightreignQuickRef/> |

当前数据版本：**App Ver. 1.03.4 | Reg Ver. 1.03.5（2026.09.18）**。
游戏已停止内容更新，站内数据为终版，仅随服务器维护公告微调。

## 功能一览

- **游戏机制**：每日时间线与缩圈时间、升级所需卢恩、封印监牢 / 夜雨机制、深夜模式评分规则、圣杯瓶回血量计算器
- **角色数据**：全渡夜者（含 DLC 角色学者、送葬者）各等级属性成长、能力值评级、翻滚无敌帧、属性雷达图
- **词条详细数据**：局外词条（遗物 + 武器固有效果）、局内词条（武器随机 buff）、潜在能力、护符词条、深夜模式词条，支持搜索与筛选
- **夜王 Boss 数据**：夜王抗性 / 血量 / 韧性（含深夜模式倍率）、野外 Boss 位置与抗性、敌人种族特攻说明、永夜山羊罪人 NPC 预设
- **传说武器详情**：各角色攻击力、武器类型与特效
- **武器战技与魔法祷告**：战技（战灰分类 / 动作 / 倍率 / 削韧）、魔法与祷告威力数据
- **商人数据**：各商人货物清单、大空洞传说商人对应武器表

## 数据来源

站内数据按以下优先级采信（完整链接见网站顶部「数据来源」按钮，配置维护于 [src/config/dataSourceConfig.ts](src/config/dataSourceConfig.ts)）：

1. **社区测试总结**（主）——B 站 UP 主实测视频 / 专栏、百度贴吧数据汇总帖
2. **官方解包**（权威校验）——[Smithbox 2.2.6](https://github.com/vawser/Smithbox/releases#release-2.2.6) 解包的参数与文本数据，与社区结论冲突时以解包为准
3. **官方网站**——[黑夜君临日站新闻页](https://nightreign.eldenring.jp/news.html)，用于服务器维护公告

### 主要参考

#### 百度贴吧
- [黑夜君临 v1.01数据汇总](https://tieba.baidu.com/p/9906444262?pid=152430482433&cid=#152430482433)
- [黑夜君临 新词条数据一览](https://tieba.baidu.com/p/9935090782?pid=152476350171&cid=#152476350171)
- [全传说武器庇佑效果](https://tieba.baidu.com/p/9889921465?pid=152403477340&cid=#152403477340)
- [黑夜君临1.02.2部分详细更新内容（包含深夜模式改动）](https://tieba.baidu.com/p/10026641416?pid=152611338073&cid=#152611338073)
- [剑骸马雷1.02.2具体成长曲线](https://tieba.baidu.com/p/10027082782?share=9105&fr=sharewise&see_lz=0)

#### Bilibili 视频 / 专栏
- [【全词条汇总】遗物 + 护符 + 武器固有效果 + 武器随机buff](https://www.bilibili.com/video/BV1GfMSzvE3V)
- [【全角色回避翻滚动作】无敌帧分析对比](https://www.bilibili.com/video/BV1LvuVzuEqo)
- [【圣杯瓶机制】恢复、缓回、群回解析及常见误区](https://www.bilibili.com/video/BV1M18jzQE9X)
- [【局内减伤词条叠加测试】](https://www.bilibili.com/opus/1100871642065666054)
- [渡夜者各等级属性点数一览](https://www.bilibili.com/video/BV1p5ThzfEy7)
- [复活机制解析](https://www.bilibili.com/video/BV1TnNLzXESx)
- [永夜山羊罪人NPC预设一览 + 部分buff/debuff数值](https://www.bilibili.com/video/BV1wzvNzREYQ)
- [【深夜模式】全词条（遗物 + 武器 + 负面词条机制）](https://www.bilibili.com/video/BV1JLpxzmEdv)
- [【DLC全词条】遗物 + 改动词条 + 可叠加性](https://www.bilibili.com/video/BV1sQmTBmEGP)
- [1.03.4 更新内容（Reg版本）](https://www.bilibili.com/opus/1158092104127217697)
- [种族特攻？武器隐藏属性！夜王特殊机制分析](https://www.bilibili.com/video/BV17HWCzhEYz)
- [黑夜君临商人表 v1.02.4 修正版v2（by 小辛）](https://www.bilibili.com/video/BV1weyMBMEN3)

#### 其他资源
- [黑夜君临官方网站（新闻 / 维护公告）](https://nightreign.eldenring.jp/news.html)
- [每日缩圈时间（mobalytics）](https://mobalytics.gg/elden-ring-nightreign/guides/day-length)
- [角色升级所需卢恩（game8）](https://game8.co/games/Elden-Ring-Nightreign/archives/522643)
- [官方 Wiki（Fextralife）](https://eldenringnightreign.wiki.fextralife.com/Elden+Ring+Nightreign+Wiki)
- [Smithbox 2.2.6（参数解包工具）](https://github.com/vawser/Smithbox/releases#release-2.2.6)
- [大空洞金武商店对应武器（小黑盒）](https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?h_camp=link&h_session_id=WnAl0U54uSJoMc6y&h_src=YXBwX3NoYXJl&link_id=aa6371e96491&new_post_share_style_v2=0)

## 技术栈

![React](https://img.shields.io/badge/React-19.3.1-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF?logo=vite&logoColor=white&style=flat-square)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6.6.7-0170FE?logo=ant-design&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-339933?logo=node.js&logoColor=white&style=flat-square)
![oxlint](https://img.shields.io/badge/oxlint-1.89.0-8B5CF6?style=flat-square)

纯前端 SPA：React 19 + TypeScript + Vite 8（Rolldown 打包），UI 基于 Ant Design 6，静态 JSON 数据按页面分组懒加载，部署于 GitHub Pages。页面内集成 [giscus](https://giscus.app) 评论（基于 GitHub Discussions）。

## 本地开发

### 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- npm

### 快速开始

```bash
# 1. 克隆本 fork
git clone https://github.com/PanZ1Haaaaaaang/NightreignQuickRef.git
cd NightreignQuickRef

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:5173/NightreignQuickRef/
```

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（HMR） |
| `npm run build` | 类型检查 + 构建产物到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run lint` / `lint:fix` | oxlint 检查 / 自动修复 |
| `npm run fmt` / `fmt:check` | oxfmt 格式化 / 检查 |
| `npm run deploy` | 构建并部署到 GitHub Pages（gh-pages 分支） |

### 代码规范

- 提交信息遵循 [Conventional Commits](docs/commit_convention.md)：`<type>(<scope>): <subject>`，由 husky + commitlint 在提交时强制校验
- pre-commit 钩子自动对暂存文件执行 `oxlint --fix` 和 `oxfmt`

## 相关项目

- [地图种子筛选器](https://PanZ1Haaaaaaang.github.io/NightreignMapFilter/) —— 配套的地图种子筛选工具（[原作者版本](https://xxiixi.github.io/NightreignMapFilter/)）

## 致谢

- 感谢原作者 [Cecilia（xxiixi）](https://github.com/xxiixi) 创建并维护 [NightreignQuickRef](https://github.com/xxiixi/NightreignQuickRef)
- 感谢各位数据测试与整理的社区 UP 主、贴吧大佬（见「数据来源」）
- 特别感谢：虚空蛋黄酱（武器战技 / 魔法祷告数据）、小辛（商人表 / 敌人种族说明）、小黑盒社区

## License

[GPL v3](LICENSE) · 与原项目保持一致

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=PanZ1Haaaaaaang/NightreignQuickRef&type=Date)](https://www.star-history.com/#PanZ1Haaaaaaang/NightreignQuickRef&Date)
