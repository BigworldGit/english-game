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

    // 隐藏加载动画 - 立即隐藏（不再等待）
    elements.loading.classList.add('hidden');
    console.log('Loading hidden');
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
        // 不显示中文提示，让用户看图猜词
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
    try {
        const canvas = elements.wordCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const width = canvas.width;
        const height = canvas.height;

        // 清空画布 - 天空蓝背景
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, width, height);

        // 绘制草地底部
        ctx.fillStyle = '#5CAB5C';
        ctx.fillRect(0, height * 0.75, width, height * 0.25);

        // 调用绘制函数
        drawMinecraftStyle(ctx, wordData, width, height);
    } catch (e) {
        console.error('Error drawing:', e);
    }
}

// Minecraft 风格像素画绘制系统
function drawMinecraftStyle(ctx, wordData, width, height) {
    const word = wordData.word.toLowerCase();

    // 绘制草地底层
    drawMinecraftBlock(ctx, 0, height * 0.75, width, height * 0.25, 'grass');

    // 根据单词绘制主体
    const success = drawWordImage2(ctx, word, width, height);

    // 如果没有特定图片，绘制一个泥土方块
    if (!success) {
        drawMinecraftBlock(ctx, width/2 - 30, height/2 - 30, 60, 60, 'dirt');
    }
}

// 绘制 Minecraft 风格方块
function drawMinecraftBlock(ctx, x, y, w, h, type) {
    const colors = {
        grass: { base: '#5CAB5C', dark: '#4A8F4A', light: '#6BBF6B', edge: '#3D7A3D' },
        dirt: { base: '#8B5A2B', dark: '#6B4423', light: '#9C6A3C', edge: '#5A3A1A' },
        stone: { base: '#9E9E9E', dark: '#757575', light: '#BDBDBD', edge: '#616161' },
        wood: { base: '#795548', dark: '#5D4037', light: '#8D6E63', edge: '#4E342E' },
        leaves: { base: '#4CAF50', dark: '#388E3C', light: '#66BB6A', edge: '#2E7D32' },
        water: { base: '#29B6F6', dark: '#03A9F4', light: '#4FC3F7', edge: '#0288D1' },
        sand: { base: '#FFE082', dark: '#FFD54F', light: '#FFECB3', edge: '#FFCA28' },
        snow: { base: '#FAFAFA', dark: '#F5F5F5', light: '#FFFFFF', edge: '#E0E0E0' },
    };

    const palette = colors[type] || colors.dirt;
    const pixelSize = Math.max(4, Math.min(w, h) / 16);

    // 绘制主色底
    ctx.fillStyle = palette.base;
    ctx.fillRect(x, y, w, h);

    // 添加深色像素纹理
    ctx.fillStyle = palette.dark;
    for (let i = 0; i < (w * h) / (pixelSize * pixelSize * 3); i++) {
        const px = x + Math.floor(Math.random() * (w / pixelSize)) * pixelSize;
        const py = y + Math.floor(Math.random() * (h / pixelSize)) * pixelSize;
        if (px < x + w - pixelSize && py < y + h - pixelSize) {
            ctx.fillRect(px, py, pixelSize, pixelSize);
        }
    }

    // 边框效果
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // 左上角高光
    ctx.fillStyle = palette.light;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x + 2, y + 2, w * 0.25, h * 0.25);
    ctx.globalAlpha = 1.0;
}

// 绘制单词对应的图片 - Minecraft 像素画风格
function drawWordImage2(ctx, word, width, height) {
    const cx = width / 2;
    const cy = height / 2 - 20;

    // 使用像素点绘制更精美的图片
    return drawMinecraftPixelArt(ctx, word, cx, cy);
}

