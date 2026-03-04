// 阶段2：为english-game项目生成预定义的候选词表
const fs = require('fs');
const path = require('path');

// 简单地从words.js中提取1-3年级的单词
function getGrade1to3Words() {
    const wordsJsPath = path.join(__dirname, '..', 'words.js');
    const content = fs.readFileSync(wordsJsPath, 'utf-8');
    
    // 简单的正则提取
    // 匹配 { word: "xxx", ... } 格式
    const wordRegex = /\{[^}]*word:\s*"([^"]+)"[^}]*\}/g;
    const words = new Set();
    let match;
    
    // 检查是否在1-3年级范围内
    const sections = [
        '"1-1":',
        '"1-2":',
        '"2-1":',
        '"2-2":',
        '"3-1":',
        '"3-2":'
    ];
    
    // 找到每个section的起始位置
    const sectionStarts = sections.map(s => ({
        name: s,
        idx: content.indexOf(s)
    })).filter(s => s.idx >= 0).sort((a, b) => a.idx - b.idx);
    
    // 提取每个section的单词
    for (let i = 0; i < sectionStarts.length; i++) {
        const start = sectionStarts[i].idx;
        const end = (i < sectionStarts.length - 1) ? sectionStarts[i + 1].idx : content.length;
        const sectionContent = content.slice(start, end);
        
        let match;
        while ((match = wordRegex.exec(sectionContent)) !== null) {
            words.add(match[1]);
        }
    }
    
    return Array.from(words);
}

// 获取所有可能的干扰词（1-3年级）
function getAllDistractorWords() {
    return getGrade1to3Words();
}

// 为单词生成候选词组
function generateOptions(correctWord, allWords) {
    const options = [correctWord];
    const available = allWords.filter(w => w !== correctWord);
    
    // 随机打乱
    shuffleArray(available);
    
    // 添加3个干扰词
    for (let i = 0; i < 3 && i < available.length; i++) {
        options.push(available[i]);
    }
    
    // 正确答案放第一位
    const correctIdx = options.indexOf(correctWord);
    if (correctIdx > 0) {
        [options[0], options[correctIdx]] = [options[correctIdx], options[0]];
    }
    
    return options;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 导出
module.exports = {
    getGrade1to3Words,
    getAllDistractorWords,
    generateOptions
};

// 测试
if (require.main === module) {
    const words = getGrade1to3Words();
    console.log(`Found ${words.length} words in grades 1-3`);
    console.log('Sample words:', words.slice(0, 20));
}
