/**
 * Minecraft英语单词小助手 - 游戏逻辑
 */

// ============================================
// 全局变量
// ============================================
let currentUser = null;
let currentGrade = 1;
let currentLevel = 1;
let currentQuestion = 1;
let currentWord = null;
let allWords = [];
let currentOptions = [];
let answers = [];
let selectedGrade = null;
let audioContext = null;
let isPlaying = false;

// 游戏配置
const QUESTIONS_PER_LEVEL = 10;

// ============================================
// DOM元素
// ============================================
const elements = {
    loading: document.getElementById('loading'),
    welcomePage: document.getElementById('welcomePage'),
    gamePage: document.getElementById('gamePage'),
    resultPage: document.getElementById('resultPage'),
    loginForm: document.getElementById('loginForm'),
    userInfo: document.getElementById('userInfo'),
    username: document.getElementById('username'),
    startBtn: document.getElementById('startBtn'),
    continueBtn: document.getElementById('continueBtn'),
    resetBtn: document.getElementById('resetBtn'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    currentGrade: document.getElementById('currentGrade'),
    currentLevel: document.getElementById('currentLevel'),
    currentQuestion: document.getElementById('currentQuestion'),
    gameUserName: document.getElementById('gameUserName'),
    levelNum: document.getElementById('levelNum'),
    questionNum: document.getElementById('questionNum'),
    wordCanvas: document.getElementById('wordCanvas'),
    optionsContainer: document.getElementById('optionsContainer'),
    progressBar: document.getElementById('progressBar'),
    feedback: document.getElementById('feedback'),
    correctCount: document.getElementById('correctCount'),
    wrongCount: document.getElementById('wrongCount'),
    accuracyValue: document.getElementById('accuracyValue'),
    accuracyCircle: document.getElementById('accuracyCircle'),
    resultMessage: document.getElementById('resultMessage'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    homeBtn: document.getElementById('homeBtn'),
    musicControl: document.getElementById('musicControl'),
    wordHint: document.getElementById('wordHint')
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

function initGame() {
    // 检查用户登录状态
    const savedUser = localStorage.getItem('minecraft_english_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserInfo();
    }

    // 隐藏加载动画
    setTimeout(() => {
        elements.loading.classList.add('hidden');
    }, 500);
}

function setupEventListeners() {
    // 年级选择
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedGrade = parseInt(btn.dataset.grade);
            updateStartButton();
        });
    });

    // 开始按钮
    elements.startBtn.addEventListener('click', startGame);

    // 继续学习
    elements.continueBtn.addEventListener('click', continueGame);

    // 重新开始
    elements.resetBtn.addEventListener('click', resetGame);

    // 下一关
    elements.nextLevelBtn.addEventListener('click', nextLevel);

    // 返回主页
    elements.homeBtn.addEventListener('click', goHome);

    // 音乐控制
    elements.musicControl.addEventListener('click', toggleMusic);

    // 页面关闭前保存进度
    window.addEventListener('beforeunload', saveProgress);

    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
}

// ============================================
// 用户系统
// ============================================
function updateStartButton() {
    const username = elements.username.value.trim();
    elements.startBtn.disabled = !(username.length >= 2 && selectedGrade);
}

function startGame() {
    const username = elements.username.value.trim();
    if (username.length < 2) {
        alert('请输入至少2个字符的名字');
        return;
    }
    if (!selectedGrade) {
        alert('请选择年级');
        return;
    }

    // 创建新用户
    currentUser = {
        id: generateUserId(),
        name: username,
        grade: selectedGrade
    };

    currentGrade = selectedGrade;
    currentLevel = 1;
    currentQuestion = 1;
    answers = [];

    // 保存用户信息
    localStorage.setItem('minecraft_english_user', JSON.stringify(currentUser));

    // 准备单词
    prepareWords();

    // 显示游戏页面
    showPage('game');
    initGameRound();
}