// 统一的 Minecraft 像素画绘制函数
function drawMinecraftPixelArt(ctx, word, cx, cy) {
    // 动物
    const animals = {
        cat: () => {
            // 橙色猫 - 身体
            drawPixelRect(ctx, cx - 30, cy - 15, 60, 40, '#FF9800');
            // 头
            drawPixelRect(ctx, cx - 25, cy - 35, 35, 30, '#FF9800');
            // 耳朵
            drawPixelRect(ctx, cx - 25, cy - 45, 10, 12, '#FF9800');
            drawPixelRect(ctx, cx + 5, cy - 45, 10, 12, '#FF9800');
            // 眼睛
            drawPixelRect(ctx, cx - 18, cy - 28, 6, 6, '#000000');
            drawPixelRect(ctx, cx + 5, cy - 28, 6, 6, '#000000');
            // 鼻子
            drawPixelRect(ctx, cx - 6, cy - 20, 8, 5, '#F48FB1');
            return true;
        },
        dog: () => {
            // 棕色狗
            drawPixelRect(ctx, cx - 35, cy - 20, 70, 50, '#8D6E63');
            drawPixelRect(ctx, cx - 25, cy - 35, 35, 30, '#8D6E63');
            drawPixelRect(ctx, cx - 30, cy - 40, 12, 15, '#8D6E63');
            drawPixelRect(ctx, cx + 8, cy - 40, 12, 15, '#8D6E63');
            drawPixelRect(ctx, cx - 18, cy - 28, 6, 6, '#000000');
            drawPixelRect(ctx, cx + 5, cy - 28, 6, 6, '#000000');
            drawPixelRect(ctx, cx - 8, cy - 18, 12, 8, '#000000');
            return true;
        },
        bird: () => {
            drawPixelRect(ctx, cx - 30, cy - 15, 60, 35, '#F44336');
            drawPixelRect(ctx, cx + 15, cy - 30, 30, 30, '#F44336');
            drawPixelRect(ctx, cx + 40, cy - 20, 15, 10, '#FFA500');
            drawPixelRect(ctx, cx + 25, cy - 25, 6, 6, '#000000');
            drawPixelRect(ctx, cx - 40, cy - 5, 20, 20, '#D32F2F');
            return true;
        },
        duck: () => {
            drawPixelRect(ctx, cx - 30, cy - 15, 60, 35, '#FFA500');
            drawPixelRect(ctx, cx + 15, cy - 30, 30, 30, '#FFA500');
            drawPixelRect(ctx, cx + 40, cy - 20, 15, 10, '#E69500');
            drawPixelRect(ctx, cx + 25, cy - 25, 6, 6, '#000000');
            return true;
        },
        fish: () => {
            drawPixelRect(ctx, cx - 35, cy - 15, 70, 35, '#2196F3');
            drawPixelRect(ctx, cx + 20, cy - 20, 25, 30, '#2196F3');
            drawPixelRect(ctx, cx - 50, cy - 25, 20, 25, '#1976D2');
            drawPixelRect(ctx, cx + 30, cy - 12, 6, 6, '#000000');
            return true;
        },
        rabbit: () => {
            drawPixelRect(ctx, cx - 25, cy - 10, 50, 35, '#EEEEEE');
            drawPixelRect(ctx, cx - 15, cy - 30, 30, 25, '#EEEEEE');
            drawPixelRect(ctx, cx - 20, cy - 55, 10, 30, '#EEEEEE');
            drawPixelRect(ctx, cx - 2, cy - 55, 10, 30, '#EEEEEE');
            drawPixelRect(ctx, cx - 12, cy - 24, 5, 5, '#F48FB1');
            drawPixelRect(ctx, cx + 2, cy - 24, 5, 5, '#F48FB1');
            return true;
        },
        pig: () => {
            drawPixelRect(ctx, cx - 35, cy - 20, 70, 50, '#F8BBD9');
            drawPixelRect(ctx, cx - 20, cy - 35, 40, 30, '#F8BBD9');
            drawPixelRect(ctx, cx - 15, cy - 20, 30, 15, '#F48FB1');
            drawPixelRect(ctx, cx - 15, cy - 30, 6, 6, '#000000');
            drawPixelRect(ctx, cx + 5, cy - 30, 6, 6, '#000000');
            return true;
        },
        bear: () => {
            drawPixelRect(ctx, cx - 40, cy - 25, 80, 55, '#795548');
            drawPixelRect(ctx, cx - 25, cy - 45, 50, 35, '#795548');
            drawPixelRect(ctx, cx - 30, cy - 55, 15, 15, '#795548');
            drawPixelRect(ctx, cx + 5, cy - 55, 15, 15, '#795548');
            drawPixelRect(ctx, cx - 20, cy - 35, 6, 6, '#000000');
            drawPixelRect(ctx, cx + 8, cy - 35, 6, 6, '#000000');
            return true;
        },
        elephant: () => {
            drawPixelRect(ctx, cx - 40, cy - 20, 80, 50, '#9E9E9E');
            drawPixelRect(ctx, cx - 30, cy - 40, 45, 35, '#9E9E9E');
            drawPixelRect(ctx, cx - 50, cy - 35, 25, 30, '#BDBDBD');
            drawPixelRect(ctx, cx + 18, cy - 35, 25, 30, '#BDBDBD');
            drawPixelRect(ctx, cx - 10, cy - 10, 20, 40, '#9E9E9E');
            drawPixelRect(ctx, cx - 20, cy + 20, 8, 15, '#FFFFFF');
            drawPixelRect(ctx, cx + 5, cy + 20, 8, 15, '#FFFFFF');
            return true;
        },
    };

    // 食物
    const foods = {
        apple: () => {
            drawPixelRect(ctx, cx - 30, cy - 25, 60, 55, '#E53935');
            drawPixelRect(ctx, cx - 25, cy - 20, 15, 15, 'rgba(255,255,255,0.3)');
            drawPixelRect(ctx, cx - 5, cy - 35, 10, 12, '#4CAF50');
            drawPixelRect(ctx, cx - 3, cy - 40, 6, 8, '#795548');
            return true;
        },
        banana: () => {
            drawPixelRect(ctx, cx - 35, cy - 15, 70, 25, '#FFEB3B');
            drawPixelRect(ctx, cx + 20, cy - 25, 20, 20, '#FDD835');
            drawPixelRect(ctx, cx - 40, cy - 10, 15, 15, '#FBC02D');
            return true;
        },
        orange: () => {
            drawPixelRect(ctx, cx - 30, cy - 25, 60, 55, '#FF9800');
            drawPixelRect(ctx, cx - 20, cy - 18, 12, 12, 'rgba(255,255,255,0.2)');
            return true;
        },
        grape: () => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    drawPixelRect(ctx, cx - 30 + c * 22, cy - 30 + r * 22, 18, 18, '#9C27B0');
                }
            }
            drawPixelRect(ctx, cx - 5, cy - 45, 10, 18, '#4CAF50');
            return true;
        },
        watermelon: () => {
            drawPixelRect(ctx, cx - 35, cy - 30, 70, 60, '#4CAF50');
            drawPixelRect(ctx, cx - 28, cy - 23, 56, 46, '#E53935');
            for (let i = 0; i < 6; i++) {
                drawPixelRect(ctx, cx - 20 + i * 8, cy - 10, 4, 8, '#212121');
            }
            return true;
        },
        bread: () => {
            drawPixelRect(ctx, cx - 35, cy - 20, 70, 45, '#FFB74D');
            drawPixelRect(ctx, cx - 30, cy - 15, 60, 35, '#FFA726');
            return true;
        },
        cake: () => {
            drawPixelRect(ctx, cx - 35, cy - 10, 70, 35, '#F48FB1');
            drawPixelRect(ctx, cx - 35, cy - 25, 70, 18, '#E91E63');
            drawPixelRect(ctx, cx - 3, cy - 45, 6, 22, '#FFFFFF');
            drawPixelRect(ctx, cx - 5, cy - 50, 10, 8, '#FFEB3B');
            return true;
        },
        egg: () => {
            ctx.fillStyle = '#FFF9C4';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 25, 35, 0, 0, Math.PI * 2);
            ctx.fill();
            return true;
        },
        milk: () => {
            drawPixelRect(ctx, cx - 25, cy - 35, 50, 70, '#FAFAFA');
            drawPixelRect(ctx, cx - 20, cy - 25, 40, 25, '#42A5F5');
            return true;
        },
        juice: () => {
            drawPixelRect(ctx, cx - 25, cy - 30, 50, 60, '#FF7043');
            drawPixelRect(ctx, cx - 18, cy - 20, 36, 25, '#FFAB91');
            drawPixelRect(ctx, cx - 5, cy - 45, 8, 25, '#FFFFFF');
            return true;
        },
        water: () => {
            drawPixelRect(ctx, cx - 30, cy - 30, 60, 60, '#29B6F6');
            drawPixelRect(ctx, cx - 25, cy - 25, 20, 20, 'rgba(255,255,255,0.3)');
            return true;
        },
    };

    // 颜色
    const colors = {
        red: () => drawColorBlock(ctx, cx, cy, '#E53935'),
        blue: () => drawColorBlock(ctx, cx, cy, '#1E88E5'),
        yellow: () => drawColorBlock(ctx, cx, cy, '#FDD835'),
        green: () => drawColorBlock(ctx, cx, cy, '#43A047'),
        pink: () => drawColorBlock(ctx, cx, cy, '#EC407A'),
        purple: () => drawColorBlock(ctx, cx, cy, '#8E24AA'),
        black: () => drawColorBlock(ctx, cx, cy, '#212121'),
        white: () => drawColorBlock(ctx, cx, cy, '#FAFAFA'),
    };

    // 自然/天气
    const nature = {
        sun: () => {
            drawPixelRect(ctx, cx - 40, cy - 40, 80, 80, '#FFD700');
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const px = cx + Math.cos(angle) * 55;
                const py = cy + Math.sin(angle) * 55;
                drawPixelRect(ctx, px - 8, py - 8, 16, 16, '#FFC107');
            }
            return true;
        },
        moon: () => {
            drawPixelRect(ctx, cx - 35, cy - 35, 70, 70, '#FFF9C4');
            drawPixelRect(ctx, cx - 20, cy - 25, 30, 25, '#FFE082');
            return true;
        },
        cloud: () => {
            drawPixelRect(ctx, cx - 50, cy - 20, 40, 30, '#FFFFFF');
            drawPixelRect(ctx, cx - 35, cy - 35, 70, 35, '#FFFFFF');
            drawPixelRect(ctx, cx - 10, cy - 20, 40, 30, '#FFFFFF');
            return true;
        },
        tree: () => {
            drawPixelRect(ctx, cx - 15, cy + 10, 30, 50, '#795548');
            drawPixelRect(ctx, cx - 45, cy - 50, 90, 65, '#4CAF50');
            drawPixelRect(ctx, cx - 35, cy - 40, 70, 50, '#388E3C');
            return true;
        },
        flower: () => {
            drawPixelRect(ctx, cx - 5, cy + 20, 10, 40, '#4CAF50');
            const fc = ['#E91E63', '#FFEB3B', '#9C27B0', '#FF5722'][Math.floor(Math.random() * 4)];
            drawPixelRect(ctx, cx - 20, cy - 15, 40, 40, fc);
            drawPixelRect(ctx, cx - 8, cy - 8, 16, 16, '#FFC107');
            return true;
        },
        rain: () => {
            drawPixelRect(ctx, cx - 40, cy - 50, 35, 25, '#B0BEC5');
            drawPixelRect(ctx, cx - 25, cy - 60, 55, 30, '#B0BEC5');
            for (let i = 0; i < 8; i++) {
                drawPixelRect(ctx, cx - 35 + i * 10, cy, 4, 25, '#29B6F6');
            }
            return true;
        },
        snow: () => {
            for (let i = 0; i < 15; i++) {
                drawPixelRect(ctx, Math.random() * 200 + 20, Math.random() * 200 + 20, 8, 8, '#FFFFFF');
            }
            return true;
        },
    };

    // 人物
    const people = {
        mother: () => {
            drawPixelRect(ctx, cx - 20, cy - 40, 40, 40, '#FFCC80');
            drawPixelRect(ctx, cx - 30, cy + 5, 60, 50, '#E91E63');
            drawPixelRect(ctx, cx - 25, cy - 45, 50, 30, '#5D4037');
            drawPixelRect(ctx, cx - 30, cy - 25, 15, 40, '#5D4037');
            drawPixelRect(ctx, cx + 15, cy - 25, 15, 40, '#5D4037');
            drawPixelRect(ctx, cx - 12, cy - 30, 5, 5, '#000000');
            drawPixelRect(ctx, cx + 7, cy - 30, 5, 5, '#000000');
            return true;
        },
        father: () => {
            drawPixelRect(ctx, cx - 20, cy - 40, 40, 40, '#FFCC80');
            drawPixelRect(ctx, cx - 30, cy + 5, 60, 50, '#1976D2');
            drawPixelRect(ctx, cx - 22, cy - 45, 44, 18, '#3E2723');
            drawPixelRect(ctx, cx - 12, cy - 30, 5, 5, '#000000');
            drawPixelRect(ctx, cx + 7, cy - 30, 5, 5, '#000000');
            return true;
        },
    };

    // 物品
    const items = {
        book: () => {
            drawPixelRect(ctx, cx - 35, cy - 45, 70, 60, '#5CAB5C');
            drawPixelRect(ctx, cx - 28, cy - 35, 56, 40, '#FFFFFF');
            for (let i = 0; i < 4; i++) {
                drawPixelRect(ctx, cx - 22, cy - 28 + i * 12, 44, 4, '#333333');
            }
            return true;
        },
        pen: () => {
            drawPixelRect(ctx, cx - 40, cy - 8, 80, 16, '#1E88E5');
            drawPixelRect(ctx, cx + 35, cy - 8, 10, 16, '#FFD700');
            return true;
        },
        bag: () => {
            drawPixelRect(ctx, cx - 40, cy - 35, 80, 60, '#F44336');
            drawPixelRect(ctx, cx - 35, cy - 30, 70, 25, '#D32F2F');
            drawPixelRect(ctx, cx - 20, cy - 45, 8, 25, '#212121');
            drawPixelRect(ctx, cx + 12, cy - 45, 8, 25, '#212121');
            return true;
        },
        chair: () => {
            drawPixelRect(ctx, cx - 30, cy - 30, 60, 10, '#8D6E63');
            drawPixelRect(ctx, cx - 30, cy - 45, 10, 45, '#8D6E63');
            drawPixelRect(ctx, cx + 20, cy - 45, 10, 45, '#8D6E63');
            drawPixelRect(ctx, cx - 30, cy - 55, 60, 25, '#8D6E63');
            return true;
        },
        table: () => {
            drawPixelRect(ctx, cx - 45, cy - 15, 90, 15, '#8D6E63');
            drawPixelRect(ctx, cx - 40, cy, 12, 35, '#8D6E63');
            drawPixelRect(ctx, cx + 28, cy, 12, 35, '#8D6E63');
            return true;
        },
        bed: () => {
            drawPixelRect(ctx, cx - 50, cy - 20, 100, 50, '#F44336');
            drawPixelRect(ctx, cx - 45, cy - 15, 90, 40, '#FFFFFF');
            drawPixelRect(ctx, cx - 55, cy - 10, 12, 40, '#795548');
            return true;
        },
        door: () => {
            drawPixelRect(ctx, cx - 30, cy - 50, 60, 80, '#795548');
            drawPixelRect(ctx, cx - 25, cy - 45, 50, 70, '#5D4037');
            drawPixelRect(ctx, cx + 15, cy - 10, 8, 15, '#FFD700');
            return true;
        },
        window: () => {
            drawPixelRect(ctx, cx - 35, cy - 45, 70, 70, '#8D6E63');
            drawPixelRect(ctx, cx - 28, cy - 38, 56, 56, '#81D4FA');
            drawPixelRect(ctx, cx - 3, cy - 38, 6, 56, '#8D6E63');
            drawPixelRect(ctx, cx - 28, cy - 15, 56, 6, '#8D6E63');
            return true;
        },
    };

    // 表情
    const faces = {
        happy: () => {
            drawPixelRect(ctx, cx - 35, cy - 35, 70, 70, '#FFCC80');
            drawPixelRect(ctx, cx - 25, cy - 20, 8, 8, '#000000');
            drawPixelRect(ctx, cx + 10, cy - 20, 8, 8, '#000000');
            drawPixelRect(ctx, cx - 20, cy + 10, 40, 8, '#000000');
            return true;
        },
        sad: () => {
            drawPixelRect(ctx, cx - 35, cy - 35, 70, 70, '#FFCC80');
            drawPixelRect(ctx, cx - 25, cy - 20, 8, 8, '#000000');
            drawPixelRect(ctx, cx + 10, cy - 20, 8, 8, '#000000');
            drawPixelRect(ctx, cx - 15, cy + 20, 30, 8, '#000000');
            return true;
        },
        angry: () => {
            drawPixelRect(ctx, cx - 35, cy - 35, 70, 70, '#FFCC80');
            drawPixelRect(ctx, cx - 25, cy - 25, 8, 8, '#000000');
            drawPixelRect(ctx, cx + 10, cy - 25, 8, 8, '#000000');
            drawPixelRect(ctx, cx - 30, cy - 35, 25, 5, '#F44336');
            drawPixelRect(ctx, cx + 5, cy - 35, 25, 5, '#F44336');
            drawPixelRect(ctx, cx - 20, cy + 10, 40, 8, '#000000');
            return true;
        },
    };

    // 检查所有类别
    if (animals[word]) return animals[word]();
    if (foods[word]) return foods[word]();
    if (colors[word]) return colors[word]();
    if (nature[word]) return nature[word]();
    if (people[word]) return people[word]();
    if (items[word]) return items[word]();
    if (faces[word]) return faces[word]();

    return false;
}

