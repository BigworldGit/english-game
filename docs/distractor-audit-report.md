# 候选词歧义检视报告

## 本轮目标

对当前项目中**所有已经设计图片、计划给用户看图猜词的题目**进行一轮存量检视，重点修复以下两类问题：

1. **同簇歧义**
   - 例如问候语之间互相干扰：`hello / hi / goodbye`
   - 例如疑问词之间互相干扰：`what / who / why / whose`
   - 例如颜色、星期、季节、天气、家庭成员、方向、交通工具等高相似词互相干扰

2. **图片直观元素冲突**
   - 候选词直接对应到图片里明显可见的颜色、物体、场景
   - 例如图片中有 `door`，候选项里不应再出现 `door`
   - 例如图片中明显是 `sun / sky / grass` 场景，候选项不应放这些可直接对图的词

## 本轮策略

### 1. 不再让高风险词放进同一语义簇竞争

本轮对以下高风险簇做了统一处理：

- 问候语：`hello`, `hi`, `goodbye`, `bye`, `good morning`, `good afternoon`, `good evening`, `good night`
- 疑问词：`what`, `who`, `why`, `where`, `when`, `whose`, `how`
- 颜色：`red`, `blue`, `green`, `yellow`, `black`, `white`, `orange`, `pink`, `purple`, `brown`
- 时间：`morning`, `afternoon`, `evening`, `night`
- 天气：`sunny`, `rainy`, `cloudy`, `windy`, `snowy`, `hot`, `cold`, `warm`, `cool`
- 地点：`town`, `city`, `village`, `park`, `school`, `hospital`, `zoo`, `farm`, `library`, `supermarket`, `classroom`
- 方向：`left`, `right`, `up`, `down`, `front`, `back`, `behind`, `in`, `on`, `under`
- 交通：`car`, `bus`, `bike`, `train`, `plane`, `ship`
- 家庭成员：`father`, `mother`, `brother`, `sister`, `grandfather`, `grandmother`, `grandpa`, `grandma`, `dad`, `mum`
- 星期：`monday` ~ `sunday`
- 季节：`spring`, `summer`, `autumn`, `winter`

### 2. 干扰词改为跨类别优先

替换干扰词时，优先从 `words.js` 里的正式词表中选择：

- 不与正确答案属于同一高风险语义簇
- 不与图片直观元素冲突
- 优先选择更具体的跨类别词，如：
  - 名词
  - 人物/职业
  - 地点
  - 物品
  - 动物
  - 食物

### 3. 不再使用非正式文件名作为候选词

修复脚本只允许从 `words.js` 正式词表中选替换项，避免把 `good_afternoon`、`fish_ref`、中文星期文件名等文件层词条误放进正式题目选项。

## 执行结果

- 检视题目数：`375`
- 调整题目数：`83`
- 替换干扰词总数：`210`
- 其中：
  - 同簇歧义替换：`199`
  - 图片直观元素冲突替换：`11`

## 复检结果

### 歧义复检

- 同簇歧义命中：`0`
- 图片直观元素直接冲突：`0`

### 结构复检

- 每题选项数不是 4 个：`0`
- 选项重复：`0`
- 正确答案未包含在选项中：`0`

### 1-3 年级题池复检

在已排除 10 个不适合图片题的词后：

- 一年级：`62` 题，异常 `0`
- 二年级：`109` 题，异常 `0`
- 三年级：`184` 题，异常 `0`

## 典型修复示例

### 示例 1：问候语

- 修复前：`hello / hi / goodbye / good morning`
- 修复后：`hello / window / woman / world`

### 示例 2：疑问词

- 修复前：`what / who / why / whose`
- 修复后：`what / home / hospital / juice`

### 示例 3：天气

- 修复前：`windy / cloudy / rainy / sunny`
- 修复后：改为跨类别干扰，不再让天气词互相竞争

## 相关脚本

本轮修复脚本：

- [scripts/repair_candidate_distractors.js](/Users/roy/Documents/ChatGPTWorkspace/english-game/scripts/repair_candidate_distractors.js)

后续如果重新生成候选词，建议在生成后再执行一次该脚本，再做人工抽查。