function showUserInfo() {
    elements.loginForm.style.display = 'none';
    elements.userInfo.style.display = 'block';
    elements.userNameDisplay.textContent = currentUser.name;
    elements.currentGrade.textContent = currentUser.grade;

    // 加载保存的进度
    const savedProgress = localStorage.getItem('minecraft_english_progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.userId === currentUser.id) {
            currentGrade = progress.grade;
            currentLevel = progress.level;
            currentQuestion = progress.question;
            answers = progress.answers || [];
            elements.currentLevel.textContent = currentLevel;
            elements.currentQuestion.textContent = currentQuestion;
        }
    }
}

function continueGame() {
    currentGrade = currentUser.grade;
    prepareWords();
    showPage('game');
    initGameRound();
}

function resetGame() {
    if (confirm('确定要重新开始吗？所有进度将被清除！')) {
        localStorage.removeItem('minecraft_english_user');
        localStorage.removeItem('minecraft_english_progress');
        location.reload();
    }
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// 游戏逻辑
// ============================================
function prepareWords() {
    allWords = getWordsUpToGrade(currentGrade);
    // 随机打乱
    allWords = shuffleArray([...allWords]);
}

function initGameRound() {
    // 更新界面
    elements.gameUserName.textContent = currentUser.name;
    updateProgressUI();

    // 获取当前题目
    loadQuestion();
}

function loadQuestion() {
    // 检查是否需要进入下一关
    if (currentQuestion > QUESTIONS_PER_LEVEL) {
        showResult();
        return;
    }

    // 更新题目序号显示
    updateProgressUI();

    // 获取单词
    const wordIndex = (currentLevel - 1) * QUESTIONS_PER_LEVEL + (currentQuestion - 1);
    if (wordIndex >= allWords.length) {
        // 单词不够，重新循环
        prepareWords();
    }

    currentWord = allWords[wordIndex % allWords.length];

    // 显示单词含义提示
    if (elements.wordHint) {
        elements.wordHint.textContent = `提示: ${currentWord.meaning}`;
    }

    // 生成选项
    generateOptions();

    // 绘制图片
    drawWordImage(currentWord);

    // 渲染选项
    renderOptions();

    // 更新进度条
    updateProgressBar();
}

function generateOptions() {
    const correctAnswer = currentWord.word;
    const wrongAnswers = [];

    // 1. 优先选择同类别、长度相近的单词作为干扰项（混淆效果）
    const sameCategory = allWords.filter(w =>
        w.category === currentWord.category && w.word !== correctAnswer
    );

    // 2. 找长度相近的单词
    const lengthDiff = 2; // 允许的长度差异
    const similarLength = allWords.filter(w =>
        w.word !== correctAnswer &&
        Math.abs(w.word.length - correctAnswer.length) <= lengthDiff
    );

    // 3. 找首字母相同的单词
    const sameInitial = allWords.filter(w =>
        w.word !== correctAnswer &&
        w.word.charAt(0) === correctAnswer.charAt(0)
    );

    // 合并候选词：同类别 > 长度相近 > 首字母相同 > 其他
    let candidates = [
        ...shuffleArray(sameCategory).slice(0, 8),
        ...shuffleArray(similarLength).slice(0, 6),
        ...shuffleArray(sameInitial).slice(0, 4),
        ...shuffleArray(allWords.filter(w => w.word !== correctAnswer)).slice(0, 10)
    ];

    // 去重
    candidates = [...new Set(candidates.map(w => w.word))];

    // 获取3个干扰项
    while (wrongAnswers.length < 3 && candidates.length > 0) {
        const candidate = candidates.pop();
        if (candidate !== correctAnswer) {
            wrongAnswers.push(candidate);
        }
    }

    // 如果干扰项不够，随机生成
    while (wrongAnswers.length < 3) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (randomWord.word !== correctAnswer && !wrongAnswers.includes(randomWord.word)) {
            wrongAnswers.push(randomWord.word);
        }
    }

    // 合并并打乱
    currentOptions = shuffleArray([correctAnswer, ...wrongAnswers]);
}