// 辅助函数：绘制像素矩形
function drawPixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// 辅助函数：绘制颜色方块
function drawColorBlock(ctx, cx, cy, color) {
    const size = 70;
    drawPixelRect(ctx, cx - size/2, cy - size/2, size, size, color);
    // 添加像素纹理
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 20; i++) {
        drawPixelRect(
            ctx,
            cx - size/2 + Math.random() * size,
            cy - size/2 + Math.random() * size,
            5, 5,
            'rgba(0,0,0,0.1)'
        );
    }
    // 边框
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - size/2, cy - size/2, size, size);
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(cx - size/2, cy - size/2, size/3, size/3);
    return true;
}

// 动物图片绘制
function drawAnimalImage(ctx, word, cx, cy) {
    const size = 80;

    switch(word) {
        case 'cat':
            // 橙色猫
            drawMinecraftBlock(ctx, cx - 35, cy - 20, 70, 50, 'grass');
            // 头
            drawMinecraftBlock(ctx, cx - 25, cy - 35, 35, 30, 'grass');
            // 耳朵
            drawMinecraftBlock(ctx, cx - 25, cy - 45, 10, 12, 'grass');
            drawMinecraftBlock(ctx, cx + 5, cy - 45, 10, 12, 'grass');
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 18, cy - 28, 6, 6);
            ctx.fillRect(cx + 5, cy - 28, 6, 6);
            // 鼻子
            ctx.fillStyle = '#F48FB1';
            ctx.fillRect(cx - 6, cy - 20, 8, 5);
            return true;

        case 'dog':
            // 棕色狗
            drawMinecraftBlock(ctx, cx - 35, cy - 20, 70, 50, 'wood');
            drawMinecraftBlock(ctx, cx - 25, cy - 35, 35, 30, 'wood');
            // 耳朵
            drawMinecraftBlock(ctx, cx - 30, cy - 40, 12, 15, 'wood');
            drawMinecraftBlock(ctx, cx + 8, cy - 40, 12, 15, 'wood');
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 18, cy - 28, 6, 6);
            ctx.fillRect(cx + 5, cy - 28, 6, 6);
            // 鼻子
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 8, cy - 18, 12, 8);
            return true;

        case 'bird':
        case 'duck':
            const birdColor = word === 'duck' ? '#FFA500' : '#F44336';
            ctx.fillStyle = birdColor;
            // 身体
            ctx.fillRect(cx - 30, cy - 15, 60, 35);
            // 头
            ctx.fillRect(cx + 15, cy - 30, 30, 30);
            // 嘴
            ctx.fillStyle = '#FFA500';
            ctx.fillRect(cx + 40, cy - 20, 15, 10);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx + 25, cy - 25, 6, 6);
            // 翅膀
            ctx.fillStyle = birdColor;
            ctx.fillRect(cx - 40, cy - 5, 20, 20);
            return true;

        case 'fish':
            // 鱼
            ctx.fillStyle = '#4DD0E1';
            // 身体
            ctx.fillRect(cx - 35, cy - 15, 70, 35);
            // 头
            ctx.fillRect(cx + 20, cy - 20, 25, 30);
            // 尾巴
            ctx.fillRect(cx - 50, cy - 25, 20, 25);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx + 30, cy - 12, 6, 6);
            return true;

        case 'rabbit':
            // 兔子
            ctx.fillStyle = '#E0E0E0';
            // 身体
            ctx.fillRect(cx - 25, cy - 10, 50, 35);
            // 头
            ctx.fillRect(cx - 15, cy - 30, 30, 25);
            // 耳朵
            ctx.fillRect(cx - 20, cy - 55, 10, 30);
            ctx.fillRect(cx - 2, cy - 55, 10, 30);
            // 眼睛
            ctx.fillStyle = '#F48FB1';
            ctx.fillRect(cx - 12, cy - 24, 5, 5);
            ctx.fillRect(cx + 2, cy - 24, 5, 5);
            return true;

        case 'pig':
            // 粉色猪
            ctx.fillStyle = '#F8BBD9';
            ctx.fillRect(cx - 35, cy - 20, 70, 50);
            ctx.fillRect(cx - 20, cy - 35, 40, 30);
            // 鼻子
            ctx.fillStyle = '#F48FB1';
            ctx.fillRect(cx - 15, cy - 20, 30, 15);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 15, cy - 30, 6, 6);
            ctx.fillRect(cx + 5, cy - 30, 6, 6);
            return true;

        case 'bear':
            // 熊
            ctx.fillStyle = '#795548';
            ctx.fillRect(cx - 40, cy - 25, 80, 55);
            ctx.fillRect(cx - 25, cy - 45, 50, 35);
            // 耳朵
            ctx.fillRect(cx - 30, cy - 55, 15, 15);
            ctx.fillRect(cx + 5, cy - 55, 15, 15);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 20, cy - 35, 6, 6);
            ctx.fillRect(cx + 8, cy - 35, 6, 6);
            return true;

        case 'lion':
            // 狮子
            ctx.fillStyle = '#FFB300';
            ctx.fillRect(cx - 35, cy - 20, 70, 50);
            ctx.fillRect(cx - 25, cy - 35, 50, 35);
            // 鬃毛
            ctx.fillStyle = '#FF8F00';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.fillRect(
                    cx + Math.cos(angle) * 35 - 5,
                    cy - 30 + Math.sin(angle) * 35 - 5,
                    10, 10
                );
            }
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 18, cy - 28, 6, 6);
            ctx.fillRect(cx + 5, cy - 28, 6, 6);
            return true;

        case 'tiger':
            // 老虎
            ctx.fillStyle = '#FF7043';
            ctx.fillRect(cx - 35, cy - 20, 70, 50);
            ctx.fillRect(cx - 25, cy - 35, 50, 35);
            // 条纹
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 30, cy - 15, 8, 25);
            ctx.fillRect(cx - 5, cy - 18, 8, 30);
            ctx.fillRect(cx + 20, cy - 15, 8, 25);
            return true;

        case 'monkey':
            // 猴子
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 30, cy - 15, 60, 45);
            ctx.fillRect(cx - 20, cy - 35, 40, 30);
            // 耳朵
            ctx.fillRect(cx - 30, cy - 35, 12, 12);
            ctx.fillRect(cx + 10, cy - 35, 12, 12);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 15, cy - 28, 6, 6);
            ctx.fillRect(cx + 3, cy - 28, 6, 6);
            return true;

        case 'elephant':
            // 大象
            ctx.fillStyle = '#9E9E9E';
            ctx.fillRect(cx - 40, cy - 20, 80, 50);
            ctx.fillRect(cx - 30, cy - 40, 45, 35);
            // 耳朵
            ctx.fillStyle = '#BDBDBD';
            ctx.fillRect(cx - 50, cy - 35, 25, 30);
            ctx.fillRect(cx + 18, cy - 35, 25, 30);
            // 鼻子
            ctx.fillStyle = '#9E9E9E';
            ctx.fillRect(cx - 10, cy - 10, 20, 40);
            // 象牙
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 20, cy + 20, 8, 15);
            ctx.fillRect(cx + 5, cy + 20, 8, 15);
            return true;
    }
    return false;
}

