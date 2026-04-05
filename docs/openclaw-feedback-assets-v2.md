# 激励系统二期素材清单

这份文档对应当前已经落地的激励机制增强版，目的是把现在用 CSS/emoji 占位的部分，升级成更完整、更适合小学生的具象化反馈。

## 设计方向

- 关键词：`像素风`、`明亮`、`积极`、`儿童学习游戏`、`Minecraft-inspired but softer`
- 避免：`黑白格背景`、`写实摄影`、`阴暗恐怖`、`过度复杂 UI 截图`、`带文字`
- 文件格式：
  - UI 装饰优先 `PNG`
  - 必须带透明背景的都要真透明 Alpha，不要棋盘底

## 第一优先级

这些素材会直接提升当前已实现功能的观感。

### 1. 伙伴头像

- `avatar-cat.png`
- `avatar-robot.png`
- `avatar-dragon.png`

用途：
- 欢迎页头像选择
- 游戏右侧陪伴型化身

尺寸：
- `256x256`

要求：
- 正方形
- 透明背景
- 头像主体居中
- 表情友好，可爱，有陪伴感

提示词建议：
- `pixel art cat avatar, cute learning companion, bright colors, transparent background`
- `pixel art robot avatar, friendly educational companion, soft blue metal, transparent background`
- `pixel art baby dragon avatar, cute and brave, green scales, transparent background`

### 2. Combo / Fever 视觉

- `combo-3.png`
- `combo-5.png`
- `fever-mode.png`

用途：
- 连击提示条
- 狂热模式强调层

尺寸：
- `640x180`

要求：
- 横向构图
- 透明背景
- 不带固定文字版本优先
- 可带火花、闪电、星星、像素能量边框

提示词建议：
- `pixel art combo banner, bright energy burst, transparent background, no text`
- `pixel art fever mode frame, glowing orange and gold, exciting, transparent background, no text`

### 3. 错题修复庆祝

- `fix-break-chain.png`
- `fix-gold-card.png`

用途：
- 错题从待复习转为已掌握时的庆祝动效

尺寸：
- `512x512`

要求：
- 透明背景
- 一个偏“锁链断裂”
- 一个偏“灰卡变金卡”

提示词建议：
- `pixel art broken chain burst, celebratory learning success effect, transparent background`
- `pixel art reward card turning gold, learning achievement effect, transparent background`

### 4. 成长树素材

- `growth-tree-trunk.png`
- `growth-tree-leaf.png`
- `growth-tree-glow.png`

用途：
- 代替当前 CSS 拼出来的成长树

尺寸：
- `tree-trunk`: `320x320`
- `tree-leaf`: `96x96`
- `tree-glow`: `256x256`

要求：
- 透明背景
- 树干单独、叶子单独，方便按掌握词数逐步叠加

提示词建议：
- `pixel art tree trunk base for growth mechanic, transparent background`
- `pixel art bright green leaf icon, transparent background`
- `pixel art soft glow burst for new leaf growth, transparent background`

### 5. 贴纸奖励

建议至少 12 张，便于形成“随机掉落 + 收藏”体验。

文件名建议：
- `sticker-apple-star.png`
- `sticker-sun-blaze.png`
- `sticker-book-boost.png`
- `sticker-leaf-growth.png`
- `sticker-gem-combo.png`
- `sticker-rocket-clear.png`
- `sticker-crown-perfect.png`
- `sticker-shield-revive.png`
- `sticker-rainbow-word.png`
- `sticker-torch-brave.png`
- `sticker-moon-focus.png`
- `sticker-map-explorer.png`

用途：
- 完美通关随机掉落
- 连击奖励掉落
- 后续贴纸收集册

尺寸：
- `192x192`

要求：
- 透明背景
- 每张风格统一
- 像素贴纸质感
- 边缘清晰，适合小尺寸显示

提示词建议：
- `pixel art collectible sticker, bright outline, transparent background, game reward asset`

## 第二优先级

### 6. 学习成就徽章

- `badge-first-clear.png`
- `badge-perfect-clear.png`
- `badge-combo-5.png`
- `badge-fever-10.png`
- `badge-mastery-20.png`
- `badge-mastery-50.png`
- `badge-fixed-10.png`
- `badge-streak-3.png`

尺寸：
- `160x160`

要求：
- 透明背景
- 每个徽章图形区分明显
- 不带文字

### 7. 冻结卡 / 复活盾

- `freeze-ticket.png`
- `revive-shield.png`

用途：
- 连续学习冻结
- 后续保级/复活机制

尺寸：
- `192x192`

要求：
- 透明背景
- 一眼能看懂“保留机会”“再来一次”

## 音频建议

如果后续仍然需要补音效，可以继续生成或人工挑选这几类：

- `sfx-combo-3.mp3`
- `sfx-combo-5.mp3`
- `sfx-fever-loop.mp3`
- `sfx-fix-word.mp3`
- `sfx-sticker-drop.mp3`
- `sfx-streak-up.mp3`

风格要求：
- 短促
- 明亮
- 游戏感强
- 不刺耳
- 不要真人语音

## 当前已经可以不用等素材就工作的部分

以下机制当前已经有功能，只是视觉还是占位版：

- 头像选择
- 连击 / Fever 提示
- 成长树
- 贴纸掉落
- 错题修复庆祝
- 连续学习 / 冻结卡统计

所以这批素材的作用不是“补功能”，而是“把反馈从能用升级成更有吸引力”。
