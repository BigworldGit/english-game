# English Game 图片加载问题排查报告

**生成时间**: 2026-03-03

---

## 问题汇总

### 问题1: 游戏使用 toLowerCase() 转换
- **位置**: game.js
- **问题**: 使用 `word.toLowerCase()` 转换图片路径
- **影响**: 部分图片文件名是大写开头 (如 Monday.png)，在 Linux 服务器上会加载失败
- **状态**: ⚠️ 待修复

### 问题2: 审核页面大小写映射 ✅ 已修复
- 已添加映射: monday→Monday.png, wednesday→Wednesday.png, sunday→Sunday.png

---

## 缺失图片 (41个)

| 单词 | 状态 |
|------|------|
| active | ❌ 缺失 |
| bathroom | ❌ 缺失 |
| be good at | ❌ 缺失 |
| because | ❌ 缺失 |
| bedroom | ❌ 缺失 |
| british | ❌ 缺失 |
| canadian | ❌ 缺失 |
| carefully | ❌ 缺失 |
| college | ❌ 缺失 |
| come from | ❌ 缺失 |
| french | ❌ 缺失 |
| game | ❌ 缺失 |
| good afternoon | ❌ 缺失 |
| good evening | ❌ 缺失 |
| good morning | ❌ 缺失 |
| good night | ❌ 缺失 |
| grow up | ❌ 缺失 |
| how are you | ❌ 缺失 |
| i'm | ❌ 缺失 |
| impossible | ❌ 缺失 |
| japanese | ❌ 缺失 |
| london | ❌ 缺失 |
| madrid | ❌ 缺失 |
| new york | ❌ 缺失 |
| paris | ❌ 缺失 |
| popular | ❌ 缺失 |
| quietly | ❌ 缺失 |
| reading | ❌ 缺失 |
| restaurant | ❌ 缺失 |
| secondary | ❌ 缺失 |
| shopping | ❌ 缺失 |
| singing | ❌ 缺失 |
| skating | ❌ 缺失 |
| sleeping | ❌ 缺失 |
| speaking | ❌ 缺失 |
| street | ❌ 缺失 |
| swimming | ❌ 缺失 |
| teaching | ❌ 缺失 |
| tired | ❌ 缺失 |
| waiting | ❌ 缺失 |
| washing | ❌ 缺失 |

---

## 额外图片 (不在单词表中)

这些图片存在但不在 words.js 单词表中：

| 文件名 | 建议 |
|--------|------|
| angry_v2.png | 保留(备用) |
| careful.png | 保留(备用) |
| come_from.png | 保留(备用) |
| fish_ref.png | 保留(备用) |
| france.png | 保留(备用) |
| gloves.png | 保留(备用) |
| good_afternoon.png | 保留(备用) |
| good_evening.png | 保留(备用) |
| good_morning.png | 保留(备用) |
| good_night.png | 保留(备用) |
| grow_up.png | 保留(备用) |
| japan.png | 保留(备用) |
| jeans.png | 保留(备用) |
| shoes.png | 保留(备用) |
| shorts.png | 保留(备用) |
| socks.png | 保留(备用) |
| sweater.png | 保留(备用) |
| thank_you.png | 保留(备用) |
| tshirt.png | 保留(备用) |
| 星期三.png | 保留(备用) |
| 星期二.png | 保留(备用) |
| 星期五.png | 保留(备用) |
| 星期六.png | 保留(备用) |
| 星期四.png | 保留(备用) |
| 星期日.png | 保留(备用) |

---

## 修复建议

### 优先级1: 修复 game.js 大小写问题
修改图片加载逻辑，支持大小写映射

### 优先级2: 补充缺失图片
生成41个缺失的图片

### 优先级3: 统一文件名规范
建议全部使用小写文件名，避免大小写问题

---

## 2026-03-29 二次人工巡检

### 巡检目标

- 排查“图片文件名正确，但图片内容本身误导用户”的情况
- 排查动作词、学校词、抽象词中不适合继续保留在图片题池里的资源
- 将确认结果同步到代码和文档，供后续素材重绘与题池维护参考

### 本轮明确结论

#### 1. `sing` 不是资源命名错误，更像是异步串图问题

- 本地资源 [sing.png](/Users/roy/Documents/ChatGPTWorkspace/english-game/images/grade3/sing.png) 内容是“唱歌”
- 用户截图中出现的 `LEARN ENGLISH!` 画面，不是 `sing.png`
- 结论：问题更可能来自旧题图片晚加载后覆盖当前题，而不是 `sing` 资源错配
- 处理：已在 `game.js` 中增加图片渲染令牌，防止旧题图片覆盖当前题

#### 2. 已确认不适合继续保留在图片题池中的词

这批词已经加入 [game.js](/Users/roy/Documents/ChatGPTWorkspace/english-game/game.js) 的 `EXCLUDED_IMAGE_WORDS`：

| 单词 | 当前图片观察 | 判定 | 处理建议 |
|------|--------------|------|----------|
| `name` | 1-3 年级均为同一张 “NAME” 字母拼块图 | 表达弱，接近“拼写/字母”，不稳定表达“名字” | 暂时移出图片题池，后续改成更明确的人名牌/自我介绍场景 |
| `draw` | 现图更像 Minecraft 风景展示 | 与“画画”动作不匹配 | 暂时移出图片题池，后续重绘为人物正在画画 |
| `learn` | 现图只是人物站立像 | 几乎不表达“学习” | 暂时移出图片题池，后续重绘为课堂学习/阅读学习场景 |

#### 3. 本轮抽样中可暂时保留的词

| 单词 | 当前判断 |
|------|----------|
| `sing` | 语义明确，可保留 |
| `dance` | 基本可保留，但与 `sing` 同属动作娱乐类，后续仍建议继续关注干扰词设计 |
| `read` | 主体表达基本清楚，可保留 |
| `write` | 主体表达基本清楚，可保留 |
| `music` | 物体和音符场景明确，可保留 |
| `school` | 建筑表达直接，可保留 |
| `book` | 图面略复杂，但仍能稳定指向书/阅读场景，暂时可保留 |

### 当前代码侧状态

截至 2026-03-29，图片题池中已明确排除：

- `I'm`
- `good morning`
- `good afternoon`
- `good evening`
- `good night`
- `how are you`
- `thanks`
- `thank you`
- `what's your name`
- `nice to meet you`
- `name`
- `draw`
- `learn`

### 后续开发建议

#### 建议优先重绘

- `name`
- `draw`
- `learn`

#### 建议继续人工巡检的高风险类别

- 抽象动词：`study`, `understand`, `remember`, `think`, `know`, `wish`, `hope`
- 学科词：`English`, `Chinese`, `math`, `art`, `music`, `PE`
- 高频功能词：`what`, `who`, `why`, `how`, `if`, `to`, `in`, `on`, `under`
- 频率词：`always`, `usually`, `often`, `sometimes`, `never`

#### 审核标准

一张图应满足以下至少两点，否则建议移出图片题池：

1. 不看文件名，人工能稳定说出唯一目标词
2. 不依赖文字提示或大段英文标题来猜词
3. 不需要脑补语境
4. 不会和同年级常见词形成明显竞争答案
