# 候选词优化方案 (更新版)

## 问题分析

### 当前问题
1. 图片颜色导致误判 (evening → red)
2. 单词特征导致混淆 (tall (树) → tree)

### 游戏现状
- ✅ 有年级选择 (1-6年级)
- ✅ 已使用 `getWordsUpToGrade(currentGrade)` 筛选题目
- ❌ 候选词未按年级限制
- ❌ 无图片内容分析

---

## 解决方案

### 1. 年级限制 (必须实现)

候选词只能来自 ≤ 用户选择的年级：

```javascript
// 修改 generateOptions
const allowedWords = allWords.filter(w =>
    w.grade <= currentGrade &&  // 不高于用户年级
    w.word !== correctAnswer
);
```

### 2. AI 图片分析 (新方案)

用 AI 分析每张图片，生成"关联词表"：

**分析维度**:
- 颜色 (颜色词)
- 主体 (核心物品)
- 场景 (环境/背景)
- 动作 (如果有人物)

**实现步骤**:

1. **批量分析图片**:
   - 用 AI 视觉模型分析每张图片
   - 输出图片中的主要颜色、物体、场景

2. **生成关联词表** (JSON):
```json
{
  "evening": {
    "colors": ["red", "orange", "yellow", "purple"],
    "objects": ["sun", "sky", "moon", "cloud"],
    "scenes": ["sunset", "dusk", "evening"]
  },
  "tall": {
    "colors": ["green", "brown"],
    "objects": ["tree", "building", "tower"],
    "features": ["height", "big", "tall"]
  }
}
```

3. **过滤候选词**:
```javascript
// 生成候选词时
const relatedWords = imageRelevanceTable[correctAnswer] || {};
const excludeList = [
    ...relatedWords.colors,      // 颜色
    ...relatedWords.objects,    // 物体
    ...relatedWords.scenes      // 场景
];

// 从候选词中排除
candidates = candidates.filter(w => !excludeList.includes(w));
```

### 3. 保留首字母相同的词
- ❌ 不再排除首字母相同的词

---

## 执行计划

### 阶段1: 基础修复 (立即)
1. 修改候选词生成逻辑，按年级限制
2. 基本过滤（颜色黑名单）

### 阶段2: AI 分析 (后续)
1. 批量用 AI 分析所有图片
2. 生成关联词表
3. 实现智能过滤

---

## 待确认

1. **是否立即实现阶段1？** (年级限制 + 基础过滤)
2. **阶段2需要分析所有图片**，工作量较大，是否稍后处理？

