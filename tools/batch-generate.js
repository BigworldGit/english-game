// 阶段2：为english-game项目生成预定义的候选词表
// 批量处理版本

const fs = require('fs');
const path = require('path');
const { getGrade1to3Words, getAllDistractorWords, generateOptions } = require('./generate-candidates');

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

// 主处理函数
async function processWords() {
    console.log('Starting candidate words generation...');
    
    // 获取1-3年级的所有单词和可用图片
    const allWords = getGrade1to3Words();
    const availableImages = getAvailableImages();
    
    console.log(`Total words: ${allWords.length}`);
    console.log(`Available images: ${availableImages.length}`);
    
    // 过滤出有图片的单词
    const wordsWithImages = allWords.filter(w => availableImages.includes(w));
    console.log(`Words with images: ${wordsWithImages.length}`);
    
    // 获取所有干扰词
    const distractorWords = getAllDistractorWords();
    
    // 生成初始候选词组
    const candidates = {};
    for (const word of wordsWithImages) {
        const options = generateOptions(word, distractorWords);
        candidates[word] = {
            correct: word,
            options: options,
            replaced: []
        };
    }
    
    console.log(`Generated initial candidates for ${Object.keys(candidates).length} words`);
    
    // 保存初始结果
    const outputPath = path.join(__dirname, '..', 'docs', 'candidate-words-fixed.json');
    fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
    console.log(`Saved initial candidates to ${outputPath}`);
    
    return candidates;
}

// 运行
processWords().then(() => {
    console.log('Done!');
}).catch(err => {
    console.error('Error:', err);
});