function renderOptions() {
    elements.optionsContainer.innerHTML = '';

    currentOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => handleAnswer(option, btn));
        elements.optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selected, btn) {
    // 禁用所有按钮
    const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selected === currentWord.word;

    // 记录答案
    answers.push({
        question: currentQuestion,
        word: currentWord.word,
        selected: selected,
        correct: isCorrect
    });

    // 显示反馈
    if (isCorrect) {
        btn.classList.add('correct');
        showFeedback('correct');
        playSound('correct');
    } else {
        btn.classList.add('wrong');
        // 显示正确答案
        buttons.forEach(b => {
            if (b.textContent === currentWord.word) {
                b.classList.add('correct');
            }
        });
        showFeedback('wrong');
        playSound('wrong');
    }

    // 保存进度
    saveProgress();

    // 1.5秒后进入下一题
    setTimeout(() => {
        hideFeedback();
        currentQuestion++;
        loadQuestion();
    }, 1500);
}

function showFeedback(type) {
    elements.feedback.className = 'feedback show ' + type;
    elements.feedback.querySelector('.feedback-text').textContent = type === 'correct' ? '太棒了！' : '再想想！';
}

function hideFeedback() {
    elements.feedback.classList.remove('show');
}

function updateProgressBar() {
    const progress = ((currentQuestion - 1) / QUESTIONS_PER_LEVEL) * 100;
    elements.progressBar.style.width = progress + '%';
}

function updateProgressUI() {
    elements.levelNum.textContent = currentLevel;
    elements.questionNum.textContent = currentQuestion;
}

// ============================================
// Minecraft风格图片绘制
// ============================================
function drawWordImage(wordData) {
    const canvas = elements.wordCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, width, height);

    // 绘制Minecraft风格像素图
    drawMinecraftStyle(ctx, wordData, width, height);
}

function drawMinecraftStyle(ctx, wordData, width, height) {
    const word = wordData.word.toLowerCase();
    const meaning = wordData.meaning;

    // 根据单词类别绘制不同的图案
    ctx.imageSmoothingEnabled = false;

    switch(wordData.category) {
        case 'animal':
            drawAnimal(ctx, word, width, height);
            break;
        case 'food':
            drawFood(ctx, word, width, height);
            break;
        case 'color':
            drawColor(ctx, word, width, height);
            break;
        case 'number':
            drawNumber(ctx, word, width, height);
            break;
        case 'family':
            drawFamily(ctx, word, width, height);
            break;
        case 'noun':
        default:
            drawObject(ctx, word, width, height);
            break;
    }
}

// 绘制动物
function drawAnimal(ctx, word, width, height) {
    const pixelSize = 12;
    const startX = (width - pixelSize * 12) / 2;
    const startY = (height - pixelSize * 12) / 2;

    // 背景 - 草地
    ctx.fillStyle = '#5CAB5C';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // 根据动物类型绘制
    if (['cat', 'dog', 'rabbit', 'pig', 'bear', 'lion', 'tiger', 'monkey'].includes(word)) {
        drawCatLike(ctx, word, startX, startY, pixelSize);
    } else if (['bird', 'duck'].includes(word)) {
        drawBird(ctx, word, startX, startY, pixelSize);
    } else if (['fish'].includes(word)) {
        drawFish(ctx, startX, startY + 30, pixelSize);
    } else if (['elephant'].includes(word)) {
        drawElephant(ctx, startX, startY, pixelSize);
    } else {
        // 默认绘制小猫
        drawCatLike(ctx, 'cat', startX, startY, pixelSize);
    }
}

function drawCatLike(ctx, word, startX, startY, size) {
    // 身体
    ctx.fillStyle = getAnimalColor(word);
    ctx.fillRect(startX + size * 2, startY + size * 4, size * 8, size * 6);

    // 头
    ctx.fillRect(startX + size * 1, startY + size * 2, size * 6, size * 5);

    // 耳朵
    ctx.fillRect(startX + size * 1, startY, size * 2, size * 2);
    ctx.fillRect(startX + size * 5, startY, size * 2, size * 2);

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(startX + size * 2, startY + size * 3, size, size);
    ctx.fillRect(startX + size * 5, startY + size * 3, size, size);

    // 鼻子
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(startX + size * 3.5, startY + size * 4, size, size * 0.5);

    // 腿
    ctx.fillStyle = getAnimalColor(word);
    ctx.fillRect(startX + size * 2, startY + size * 10, size, size * 2);
    ctx.fillRect(startX + size * 7, startY + size * 10, size, size * 2);

    // 尾巴
    ctx.fillRect(startX, startY + size * 5, size * 2, size);
}

