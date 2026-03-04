// 阶段2：基于类别生成更合理的候选词表
// 使用words.js中的category信息来生成同类别但不同的干扰词

const fs = require('fs');
const path = require('path');

// 读取words.js并提取单词及类别
function getWordsWithCategory() {
    const wordsJsPath = path.join(__dirname, '..', 'words.js');
    const content = fs.readFileSync(wordsJsPath, 'utf-8');
    
    // 找到1-3年级的section
    const sections = [
        { name: '1-1', start: content.indexOf('"1-1":') },
        { name: '1-2', start: content.indexOf('"1-2":') },
        { name: '2-1', start: content.indexOf('"2-1":') },
        { name: '2-2', start: content.indexOf('"2-2":') },
        { name: '3-1', start: content.indexOf('"3-1":') },
        { name: '3-2', start: content.indexOf('"3-2":') }
    ].filter(s => s.start >= 0).sort((a, b) => a.start - b.start);
    
    const wordMap = new Map(); // word -> {meaning, category}
    
    for (let i = 0; i < sections.length; i++) {
        const start = sections[i].start;
        const end = (i < sections.length - 1) ? sections[i + 1].start : content.length;
        const sectionContent = content.slice(start, end);
        
        // 匹配 { word: "xxx", meaning: "xxx", category: "xxx" }
        const regex = /\{[^}]*word:\s*"([^"]+)"[^}]*meaning:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"[^}]*\}/g;
        let match;
        while ((match = regex.exec(sectionContent)) !== null) {
            const word = match[1];
            const meaning = match[2];
            const category = match[3];
            if (!wordMap.has(word)) {
                wordMap.set(word, { meaning, category });
            }
        }
    }
    
    return wordMap;
}

// 图片目录
const IMAGE_DIRS = [
    path.join(__dirname, '..', 'images', 'grade1'),
    path.join(__dirname, '..', 'images', 'grade2'),
    path.join(__dirname, '..', 'images', 'grade3')
];

// 获取所有可用的图片（单词）
function getAvailableImages() {
    const images = new Set();
    for (const dir of IMAGE_DIRS) {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.endsWith('.png')) {
                    const word = file.replace('.png', '').replace('_v2', '').replace('_v3', '');
                    images.add(word);
                }
            }
        }
    }
    return Array.from(images);
}

// 获取同类别但不同的干扰词
function getDistractorsByCategory(word, wordInfo, allWords, allWordsInfo) {
    const category = wordInfo?.category;
    const distractors = [];
    
    if (category) {
        // 优先从同类别中选择
        const sameCategory = allWords.filter(w => {
            const info = allWordsInfo.get(w);
            return w !== word && info && info.category === category;
        });
        
        // 随机选择3个
        shuffleArray(sameCategory);
        distractors.push(...sameCategory.slice(0, 3));
    }
    
    // 如果不够3个，从其他类别补充
    if (distractors.length < 3) {
        const others = allWords.filter(w => w !== word && !distractors.includes(w));
        shuffleArray(others);
        for (const w of others) {
            if (distractors.length >= 3) break;
            distractors.push(w);
        }
    }
    
    return distractors.slice(0, 3);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 主函数
function main() {
    console.log('Generating candidate words based on category...');
    
    // 获取单词及类别信息
    const wordMap = getWordsWithCategory();
    const allWords = Array.from(wordMap.keys());
    
    console.log(`Total words with category: ${allWords.length}`);
    
    // 获取可用图片
    const availableImages = getAvailableImages();
    console.log(`Available images: ${availableImages.length}`);
    
    // 过滤出有图片的单词
    const wordsWithImages = allWords.filter(w => availableImages.includes(w));
    console.log(`Words with images: ${wordsWithImages.length}`);
    
    // 生成候选词表
    const candidates = {};
    
    for (const word of wordsWithImages) {
        const wordInfo = wordMap.get(word);
        const distractors = getDistractorsByCategory(word, wordInfo, allWords, wordMap);
        
        // 正确答案放第一位，然后是干扰词
        const options = [word, ...distractors];
        
        candidates[word] = {
            correct: word,
            options: options,
            replaced: []
        };
    }
    
    // 保存结果
    const outputPath = path.join(__dirname, '..', 'docs', 'candidate-words-fixed.json');
    fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
    console.log(`Saved to ${outputPath}`);
    console.log(`Total entries: ${Object.keys(candidates).length}`);
    
    // 打印一些示例
    console.log('\nSample entries:');
    const sampleWords = ['afternoon', 'morning', 'apple', 'cat', 'red', 'one'];
    for (const w of sampleWords) {
        if (candidates[w]) {
            console.log(`  ${w}:`, candidates[w]);
        }
    }
}

main();
