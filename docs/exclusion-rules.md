# 图片关联排除规则

## 规则表 (根据单词特点排除相关干扰词)

```json
{
  "evening": ["red", "orange", "yellow", "sunset", "sun", "sky"],
  "morning": ["sun", "yellow", "orange", "sky"],
  "night": ["moon", "star", "dark", "black", "sky"],
  "tall": ["tree", "building", "high", "up"],
  "goodbye": ["hand", "wave", "bye"],
  "hello": ["hand", "wave"],
  "door": ["house", "room", "open", "close"],
  "close": ["door", "open", "house"],
  "open": ["door", "close", "window"],
  "red": ["apple", "flower", "rose", "blood"],
  "blue": ["sky", "water", "sea", "ocean"],
  "green": ["grass", "tree", "leaf", "plant"],
  "yellow": ["sun", "banana", "flower"],
  "apple": ["red", "green", "fruit"],
  "tree": ["green", "leaf", "tall", "forest"],
  "sun": ["yellow", "orange", "sky", "hot"],
  "moon": ["night", "sky", "white"],
  "sky": ["blue", "cloud", "sun", "moon"],
  "flower": ["red", "pink", "garden", "plant"],
  "rain": ["water", "cloud", "umbrella", "wet"],
  "snow": ["white", "cold", "winter"],
  "sea": ["blue", "water", "fish", "ocean"],
  "grass": ["green", "field", "garden"],
  "house": ["door", "window", "room", "home"],
  "car": ["road", "drive", "wheel"],
  "bird": ["sky", "fly", "wing"],
  "dog": ["animal", "pet", "cat"],
  "cat": ["animal", "pet", "dog"],
  "fish": ["water", "sea", "swim"],
  "hand": ["finger", "arm", "wave"],
  "eye": ["see", "face", "look"],
  "face": ["eye", "nose", "mouth"],
  "happy": ["smile", "laugh", "face"],
  "sad": ["cry", "tear", "face"],
  "angry": ["mad", "face", "red"],
  "big": ["large", "huge", "small"],
  "small": ["little", "tiny", "big"],
  "hot": ["fire", "sun", "cold"],
  "cold": ["ice", "snow", "hot"],
  "old": ["young", "grandpa", "grandma"],
  "young": ["old", "baby", "child"]
}
```

## 实现方法

1. 读取现有的 `candidate-words-fixed.json`
2. 对每个单词：
   - 获取正确答案和3个干扰词
   - 根据规则表检查干扰词是否需要排除
   - 如果需要排除，从同年级词库中选择替代词
3. 保存更新后的候选词表

## 规则来源

- 单词的视觉特征（颜色、形状）
- 单词的场景元素（天空、树、门）
- 单词的相关物品（水果→颜色，动物→特征）