// 食物图片绘制
function drawFoodImage(ctx, word, cx, cy) {
    switch(word) {
        case 'apple':
            // 苹果 - 红色方块
            ctx.fillStyle = '#E53935';
            ctx.fillRect(cx - 30, cy - 25, 60, 55);
            // 高光
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(cx - 25, cy - 20, 15, 15);
            // 叶子
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 5, cy - 35, 10, 12);
            // 柄
            ctx.fillStyle = '#795548';
            ctx.fillRect(cx - 3, cy - 40, 6, 8);
            return true;

        case 'banana':
            // 香蕉 - 黄色弧形
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(cx - 35, cy - 15, 70, 25);
            ctx.fillRect(cx + 20, cy - 25, 20, 20);
            ctx.fillRect(cx - 40, cy - 10, 15, 15);
            return true;

        case 'orange':
            // 橙子
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(cx - 30, cy - 25, 60, 55);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(cx - 20, cy - 18, 12, 12);
            return true;

        case 'grape':
            // 葡萄 - 紫色方块
            ctx.fillStyle = '#9C27B0';
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    ctx.fillRect(cx - 30 + col * 22, cy - 30 + row * 22, 18, 18);
                }
            }
            // 茎
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 5, cy - 45, 10, 18);
            return true;

        case 'watermelon':
        case 'watermoon':
            // 西瓜
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 35, cy - 30, 70, 60);
            ctx.fillStyle = '#E53935';
            ctx.fillRect(cx - 28, cy - 23, 56, 46);
            // 瓜子
            ctx.fillStyle = '#000';
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(cx - 20 + i * 8, cy - 10, 4, 8);
            }
            return true;

        case 'strawberry':
            // 草莓
            ctx.fillStyle = '#E53935';
            ctx.fillRect(cx - 25, cy - 20, 50, 45);
            // 种子
            ctx.fillStyle = '#FFEB3B';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    ctx.fillRect(cx - 18 + i * 15, cy - 12 + j * 12, 5, 5);
                }
            }
            // 叶子
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 20, cy - 30, 40, 12);
            return true;

        case 'bread':
            // 面包
            ctx.fillStyle = '#FFB74D';
            ctx.fillRect(cx - 35, cy - 20, 70, 45);
            ctx.fillStyle = '#FFA726';
            ctx.fillRect(cx - 30, cy - 15, 60, 35);
            return true;

        case 'cake':
            // 蛋糕
            ctx.fillStyle = '#F48FB1';
            ctx.fillRect(cx - 35, cy - 10, 70, 35);
            ctx.fillStyle = '#E91E63';
            ctx.fillRect(cx - 35, cy - 25, 70, 18);
            // 蜡烛
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 3, cy - 45, 6, 22);
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(cx - 5, cy - 50, 10, 8);
            return true;

        case 'egg':
            // 鸡蛋
            ctx.fillStyle = '#FFF9C4';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 25, 35, 0, 0, Math.PI * 2);
            ctx.fill();
            return true;

        case 'chicken':
            // 鸡肉
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(cx - 30, cy - 20, 60, 45);
            ctx.fillStyle = '#F57F17';
            ctx.fillRect(cx - 20, cy - 30, 40, 15);
            return true;

        case 'beef':
            // 牛肉
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 35, cy - 20, 70, 45);
            ctx.fillStyle = '#6D4C41';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(cx - 30 + i * 20, cy - 10, 15, 25);
            }
            return true;

        case 'rice':
            // 米饭
            ctx.fillStyle = '#FAFAFA';
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(
                    cx - 30 + Math.random() * 60,
                    cy - 25 + Math.random() * 50,
                    6, 4
                );
            }
            return true;

        case 'milk':
            // 牛奶盒
            ctx.fillStyle = '#FAFAFA';
            ctx.fillRect(cx - 25, cy - 35, 50, 70);
            ctx.fillStyle = '#42A5F5';
            ctx.fillRect(cx - 20, cy - 25, 40, 25);
            return true;

        case 'juice':
            // 果汁
            ctx.fillStyle = '#FF7043';
            ctx.fillRect(cx - 25, cy - 30, 50, 60);
            ctx.fillStyle = '#FFAB91';
            ctx.fillRect(cx - 18, cy - 20, 36, 25);
            // 吸管
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 5, cy - 45, 8, 25);
            return true;

        case 'water':
            // 水
            ctx.fillStyle = '#29B6F6';
            ctx.fillRect(cx - 30, cy - 30, 60, 60);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(cx - 25, cy - 25, 20, 20);
            return true;
    }
    return false;
}

