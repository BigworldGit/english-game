# OpenClaw 素材重生成清单

当前项目里，只有 `assets/ui/bg-minecraft-day.png` 还能继续作为整站背景使用。其余这批 UI/装饰素材不建议继续直接接入，主要问题有：

- 大多数 PNG 没有透明通道
- 一些文件本身是完整场景图，不是可复用的“空面板”或“空按钮”
- 鸟的两帧不是同一只鸟，无法做自然帧动画
- 云、太阳、树等装饰图带底色，叠加后会污染背景

## 通用要求

- 文件格式：`PNG`
- 色彩风格：`Minecraft-inspired`, `voxel pixel art`, `blocky`, `bright daytime`, `clean educational UI`
- 禁止：文字、水印、logo、人物正脸、复杂界面截图、现成 UI 全画面、棋盘底、白底、灰底
- 所有“装饰精灵”和“可叠加 UI 素材”必须带透明通道
- 所有“按钮/面板”必须是干净底板，中心留出文字安全区，不要内置箭头、房子、人物、背包格子等具体图案

## 可保留素材

- `bg-minecraft-day.png`
  - 现状：可继续使用
  - 用途：全站背景

## 需要重生成的素材

### 1. 左侧信息面板

- 文件名：`panel-wood-left.png`
- 尺寸：`640x960`
- 透明：`否`
- 要求：
  - 木质 Minecraft 面板
  - 只做边框和底板
  - 中间大面积留空，适合放用户名、关卡、题号
  - 不要背包格子、铁门、家具、机器

### 2. 右侧状态面板

- 文件名：`panel-stone-right.png`
- 尺寸：`640x960`
- 透明：`否`
- 要求：
  - 石头/砂岩风格面板
  - 只做边框和浅色底板
  - 中间留空，适合放统计和题目导航
  - 不要月亮、太阳、图标、UI 示意图

### 3. 欢迎页/结果页主卡

- 文件名：`panel-main-card.png`
- 尺寸：`1200x900`
- 透明：`否`
- 要求：
  - 大卡片底板
  - Minecraft 风格边框
  - 中间完全留空，方便覆盖输入框、统计块、按钮
  - 不要任何具体界面截图感

### 4. 主按钮

- 文件名：`btn-primary-grass.png`
- 尺寸：`640x180`
- 透明：`否`
- 要求：
  - 草方块/绿色按钮风格
  - 中间留空
  - 不要箭头、文字、发光图标

### 5. 次按钮

- 文件名：`btn-secondary-wood.png`
- 尺寸：`640x180`
- 透明：`否`
- 要求：
  - 木板/棕色按钮风格
  - 中间留空
  - 不要返回箭头、装饰图标

### 6. 导航按钮

- 文件名：`btn-nav-stone.png`
- 尺寸：`480x160`
- 透明：`否`
- 要求：
  - 石质按钮底板
  - 中间留空
  - 不要房子、箭头、罗盘等图标

### 7. 用户头像徽章底板

- 文件名：`badge-player.png`
- 尺寸：`256x256`
- 透明：`是`
- 要求：
  - 简洁像素头像徽章
  - 只保留徽章轮廓或极简头像剪影
  - 透明背景
  - 不要方块大底图

### 8. 统计小卡片

- 文件名：`stats-tile.png`
- 尺寸：`256x256`
- 透明：`否`
- 要求：
  - 小型浅色统计底板
  - 中间留空，用于叠放数字和标签
  - 不要数字、奖杯、人物

### 9. 进度条外框

- 文件名：`progress-frame.png`
- 尺寸：`1200x200`
- 透明：`是`
- 要求：
  - 横向细长框体
  - 只保留外框和边角装饰
  - 中间透明，方便放题目进度图标

### 10. 云朵装饰

- 文件名：`cloud-block-1.png`
- 尺寸：`512x256`
- 透明：`是`
- 要求：
  - 单朵像素云
  - 透明背景
  - 干净边缘

- 文件名：`cloud-block-2.png`
- 尺寸：`512x256`
- 透明：`是`
- 要求：
  - 另一种轮廓的像素云
  - 必须与 `cloud-block-1.png` 风格一致
  - 透明背景

### 11. 太阳装饰

- 文件名：`sun-square.png`
- 尺寸：`256x256`
- 透明：`是`
- 要求：
  - 单个方块太阳
  - 透明背景
  - 不要额外天空底色

### 12. 树装饰

- 文件名：`tree-pixel.png`
- 尺寸：`320x512`
- 透明：`是`
- 要求：
  - 一棵完整的 Minecraft 风格像素树
  - 透明背景
  - 不要大块天空或地面底色

### 13. 鸟动画两帧

- 文件名：`bird-fly-1.png`
- 尺寸：`256x128`
- 透明：`是`
- 要求：
  - 同一只远景像素鸟
  - 左右朝向固定
  - 翅膀上扬
  - 透明背景

- 文件名：`bird-fly-2.png`
- 尺寸：`256x128`
- 透明：`是`
- 要求：
  - 必须和 `bird-fly-1.png` 是同一只鸟、同一视角、同一大小、同一配色
  - 只允许翅膀位置变化
  - 翅膀下压
  - 透明背景

## 给 OpenClaw 的统一提示补充

可以在每张图提示词后统一追加：

`transparent background if this is a sprite or overlay asset, centered composition, no text, no watermark, no UI screenshot, no checkerboard pattern, clean edges, consistent Minecraft-inspired voxel pixel art style`

## 当前接入建议

这批新图回来后，优先重新接入：

1. `panel-wood-left.png`
2. `panel-stone-right.png`
3. `panel-main-card.png`
4. `btn-primary-grass.png`
5. `btn-secondary-wood.png`
6. `btn-nav-stone.png`
7. `bird-fly-1.png`
8. `bird-fly-2.png`

其余云、树、太阳等装饰素材，等确认透明通道和风格一致后再接入，避免再次把页面叠乱。