function drawBird(ctx, word, startX, startY, size) {
    // 身体
    ctx.fillStyle = word === 'duck' ? '#FFA500' : '#FF6B6B';
    ctx.fillRect(startX + size * 4, startY + size * 4, size * 5, size * 4);

    // 头
    ctx.fillRect(startX + size * 6, startY + size * 2, size * 3, size * 3);

    // 嘴
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(startX + size * 9, startY + size * 3, size * 2, size);

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(startX + size * 7, startY + size * 2.5, size, size);

    // 翅膀
    ctx.fillStyle = word === 'duck' ? '#E69500' : '#E05555';
    ctx.fillRect(startX + size * 2, startY + size * 5, size * 3, size * 2);

    // 腿
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(startX + size * 5, startY + size * 8, size, size * 2);
    ctx.fillRect(startX + size * 7, startY + size * 8, size, size * 2);
}

function drawFish(ctx, startX, startY, size) {
    // 身体
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(startX + size * 3, startY, size * 8, size * 6);

    // 头
    ctx.fillRect(startX + size * 8, startY + size, size * 4, size * 4);

    // 尾巴
    ctx.fillRect(startX + size * 11, startY - size, size * 3, size * 3);
    ctx.fillRect(startX + size * 11, startY + size * 4, size * 3, size * 3);

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(startX + size * 10, startY + size * 2, size, size);

    // 鳍
    ctx.fillStyle = '#29B6F6';
    ctx.fillRect(startX + size * 5, startY - size, size * 2, size);
    ctx.fillRect(startX + size * 5, startY + size * 6, size * 2, size);
}

function drawElephant(ctx, startX, startY, size) {
    // 身体
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(startX + size, startY + size * 3, size * 10, size * 7);

    // 头
    ctx.fillRect(startX, startY + size, size * 5, size * 5);

    // 耳朵
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(startX - size, startY, size * 3, size * 4);
    ctx.fillRect(startX + size * 8, startY, size * 3, size * 4);

    // 鼻子
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(startX - size, startY + size * 3, size * 3, size * 2);

    // 象牙
    ctx.fillStyle = '#FFF';
    ctx.fillRect(startX - size, startY + size * 5, size, size * 2);
    ctx.fillRect(startX + size * 2, startY + size * 5, size, size * 2);

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(startX + size, startY + size * 2, size, size);

    // 腿
    ctx.fillRect(startX + size * 2, startY + size * 10, size, size * 3);
    ctx.fillRect(startX + size * 8, startY + size * 10, size, size * 3);
}

function getAnimalColor(word) {
    const colors = {
        cat: '#FFB74D',
        dog: '#8D6E63',
        rabbit: '#E0E0E0',
        pig: '#F48FB1',
        bear: '#795548',
        lion: '#FFB300',
        tiger: '#FF7043',
        monkey: '#8D6E63'
    };
    return colors[word] || '#9E9E9E';
}