// 颜色图片绘制
function drawColorImage(ctx, word, cx, cy) {
    const colors = {
        red: '#E53935', blue: '#1E88E5', yellow: '#FDD835',
        green: '#43A047', pink: '#EC407A', purple: '#8E24AA',
        black: '#212121', white: '#FAFAFA'
    };

    if (colors[word]) {
        // 绘制 Minecraft 方块风格的颜色
        const size = 70;
        ctx.fillStyle = colors[word];
        ctx.fillRect(cx - size/2, cy - size/2, size, size);

        // 像素纹理
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(
                cx - size/2 + Math.random() * size,
                cy - size/2 + Math.random() * size,
                5, 5
            );
        }

        // 边框
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - size/2, cy - size/2, size, size);

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(cx - size/2, cy - size/2, size/3, size/3);

        return true;
    }
    return false;
}

// 数字图片绘制
function drawNumberImage(ctx, word, cx, cy) {
    const numMap = {
        one: '1', two: '2', three: '3', four: '4', five: '5',
        six: '6', seven: '7', eight: '8', nine: '9', ten: '10'
    };

    if (numMap[word]) {
        // Minecraft 背景
        ctx.fillStyle = '#5CAB5C';
        ctx.fillRect(0, 0, 240, 240);

        // 像素风格数字
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 100px VT323';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(numMap[word], cx, cy);

        return true;
    }
    return false;
}

