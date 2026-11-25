# GitHub Pages 部署指南

本 fork 从 `self-deploy` 构建，在 `gh-pages` 分支发布静态产物。部署命令由维护者在本地执行。 [当前 fork](https://github.com/PanZ1Haaaaaaang/NightreignQuickRef) · [线上速查手册](https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/)

## 环境与本地预览

使用 Node.js 24 和 pnpm。项目使用的 Node 版本见 [.nvmrc](../.nvmrc)，pnpm 版本见 [package.json](../package.json) 的 `packageManager`。按锁文件安装依赖时会一并安装 `gh-pages`。

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run preview
```

使用预览命令给出的端口访问 `/NightreignQuickRef/`，检查首页、页面切换及静态资源。面向 GitHub Pages 构建时，Vite 使用 `/NightreignQuickRef/` 作为资源基路径。 [Vite 配置](../vite.config.ts)

## 首次配置 GitHub Pages

在 fork 的仓库设置中打开 **Settings → Pages → Build and deployment**，将 **Source** 设为 **Deploy from a branch**，选择 `gh-pages` 分支及 `/ (root)` 后保存。首次部署时若分支列表里还没有 `gh-pages`，先按下一节发布一次，再回到设置选择。 [GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 发布更新

1. 在 `self-deploy` 上确认当前内容属于本次发布。用 `git status --short --branch` 查看分支及本地改动，用 `git remote get-url origin` 确认 `origin` 指向当前 fork。
2. 运行 `pnpm run deploy`。脚本先执行生产构建，成功后将 `dist/` 发布到 `origin` 的 `gh-pages` 分支。脚本包含远程推送。 [部署脚本](../package.json)
3. 在 GitHub **Actions** 查看 Pages 部署状态。发布成功后打开线上站点，检查首页、页面切换和静态资源。如果资源出现 404，检查 Pages 发布分支、根目录与 Vite 基路径。 [线上速查手册](https://PanZ1Haaaaaaang.github.io/NightreignQuickRef/)

原项目由 Cecilia（xxiixi）创建和维护。 [原仓库](https://github.com/xxiixi/NightreignQuickRef) · [原站点](https://xxiixi.github.io/NightreignQuickRef/) · [站点署名配置](../src/config/siteConfig.ts)