// 绘制食物
function drawFood(ctx, word, width, height) {
    const size = 14;
    const centerX = width / 2;
    const centerY = height / 2;

    if (word === 'apple') {
        // 苹果
        ctx.fillStyle = '#E53935';
        drawCircle(ctx, centerX, centerY, size * 3);
        // 叶子
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(centerX - 3, centerY - size * 3.5, 6, 10);
        // 柄
        ctx.fillStyle = '#795548';
        ctx.fillRect(centerX - 2, centerY - size * 4, 4, 8);
    } else if (word === 'banana') {
        // 香蕉
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.moveTo(centerX - size * 2, centerY - size * 2);
        ctx.quadraticCurveTo(centerX, centerY - size * 3, centerX + size * 2, centerY + size * 2);
        ctx.quadraticCurveTo(centerX, centerY, centerX - size * 2, centerY - size * 2);
        ctx.fill();
    } else if (word === 'orange') {
        // 橙子
        ctx.fillStyle = '#FF9800';
        drawCircle(ctx, centerX, centerY, size * 3);
    } else if (word === 'grape') {
        // 葡萄
        ctx.fillStyle = '#7B1FA2';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                drawCircle(ctx, centerX - size + i * size, centerY - size + j * size, size * 0.7);
            }
        }
    } else if (word === 'watermoon' || word === 'watermelon') {
        // 西瓜
        ctx.fillStyle = '#4CAF50';
        drawCircle(ctx, centerX, centerY, size * 3.5);
        ctx.fillStyle = '#E53935';
        drawCircle(ctx, centerX, centerY, size * 2.5);
        ctx.fillStyle = '#000';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(centerX - size + i * size * 0.8, centerY - size * 0.5, 3, 3);
        }
    } else if (['bread', 'cake', 'chicken', 'beef', 'egg', 'rice', 'milk', 'juice', 'water'].includes(word)) {
        // 绘制食物图标
        drawFoodIcon(ctx, word, centerX, centerY, size);
    } else {
        // 默认苹果
        ctx.fillStyle = '#E53935';
        drawCircle(ctx, centerX, centerY, size * 3);
    }
}

function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawFoodIcon(ctx, word, x, y, size) {
    const foods = {
        bread: '#FFB74D',
        cake: '#F48FB1',
        chicken: '#FFE0B2',
        beef: '#8D6E63',
        egg: '#FFF9C4',
        rice: '#FFFFFF',
        milk: '#FAFAFA',
        juice: '#FF7043',
        water: '#81D4FA'
    };

    ctx.fillStyle = foods[word] || '#9E9E9E';
    if (word === 'bread') {
        ctx.fillRect(x - size * 3, y - size * 2, size * 6, size * 4);
    } else if (word === 'cake') {
        ctx.fillRect(x - size * 3, y - size, size * 6, size * 2);
        ctx.fillRect(x - size * 2, y - size * 2, size * 4, size);
    } else if (word === 'egg') {
        ctx.beginPath();
        ctx.ellipse(x, y, size * 1.5, size * 2, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        drawCircle(ctx, x, y, size * 2);
    }
}

// 绘制颜色
function drawColor(ctx, word, width, height) {
    const colors = {
        red: '#E53935',
        blue: '#1E88E5',
        yellow: '#FDD835',
        green: '#43A047',
        pink: '#EC407A',
        purple: '#8E24AA',
        black: '#212121',
        white: '#FAFAFA'
    };

    const color = colors[word] || '#9E9E9E';
    const size = 60;

    // 绘制Minecraft方块
    ctx.fillStyle = color;
    ctx.fillRect((width - size) / 2, (height - size) / 2, size, size);

    // 边框效果
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect((width - size) / 2, (height - size) / 2, size, size);

    // 高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect((width - size) / 2, (height - size) / 2, size / 3, size / 3);

    // 显示颜色名称
    ctx.fillStyle = word === 'white' || word === 'yellow' ? '#000' : '#FFF';
    ctx.font = 'bold 20px VT323';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, width / 2, height / 2);
}

