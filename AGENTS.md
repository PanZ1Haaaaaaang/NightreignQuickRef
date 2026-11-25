# AGENTS.md

本文件约定 NightreignQuickRef 的开发方式。站点面向《艾尔登法环：黑夜君临》玩家，文案使用简体中文，游戏术语沿用官方中文译名。

本文件适用于贡献者和编码代理。若本地存在仓库根目录下的 `.codex/AGENTS.local.md`，开始前读取它，补充本机工具和核验材料。公共约定适用于每个检出环境。 [Codex 工作入口](.codex/README.md)

## 项目约束

- 本仓库是 [PanZ1Haaaaaaang/NightreignQuickRef](https://github.com/PanZ1Haaaaaaang/NightreignQuickRef) fork，由 `self-deploy` 构建线上版本。 [GitHub Pages 站点](https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/) · [部署指南](docs/deploy_record.md)
- 上游原作者为 Cecilia（xxiixi）。必须保留 `SITE_CONFIG.original` 的署名与链接。 [原仓库](https://github.com/xxiixi/NightreignQuickRef) · [站点配置](src/config/siteConfig.ts)
- `main` 用于同步上游并关联上游 PR，禁止对它执行 checkout、commit、merge、rebase、push 等操作。`self-deploy` 是主开发分支，常规贡献以此为基线并向它提交 PR。特性分支沿用 `<type>/<scope>`。 [上游 PR](https://github.com/xxiixi/NightreignQuickRef/pull/11)
- Agent 的分支与提交操作限于本地，交付时汇报分支及提交摘要。远程推送和 `pnpm run deploy`（包含发布分支推送）由用户执行。
- 根 `AGENTS.md` 与 `.codex/README.md` 随仓库共享。`docs/` 当前跟踪提交规范和部署指南。本机补充与核验材料按忽略规则管理。 [忽略规则](.gitignore)

## 技术栈与命令

React 19、TypeScript 6.0.3、Vite 8（Rolldown）、Ant Design 6。Node.js 使用 `24.x`，pnpm 按 `packageManager` 字段锁定。 [Node 版本](.nvmrc) · [依赖与脚本](package.json) · [锁文件](pnpm-lock.yaml)

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
pnpm run lint
pnpm run fmt:check
pnpm run preview
```

- `dev` 默认访问 `http://localhost:5173/NightreignQuickRef/`。`build` 先运行 `tsc -b`，再打包到 `dist/`。`VERCEL` 控制根路径部署，GitHub Pages 使用 `/NightreignQuickRef/`。资源引用须兼容现有基路径。 [Vite 配置](vite.config.ts)
- 提交使用 `<type>(<scope>): <subject>`，scope 可选。组件和独立 CSS 的视觉改动归 `ui`，纯格式改动归 `style`。Husky 调用 commitlint，lint-staged 对暂存文件执行对应的 lint 和格式化。 [提交规范](docs/commit_convention.md)
- oxlint 忽略 `src/data/**`，`react/rules-of-hooks` 为 error，`react/exhaustive-deps` 为 warn。 [oxlint 规则](.oxlintrc.json)

## 导航、目录与加载

- 顶部五组导航固定使用以下 11 项，按这个顺序展示：游戏机制、角色数据、遗物词条、夜王数据、强敌与事件、局内词条、掉落池、商人数据、机制、传说武器、战技与魔法祷告。
- 顶部按钮、页面标题和功能菜单共享 `navigationConfig.ts` 的展示名称。维持已有内部 key、页内 Tab、步骤和锚点契约。调整入口时同时检查 `App.tsx` 的视图选择、懒加载和 `TAB_DATA_GROUPS`。 [导航配置](src/config/navigationConfig.ts) · [应用入口](src/App.tsx)
- 公开链接使用 `?page=<slug>&section=<anchorId>`。调整页面文案或目录时保留已发布的标识，新增主页面页签或传说武器步骤时登记对应的锚点。 [链接解析](src/utils/navigationUrl.ts)
- 页面专用组件、样式和逻辑随页面归属。跨功能复用的 UI 放 `src/components/common/`，跨页领域逻辑放对应 `src/features/` 模块。
- 公共数据类型统一从 `src/types/index.ts` 导出。优先复用现有的加载和派生逻辑，保留 `DataManager` 与 `DataGate` 已有分组。大 JSON 和图表按页面或功能延迟加载。站内链接、版本与来源统一放在 `src/config/`。 [数据分组](src/utils/dataManager.ts)
- Giscus 使用当前 fork 的 Discussions。仓库变更后按 Giscus 配置重新取得对应仓库和分类 ID。 [评论配置](src/config/siteConfig.ts)

## 公共 UI 与 Ant Design

- 渡夜者头像以「角色数据 → 基础属性与等级成长」的圆形头像为基线。共用伤害、异常、技能图标的语义映射，并保留相邻的文字标签。冲击力徽章按场景含义展示。
- 表格复用 `CustomPagination` 的分页条样式。对全量筛选结果排序后再切页，筛选和页长变化时回到第一页。宽表把横向滚动留在表格容器内。
- 主题用 `App.tsx` 的 `ConfigProvider` 和现有 token。全局 antd 覆写放 `src/styles/antd-overrides.css`，局部样式用 CSS Module。反馈消息使用 `src/utils/feedback.ts` 提供的实例，由 `MessageBridge` 注入。
- 编写 antd 组件前，按 `package.json` 的版本查询 API。当前为 6.7.2，例如 `antd info Table --version 6.7.2 --format json`。可用 antd 技能、CLI 或官方文档，也可用 `pnpm dlx @ant-design/cli` 临时运行 CLI。`Alert` 的标题用 `title`，说明用 `description`。 [antd 官方文档索引](https://ant.design/llms.txt)
- 修改 antd 代码后运行 `antd lint ./src --version 6.7.2 --format json`，确认 deprecated 项为 0。

## 数据命名与来源

- `src/data/zh-CN/` 的新文件采用小写连字符命名。`src/data/character-info/` 用渡夜者英文名的小写形式，公告保留 `src/data/news/` 的公告 ID。改名或移动时同步更新导入、Vite glob 和仍使用该路径的脚本，保持原 JSON 内容一致。
- 社区实测用于词条效果和机制说明。数值与参数优先用相同版本的 Smithbox 导出核对。手头只有公开资料或实测时，在 PR 中注明版本、取值来源和待核实的差异。修改数据时保留对应的 `DATA_SOURCE_CONFIG` 来源链接。 [站内数据来源](src/config/dataSourceConfig.ts)
- 已录入数据以 App Ver. 1.03.4 / Reg Ver. 1.03.5（2026.09.18）为基线，版本字段由 `versionConfig.ts` 统一维护。官方站点用于核对维护公告。 [站内版本配置](src/config/versionConfig.ts) · [游戏维护公告](https://nightreign.eldenring.jp/news.html)

## 分阶段验收

- 每批记录涉及的入口、代表性数据和行为基线。改动 UI、加载或数据路径时运行 `pnpm run lint`、`pnpm run build`，并按改动范围检查格式及 antd API。页面迁移和游戏数值修订分别验收。
- 用可用的浏览器工具验证 UI，按受影响范围检查页签、筛选、分页、键盘操作、浅色与暗色以及 390px 窄屏。
- 在开发服务器核对 UI 时，组件与配置改动使用 HMR，静态 JSON 更新可刷新页面。涉及懒加载或资源路径时，用生产预览复核 GitHub Pages 子路径。

## Code Review Rules

- PR 说明改动、受影响页面和实际运行的验收项。涉及数值时附可复查的资料和游戏版本。
- 检查导航和数据加载改动是否保留现有页签、步骤和锚点。共享表格的筛选与排序作用于全量结果，再按页切分。
- 核对署名配置、GitHub Pages 子路径及数据引用。文件迁移的 PR 说明新旧路径，方便评审遗漏引用的风险。