// 自然/天气图片绘制
function drawNatureImage(ctx, word, cx, cy) {
    switch(word) {
        case 'sun':
            // 太阳
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(cx - 40, cy - 40, 80, 80);
            // 光芒
            ctx.fillStyle = '#FFC107';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = cx + Math.cos(angle) * 55;
                const y = cy + Math.sin(angle) * 55;
                ctx.fillRect(x - 8, y - 8, 16, 16);
            }
            return true;

        case 'moon':
            // 月亮
            ctx.fillStyle = '#FFF9C4';
            ctx.fillRect(cx - 35, cy - 35, 70, 70);
            ctx.fillStyle = '#FFE082';
            ctx.fillRect(cx - 20, cy - 25, 30, 25);
            return true;

        case 'star':
            // 星星
            ctx.fillStyle = '#212121';
            ctx.fillRect(0, 0, 240, 240);
            ctx.fillStyle = '#FFD700';
            drawStar(ctx, cx, cy, 5, 35, 15);
            // 小星星
            for (let i = 0; i < 10; i++) {
                const sx = Math.random() * 240;
                const sy = Math.random() * 240;
                drawStar(ctx, sx, sy, 4, 8, 3);
            }
            return true;

        case 'cloud':
            // 云
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 50, cy - 20, 40, 30);
            ctx.fillRect(cx - 35, cy - 35, 70, 35);
            ctx.fillRect(cx - 10, cy - 20, 40, 30);
            return true;

        case 'rain':
            // 下雨天
            ctx.fillStyle = '#78909C';
            ctx.fillRect(0, 0, 240, 240);
            // 云
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(cx - 40, cy - 50, 35, 25);
            ctx.fillRect(cx - 25, cy - 60, 55, 30);
            // 雨滴
            ctx.fillStyle = '#29B6F6';
            for (let i = 0; i < 8; i++) {
                ctx.fillRect(cx - 35 + i * 10, cy, 4, 25);
            }
            return true;

        case 'snow':
            // 下雪天
            ctx.fillStyle = '#E3F2FD';
            ctx.fillRect(0, 0, 240, 240);
            // 雪花
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < 15; i++) {
                ctx.fillRect(
                    Math.random() * 240,
                    Math.random() * 240,
                    8, 8
                );
            }
            return true;

        case 'wind':
            // 风
            ctx.fillStyle = '#E0F7FA';
            ctx.fillRect(0, 0, 240, 240);
            ctx.fillStyle = '#80DEEA';
            ctx.font = 'bold 60px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('~ ~ ~', cx, cy);
            return true;

        case 'tree':
            // 树
            // 树干
            ctx.fillStyle = '#795548';
            ctx.fillRect(cx - 15, cy + 10, 30, 50);
            // 树叶
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 45, cy - 50, 90, 65);
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(cx - 35, cy - 40, 70, 50);
            return true;

        case 'flower':
            // 花
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 5, cy + 20, 10, 40);
            const flowerColors = ['#E91E63', '#FFEB3B', '#9C27B0', '#FF5722'];
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * 4)];
            ctx.fillRect(cx - 20, cy - 15, 40, 40);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(cx - 8, cy - 8, 16, 16);
            return true;

        case 'grass':
            // 草地
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(0, cy, 240, 60);
            ctx.fillStyle = '#5CAB5C';
            ctx.fillRect(0, cy - 20, 240, 30);
            for (let i = 0; i < 30; i++) {
                ctx.fillStyle = '#6BBF6B';
                ctx.fillRect(i * 8 + 2, cy - 30, 4, 15);
            }
            return true;

        case 'leaf':
            // 叶子
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 30, cy - 25, 60, 55);
            ctx.fillStyle = '#81C784';
            ctx.fillRect(cx - 20, cy - 15, 40, 35);
            return true;
    }
    return false;
}

