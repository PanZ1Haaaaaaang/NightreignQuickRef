# 项目的 Codex 工作入口

项目规范与 PR 检查项写在根目录的 [AGENTS.md](../AGENTS.md)，供维护者、贡献者和编码代理查阅。

## 开始一批改动

1. 确认当前分支与任务阶段，阅读相应规范。先记录受影响页面的行为和数据基线。
2. 按阶段完成可独立验证的一批改动。路径迁移与游戏数值修订分别核对。
3. 依据改动范围运行检查并记录结果。需要本地环境及构建命令时，参见 [项目 README](../README.md)。 [提交规范](../docs/commit_convention.md) · [部署指南](../docs/deploy_record.md)

## 共享技能

贡献者和编码代理可以按任务打开对应的 `SKILL.md`，以及该文件引用的资源。

| 技能 | 适用任务 |
| --- | --- |
| [antd](skills/antd/SKILL.md) | 查询项目版本的组件 API、检查弃用项、复用站内 UI |
| [find-skills](skills/find-skills/SKILL.md) | 查找和评估其他代理技能 |
| [svg-skill](skills/svg-skill/SKILL.md) | 编写和校验 SVG 图标及其他矢量资源 |

## 项目配置

团队有共用的 Codex 运行设置时，可按用途添加 `.codex/config.toml`。 [项目配置指南](https://learn.chatgpt.com/docs/config-file/config-basic)

各贡献者可在本机创建 `.codex/AGENTS.local.md`，记录 IDE 工具、解包资料和额外的验收方式。仓库会忽略该文件，根 `AGENTS.md` 会指示代理在文件存在时读取它。Codex 的同级 `AGENTS.override.md` 优先于 `AGENTS.md`，这种本机补充通过根文档显式引用。 [AGENTS.md 加载规则](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