// 绘制数字
function drawNumber(ctx, word, width, height) {
    ctx.font = 'bold 80px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 背景
    ctx.fillStyle = '#5CAB5C';
    ctx.fillRect(0, 0, width, height);

    // 数字
    const numMap = { one: '1', two: '2', three: '3', four: '4', five: '5',
                     six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
    const num = numMap[word] || word;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(num, width / 2, height / 2);
}

// 绘制家庭成员
function drawFamily(ctx, word, width, height) {
    const size = 50;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = '#FFCC80';
    // 头
    drawCircle(ctx, centerX, centerY - 20, size / 2);
    // 身体
    ctx.fillRect(centerX - size / 2, centerY, size, size);

    // 根据具体词汇添加细节
    if (word === 'mother') {
        // 妈妈 - 长发
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(centerX - size / 2 - 5, centerY - size / 2 - 10, size + 10, size / 2);
    } else if (word === 'father') {
        // 爸爸 - 短发
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(centerX - size / 2, centerY - size / 2 - 5, size, size / 3);
    }
}

// 绘制物品
function drawObject(ctx, word, width, height) {
    const size = 50;
    const centerX = width / 2;
    const centerY = height / 2;

    // 常见物品的简单绘制
    if (['book', 'bag', 'pen'].includes(word)) {
        // 书本
        ctx.fillStyle = '#5CAB5C';
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size * 1.2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(centerX - size / 4, centerY - size / 3, size / 2, size * 0.8);
    } else if (['chair', 'table', 'bed'].includes(word)) {
        // 椅子
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(centerX - size / 3, centerY - size / 3, size / 1.5, size);
        ctx.fillRect(centerX - size / 2, centerY + size / 3, size, size / 4);
    } else if (['door', 'window'].includes(word)) {
        // 门
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size * 1.5);
        ctx.fillStyle = '#81D4FA';
        ctx.fillRect(centerX - size / 4, centerY - size / 3, size / 2, size);
    } else if (['face', 'eye', 'nose', 'mouth', 'hand', 'head', 'leg', 'foot'].includes(word)) {
        // 脸部或身体部位
        ctx.fillStyle = '#FFCC80';
        drawCircle(ctx, centerX, centerY, size);
        ctx.fillStyle = '#000';
        if (word === 'eye') {
            // 眼睛
            drawCircle(ctx, centerX - size / 3, centerY - size / 5, size / 6);
            drawCircle(ctx, centerX + size / 3, centerY - size / 5, size / 6);
        } else if (word === 'nose') {
            // 鼻子
            ctx.fillStyle = '#FFAB91';
            ctx.fillRect(centerX - 3, centerY, 6, 10);
        } else if (word === 'mouth') {
            // 嘴巴
            ctx.fillRect(centerX - size / 4, centerY + size / 4, size / 2, size / 6);
        } else if (word === 'hand' || word === 'head') {
            // 手或头
            ctx.fillStyle = '#E0E0E0';
            drawCircle(ctx, centerX, centerY, size / 2);
        }
    } else if (['sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind'].includes(word)) {
        // 天气相关
        if (word === 'sun') {
            ctx.fillStyle = '#FFD700';
            drawCircle(ctx, centerX, centerY, size);
            // 光芒
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(
                    centerX + Math.cos(angle) * (size + 10) - 3,
                    centerY + Math.sin(angle) * (size + 10) - 3,
                    6, 6
                );
            }
        } else if (word === 'moon') {
            ctx.fillStyle = '#FFF9C4';
            drawCircle(ctx, centerX, centerY, size);
            ctx.fillStyle = '#FFE082';
            drawCircle(ctx, centerX - size / 4, centerY - size / 4, size / 3);
        } else if (word === 'cloud') {
            ctx.fillStyle = '#FFFFFF';
            drawCircle(ctx, centerX - size / 3, centerY, size / 1.5);
            drawCircle(ctx, centerX, centerY - size / 4, size / 1.2);
            drawCircle(ctx, centerX + size / 3, centerY, size / 1.5);
        } else if (word === 'rain') {
            ctx.fillStyle = '#81D4FA';
            drawCircle(ctx, centerX, centerY, size);
            ctx.fillStyle = '#0288D1';
            for (let i = -2; i <= 2; i++) {
                ctx.fillRect(centerX + i * 15 - 2, centerY + size / 2, 4, 20);
            }
        } else if (word === 'snow') {
            ctx.fillStyle = '#E3F2FD';
            drawCircle(ctx, centerX, centerY, size);
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                drawCircle(ctx, centerX + Math.cos(angle) * 20, centerY + Math.sin(angle) * 20, 6);
            }
        } else if (word === 'wind') {
            ctx.fillStyle = '#B0BEC5';
            drawCircle(ctx, centerX, centerY, size);
            ctx.fillStyle = '#ECEFF1';
            ctx.font = 'bold 24px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('~ ~', centerX, centerY + 5);
        }
    } else if (['water', 'milk', 'juice'].includes(word)) {
        // 饮料
        ctx.fillStyle = word === 'water' ? '#29B6F6' : word === 'milk' ? '#FAFAFA' : '#FF7043';
        drawCircle(ctx, centerX, centerY, size);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(centerX - size / 3, centerY - size / 2, size / 3, size / 2);
    } else if (['flower', 'tree', 'grass', 'leaf'].includes(word)) {
        // 植物
        if (word === 'flower') {
            ctx.fillStyle = '#5CAB5C';
            ctx.fillRect(centerX - 5, centerY, 10, size / 2);
            const colors = ['#E91E63', '#FFEB3B', '#9C27B0', '#FF5722'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            drawCircle(ctx, centerX, centerY - 10, 15);
        } else if (word === 'tree') {
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(centerX - 10, centerY, 20, size / 2);
            ctx.fillStyle = '#2E7D32';
            drawCircle(ctx, centerX, centerY - 20, 30);
        } else if (word === 'grass' || word === 'leaf') {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, centerY, width, height / 2);
            ctx.fillStyle = '#81C784';
            for (let i = 0; i < width; i += 20) {
                ctx.fillRect(i + 5, centerY - 10, 10, 15);
            }
        }
    } else if (['happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty'].includes(word)) {
        // 表情
        ctx.fillStyle = '#FFCC80';
        drawCircle(ctx, centerX, centerY, size);
        ctx.fillStyle = '#000';
        // 眼睛
        drawCircle(ctx, centerX - size / 3, centerY - size / 5, size / 7);
        drawCircle(ctx, centerX + size / 3, centerY - size / 5, size / 7);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        if (word === 'happy') {
            ctx.beginPath();
            ctx.arc(centerX, centerY + 5, size / 2.5, 0, Math.PI);
            ctx.stroke();
        } else if (word === 'sad') {
            ctx.beginPath();
            ctx.arc(centerX, centerY + size, size / 2.5, Math.PI, 0);
            ctx.stroke();
        } else if (word === 'angry') {
            // 眉毛
            ctx.beginPath();
            ctx.moveTo(centerX - size / 2, centerY - size / 2);
            ctx.lineTo(centerX - size / 6, centerY - size / 3);
            ctx.moveTo(centerX + size / 2, centerY - size / 2);
            ctx.lineTo(centerX + size / 6, centerY - size / 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY + size / 3, size / 3, 0, Math.PI);
            ctx.stroke();
        } else if (word === 'tired') {
            ctx.beginPath();
            ctx.moveTo(centerX - size / 3, centerY - size / 5);
            ctx.lineTo(centerX - size / 6, centerY - size / 5 + 3);
            ctx.moveTo(centerX + size / 3, centerY - size / 5);
            ctx.lineTo(centerX + size / 6, centerY - size / 5 + 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY + size / 4, size / 5, 0, Math.PI);
            ctx.stroke();
        } else if (word === 'hungry' || word === 'thirsty') {
            ctx.beginPath();
            ctx.arc(centerX, centerY + size / 4, size / 3, 0, Math.PI);
            ctx.stroke();
        }
    } else {
        // 默认 - 显示单词的Minecraft风格方块
        ctx.fillStyle = '#5CAB5C'; // 草地绿底色
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);

        // 边框效果
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size / 3, size / 3);

        // 显示单词
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px VT323';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 如果单词太长，分两行显示
        if (word.length > 6) {
            ctx.fillText(word.substring(0, 5), centerX, centerY - 8);
            ctx.fillText(word.substring(5), centerX, centerY + 10);
        } else {
            ctx.fillText(word, centerX, centerY + 2);
        }
    }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// ============================================
