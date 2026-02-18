// 深圳小学英语单词库
// 基于上海教育出版社（沪版）教材
// 适用于深圳小学1-6年级

const WORD_DATA = {
    // ============================================
    // 一年级上学期 (Grade 1 - Part 1)
    // ============================================
    "1-1": [
        // Unit 1 - Hello!
        { word: "hello", meaning: "你好", category: "greeting" },
        { word: "hi", meaning: "你好", category: "greeting" },
        { word: "goodbye", meaning: "再见", category: "greeting" },
        { word: "bye", meaning: "再见", category: "greeting" },
        { word: "I", meaning: "我", category: "pronoun" },
        { word: "am", meaning: "是", category: "verb" },
        { word: "I'm", meaning: "我是", category: "phrase" },
        
        // Unit 2 - Good morning
        { word: "good", meaning: "好的", category: "adj" },
        { word: "morning", meaning: "早晨", category: "time" },
        { word: "good morning", meaning: "早上好", category: "greeting" },
        { word: "afternoon", meaning: "下午", category: "time" },
        { word: "good afternoon", meaning: "下午好", category: "greeting" },
        { word: "evening", meaning: "傍晚", category: "time" },
        { word: "good evening", meaning: "晚上好", category: "greeting" },
        { word: "night", meaning: "夜晚", category: "time" },
        { word: "good night", meaning: "晚安", category: "greeting" },
        
        // Unit 3 - How are you?
        { word: "how", meaning: "怎样", category: "question" },
        { word: "are", meaning: "是", category: "verb" },
        { word: "you", meaning: "你", category: "pronoun" },
        { word: "how are you", meaning: "你好吗", category: "phrase" },
        { word: "thank", meaning: "感谢", category: "verb" },
        { word: "thanks", meaning: "谢谢", category: "phrase" },
        { word: "thank you", meaning: "谢谢你", category: "phrase" },
        { word: "welcome", meaning: "不客气", category: "phrase" },
        { word: "sorry", meaning: "对不起", category: "phrase" },
        { word: "OK", meaning: "好的", category: "phrase" },
        
        // Unit 4 - What's your name?
        { word: "what", meaning: "什么", category: "question" },
        { word: "name", meaning: "名字", category: "noun" },
        { word: "your", meaning: "你的", category: "pronoun" },
        { word: "what's your name", meaning: "你叫什么名字", category: "phrase" },
        { word: "my", meaning: "我的", category: "pronoun" },
        { word: "nice", meaning: "美好的", category: "adj" },
        { word: "to", meaning: "向", category: "prep" },
        { word: "meet", meaning: "遇见", category: "verb" },
        { word: "nice to meet you", meaning: "很高兴认识你", category: "phrase" },
        
        // 基础颜色
        { word: "red", meaning: "红色", category: "color" },
        { word: "blue", meaning: "蓝色", category: "color" },
        { word: "yellow", meaning: "黄色", category: "color" },
        { word: "green", meaning: "绿色", category: "color" },
        
        // 基础数字
        { word: "one", meaning: "一", category: "number" },
        { word: "two", meaning: "二", category: "number" },
        { word: "three", meaning: "三", category: "number" },
        { word: "four", meaning: "四", category: "number" },
        { word: "five", meaning: "五", category: "number" },
    ],

    // ============================================
    // 一年级下学期 (Grade 1 - Part 2)
    // ============================================
    "1-2": [
        // 更多颜色
        { word: "orange", meaning: "橙色", category: "color" },
        { word: "purple", meaning: "紫色", category: "color" },
        { word: "pink", meaning: "粉色", category: "color" },
        { word: "brown", meaning: "棕色", category: "color" },
        { word: "black", meaning: "黑色", category: "color" },
        { word: "white", meaning: "白色", category: "color" },
        
        // 更多数字
        { word: "six", meaning: "六", category: "number" },
        { word: "seven", meaning: "七", category: "number" },
        { word: "eight", meaning: "八", category: "number" },
        { word: "nine", meaning: "九", category: "number" },
        { word: "ten", meaning: "十", category: "number" },
        
        // 动物
        { word: "cat", meaning: "猫", category: "animal" },
        { word: "dog", meaning: "狗", category: "animal" },
        { word: "bird", meaning: "鸟", category: "animal" },
        { word: "fish", meaning: "鱼", category: "animal" },
        { word: "duck", meaning: "鸭子", category: "animal" },
        
        // 身体部位
        { word: "eye", meaning: "眼睛", category: "body" },
        { word: "nose", meaning: "鼻子", category: "body" },
        { word: "mouth", meaning: "嘴巴", category: "body" },
        { word: "face", meaning: "脸", category: "body" },
        { word: "head", meaning: "头", category: "body" },
        { word: "hand", meaning: "手", category: "body" },
        { word: "leg", meaning: "腿", category: "body" },
        { word: "foot", meaning: "脚", category: "body" },
        
        // 家庭
        { word: "mother", meaning: "妈妈", category: "family" },
        { word: "father", meaning: "爸爸", category: "family" },
        { word: "mum", meaning: "妈妈", category: "family" },
        { word: "dad", meaning: "爸爸", category: "family" },
    ],

    // ============================================
    // 二年级上学期 (Grade 2 - Part 1)
    // ============================================
    "2-1": [
        // 更多动物
        { word: "rabbit", meaning: "兔子", category: "animal" },
        { word: "bear", meaning: "熊", category: "animal" },
        { word: "pig", meaning: "猪", category: "animal" },
        { word: "monkey", meaning: "猴子", category: "animal" },
        { word: "elephant", meaning: "大象", category: "animal" },
        
        // 食物
        { word: "apple", meaning: "苹果", category: "food" },
        { word: "banana", meaning: "香蕉", category: "food" },
        { word: "bread", meaning: "面包", category: "food" },
        { word: "milk", meaning: "牛奶", category: "drink" },
        { word: "water", meaning: "水", category: "drink" },
        { word: "egg", meaning: "鸡蛋", category: "food" },
        { word: "rice", meaning: "米饭", category: "food" },
        
        // 学习用品
        { word: "book", meaning: "书", category: "school" },
        { word: "pen", meaning: "钢笔", category: "school" },
        { word: "pencil", meaning: "铅笔", category: "school" },
        { word: "ruler", meaning: "尺子", category: "school" },
        { word: "eraser", meaning: "橡皮", category: "school" },
        { word: "bag", meaning: "书包", category: "school" },
        
        // 学校
        { word: "school", meaning: "学校", category: "place" },
        { word: "classroom", meaning: "教室", category: "place" },
        { word: "desk", meaning: "课桌", category: "school" },
        { word: "chair", meaning: "椅子", category: "school" },
        { word: "teacher", meaning: "老师", category: "person" },
        { word: "student", meaning: "学生", category: "person" },
    ],

    // ============================================
    // 二年级下学期 (Grade 2 - Part 2)
    // ============================================
    "2-2": [
        // 更多食物
        { word: "cake", meaning: "蛋糕", category: "food" },
        { word: "chicken", meaning: "鸡肉", category: "food" },
        { word: "juice", meaning: "果汁", category: "drink" },
        
        // 地点
        { word: "home", meaning: "家", category: "place" },
        { word: "park", meaning: "公园", category: "place" },
        { word: "zoo", meaning: "动物园", category: "place" },
        { word: "library", meaning: "图书馆", category: "place" },
        
        // 星期
        { word: "Sunday", meaning: "星期日", category: "day" },
        { word: "Monday", meaning: "星期一", category: "day" },
        { word: "Tuesday", meaning: "星期二", category: "day" },
        { word: "Wednesday", meaning: "星期三", category: "day" },
        { word: "Thursday", meaning: "星期四", category: "day" },
        { word: "Friday", meaning: "星期五", category: "day" },
        { word: "Saturday", meaning: "星期六", category: "day" },
        
        // 天气
        { word: "sunny", meaning: "晴朗的", category: "weather" },
        { word: "rainy", meaning: "下雨的", category: "weather" },
        { word: "cloudy", meaning: "多云的", category: "weather" },
        { word: "windy", meaning: "刮风的", category: "weather" },
        
        // 动作
        { word: "run", meaning: "跑", category: "verb" },
        { word: "jump", meaning: "跳", category: "verb" },
        { word: "walk", meaning: "走", category: "verb" },
        { word: "sit", meaning: "坐", category: "verb" },
        { word: "stand", meaning: "站", category: "verb" },
    ],

    // ============================================
    // 三年级上学期 (Grade 3 - Part 1)
    // ============================================
    "3-1": [
        // 形容词
        { word: "big", meaning: "大的", category: "adj" },
        { word: "small", meaning: "小的", category: "adj" },
        { word: "long", meaning: "长的", category: "adj" },
        { word: "short", meaning: "短的/矮的", category: "adj" },
        { word: "tall", meaning: "高的", category: "adj" },
        { word: "new", meaning: "新的", category: "adj" },
        { word: "old", meaning: "旧的/老的", category: "adj" },
        { word: "happy", meaning: "开心的", category: "adj" },
        { word: "sad", meaning: "伤心的", category: "adj" },
        { word: "good", meaning: "好的", category: "adj" },
        { word: "nice", meaning: "美好的", category: "adj" },
        
        // 更多动词
        { word: "eat", meaning: "吃", category: "verb" },
        { word: "drink", meaning: "喝", category: "verb" },
        { word: "play", meaning: "玩", category: "verb" },
        { word: "read", meaning: "读", category: "verb" },
        { word: "write", meaning: "写", category: "verb" },
        { word: "draw", meaning: "画", category: "verb" },
        { word: "sing", meaning: "唱歌", category: "verb" },
        { word: "dance", meaning: "跳舞", category: "verb" },
        { word: "swim", meaning: "游泳", category: "verb" },
        { word: "sleep", meaning: "睡觉", category: "verb" },
        
        // 学科
        { word: "Chinese", meaning: "语文", category: "subject" },
        { word: "English", meaning: "英语", category: "subject" },
        { word: "math", meaning: "数学", category: "subject" },
        { word: "music", meaning: "音乐", category: "subject" },
        { word: "art", meaning: "美术", category: "subject" },
        { word: "PE", meaning: "体育", category: "subject" },
        
        // 衣物
        { word: "shirt", meaning: "衬衫", category: "clothes" },
        { word: "skirt", meaning: "裙子", category: "clothes" },
        { word: "dress", meaning: "连衣裙", category: "clothes" },
        { word: "coat", meaning: "外套", category: "clothes" },
        { word: "shoe", meaning: "鞋子", category: "clothes" },
        { word: "sock", meaning: "袜子", category: "clothes" },
        { word: "cap", meaning: "棒球帽", category: "clothes" },
        { word: "hat", meaning: "帽子", category: "clothes" },
        
        // 家庭成员扩展
        { word: "sister", meaning: "姐妹", category: "family" },
        { word: "brother", meaning: "兄弟", category: "family" },
        { word: "grandmother", meaning: "奶奶/外婆", category: "family" },
        { word: "grandfather", meaning: "爷爷/外公", category: "family" },
        { word: "grandma", meaning: "奶奶/外婆", category: "family" },
        { word: "grandpa", meaning: "爷爷/外公", category: "family" },
    ],

    // ============================================
    // 三年级下学期 (Grade 3 - Part 2)
    // ============================================
    "3-2": [
        // 更多形容词
        { word: "beautiful", meaning: "美丽的", category: "adj" },
        { word: "clean", meaning: "干净的", category: "adj" },
        { word: "dirty", meaning: "脏的", category: "adj" },
        { word: "hot", meaning: "热的", category: "adj" },
        { word: "cold", meaning: "冷的", category: "adj" },
        { word: "warm", meaning: "温暖的", category: "adj" },
        { word: "cool", meaning: "凉爽的", category: "adj" },
        
        // 动词
        { word: "watch", meaning: "观看", category: "verb" },
        { word: "listen", meaning: "听", category: "verb" },
        { word: "look", meaning: "看", category: "verb" },
        { word: "open", meaning: "打开", category: "verb" },
        { word: "close", meaning: "关闭", category: "verb" },
        { word: "come", meaning: "来", category: "verb" },
        { word: "go", meaning: "去", category: "verb" },
        { word: "love", meaning: "爱", category: "verb" },
        { word: "like", meaning: "喜欢", category: "verb" },
        { word: "want", meaning: "想要", category: "verb" },
        { word: "have", meaning: "有", category: "verb" },
        
        // 时间
        { word: "today", meaning: "今天", category: "time" },
        { word: "tomorrow", meaning: "明天", category: "time" },
        { word: "yesterday", meaning: "昨天", category: "time" },
        
        // 季节
        { word: "spring", meaning: "春天", category: "season" },
        { word: "summer", meaning: "夏天", category: "season" },
        { word: "autumn", meaning: "秋天", category: "season" },
        { word: "winter", meaning: "冬天", category: "season" },
        
        // 自然
        { word: "sun", meaning: "太阳", category: "nature" },
        { word: "moon", meaning: "月亮", category: "nature" },
        { word: "star", meaning: "星星", category: "nature" },
        { word: "tree", meaning: "树", category: "nature" },
        { word: "flower", meaning: "花", category: "nature" },
        { word: "grass", meaning: "草", category: "nature" },
        { word: "cloud", meaning: "云", category: "nature" },
        { word: "rain", meaning: "雨", category: "nature" },
        { word: "snow", meaning: "雪", category: "nature" },
        
        // 地点
        { word: "park", meaning: "公园", category: "place" },
        { word: "hospital", meaning: "医院", category: "place" },
        { word: "supermarket", meaning: "超市", category: "place" },
    ],

    // ============================================
    // 四年级上学期 (Grade 4 - Part 1)
    // ============================================
    "4-1": [
        // 介词
        { word: "in", meaning: "在...里面", category: "prep" },
        { word: "on", meaning: "在...上面", category: "prep" },
        { word: "under", meaning: "在...下面", category: "prep" },
        { word: "behind", meaning: "在...后面", category: "prep" },
        { word: "near", meaning: "在...附近", category: "prep" },
        
        // 方位
        { word: "left", meaning: "左边", category: "direction" },
        { word: "right", meaning: "右边", category: "direction" },
        { word: "front", meaning: "前面", category: "direction" },
        { word: "back", meaning: "后面", category: "direction" },
        { word: "up", meaning: "向上", category: "direction" },
        { word: "down", meaning: "向下", category: "direction" },
        
        // 更多动词
        { word: "help", meaning: "帮助", category: "verb" },
        { word: "find", meaning: "找到", category: "verb" },
        { word: "see", meaning: "看见", category: "verb" },
        { word: "buy", meaning: "买", category: "verb" },
        { word: "sell", meaning: "卖", category: "verb" },
        { word: "make", meaning: "制作", category: "verb" },
        { word: "take", meaning: "拿/拍摄", category: "verb" },
        { word: "give", meaning: "给", category: "verb" },
        
        // 人物
        { word: "friend", meaning: "朋友", category: "person" },
        { word: "boy", meaning: "男孩", category: "person" },
        { word: "girl", meaning: "女孩", category: "person" },
        { word: "man", meaning: "男人", category: "person" },
        { word: "woman", meaning: "女人", category: "person" },
        { word: "baby", meaning: "婴儿", category: "person" },
        
        // 房间
        { word: "bedroom", meaning: "卧室", category: "room" },
        { word: "living room", meaning: "客厅", category: "room" },
        { word: "kitchen", meaning: "厨房", category: "room" },
        { word: "bathroom", meaning: "浴室", category: "room" },
        
        // 家具
        { word: "bed", meaning: "床", category: "furniture" },
        { word: "table", meaning: "桌子", category: "furniture" },
        { word: "door", meaning: "门", category: "furniture" },
        { word: "window", meaning: "窗户", category: "furniture" },
        { word: "sofa", meaning: "沙发", category: "furniture" },
        
        // 交通工具
        { word: "car", meaning: "汽车", category: "vehicle" },
        { word: "bus", meaning: "公共汽车", category: "vehicle" },
        { word: "bike", meaning: "自行车", category: "vehicle" },
        { word: "plane", meaning: "飞机", category: "vehicle" },
        { word: "train", meaning: "火车", category: "vehicle" },
        { word: "ship", meaning: "船", category: "vehicle" },
    ],

    // ============================================
    // 四年级下学期 (Grade 4 - Part 2)
    // ============================================
    "4-2": [
        // 更多形容词
        { word: "young", meaning: "年轻的", category: "adj" },
        { word: "clever", meaning: "聪明的", category: "adj" },
        { word: "kind", meaning: "善良的", category: "adj" },
        { word: "quiet", meaning: "安静的", category: "adj" },
        { word: "active", meaning: "活跃的", category: "adj" },
        { word: "angry", meaning: "生气的", category: "adj" },
        { word: "tired", meaning: "累的", category: "adj" },
        { word: "hungry", meaning: "饿的", category: "adj" },
        { word: "thirsty", meaning: "渴的", category: "adj" },
        
        // 动词
        { word: "think", meaning: "想", category: "verb" },
        { word: "know", meaning: "知道", category: "verb" },
        { word: "learn", meaning: "学习", category: "verb" },
        { word: "teach", meaning: "教", category: "verb" },
        { word: "study", meaning: "学习", category: "verb" },
        { word: "live", meaning: "生活/住", category: "verb" },
        { word: "work", meaning: "工作", category: "verb" },
        
        // 问句
        { word: "where", meaning: "在哪里", category: "question" },
        { word: "when", meaning: "什么时候", category: "question" },
        { word: "who", meaning: "谁", category: "question" },
        { word: "whose", meaning: "谁的", category: "question" },
        { word: "why", meaning: "为什么", category: "question" },
        
        // 地点扩展
        { word: "city", meaning: "城市", category: "place" },
        { word: "town", meaning: "城镇", category: "place" },
        { word: "village", meaning: "村庄", category: "place" },
        { word: "street", meaning: "街道", category: "place" },
        { word: "road", meaning: "道路", category: "place" },
        
        // 世界
        { word: "world", meaning: "世界", category: "noun" },
        { word: "country", meaning: "国家", category: "noun" },
        { word: "China", meaning: "中国", category: "noun" },
        { word: "America", meaning: "美国", category: "noun" },
        { word: "UK", meaning: "英国", category: "noun" },
        { word: "Australia", meaning: "澳大利亚", category: "noun" },
    ],

    // ============================================
    // 五年级上学期 (Grade 5 - Part 1)
    // ============================================
    "5-1": [
        // 更多形容词
        { word: "important", meaning: "重要的", category: "adj" },
        { word: "interesting", meaning: "有趣的", category: "adj" },
        { word: "boring", meaning: "无聊的", category: "adj" },
        { word: "difficult", meaning: "困难的", category: "adj" },
        { word: "easy", meaning: "容易的", category: "adj" },
        { word: "healthy", meaning: "健康的", category: "adj" },
        { word: "strong", meaning: "强壮的", category: "adj" },
        { word: "weak", meaning: "虚弱的", category: "adj" },
        { word: "fast", meaning: "快的", category: "adj" },
        { word: "slow", meaning: "慢的", category: "adj" },
        { word: "high", meaning: "高的", category: "adj" },
        { word: "low", meaning: "低的", category: "adj" },
        { word: "light", meaning: "轻的", category: "adj" },
        { word: "heavy", meaning: "重的", category: "adj" },
        { word: "full", meaning: "满的", category: "adj" },
        { word: "empty", meaning: "空的", category: "adj" },
        
        // 副词
        { word: "quickly", meaning: "快速地", category: "adv" },
        { word: "slowly", meaning: "缓慢地", category: "adv" },
        { word: "carefully", meaning: "小心地", category: "adv" },
        { word: "always", meaning: "总是", category: "adv" },
        { word: "often", meaning: "经常", category: "adv" },
        { word: "sometimes", meaning: "有时", category: "adv" },
        { word: "never", meaning: "从不", category: "adv" },
        { word: "usually", meaning: "通常", category: "adv" },
        
        // 连词
        { word: "because", meaning: "因为", category: "conj" },
        { word: "if", meaning: "如果", category: "conj" },
        { word: "when", meaning: "当...时", category: "conj" },
        { word: "but", meaning: "但是", category: "conj" },
        
        // 更多动词
        { word: "use", meaning: "使用", category: "verb" },
        { word: "start", meaning: "开始", category: "verb" },
        { word: "finish", meaning: "完成", category: "verb" },
        { word: "visit", meaning: "访问/参观", category: "verb" },
        { word: "meet", meaning: "遇见", category: "verb" },
        { word: "leave", meaning: "离开", category: "verb" },
        { word: "remember", meaning: "记得", category: "verb" },
        { word: "forget", meaning: "忘记", category: "verb" },
        
        // 食物
        { word: "vegetable", meaning: "蔬菜", category: "food" },
        { word: "fruit", meaning: "水果", category: "food" },
        { word: "beef", meaning: "牛肉", category: "food" },
        { word: "pork", meaning: "猪肉", category: "food" },
    ],

    // ============================================
    // 五年级下学期 (Grade 5 - Part 2)
    // ============================================
    "5-2": [
        // 形容词比较级/最高级
        { word: "better", meaning: "更好的", category: "adj" },
        { word: "best", meaning: "最好的", category: "adj" },
        { word: "worse", meaning: "更差的", category: "adj" },
        { word: "worst", meaning: "最差的", category: "adj" },
        { word: "more", meaning: "更多", category: "adj" },
        { word: "most", meaning: "最多", category: "adj" },
        
        // 更多形容词
        { word: "successful", meaning: "成功的", category: "adj" },
        { word: "popular", meaning: "流行的/受欢迎的", category: "adj" },
        { word: "special", meaning: "特别的", category: "adj" },
        { word: "different", meaning: "不同的", category: "adj" },
        { word: "same", meaning: "相同的", category: "adj" },
        
        // 动词
        { word: "enjoy", meaning: "喜欢", category: "verb" },
        { word: "hope", meaning: "希望", category: "verb" },
        { word: "wish", meaning: "祝愿", category: "verb" },
        { word: "miss", meaning: "想念", category: "verb" },
        { word: "believe", meaning: "相信", category: "verb" },
        { word: "understand", meaning: "理解", category: "verb" },
        
        // 时间
        { word: "week", meaning: "周", category: "time" },
        { word: "month", meaning: "月", category: "time" },
        { word: "year", meaning: "年", category: "time" },
        { word: "birthday", meaning: "生日", category: "time" },
        
        // 活动
        { word: "party", meaning: "派对", category: "activity" },
        { word: "game", meaning: "游戏", category: "activity" },
        { word: "sport", meaning: "运动", category: "activity" },
        
        // 其他名词
        { word: "story", meaning: "故事", category: "noun" },
        { word: "song", meaning: "歌曲", category: "noun" },
        { word: "film", meaning: "电影", category: "noun" },
        { word: "photo", meaning: "照片", category: "noun" },
        { word: "gift", meaning: "礼物", category: "noun" },
    ],

    // ============================================
    // 六年级上学期 (Grade 6 - Part 1)
    // ============================================
    "6-1": [
        // 职业
        { word: "doctor", meaning: "医生", category: "job" },
        { word: "nurse", meaning: "护士", category: "job" },
        { word: "driver", meaning: "司机", category: "job" },
        { word: "farmer", meaning: "农民", category: "job" },
        { word: "cook", meaning: "厨师", category: "job" },
        { word: "police", meaning: "警察", category: "job" },
        { word: "postman", meaning: "邮递员", category: "job" },
        { word: "businessman", meaning: "商人", category: "job" },
        
        // 动词
        { word: "wear", meaning: "穿", category: "verb" },
        { word: "show", meaning: "展示", category: "verb" },
        { word: "call", meaning: "打电话/叫", category: "verb" },
        { word: "answer", meaning: "回答", category: "verb" },
        { word: "ask", meaning: "问", category: "verb" },
        { word: "tell", meaning: "告诉", category: "verb" },
        { word: "say", meaning: "说", category: "verb" },
        { word: "spell", meaning: "拼写", category: "verb" },
        
        // 语言
        { word: "language", meaning: "语言", category: "noun" },
        { word: "Chinese", meaning: "中文/汉语", category: "noun" },
        { word: "Japanese", meaning: "日语", category: "noun" },
        { word: "French", meaning: "法语", category: "noun" },
        
        // 国家/国籍
        { word: "Canadian", meaning: "加拿大人", category: "nationality" },
        { word: "Australian", meaning: "澳大利亚人", category: "nationality" },
        { word: "American", meaning: "美国人", category: "nationality" },
        { word: "British", meaning: "英国人", category: "nationality" },
        { word: "Japanese", meaning: "日本人", category: "nationality" },
        
        // 更多形容词
        { word: "national", meaning: "国家的", category: "adj" },
        { word: "international", meaning: "国际的", category: "adj" },
        { word: "traditional", meaning: "传统的", category: "adj" },
        { word: "modern", meaning: "现代的", category: "adj" },
    ],

    // ============================================
    // 六年级下学期 (Grade 6 - Part 2)
    // ============================================
    "6-2": [
        // 动词
        { word: "become", meaning: "变成", category: "verb" },
        { word: "change", meaning: "改变", category: "verb" },
        { word: "grow", meaning: "生长", category: "verb" },
        { word: "fly", meaning: "飞", category: "verb" },
        { word: "travel", meaning: "旅行", category: "verb" },
        { word: "return", meaning: "返回", category: "verb" },
        { word: "bring", meaning: "带来", category: "verb" },
        { word: "send", meaning: "发送", category: "verb" },
        
        // 名词
        { word: "university", meaning: "大学", category: "noun" },
        { word: "college", meaning: "学院", category: "noun" },
        { word: "company", meaning: "公司", category: "noun" },
        { word: "factory", meaning: "工厂", category: "noun" },
        { word: "museum", meaning: "博物馆", category: "noun" },
        { word: "theatre", meaning: "剧院", category: "noun" },
        
        // 形容词
        { word: "possible", meaning: "可能的", category: "adj" },
        { word: "impossible", meaning: "不可能的", category: "adj" },
        { word: "necessary", meaning: "必要的", category: "adj" },
        
        // 短语动词
        { word: "grow up", meaning: "成长", category: "phrase" },
        { word: "come from", meaning: "来自", category: "phrase" },
        { word: "be good at", meaning: "擅长", category: "phrase" },
        { word: "look forward to", meaning: "期待", category: "phrase" },
        { word: "take part in", meaning: "参加", category: "phrase" },
        
        // 结束语
        { word: "future", meaning: "未来", category: "noun" },
        { word: "dream", meaning: "梦想", category: "noun" },
    ],
};

// 导出所有单词（用于游戏）
function getAllWords() {
    let allWords = [];
    for (let grade in WORD_DATA) {
        allWords = allWords.concat(WORD_DATA[grade]);
    }
    return allWords;
}

// 获取年级单词
function getWordsByGrade(grade) {
    return WORD_DATA[grade] || [];
}

// 获取指定年级及以下的所有单词
function getWordsUpToGrade(grade) {
    let allWords = [];
    for (let i = 1; i <= grade; i++) {
        const gradeKey = i.toString();
        if (WORD_DATA[gradeKey]) {
            allWords = allWords.concat(WORD_DATA[gradeKey]);
        }
        // 也检查 i-1 格式（如 "1-1", "1-2"）
        for (let semester = 1; semester <= 2; semester++) {
            const semesterKey = gradeKey + "-" + semester;
            if (WORD_DATA[semesterKey]) {
                allWords = allWords.concat(WORD_DATA[semesterKey]);
            }
        }
    }
    return allWords;
}

// 获取所有年级列表
function getAllGrades() {
    return Object.keys(WORD_DATA);
}

// 浏览器版本不需要 module.exports
// module.exports = { WORD_DATA, getAllWords, getWordsByGrade, getAllGrades };
