# OpenClaw 素材生成清单

更新时间：2026-04-02

用途：给 OpenClaw 通过 Gemini 网页生成英语学习游戏的反馈素材。

目标：围绕“答对/答错即时反馈、关卡总结、长期成就”提供一套像素风素材。

统一要求：

- 风格：Minecraft-inspired / voxel pixel art / blocky / child-friendly
- 输出格式：优先 PNG；音效为 MP3
- 透明要求：所有漂浮叠加类素材必须透明背景
- 禁止：文字水印、复杂人物脸、写实风、赛博朋克、恐怖感、霓虹紫主调
- 颜色建议：
  - 正确：绿色、金色
  - 错误：柔和红、橙红
  - 中性：木头、石头、浅米色

## 1. 第一批必须生成

### 音效

1. `sfx-answer-correct.mp3`
- 用途：答对
- 时长：0.4-0.8 秒
- 风格：清脆上升音，像素游戏感
- 要求：短、亮、利落，不刺耳

2. `sfx-answer-wrong.mp3`
- 用途：答错
- 时长：0.3-0.6 秒
- 风格：轻微下降音
- 要求：不能刺耳，不能太重，不要失败惩罚感过强

3. `sfx-level-complete.mp3`
- 用途：关卡完成
- 时长：1.0-1.8 秒
- 风格：短胜利乐句
- 要求：有完成感，但不要太长

4. `sfx-achievement-unlock.mp3`
- 用途：获得徽章 / 成就
- 时长：1.2-2.0 秒
- 风格：升级、解锁、宝物感

### 即时反馈视觉

5. `feedback-correct-burst.png`
- 用途：答对时按钮附近的爆闪特效
- 尺寸：512x512
- 格式：PNG，透明背景
- 要求：绿色 + 金色像素碎片、短促爆发感
- 提示词：
  `Minecraft-inspired pixel art success burst effect, green and gold blocky sparkles, transparent background, polished UI feedback asset, child-friendly, no text, no watermark`

6. `feedback-wrong-burst.png`
- 用途：答错时按钮附近的轻量爆闪
- 尺寸：512x512
- 格式：PNG，透明背景
- 要求：柔和红橙色，不要像爆炸
- 提示词：
  `Minecraft-inspired pixel art gentle error burst effect, soft red and orange blocky sparkles, transparent background, clean UI feedback asset, child-friendly, no text, no watermark`

7. `feedback-star-green.png`
- 用途：答对后飘出的奖励星星
- 尺寸：256x256
- 格式：PNG，透明背景

8. `feedback-star-yellow.png`
- 用途：连续答对奖励星星
- 尺寸：256x256
- 格式：PNG，透明背景

### 进度与状态素材

9. `chip-correct.png`
- 用途：进度条里“答对”状态块
- 尺寸：128x128
- 格式：PNG，透明背景
- 要求：绿色、清晰、像素感强

10. `chip-wrong.png`
- 用途：进度条里“答错”状态块
- 尺寸：128x128
- 格式：PNG，透明背景
- 要求：红色，但不要压迫感太强

11. `chip-current.png`
- 用途：进度条里“当前题”状态块
- 尺寸：128x128
- 格式：PNG，透明背景
- 要求：黄色或蓝色高亮

12. `chip-review.png`
- 用途：进度条里“待复习”状态块
- 尺寸：128x128
- 格式：PNG，透明背景
- 要求：橙色或琥珀色，和答错状态区分开

### 结果页素材

13. `result-banner-complete.png`
- 用途：关卡完成横幅
- 尺寸：1200x320
- 格式：PNG，透明背景
- 要求：块状横幅，不带文字

14. `result-banner-perfect.png`
- 用途：全对横幅
- 尺寸：1200x320
- 格式：PNG，透明背景
- 要求：比完成横幅更亮、更有奖励感

15. `panel-review-list.png`
- 用途：结果页“待复习词”面板
- 尺寸：1024x768
- 格式：PNG
- 要求：中心留空，适合放文字列表

16. `panel-mastery-list.png`
- 用途：结果页“已掌握词”面板
- 尺寸：1024x768
- 格式：PNG
- 要求：中心留空，视觉上比 review 面板更亮一些

## 2. 第二批推荐生成

17. `badge-mastery-basic.png`
- 用途：掌握词数类徽章
- 尺寸：512x512
- 格式：PNG，透明背景

18. `badge-streak.png`
- 用途：连续答对 / 连续学习类徽章
- 尺寸：512x512
- 格式：PNG，透明背景

19. `badge-review-fix.png`
- 用途：错题修复类徽章
- 尺寸：512x512
- 格式：PNG，透明背景

20. `badge-daily-study.png`
- 用途：连续学习类徽章
- 尺寸：512x512
- 格式：PNG，透明背景

21. `streak-flare.png`
- 用途：连续答对时的数字光效
- 尺寸：512x512
- 格式：PNG，透明背景

22. `achievement-glow-ring.png`
- 用途：徽章解锁时的发光环
- 尺寸：512x512
- 格式：PNG，透明背景

## 3. 统一提示词模板

### 徽章类

`Minecraft-inspired achievement badge, blocky pixel art, polished game UI icon, bright and rewarding, transparent background, child-friendly, no text, no watermark`

### 状态方块类

`Minecraft-inspired status chip icon, blocky pixel art UI asset, transparent background, clean and readable, child-friendly, no text, no watermark`

### 面板类

`Minecraft-inspired game UI panel, blocky pixel art, polished educational game style, center area left empty for text, child-friendly, no text, no watermark`

### 横幅类

`Minecraft-inspired blocky game banner, polished pixel art, bright celebratory style, transparent background, no text, no watermark`

## 4. 文件放置建议

建议生成后放到这个目录，便于后续接入：

`/Users/roy/Downloads/feedback-assets/`

音效和图片可以分别建子目录：

- `/Users/roy/Downloads/feedback-assets/sfx/`
- `/Users/roy/Downloads/feedback-assets/ui/`