// 结果页面
// ============================================
function showResult() {
    const correct = answers.filter(a => a.correct).length;
    const wrong = answers.length - correct;
    const accuracy = Math.round((correct / answers.length) * 100);

    // 更新界面
    elements.correctCount.textContent = correct;
    elements.wrongCount.textContent = wrong;
    elements.accuracyValue.textContent = accuracy + '%';

    // 更新正确率圆环
    elements.accuracyCircle.style.background =
        `conic-gradient(var(--primary) ${accuracy * 3.6}deg, #E0E0E0 ${accuracy * 3.6}deg)`;

    // 显示消息
    let message = '';
    if (accuracy >= 90) {
        message = '太棒了！你是英语小高手！🎉';
    } else if (accuracy >= 70) {
        message = '做得不错！继续加油！💪';
    } else if (accuracy >= 50) {
        message = '还不错哦！多练习会更棒！🌟';
    } else {
        message = '别灰心！再试一次一定更好！💖';
    }
    elements.resultMessage.textContent = message;

    // 播放结果音效
    playSound(accuracy >= 70 ? 'success' : 'encourage');

    // 显示结果页面
    showPage('result');
}

function nextLevel() {
    currentLevel++;
    currentQuestion = 1;
    answers = [];
    saveProgress();
    showPage('game');
    initGameRound();
}

