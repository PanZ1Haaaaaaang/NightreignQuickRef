# 黑夜君临站内术语与社区外号

---

## 一、渡夜者（游戏角色）

### 本体 8 名

| #    | 中文名 | 英文名   | 外号                | 备注                                     |
| ---- | ------ | -------- | ------------------- | ---------------------------------------- |
| 1    | 追踪者 | Wylder   | —                   |                                          |
| 2    | 守护者 | Guardian | **鸟人**            |                                          |
| 3    | 无赖   | Raider   | **胖宝宝**          |                                          |
| 4    | 女爵   | Duchess  | —                   |                                          |
| 5    | 隐士   | Recluse  | —                   |                                          |
| 6    | 铁之眼 | Ironeye  | **铁眼**            |                                          |
| 7    | 执行者 | Executor | **太刀哥**          | 绝招熔炉百相之兽也被社区称作“大狗”       |
| 8    | 复仇者 | Revenant | **哈基蜗**/**小蜗** | 召唤家人：海伦 / 弗雷德利克 / 塞巴斯蒂安 |

### DLC 新增 2 名

| #    | 中文名 | 英文名     | 外号     | 备注 |
| ---- | ------ | ---------- | -------- | ---- |
| 9    | 学者   | Scholar    | **老头** |      |
| 10   | 送葬者 | Undertaker | **修女** |      |

---

## 二、夜王

### 本体 8 名（前 7 名均有"永夜王"形态）

| #    | 中文名                         | 英文名   | 外号              | 有无永夜王 |
| ---- | ------------------------------ | -------- | ----------------- | ---------- |
| 1    | 黑夜野兽 格拉狄乌斯            | Gladius  | **三狼**          | 有         |
| 2    | 黑夜之爵 艾德雷                | Adel     | **大嘴**          | 有         |
| 3    | 黑夜之智 格诺斯塔              | Gnoster  | **虫子**          | 有         |
| 4    | 深海黑夜 玛利斯                | Maris    | **皮蛋**/**征兆** | 有         |
| 5    | 黑夜之魔 利普拉                | Librda   | **山羊**          | 有         |
| 6    | 黑夜光骑士 弗格尔              | Fulghor  | **人马**          | 有         |
| 7    | 黑夜雾霾 卡莉果                | Caligo   | **冰龙**          | 有         |
| 8    | 黑夜轮廓 / 黑夜化形者 布德奇冥 | Heolstor | **牢布**          | **无**     |

### DLC 新增 2 名

| #    | 中文名                          | 英文名    | 外号                       | 有无永夜王                       |
| ---- | ------------------------------- | --------- | -------------------------- | -------------------------------- |
| 9    | 继承英雄武器的众女孩 哈尔莫妮亚 | Harmonia  | **七仙女**                 | **有**（DLC 唯一有永夜王形态的） |
| 10   | 废弃物之王 史柴格斯             | Straghess | **废物王 / 废王 / 垃圾王** | 无                               |

---

## 三、特殊地形

### 本体 4 种

| 英文名                      | 中文名         | 常见叫法 |
| --------------------------- | -------------- | -------- |
| Mountaintop                 | 山顶           | 雪山     |
| The Crater                  | 火山口         | **火山** |
| Rotted Woods                | 腐败森林       | —        |
| Noklateo, the Shrouded City | 隐城诺克拉提奥 | **隐城** |

### DLC 新增 1 种

| 英文名           | 中文名 | 常见叫法 |
| ---------------- | ------ | -------- |
| The Great Hollow | 大空洞 | —        |


---

## 四、角色能力点 / 能力值名称对照

能力点指随角色等级成长的 8 项基础属性。血量、专注值和精力是分别由生命力、集中力和耐力派生的能力值，两者共用对应图标。 [图标与名称映射](../src/assets/icons/attributes.ts)

### 4.1 能力点（8 项）

| 中文名 | 英文名 | 图标来源 |
| ------ | ------ | -------- |
| 生命力 | Vigor | [vigor](../src/assets/icons/attributes/vigor.webp) |
| 集中力 | Mind | [mind](../src/assets/icons/attributes/mind.webp) |
| 耐力 | Endurance | [endurance](../src/assets/icons/attributes/endurance.webp) |
| 力气 | Strength | [strength](../src/assets/icons/attributes/strength.webp) |
| 灵巧 | Dexterity | [dexterity](../src/assets/icons/attributes/dexterity.webp) |
| 智力 | Intelligence | [intelligence](../src/assets/icons/attributes/intelligence.webp) |
| 信仰 | Faith | [faith](../src/assets/icons/attributes/faith.webp) |
| 感应 | Arcane | [arcane](../src/assets/icons/attributes/arcane.webp) |

### 4.2 能力值（3 项）

| 中文名 | 英文名 | 共用图标的能力点 |
| ------ | ------ | ---------------- |
| 血量 | HP（Hit Points） | 生命力 Vigor |
| 专注值 | FP（Focus Points） | 集中力 Mind |
| 精力 | Stamina | 耐力 Endurance |

站内表头、筛选和说明使用上表名称。历史 JSON 字段在读取时映射，例如「敏捷」显示为「灵巧」。官方词条保留原文。例如遗物词条 `7000000` 写「生命力 +1」，深夜词条 `6610400` 写「提升血量上限」。遗物词条 `7000090` 和 `7082700` 也沿用解包文本中的「提升血量上限」。

---

## 五、属性 / 异常名称对照（站内统一写法）

站内展示使用标准名。筛选按主名匹配，保留「可变」「附魔无法改变」等原有后缀。物理伤害类型及其图标统一由公共映射维护。 [伤害类型](../src/assets/icons/damage.ts) · [异常状态](../src/assets/icons/status.ts)

| 简称 | 标准名 | 英文名 | 分类 | 图标来源 |
| ---- | ------ | ------ | ---- | -------- |
| 魔 | 魔力 | Magic | 属性 | Negations/magic |
| 火 | 火焰 | Fire | 属性 | Negations/fire |
| 雷 | 雷电 | Lightning | 属性 | Negations/lightning |
| 圣 | 神圣 | Holy | 属性 | Negations/holy |
| 毒 | 中毒 | Poison | 异常 | Resistances/poison |
| 冻 | 冻伤 | Frostbite | 异常 | Resistances/frostbite |
| 腐败 | 腐败 | Scarlet Rot | 异常 | Resistances/scarlet-rot |
| 骤死 | 骤死 | Death Blight | 异常 | Resistances/blight |
| 血 | 出血 | Blood Loss | 异常 | Resistances/hemorrhage |
| 睡眠 | 睡眠 | Sleep | 异常 | Resistances/sleep |
| 发狂 | 发狂 | Madness | 异常 | Resistances/madness |
| 无 | 无属性 | — | 其他 | Negations/standard |

补充说明：

- `Blood Loss` 是 Nightreign 的官方英文写法；`Hemorrhage` 是旧称/别名，不作为独立异常。
- `Death Blight` 为两词；部分抗性/参数名会写成 `Deathblight`。
- 「无属性」用于弱点累积筛选，与物理攻击分类中的「普通」（`Standard`）共用图标。
- 其余属性名使用 `Magic / Fire / Lightning / Holy`，不要写成 `Sorcery / Flame / Thunder / Sacred`。
- `催眠` 是社区俗称；官方状态名为「睡眠」，英文 `Sleep`。

筛选器分组：**异常类别**（7 种）→ **属性类别**（4 种）→ **其他**（无属性），与「夜王数据 - 夜王基础数据」的图标保持一致。
