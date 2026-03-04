// AI分析候选词与图片的关联度
// 使用image工具分析

const fs = require('fs');
const path = require('path');
const { image } = require('../image-analyzer');

// 图片目录
const IMAGE_DIRS = [
    path.join(__dirname, '..', 'images', 'grade1'),
    path.join(__dirname, '..', 'images', 'grade2'),
    path.join(__dirname, '..', 'images', 'grade3')
];

// 找到图片路径
function findImagePath(word) {
    for (const dir of IMAGE_DIRS) {
        // 尝试不同的文件名变体
        const variants = [
            word + '.png',
            word + '_v2.png',
            word + '_v3.png'
        ];
        for (const variant of variants) {
            const fullPath = path.join(dir, variant);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
    }
    return null;
}

// 分析单个单词的候选词
async function analyzeWord(word, options) {
    const imagePath = findImagePath(word);
    if (!imagePath) {
        console.log(`No image found for ${word}`);
        return { needsReplacement: false };
    }
    
    // 调用AI分析
    const optionsStr = options.map((o, i) => `${i + 1}. ${o}`).join(', ');
    const prompt = `图片显示的是 "${word}"。请分析以下4个单词与这张图片的关联程度：
${optionsStr}

请判断每个单词与图片的关联度（1-10分），并指出哪些干扰词（除了正确答案以外的词）关联度过高（>=7分），不适合作为干扰项。
返回格式：只返回需要替换的干扰词（如果有的话），用逗号分隔。如果没有需要替换的，返回"无"。`;
    
    try {
        const result = await image({
            image: imagePath,
            prompt: prompt
        });
        
        console.log(`Analyzed ${word}: ${result.substring(0, 100)}...`);
        
        // 解析结果
        const text = result.toLowerCase();
        if (text.includes('无') || text.includes('none') || text.includes('no')) {
            return { needsReplacement: false };
        }
        
        // 提取需要替换的词
        const replaceWords = [];
        for (const opt of options) {
            if (opt !== word && (text.includes(opt) || text.includes(`"${opt}"`))) {
                replaceWords.push(opt);
            }
        }
        
        return {
            needsReplacement: replaceWords.length > 0,
            replaceWords: replaceWords
        };
    } catch (err) {
        console.error(`Error analyzing ${word}:`, err.message);
        return { needsReplacement: false };
    }
}

// 加载候选词表
function loadCandidates() {
    const data = fs.readFileSync(path.join(__dirname, '..', 'docs', 'candidate-words-fixed.json'), 'utf-8');
    return JSON.parse(data);
}

// 保存候选词表
function saveCandidates(candidates) {
    fs.writeFileSync(
        path.join(__dirname, '..', 'docs', 'candidate-words-fixed.json'),
        JSON.stringify(candidates, null, 2)
    );
}

// 主函数
async function main() {
    const candidates = loadCandidates();
    const words = Object.keys(candidates);
    
    console.log(`Processing ${words.length} words...`);
    
    let processed = 0;
    let replaced = 0;
    
    for (const word of words) {
        const item = candidates[word];
        const result = await analyzeWord(word, item.options);
        
        if (result.needsReplacement) {
            console.log(`${word}: 需要替换 ${result.replaceWords.join(', ')}`);
            replaced++;
        }
        
        processed++;
        if (processed % 10 === 0) {
            console.log(`Processed ${processed}/${words.length}`);
        }
        
        // 简单延迟避免过快
        await new Promise(r => setTimeout(r, 100));
    }
    
    console.log(`Done! Processed ${processed} words, replaced ${replaced}干扰项`);
    saveCandidates(candidates);
}

main().catch(console.error);