function goHome() {
    showPage('welcome');
    if (currentUser) {
        showUserInfo();
    }
}

// ============================================
// 页面管理
// ============================================
function showPage(pageName) {
    elements.welcomePage.classList.remove('active');
    elements.gamePage.classList.remove('active');
    elements.resultPage.classList.remove('active');

    switch(pageName) {
        case 'welcome':
            elements.welcomePage.classList.add('active');
            break;
        case 'game':
            elements.gamePage.classList.add('active');
            break;
        case 'result':
            elements.resultPage.classList.add('active');
            break;
    }
}

// ============================================
// 进度保存
// ============================================
function saveProgress() {
    if (!currentUser) return;

    const progress = {
        userId: currentUser.id,
        grade: currentGrade,
        level: currentLevel,
        question: currentQuestion,
        answers: answers
    };

    localStorage.setItem('minecraft_english_progress', JSON.stringify(progress));
}

// ============================================
// 音频系统
// ============================================
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playSound(type) {
    try {
        const ctx = initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch(type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;
            case 'encourage':
                oscillator.frequency.setValueAtTime(392, ctx.currentTime);
                oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
                oscillator.frequency.setValueAtTime(392, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.45);
                break;
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function toggleMusic() {
    const icon = elements.musicControl.querySelector('.music-icon');

    if (isPlaying) {
        isPlaying = false;
        icon.textContent = '🔇';
        elements.musicControl.classList.remove('playing');
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend();
        }
    } else {
        isPlaying = true;
        icon.textContent = '🎵';
        elements.musicControl.classList.add('playing');
        if (audioContext) {
            audioContext.resume();
        }
        playBackgroundMusic();
    }
}

function playBackgroundMusic() {
    if (!isPlaying || !audioContext) return;

    // 播放简单的背景旋律
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 329.63, 293.66, 261.63];
    let noteIndex = 0;

    function playNote() {
        if (!isPlaying) return;

        const ctx = initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);

        noteIndex = (noteIndex + 1) % notes.length;
        setTimeout(playNote, 500);
    }

    playNote();
}

// ============================================
// 工具函数
// ============================================
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function handleKeyPress(e) {
    // 键盘快捷键
    if (e.key >= '1' && e.key <= '4') {
        const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
        const index = parseInt(e.key) - 1;
        if (buttons[index] && !buttons[index].disabled) {
            buttons[index].click();
        }
    }
}

// 输入框事件
elements.username.addEventListener('input', updateStartButton);

// ============================================
// 导出函数（供调试）
// ============================================
if (typeof window !== 'undefined') {
    window.MinecraftEnglishGame = {
        getWords: () => allWords,
        getCurrentWord: () => currentWord,
        getAnswers: () => answers,
        reset: () => {
            localStorage.removeItem('minecraft_english_user');
            localStorage.removeItem('minecraft_english_progress');
            location.reload();
        }
    };
}
