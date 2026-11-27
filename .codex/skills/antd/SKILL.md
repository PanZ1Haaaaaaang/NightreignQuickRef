---
name: antd
description: 在 NightreignQuickRef 中使用、审查或迁移 Ant Design 组件时使用。涵盖组件 API、主题、弃用项和仓库内的共用 UI。
---

# Ant Design

1. 读取根目录 `package.json` 中的 `antd` 版本，查该版本的组件属性、语义化样式和弃用项。例如 `antd info Table --version 6.7.2 --format json`。本机未安装 CLI 时，可用 `pnpm dlx @ant-design/cli` 运行相同子命令，或查阅已安装的类型声明和官方文档。
2. 按 [AGENTS.md](../../../AGENTS.md) 复用页面壳层、筛选条、分页、主题 token 和反馈实例。表格对筛选后的完整数据排序，再分页。在 6.7.2 中，`Alert` 的标题使用 `title`，正文使用 `description`。
3. 修改组件后运行 `antd lint ./src --version 6.7.2 --format json`，确认弃用项为 0。版本更新时，命令使用项目安装的版本。按改动范围运行项目的 lint、build 和浏览器验收。

[Ant Design 技能](https://github.com/ant-design/antd-skill/blob/main/skills/antd/SKILL.md) · [CLI](https://github.com/ant-design/ant-design-cli) · [官方文档索引](https://ant.design/llms.txt)
