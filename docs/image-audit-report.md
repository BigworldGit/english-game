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