// 人物/家庭图片绘制
function drawPersonImage(ctx, word, cx, cy) {
    switch(word) {
        case 'mother':
            // 妈妈 - 长发女性
            ctx.fillStyle = '#FFCC80';
            ctx.fillRect(cx - 20, cy - 40, 40, 40); // 头
            ctx.fillRect(cx - 30, cy + 5, 60, 50); // 身体
            // 头发
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(cx - 25, cy - 45, 50, 30);
            ctx.fillRect(cx - 30, cy - 25, 15, 40);
            ctx.fillRect(cx + 15, cy - 25, 15, 40);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 12, cy - 30, 5, 5);
            ctx.fillRect(cx + 7, cy - 30, 5, 5);
            return true;

        case 'father':
            // 爸爸 - 短发男性
            ctx.fillStyle = '#FFCC80';
            ctx.fillRect(cx - 20, cy - 40, 40, 40);
            ctx.fillRect(cx - 30, cy + 5, 60, 50);
            // 头发
            ctx.fillStyle = '#3E2723';
            ctx.fillRect(cx - 22, cy - 45, 44, 18);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 12, cy - 30, 5, 5);
            ctx.fillRect(cx + 7, cy - 30, 5, 5);
            return true;

        case 'sister':
            // 姐妹
            ctx.fillStyle = '#FFCC80';
            ctx.fillRect(cx - 18, cy - 35, 36, 36);
            ctx.fillRect(cx - 25, cy + 5, 50, 45);
            // 头发
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 22, cy - 40, 44, 25);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 10, cy - 28, 4, 4);
            ctx.fillRect(cx + 6, cy - 28, 4, 4);
            return true;

        case 'brother':
            // 兄弟
            ctx.fillStyle = '#FFCC80';
            ctx.fillRect(cx - 18, cy - 35, 36, 36);
            ctx.fillRect(cx - 25, cy + 5, 50, 45);
            // 头发
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 20, cy - 40, 40, 15);
            // 眼睛
            ctx.fillStyle = '#000';
            ctx.fillRect(cx - 10, cy - 28, 4, 4);
            ctx.fillRect(cx + 6, cy - 28, 4, 4);
            return true;
    }
    return false;
}

