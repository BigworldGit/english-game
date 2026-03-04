# 候选词优化方案 (清晰版)

## 用户需求

1. **避免图片混淆**：如 `evening` 图片有很多红色，候选词不应包含 `red`
2. **年级限制**：三年级题目，候选词只来自1-3年级

## 当前问题

- `candidate-words-fixed.json` 已有375个单词的候选词
- `image-relevance.json` 已有154个单词的图片分析（颜色、物体、场景）
- **但两者没有关联**：生成候选词时没有排除与图片内容相关的词

## 解决方案

### 步骤1：关联图片分析与候选词

对每个单词：
1. 读取 `image-relevance.json` 中的图片分析结果
2. 获取候选词中的3个干扰词
3. 检查干扰词是否与图片内容冲突：
   - 图片颜色 `colors` vs 颜色词 (red, blue, green等)
   - 图片物体 `objects` vs 可能引起混淆的词
4. 如果冲突，替换该干扰词

### 步骤2：年级限制

确保所有候选词来自：
- 同年级 或 低年级
- 不会出现高年级词汇

## 具体实现

```python
def optimize_candidates(word, candidates, image_analysis):
    correct = candidates[0]
    distractors = candidates[1:]  # 3个干扰词

    # 获取图片颜色
    colors = image_analysis.get('colors', [])

    # 颜色词列表
    color_words = ['red', 'blue', 'green', 'yellow', 'orange', 'purple',
                   'pink', 'black', 'white', 'brown', 'grey', 'cyan']

    # 检查干扰词是否与图片颜色冲突
    new_distractors = []
    for d in distractors:
        if d.lower() in colors or d.lower() in color_words and any(c in colors for c in [d.lower()]):
            # 冲突！需要替换
            new_distractors.append(replace_distractor(word, d))
        else:
            new_distractors.append(d)

    return [correct] + new_distractors
```

## 输出

更新 `candidate-words-fixed.json`，填充 `replaced` 字段：

```json
{
  "evening": {
    "correct": "evening",
    "options": ["evening", "afternoon", "morning", "night"],
    "replaced": ["red"]  // 被替换掉的词
  }
}
```

## 执行计划

1. 读取现有的 `image-relevance.json`
2. 读取现有的 `candidate-words-fixed.json`
3. 对每个单词执行优化
4. 保存更新后的候选词表
5. 推送到 GitHub

---

请确认是否开始执行？