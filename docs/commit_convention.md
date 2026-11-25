# 提交信息规范

本项目采用 Conventional Commits，由 Husky 调用 commitlint 校验提交标题，并按提交类型自动添加 Emoji。 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) · [项目校验规则](../commitlint.config.js)

## 标题格式

```text
<type>(<scope>): <subject>
```

- `type` 必填，使用下表的小写英文类型。
- `scope` 可选，用括号注明改动范围，省略后写成 `<type>: <subject>`。
- `subject` 必填，冒号后留一个空格。使用一句简短的描述，支持中文。

## 提交类型

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| `feat` | 新增功能 | `feat(character): 增加角色数据页` |
| `fix` | 修复缺陷 | `fix(navigation): 修复跨页定位` |
| `docs` | 更新文档 | `docs(deploy): 更新部署指南` |
| `style` | 仅调整代码格式，如缩进和空白 | `style: 统一代码缩进` |
| `refactor` | 保持功能行为的代码重构 | `refactor(data): 统一数据文件命名` |
| `perf` | 优化性能 | `perf(charts): 延迟加载图表库` |
| `test` | 新增或修改测试 | `test(pagination): 覆盖末页边界` |
| `ui` | 调整组件结构、布局、配色等界面呈现，涵盖独立 CSS 和组件样式 | `ui(theme): 调整暗色主题描边` |
| `chore` | 更新依赖、构建或项目配置 | `chore(deps): 更新 pnpm 依赖` |

`update code` 缺少类型，`fix bug` 缺少冒号，`feat:add feature` 缺少冒号后的空格。一次提交集中表达一项改动。

## Git 钩子与 Emoji

1. `pre-commit` 调用 `pnpm exec lint-staged`，对暂存的 JS／TS 文件运行 `oxlint --fix` 和 `oxfmt`，对暂存的 CSS 文件运行 `oxfmt`。 [暂存文件检查](../.husky/pre-commit) · [文件匹配规则](../package.json)
2. `commit-msg` 调用 `pnpm exec commitlint`。通过校验后，为有映射的类型添加 Emoji。已通过校验且带 Emoji 的标题保留原样。 [提交消息钩子](../.husky/commit-msg) · [Emoji 映射](../.husky/prefix-emoji.mjs)

| 输入 | 最终标题 |
| --- | --- |
| `feat(character): 增加角色数据页` | `💙 feat(character): 增加角色数据页` |
| `💙 feat(character): 增加角色数据页` | `💙 feat(character): 增加角色数据页` |
| `ui(theme): 调整暗色主题描边` | `🩵 ui(theme): 调整暗色主题描边` |

新增的视觉样式改动统一使用 `ui`。commitlint 仍接受旧的 `css` 类型，便于沿用已有提交信息。
