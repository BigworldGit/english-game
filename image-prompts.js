// ============================================================
// Minecraft 风格英语单词图片 AI 绘画提示词
// ============================================================
// 使用方法：
// 1. 将这些提示词复制到 DALL-E 3、Midjourney 或其他 AI 绘画工具
// 2. 生成的图片保存到 images/ 文件夹
// 3. 图片命名格式: {单词}.png (如 cat.png, apple.png)
// ============================================================

const IMAGE_PROMPTS = {
    // Grade 1 - 动物
    "cat": "A cute orange tabby cat in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, green grass background",
    "dog": "A friendly brown dog in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, green grass background",
    "bird": "A red bird in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, blue sky background",
    "duck": "A yellow duck in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, blue sky background",
    "fish": "A blue fish in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, underwater background",
    "rabbit": "A white fluffy rabbit in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, green grass background",
    "pig": "A pink pig in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, green grass background",
    "bear": "A brown bear in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, forest background",
    "lion": "A golden lion in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, savanna background",
    "tiger": "An orange tiger with black stripes in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, jungle background",
    "monkey": "A brown monkey in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, jungle background",
    "elephant": "A grey elephant in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, savanna background",

    // Grade 1 - 食物
    "apple": "A red apple in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, with green leaf on top",
    "banana": "A yellow banana in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style",
    "orange": "An orange fruit in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style",
    "grape": "Purple grapes in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, bunch of grapes",
    "watermelon": "A green and red watermelon in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style",
    "strawberry": "A red strawberry in Minecraft pixel art style, blocky style, pixelated, game art, square pixels, 8-bit style, with green leaves",

    // Grade 1 - 颜色
    "red": "A red Minecraft block, blocky style, square pixels, 8-bit style, pure red color square",
    "blue": "A blue Minecraft block, blocky style, square pixels, 8-bit style, pure blue color square",
    "yellow": "A yellow Minecraft block, blocky style, square pixels, 8-bit style, pure yellow color square",
    "green": "A green Minecraft block, blocky style, square pixels, 8-bit style, pure green color square",
    "pink": "A pink Minecraft block, blocky style, square pixels, 8-bit style, pure pink color square",
    "purple": "A purple Minecraft block, blocky style, square pixels, 8-bit style, pure purple color square",
    "black": "A black Minecraft block, blocky style, square pixels, 8-bit style, pure black color square",
    "white": "A white Minecraft block, blocky style, square pixels, 8-bit style, pure white color square",

    // Grade 1 - 数字
    "one": "The number 1 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "two": "The number 2 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "three": "The number 3 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "four": "The number 4 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "five": "The number 5 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "six": "The number 6 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "seven": "The number 7 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "eight": "The number 8 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "nine": "The number 9 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",
    "ten": "The number 10 in Minecraft style, pixel art, blocky numbers, 8-bit, white number on green grass block background",

    // Grade 1 - 家庭
    "mother": "A woman with long brown hair in Minecraft pixel art style, blocky style, smiling, pixelated, game art",
    "father": "A man with short black hair in Minecraft pixel art style, blocky style, smiling, pixelated, game art",
    "sister": "A girl with brown hair in Minecraft pixel art style, blocky style, smiling, pixelated, game art",
    "brother": "A boy with short hair in Minecraft pixel art style, blocky style, smiling, pixelated, game art",

    // Grade 1 - 身体部位
    "face": "A human face in Minecraft pixel art style, blocky style, pixelated, game art, front view",
    "eye": "A pair of human eyes in Minecraft pixel art style, blocky style, pixelated, game art",
    "nose": "A human nose in Minecraft pixel art style, blocky style, pixelated, game art",
    "mouth": "A human mouth in Minecraft pixel art style, blocky style, pixelated, game art, smiling",
    "hand": "A human hand in Minecraft pixel art style, blocky style, pixelated, game art, open palm",
    "head": "A human head in Minecraft pixel art style, blocky style, pixelated, game art, front view",
    "leg": "A human leg in Minecraft pixel art style, blocky style, pixelated, game art",
    "foot": "A human foot in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 1 - 物品
    "book": "A green book in Minecraft pixel art style, blocky style, pixelated, game art, closed book",
    "pen": "A blue pen in Minecraft pixel art style, blocky style, pixelated, game art",
    "bag": "A red backpack in Minecraft pixel art style, blocky style, pixelated, game art",
    "chair": "A brown wooden chair in Minecraft pixel art style, blocky style, pixelated, game art",
    "table": "A brown wooden table in Minecraft pixel art style, blocky style, pixelated, game art",
    "door": "A brown wooden door in Minecraft pixel art style, blocky style, pixelated, game art",
    "window": "A window with blue glass in Minecraft pixel art style, blocky style, pixelated, game art, wooden frame",
    "school": "A school building in Minecraft pixel art style, blocky style, pixelated, game art",
    "name": "A name tag in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 2 - 更多食物
    "bread": "A brown bread loaf in Minecraft pixel art style, blocky style, pixelated, game art",
    "cake": "A birthday cake in Minecraft pixel art style, blocky style, pixelated, game art, with candles",
    "chicken": "A piece of chicken meat in Minecraft pixel art style, blocky style, pixelated, game art",
    "beef": "A piece of beef meat in Minecraft pixel art style, blocky style, pixelated, game art",
    "egg": "A white egg in Minecraft pixel art style, blocky style, pixelated, game art",
    "rice": "A bowl of white rice in Minecraft pixel art style, blocky style, pixelated, game art",
    "milk": "A milk carton in Minecraft pixel art style, blocky style, pixelated, game art, white with blue",
    "juice": "An orange juice carton in Minecraft pixel art style, blocky style, pixelated, game art",
    "water": "A blue water bucket in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 2 - 地点
    "home": "A Minecraft house, pixel art style, blocky style, 8-bit, wooden house with roof",
    "park": "A Minecraft park with trees and grass, pixel art style, blocky style, 8-bit",
    "hospital": "A Minecraft hospital building, pixel art style, blocky style, 8-bit, with red cross",
    "library": "A Minecraft library, pixel art style, blocky style, 8-bit, with bookshelves",
    "classroom": "A Minecraft classroom, pixel art style, blocky style, 8-bit, with desks and blackboard",
    "supermarket": "A Minecraft supermarket, pixel art style, blocky style, 8-bit",

    // Grade 2 - 时间/天气
    "sun": "The sun in Minecraft pixel art style, blocky style, pixelated, game art, bright yellow",
    "moon": "The moon in Minecraft pixel art style, blocky style, pixelated, game art, white crescent",
    "star": "Stars in Minecraft pixel art style, blocky style, pixelated, game art, night sky",
    "cloud": "White clouds in Minecraft pixel art style, blocky style, pixelated, game art, blue sky",
    "rain": "Rain falling in Minecraft pixel art style, blocky style, pixelated, game art, blue sky with drops",
    "snow": "Snow falling in Minecraft pixel art style, blocky style, pixelated, game art, white snowflakes",
    "wind": "Wind blowing in Minecraft pixel art style, blocky style, pixelated, game art",
    "spring": "Spring season in Minecraft, pixel art style, blocky style, green grass and flowers",
    "summer": "Summer season in Minecraft, pixel art style, blocky style, bright sun",
    "autumn": "Autumn season in Minecraft, pixel art style, blocky style, orange and brown leaves",
    "winter": "Winter season in Minecraft, pixel art style, blocky style, snow and ice",

    // Grade 2 - 形容词
    "hot": "Hot temperature symbol in Minecraft style, pixel art, blocky style, red flame and sun",
    "cold": "Cold temperature symbol in Minecraft style, pixel art, blocky style, blue snowflake",
    "warm": "Warm temperature in Minecraft style, pixel art, blocky style, orange and yellow",
    "cool": "Cool temperature in Minecraft style, pixel art, blocky style, light blue",
    "happy": "A happy smiling face in Minecraft pixel art style, blocky style, pixelated, game art",
    "sad": "A sad crying face in Minecraft pixel art style, blocky style, pixelated, game art",
    "angry": "An angry face in Minecraft pixel art style, blocky style, pixelated, game art, red",
    "tired": "A tired sleepy face in Minecraft pixel art style, blocky style, pixelated, game art",
    "hungry": "A hungry face in Minecraft pixel art style, blocky style, pixelated, game art",
    "thirsty": "A thirsty face in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 2 - 交通工具
    "car": "A red car in Minecraft pixel art style, blocky style, pixelated, game art",
    "bus": "A yellow school bus in Minecraft pixel art style, blocky style, pixelated, game art",
    "bike": "A bicycle in Minecraft pixel art style, blocky style, pixelated, game art",
    "train": "A train in Minecraft pixel art style, blocky style, pixelated, game art",
    "plane": "An airplane in Minecraft pixel art style, blocky style, pixelated, game art, blue sky",
    "ship": "A boat ship in Minecraft pixel art style, blocky style, pixelated, game art",
    "taxi": "A yellow taxi in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 3 - 更多形容词
    "beautiful": "A beautiful scene in Minecraft pixel art style, blocky style, pixelated, colorful flowers",
    "clean": "Clean sparkly items in Minecraft pixel art style, blocky style, pixelated, shiny",
    "dirty": "Dirty muddy items in Minecraft pixel art style, blocky style, pixelated, brown mud",
    "long": "Long items in Minecraft pixel art style, blocky style, pixelated",
    "short": "Short small items in Minecraft pixel art style, blocky style, pixelated",
    "tall": "Tall items in Minecraft pixel art style, blocky style, pixelated",
    "small": "Small tiny items in Minecraft pixel art style, blocky style, pixelated",
    "big": "Big large items in Minecraft pixel art style, blocky style, pixelated",
    "new": "New fresh items in Minecraft pixel art style, blocky style, pixelated, bright colors",
    "old": "Old worn items in Minecraft pixel art style, blocky style, pixelated, brown and grey",
    "good": "Good positive items in Minecraft pixel art style, blocky style, pixelated, green checkmark",
    "bad": "Bad negative items in Minecraft pixel art style, blocky style, pixelated, red X",
    "kind": "A kind heart in Minecraft pixel art style, blocky style, pixelated, red heart",
    "clever": "A clever thinking face in Minecraft pixel art style, blocky style, pixelated",
    "quiet": "A quiet sleeping face in Minecraft pixel art style, blocky style, pixelated",
    "active": "An active running figure in Minecraft pixel art style, blocky style, pixelated",

    // Grade 3 - 服装
    "shirt": "A red shirt in Minecraft pixel art style, blocky style, pixelated, game art",
    "skirt": "A blue skirt in Minecraft pixel art style, blocky style, pixelated, game art",
    "dress": "A purple dress in Minecraft pixel art style, blocky style, pixelated, game art",
    "coat": "A brown coat in Minecraft pixel art style, blocky style, pixelated, game art",
    "jacket": "A denim jacket in Minecraft pixel art style, blocky style, pixelated, game art",
    "sweater": "A wool sweater in Minecraft pixel art style, blocky style, pixelated, game art",
    "shoe": "A brown shoe in Minecraft pixel art style, blocky style, pixelated, game art",
    "sock": "A white sock in Minecraft pixel art style, blocky style, pixelated, game art",
    "glove": "A wool glove in Minecraft pixel art style, blocky style, pixelated, game art",
    "scarf": "A red scarf in Minecraft pixel art style, blocky style, pixelated, game art",
    "hat": "A black hat in Minecraft pixel art style, blocky style, pixelated, game art",
    "cap": "A blue baseball cap in Minecraft pixel art style, blocky style, pixelated, game art",

    // Grade 3 - 科技产品
    "computer": "A computer monitor in Minecraft pixel art style, blocky style, pixelated, game art",
    "television": "A television TV in Minecraft pixel art style, blocky style, pixelated, game art",
    "radio": "A radio in Minecraft pixel art style, blocky style, pixelated, game art",
    "telephone": "A telephone in Minecraft pixel art style, blocky style, pixelated, game art",
    "camera": "A camera in Minecraft pixel art style, blocky style, pixelated, game art",
    "watch": "A wristwatch in Minecraft pixel art style, blocky style, pixelated, game art",
    "umbrella": "A red umbrella in Minecraft pixel art style, blocky style, pixelated, game art",

    // 更多常见单词...
    "tree": "A Minecraft tree, pixel art style, blocky style, 8-bit, green leaves brown trunk",
    "flower": "A colorful flower in Minecraft pixel art style, blocky style, pixelated, red yellow purple",
    "grass": "Green grass blocks in Minecraft pixel art style, blocky style, pixelated, square grass",
    "leaf": "Green leaves in Minecraft pixel art style, blocky style, pixelated, square leaves",
};

// ============================================================
// 生成所有单词的提示词
// ============================================================
function generateAllPrompts() {
    const prompts = [];
    const processed = new Set();

    for (const grade in WORD_DATA) {
        for (const wordData of WORD_DATA[grade]) {
            const word = wordData.word.toLowerCase().replace(/\s+/g, '_');
            if (processed.has(word)) continue;
            processed.add(word);

            if (IMAGE_PROMPTS[word]) {
                prompts.push({
                    word: word,
                    prompt: IMAGE_PROMPTS[word]
                });
            } else {
                // 为没有预设的单词生成通用提示
                prompts.push({
                    word: word,
                    prompt: `The word "${word}" illustrated in Minecraft pixel art style, blocky style, pixelated, 8-bit game art, square pixels, educational word image`
                });
            }
        }
    }

    return prompts;
}

// 导出提示词供 AI 批量生成图片
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IMAGE_PROMPTS, generateAllPrompts };
}