// 物品图片绘制
function drawItemImage(ctx, word, cx, cy) {
    switch(word) {
        case 'book':
            // 书
            ctx.fillStyle = '#5CAB5C';
            ctx.fillRect(cx - 35, cy - 45, 70, 60);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 28, cy - 35, 56, 40);
            // 文字行
            ctx.fillStyle = '#333';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(cx - 22, cy - 28 + i * 12, 44, 4);
            }
            return true;

        case 'pen':
            // 笔
            ctx.fillStyle = '#1E88E5';
            ctx.fillRect(cx - 40, cy - 8, 80, 16);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(cx + 35, cy - 8, 10, 16);
            return true;

        case 'bag':
            // 书包
            ctx.fillStyle = '#F44336';
            ctx.fillRect(cx - 40, cy - 35, 80, 60);
            ctx.fillStyle = '#D32F2F';
            ctx.fillRect(cx - 35, cy - 30, 70, 25);
            // 带子
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 20, cy - 45, 8, 25);
            ctx.fillRect(cx + 12, cy - 45, 8, 25);
            return true;

        case 'chair':
            // 椅子
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 30, cy - 30, 60, 10); // 座
            ctx.fillRect(cx - 30, cy - 45, 10, 45); // 腿
            ctx.fillRect(cx + 20, cy - 45, 10, 45);
            ctx.fillRect(cx - 30, cy - 55, 60, 25); // 背
            return true;

        case 'table':
            // 桌子
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 45, cy - 15, 90, 15); // 面
            ctx.fillRect(cx - 40, cy, 12, 35); // 腿
            ctx.fillRect(cx + 28, cy, 12, 35);
            return true;

        case 'bed':
            // 床
            ctx.fillStyle = '#F44336';
            ctx.fillRect(cx - 50, cy - 20, 100, 50); // 床单
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 45, cy - 15, 90, 40); // 枕头
            ctx.fillStyle = '#795548';
            ctx.fillRect(cx - 55, cy - 10, 12, 40); // 床头
            return true;

        case 'door':
            // 门
            ctx.fillStyle = '#795548';
            ctx.fillRect(cx - 30, cy - 50, 60, 80);
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(cx - 25, cy - 45, 50, 70);
            // 把手
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(cx + 15, cy - 10, 8, 15);
            return true;

        case 'window':
            // 窗户
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 35, cy - 45, 70, 70);
            ctx.fillStyle = '#81D4FA';
            ctx.fillRect(cx - 28, cy - 38, 56, 56);
            // 窗框
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(cx - 3, cy - 38, 6, 56);
            ctx.fillRect(cx - 28, cy - 15, 56, 6);
            return true;

        case 'clock':
            // 时钟
            ctx.fillStyle = '#FAFAFA';
            ctx.fillRect(cx - 30, cy - 35, 60, 70);
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 2, cy - 30, 4, 20);
            ctx.fillRect(cx - 8, cy - 25, 16, 4);
            return true;

        case 'phone':
            // 电话
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 20, cy - 40, 40, 70);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cx - 15, cy - 35, 30, 50);
            return true;

        case 'computer':
            // 电脑
            ctx.fillStyle = '#424242';
            ctx.fillRect(cx - 45, cy - 40, 90, 60); // 屏幕
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 40, cy - 35, 80, 50);
            ctx.fillStyle = '#757575';
            ctx.fillRect(cx - 20, cy + 20, 40, 15); // 底座
            ctx.fillRect(cx - 30, cy + 32, 60, 8);
            return true;

        case 'tv':
        case 'television':
            // 电视
            ctx.fillStyle = '#212121';
            ctx.fillRect(cx - 50, cy - 40, 100, 70);
            ctx.fillStyle = '#1E88E5';
            ctx.fillRect(cx - 45, cy - 35, 90, 60);
            return true;
    }
    return false;
}

// 动作/形容词图片绘制
function drawActionImage(ctx, word, cx, cy) {
    // 表情
    if (['happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty'].includes(word)) {
        ctx.fillStyle = '#FFCC80';
        ctx.fillRect(cx - 35, cy - 35, 70, 70);
        ctx.fillStyle = '#000';

        switch(word) {
            case 'happy':
                // 笑脸
                ctx.fillRect(cx - 25, cy - 20, 8, 8);
                ctx.fillRect(cx + 10, cy - 20, 8, 8);
                ctx.fillRect(cx - 20, cy + 10, 40, 8);
                break;
            case 'sad':
                ctx.fillRect(cx - 25, cy - 20, 8, 8);
                ctx.fillRect(cx + 10, cy - 20, 8, 8);
                ctx.fillRect(cx - 15, cy + 20, 30, 8);
                break;
            case 'angry':
                ctx.fillRect(cx - 25, cy - 25, 8, 8);
                ctx.fillRect(cx + 10, cy - 25, 8, 8);
                ctx.fillStyle = '#F44336';
                ctx.fillRect(cx - 30, cy - 35, 25, 5);
                ctx.fillRect(cx + 5, cy - 35, 25, 5);
                ctx.fillStyle = '#000';
                ctx.fillRect(cx - 20, cy + 10, 40, 8);
                break;
            case 'tired':
                ctx.fillRect(cx - 25, cy - 20, 10, 4);
                ctx.fillRect(cx + 8, cy - 20, 10, 4);
                ctx.fillRect(cx - 20, cy + 10, 40, 8);
                break;
            case 'hungry':
            case 'thirsty':
                ctx.fillRect(cx - 25, cy - 20, 8, 8);
                ctx.fillRect(cx + 10, cy - 20, 8, 8);
                ctx.fillRect(cx - 15, cy + 5, 30, 15);
                break;
        }
        return true;
    }

    // 其他常见词
    switch(word) {
        case 'hot':
            // 热
            ctx.fillStyle = '#F44336';
            ctx.fillRect(cx - 30, cy - 30, 60, 60);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 50px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('HOT', cx, cy + 5);
            return true;

        case 'cold':
            // 冷
            ctx.fillStyle = '#03A9F4';
            ctx.fillRect(cx - 30, cy - 30, 60, 60);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 50px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('COLD', cx, cy + 5);
            return true;

        case 'big':
            // 大
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(cx - 35, cy - 35, 70, 70);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 45px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('BIG', cx, cy + 5);
            return true;

        case 'small':
            // 小
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 20, cy - 20, 40, 40);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 30px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('S', cx, cy + 5);
            return true;

        case 'new':
            // 新
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cx - 30, cy - 30, 60, 60);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 45px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('NEW', cx, cy + 5);
            return true;

        case 'old':
            // 旧
            ctx.fillStyle = '#9E9E9E';
            ctx.fillRect(cx - 30, cy - 30, 60, 60);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 45px VT323';
            ctx.textAlign = 'center';
            ctx.fillText('OLD', cx, cy + 5);
            return true;
    }
    return false;
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
