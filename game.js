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
let questionSequence = [];
let questionCache = {};
let currentOptions = [];
let answers = [];
let reviewWords = [];
let learningProfile = null;
let selectedGrade = null;
let audioContext = null;
let isPlaying = false;
let bgMusic = null;
let isReviewMode = false;
const SOUND_EFFECT_FILES = {
    correct: 'audio/feedback/sfx-answer-correct.mp3',
    wrong: 'audio/feedback/sfx-answer-wrong.mp3',
    success: 'audio/feedback/sfx-level-complete.mp3',
    achievement: 'audio/feedback/sfx-achievement-unlock.mp3'
};
const soundEffectPool = {};
let bgMusicFiles = [
    'audio/colors-and-cheers.mp3',
    'audio/pixelated-fury.mp3',
    'audio/jungle-jamboree.mp3',
    'audio/starlight-symphony.mp3',
    'audio/embers-and-marshmallows.mp3',
    'audio/pixel-power-up.mp3',
    'audio/sunny-learning-fiesta.mp3',
    'audio/global-dream-team.mp3',
    'audio/starlight-lullaby.mp3',
    'audio/Give_Your_Brain_a_Little_Pat.mp3'
];
let currentMusicIndex = 0;

// 预定义的候选词表
let candidateWords = {};
let candidateWordsLoaded = false;
let auditExcludedWords = new Set();
let auditExcludedLoaded = false;
const API_BASE = window.location.origin;
let activeImageRenderToken = 0;

// 游戏配置
const QUESTIONS_PER_LEVEL = 10;
// 已确认不适合继续作为“看图猜词”题目的词。
// 原因包括：
// 1. 词本身过于抽象或属于寒暄短语
// 2. 现有图片资源表达错误、表达过弱，或容易和其他词混淆
const EXCLUDED_IMAGE_WORDS = new Set([
    "I'm",
    'am',
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'how are you',
    'thanks',
    'thank you',
    "what's your name",
    'nice to meet you',
    'your',
    'name',
    'draw',
    'learn'
]);

// 当前仓库中 1-3 年级已存在的图片资源清单。
// 词库可以先完整，但图片题只从这份集合里出题，避免“有词无图”破坏当前玩法。
const AVAILABLE_IMAGE_WORDS = new Set([
    'afternoon', 'always', 'am', 'america', 'american', 'angry', 'answer', 'apple', 'are', 'art',
    'ask', 'australia', 'australian', 'autumn', 'baby', 'back', 'bag', 'banana', 'bear', 'beautiful',
    'become', 'bed', 'beef', 'behind', 'believe', 'best', 'better', 'big', 'bike', 'bird',
    'birthday', 'black', 'blue', 'book', 'boring', 'boy', 'bread', 'bring', 'brother', 'brown',
    'bus', 'businessman', 'but', 'buy', 'bye', 'cake', 'call', 'cap', 'car', 'careful',
    'cat', 'chair', 'change', 'chicken', 'china', 'chinese', 'city', 'classroom', 'clean', 'clever',
    'close', 'cloud', 'cloudy', 'coat', 'cold', 'come', 'come from', 'company', 'cook', 'cool',
    'country', 'dad', 'dance', 'desk', 'different', 'difficult', 'dirty', 'doctor', 'dog', 'door',
    'down', 'draw', 'dream', 'dress', 'drink', 'driver', 'duck', 'easy', 'eat', 'egg',
    'eight', 'elephant', 'empty', 'english', 'enjoy', 'eraser', 'evening', 'eye', 'face', 'factory',
    'farmer', 'fast', 'father', 'film', 'find', 'finish', 'fish', 'five', 'flower', 'fly',
    'foot', 'forget', 'four', 'france', 'friday', 'friend', 'front', 'fruit', 'full', 'future',
    'gift', 'girl', 'give', 'gloves', 'go', 'good', 'good afternoon', 'good evening', 'good morning', 'good night',
    'goodbye', 'grandfather', 'grandma', 'grandmother', 'grandpa', 'grass', 'green', 'grow', 'grow up', 'hand',
    'happy', 'hat', 'have', 'head', 'healthy', 'heavy', 'hello', 'help', 'hi', 'high',
    'home', 'hope', 'hospital', 'hot', 'how', 'hungry', 'i', 'if', 'important', 'in',
    'interesting', 'international', 'japan', 'jeans', 'juice', 'jump', 'kind', 'know', 'language', 'learn',
    'leave', 'left', 'leg', 'library', 'light', 'like', 'listen', 'live', 'long', 'look',
    'love', 'low', 'make', 'man', 'math', 'meet', 'milk', 'miss', 'modern', 'monday',
    'monkey', 'month', 'moon', 'more', 'morning', 'most', 'mother', 'mouth', 'mum', 'museum',
    'music', 'my', 'name', 'national', 'near', 'necessary', 'never', 'new', 'nice', 'night',
    'nine', 'nose', 'nurse', 'often', 'ok', 'old', 'on', 'one', 'open', 'orange',
    'park', 'pe', 'pen', 'pencil', 'photo', 'pig', 'pink', 'plane', 'play', 'police',
    'popular', 'pork', 'possible', 'postman', 'purple', 'rabbit', 'rain', 'rainy', 'read', 'red',
    'remember', 'return', 'rice', 'right', 'road', 'ruler', 'run', 'sad', 'same', 'saturday',
    'say', 'school', 'see', 'sell', 'send', 'seven', 'ship', 'shirt', 'shoe', 'shoes',
    'short', 'shorts', 'sing', 'sister', 'sit', 'six', 'skirt', 'sleep', 'slow', 'slowly',
    'small', 'snow', 'sock', 'socks', 'sofa', 'sometimes', 'song', 'sorry', 'special', 'spell',
    'sport', 'spring', 'stand', 'star', 'start', 'story', 'strong', 'student', 'study', 'successful',
    'summer', 'sun', 'sunday', 'sunny', 'supermarket', 'sweater', 'swim', 'table', 'take', 'tall',
    'teacher', 'tell', 'ten', 'thank', 'thank you', 'think', 'thirsty', 'three', 'thursday', 'tired',
    'to', 'today', 'tomorrow', 'town', 'traditional', 'train', 'travel', 'tree', 'tshirt', 'tuesday',
    'two', 'uk', 'under', 'understand', 'up', 'use', 'usually', 'vegetable', 'village', 'visit',
    'walk', 'want', 'warm', 'watch', 'water', 'weak', 'wear', 'wednesday', 'week', 'welcome',
    'what', 'when', 'where', 'white', 'who', 'whose', 'why', 'window', 'windy', 'winter',
    'wish', 'woman', 'work', 'world', 'worse', 'worst', 'write', 'yellow', 'yesterday', 'you',
    'young', 'your', 'zoo'
]);
const NEWLY_IMPORTED_IMAGE_WORDS = new Set([
    'activity', 'animal', 'ant', 'arm', 'baby bear', 'bad', 'ball', 'balloon', 'beach', 'bee',
    'bicycle', 'biscuit', 'blackboard', 'blouse', 'blow', 'body', 'bowl', 'box', 'breakfast', 'bright',
    'candy', 'card', 'chick', 'child', 'chopsticks', 'classmate', 'climb', 'clothes', 'cola', 'colour',
    'count', 'cow', 'cup', 'cut', 'cute', 'day', 'dinner', 'doll', 'dove', 'ear',
    'family', 'farm', 'fat', 'feel', 'firecracker', 'firework', 'fold', 'food', 'football', 'forest',
    'fox', 'frog', 'giraffe', 'guess', 'hair', 'hamburger', 'hard', 'hear', 'hen', 'here',
    'hippo', 'hop', 'horse', 'house', 'ice cream', 'idea', 'insect', 'jelly', 'jellyfish', 'kangaroo',
    'king', 'kite', 'lemon', 'lion', 'litter', 'mama bear', 'meat', 'mouse', 'narrator', 'new year',
    'nightingale', 'noodle', 'noodles', 'now', 'ox', 'panda', 'papa bear', 'party', 'peach', 'pear',
    'pencil case', 'pick', 'picture', 'pie', 'pizza', 'plate', 'playground', 'playtime', 'poor', 'put',
    'queen bee', 'restaurant', 'ride', 'robot', 'room', 'rope', 'rubber', 'rule', 'salad', 'schoolbag',
    'season', 'seesaw', 'september', 'sheep', 'shopping', 'skate', 'skip', 'sky', 'slide', 'smell',
    'snake', 'soft', 'soup', 'spoon', 'stick', 'stone', 'street', 'swan', 'swing', 'tail',
    'taste', 'tea', 'teachers day', 'teatime', 'there', 'thin', 'thing', 'tie', 'tiger', 'touch',
    'toy', 'toy bear', 'toy shop', 'traffic', 'trousers', 'wait', 'watermelon', 'weather', 'wild', 'wolf',
    'worker', 'yak', 'yummy', 'zebra'
]);
const PLAYABLE_IMAGE_WORDS = new Set([
    ...AVAILABLE_IMAGE_WORDS,
    ...NEWLY_IMPORTED_IMAGE_WORDS
]);
const IMAGE_WORD_ALIASES = {
    't-shirt': 'tshirt',
    'maths': 'math'
};

function normalizeWordKey(word) {
    return String(word)
        .toLowerCase()
        .replace(/\.{3}/g, ' ')
        .replace(/[()]/g, ' ')
        .replace(/['"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function hasPlayableImageAsset(word) {
    const key = normalizeWordKey(word);
    return PLAYABLE_IMAGE_WORDS.has(key) || PLAYABLE_IMAGE_WORDS.has(IMAGE_WORD_ALIASES[key]);
}

// 图片预加载
const imagePreloadCache = new Map();
const PRELOAD_BATCH_SIZE = 3;
const CONCRETE_CATEGORIES = new Set([
    'animal', 'body', 'clothes', 'color', 'drink', 'family', 'food', 'furniture',
    'job', 'nature', 'noun', 'number', 'person', 'place', 'room', 'school', 'subject', 'vehicle'
]);
const CONFLICT_GROUPS = {
    greetings: ['hello', 'hi', 'goodbye', 'bye', 'good morning', 'good afternoon', 'good evening', 'good night'],
    question: ['what', 'who', 'why', 'where', 'when', 'whose', 'how'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'pink', 'purple', 'brown'],
    time: ['morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'birthday'],
    weather: ['sunny', 'rainy', 'cloudy', 'windy', 'snowy', 'hot', 'cold', 'warm', 'cool'],
    places: ['town', 'city', 'village', 'park', 'school', 'hospital', 'zoo', 'farm', 'library', 'supermarket', 'classroom', 'home'],
    directions: ['left', 'right', 'up', 'down', 'front', 'back', 'behind', 'in', 'on', 'under', 'near', 'to'],
    transport: ['car', 'bus', 'bike', 'train', 'plane', 'ship'],
    family: ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'grandpa', 'grandma', 'dad', 'mum'],
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    nationality: ['american', 'australian', 'british', 'canadian', 'chinese', 'america', 'australia', 'britain', 'canada', 'china'],
    subjects: ['chinese', 'english', 'math', 'music', 'art', 'pe', 'science'],
    frequency: ['always', 'usually', 'often', 'sometimes', 'never'],
    pronouns: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their'],
    be: ['am', 'is', 'are', 'was', 'were', 'be'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
};

// 音频对象池
const audioPool = {
    current: null,
    next: null,
    fadeDuration: 2000, // 淡入淡出时间(ms)
    isTransitioning: false
};

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
    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    questionModeLabel: document.getElementById('questionModeLabel'),
    answerStatusText: document.getElementById('answerStatusText'),
    answeredCount: document.getElementById('answeredCount'),
    liveCorrectCount: document.getElementById('liveCorrectCount'),
    liveWrongCount: document.getElementById('liveWrongCount'),
    liveAccuracyRate: document.getElementById('liveAccuracyRate'),
    progressBar: document.getElementById('progressBar'),
    feedback: document.getElementById('feedback'),
    answerResultBadge: document.getElementById('answerResultBadge'),
    reviewStateText: document.getElementById('reviewStateText'),
    correctAnswerText: document.getElementById('correctAnswerText'),
    selectedAnswerText: document.getElementById('selectedAnswerText'),
    feedbackHintText: document.getElementById('feedbackHintText'),
    resultTitle: document.getElementById('resultTitle'),
    correctCount: document.getElementById('correctCount'),
    wrongCount: document.getElementById('wrongCount'),
    bestStreakCount: document.getElementById('bestStreakCount'),
    accuracyValue: document.getElementById('accuracyValue'),
    accuracyCircle: document.getElementById('accuracyCircle'),
    resultMessage: document.getElementById('resultMessage'),
    masteredWordCount: document.getElementById('masteredWordCount'),
    reviewWordCount: document.getElementById('reviewWordCount'),
    masteredWordsList: document.getElementById('masteredWordsList'),
    reviewWordsList: document.getElementById('reviewWordsList'),
    overallMasteredCount: document.getElementById('overallMasteredCount'),
    gradeCoverageText: document.getElementById('gradeCoverageText'),
    overallCoverageText: document.getElementById('overallCoverageText'),
    fixedWrongCount: document.getElementById('fixedWrongCount'),
    achievementBadgeList: document.getElementById('achievementBadgeList'),
    nextGoalText: document.getElementById('nextGoalText'),
    reviewWrongBtn: document.getElementById('reviewWrongBtn'),
    retryLevelBtn: document.getElementById('retryLevelBtn'),
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

    // 加载预定义的候选词表
    loadCandidateWords();
    loadAuditExcludedWords();
    preloadSoundEffects();
    updateStartButton();
    updateContinueButton();

    // 隐藏加载动画
    setTimeout(() => {
        elements.loading.classList.add('hidden');
    }, 500);
}

// 加载预定义的候选词表
function loadCandidateWords() {
    fetch('docs/candidate-words-fixed.json')
        .then(response => response.json())
        .then(data => {
            candidateWords = data;
            candidateWordsLoaded = true;
            console.log('候选词表已加载，共 ' + Object.keys(candidateWords).length + ' 个单词');
            updateStartButton();
            updateContinueButton();
        })
        .catch(error => {
            console.error('加载候选词表失败:', error);
            candidateWords = {};
            candidateWordsLoaded = true;
            updateStartButton();
            updateContinueButton();
        });
}

function loadAuditExcludedWords() {
    fetch('docs/image-audit-excluded.json')
        .then(response => response.json())
        .then(data => {
            const words = Array.isArray(data.words) ? data.words : [];
            auditExcludedWords = new Set(words.map(normalizeWord));
            auditExcludedLoaded = true;
            updateStartButton();
            updateContinueButton();
        })
        .catch(error => {
            console.error('加载审计剔除词失败:', error);
            auditExcludedWords = new Set();
            auditExcludedLoaded = true;
            updateStartButton();
            updateContinueButton();
        });
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
    if (elements.continueBtn) {
        elements.continueBtn.addEventListener('click', continueGame);
    }

    // 重新开始
    elements.resetBtn.addEventListener('click', resetGame);

    // 下一关
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    if (elements.reviewWrongBtn) {
        elements.reviewWrongBtn.addEventListener('click', startReviewRound);
    }
    if (elements.retryLevelBtn) {
        elements.retryLevelBtn.addEventListener('click', replayCurrentRound);
    }

    if (elements.prevQuestionBtn) {
        elements.prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
    }
    if (elements.nextQuestionBtn) {
        elements.nextQuestionBtn.addEventListener('click', goToNextQuestion);
    }

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
    elements.startBtn.disabled = !(username.length >= 2 && selectedGrade && candidateWordsLoaded && auditExcludedLoaded);
}

function updateContinueButton() {
    if (elements.continueBtn) {
        elements.continueBtn.disabled = !(candidateWordsLoaded && auditExcludedLoaded);
    }
}

function startGame() {
    if (!candidateWordsLoaded || !auditExcludedLoaded) {
        alert('题库资源仍在加载中，请稍等片刻');
        return;
    }

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
    questionCache = {};
    reviewWords = [];
    isReviewMode = false;
    loadLearningProfile();

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
    loadLearningProfile();

    // 加载保存的进度
    const savedProgress = localStorage.getItem('minecraft_english_progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.userId === currentUser.id) {
            currentGrade = progress.grade;
            currentLevel = progress.level;
            currentQuestion = progress.question;
            answers = progress.answers || [];
            questionSequence = progress.questionSequence || [];
            reviewWords = progress.reviewWords || [];
            isReviewMode = Boolean(progress.isReviewMode);
            elements.currentLevel.textContent = currentLevel;
            elements.currentQuestion.textContent = currentQuestion;
        }
    }

    updateContinueButton();
}

function continueGame() {
    if (!candidateWordsLoaded || !auditExcludedLoaded) {
        alert('题库资源仍在加载中，请稍等片刻');
        return;
    }

    try {
        currentGrade = currentUser.grade;
        prepareWords();
        showPage('game');
    } catch (e) {
    }
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

function getLearningProfileKey() {
    if (!currentUser?.id) return null;
    return `minecraft_english_learning_profile_${currentUser.id}`;
}

function createEmptyLearningProfile() {
    return {
        userId: currentUser?.id || null,
        wordStats: {},
        totalMasteredWords: 0,
        fixedWrongWords: 0,
        completedRounds: 0,
        perfectRounds: 0,
        bestRoundStreak: 0,
        unlockedAchievements: [],
        lastProcessedRoundSignature: null,
        updatedAt: null
    };
}

function loadLearningProfile() {
    const key = getLearningProfileKey();
    if (!key) {
        learningProfile = createEmptyLearningProfile();
        return;
    }

    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            learningProfile = { ...createEmptyLearningProfile(), ...JSON.parse(saved) };
            learningProfile.wordStats = learningProfile.wordStats || {};
            return;
        }
    } catch (error) {
        console.error('加载学习档案失败:', error);
    }

    learningProfile = createEmptyLearningProfile();
}

function saveLearningProfile() {
    const key = getLearningProfileKey();
    if (!key || !learningProfile) return;
    learningProfile.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(learningProfile));
}

function preloadSoundEffects() {
    Object.entries(SOUND_EFFECT_FILES).forEach(([type, src]) => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        soundEffectPool[type] = audio;
    });
}

function getWordLearningStat(word) {
    if (!learningProfile) {
        learningProfile = createEmptyLearningProfile();
    }
    const key = normalizeWord(word);
    if (!learningProfile.wordStats[key]) {
        learningProfile.wordStats[key] = {
            word,
            correctCount: 0,
            wrongCount: 0,
            consecutiveCorrect: 0,
            needsReview: false,
            mastered: false,
            lastResult: null
        };
    }
    return learningProfile.wordStats[key];
}

function isWordMasteredStat(stat) {
    return stat.consecutiveCorrect >= 2 || (stat.correctCount >= 3 && stat.correctCount > stat.wrongCount);
}

function getAchievementRules(summary, profile = learningProfile || createEmptyLearningProfile()) {
    const bestStreak = Math.max(profile.bestRoundStreak || 0, summary.bestStreak || 0);
    return [
        {
            id: 'first_clear',
            theme: 'daily',
            label: '完成首关',
            unlocked: profile.completedRounds >= 1,
            progressText: `已完成 ${profile.completedRounds}/1 关`
        },
        {
            id: 'perfect_round',
            theme: 'streak',
            label: '满分通关',
            unlocked: profile.perfectRounds >= 1 || summary.accuracy === 100,
            progressText: `已达成 ${Math.max(profile.perfectRounds, summary.accuracy === 100 ? 1 : 0)}/1 次`
        },
        {
            id: 'streak_5',
            theme: 'streak',
            label: '连对 5 题',
            unlocked: bestStreak >= 5,
            progressText: `当前峰值 ${bestStreak}/5`
        },
        {
            id: 'mastered_20',
            theme: 'mastery',
            label: '掌握 20 词',
            unlocked: (profile.totalMasteredWords || 0) >= 20,
            progressText: `当前 ${profile.totalMasteredWords || 0}/20`
        },
        {
            id: 'mastered_50',
            theme: 'mastery',
            label: '掌握 50 词',
            unlocked: (profile.totalMasteredWords || 0) >= 50,
            progressText: `当前 ${profile.totalMasteredWords || 0}/50`
        },
        {
            id: 'fixed_10',
            theme: 'review',
            label: '修复 10 个错词',
            unlocked: (profile.fixedWrongWords || 0) >= 10,
            progressText: `当前 ${profile.fixedWrongWords || 0}/10`
        }
    ];
}

function updateLearningProfileFromAnswers(answerList = answers) {
    if (!currentUser) return;
    if (!learningProfile) {
        loadLearningProfile();
    }

    const roundSignature = JSON.stringify({
        grade: currentGrade,
        level: currentLevel,
        reviewMode: isReviewMode,
        answers: answerList.filter(Boolean).map(answer => ({
            q: answer.question,
            w: answer.word,
            s: answer.selected,
            c: answer.correct
        }))
    });

    if (learningProfile.lastProcessedRoundSignature === roundSignature) {
        return;
    }

    const roundSummary = getRoundSummary(answerList);
    const fixedWords = new Set();
    answerList.filter(Boolean).forEach(answer => {
        const stat = getWordLearningStat(answer.word);
        const wasNeedsReview = stat.needsReview;

        if (answer.correct) {
            stat.correctCount += 1;
            stat.consecutiveCorrect += 1;
            stat.lastResult = 'correct';
            if (wasNeedsReview && stat.consecutiveCorrect >= 1) {
                stat.needsReview = false;
                fixedWords.add(normalizeWord(answer.word));
            }
        } else {
            stat.wrongCount += 1;
            stat.consecutiveCorrect = 0;
            stat.needsReview = true;
            stat.lastResult = 'wrong';
        }

        stat.mastered = isWordMasteredStat(stat);
    });

    const previouslyUnlocked = new Set(learningProfile.unlockedAchievements || []);

    if (!isReviewMode && roundSummary.total > 0) {
        learningProfile.completedRounds += 1;
        if (roundSummary.wrong === 0) {
            learningProfile.perfectRounds += 1;
        }
        learningProfile.bestRoundStreak = Math.max(learningProfile.bestRoundStreak, roundSummary.bestStreak);
    }

    learningProfile.fixedWrongWords += fixedWords.size;
    learningProfile.totalMasteredWords = Object.values(learningProfile.wordStats).filter(stat => stat.mastered).length;
    const unlockedIds = getAchievementRules(roundSummary, learningProfile)
        .filter(rule => rule.unlocked)
        .map(rule => rule.id);
    const newlyUnlocked = unlockedIds.filter(id => !previouslyUnlocked.has(id));
    learningProfile.unlockedAchievements = unlockedIds;
    learningProfile.lastProcessedRoundSignature = roundSignature;
    saveLearningProfile();
    return newlyUnlocked;
}

function getPlayableWordsForCoverage(sourceWords) {
    return sourceWords.filter(wordData =>
        !isImageWordExcluded(wordData.word) &&
        hasPlayableImageAsset(wordData.word)
    );
}

function buildCoverageStat(sourceWords) {
    const uniqueWords = [...new Set(getPlayableWordsForCoverage(sourceWords).map(wordData => normalizeWord(wordData.word)))];
    if (!uniqueWords.length || !learningProfile) {
        return { mastered: 0, total: uniqueWords.length, percent: 0 };
    }

    const mastered = uniqueWords.filter(word => learningProfile.wordStats[word]?.mastered).length;
    return {
        mastered,
        total: uniqueWords.length,
        percent: Math.round((mastered / uniqueWords.length) * 100)
    };
}

function getCoverageStats() {
    const currentGradeWords = getWordsByGrade(currentGrade) || [];
    const cumulativeWords = getWordsUpToGrade(currentGrade) || [];

    return {
        current: buildCoverageStat(currentGradeWords),
        cumulative: buildCoverageStat(cumulativeWords)
    };
}

function getAchievementState(summary) {
    const profile = learningProfile || createEmptyLearningProfile();
    const rules = getAchievementRules(summary, profile);

    const nextLocked = rules.find(rule => !rule.unlocked);

    return {
        unlocked: rules.filter(rule => rule.unlocked).slice(-4),
        nextGoal: nextLocked
            ? `下一目标：${nextLocked.label}，${nextLocked.progressText}`
            : '当前这批核心成就已全部解锁，继续练习会稳定巩固掌握状态。'
    };
}

function normalizeWord(word) {
    return String(word).trim().toLowerCase();
}

function isImageWordExcluded(word) {
    return EXCLUDED_IMAGE_WORDS.has(word) || auditExcludedWords.has(normalizeWord(word));
}

function getConflictGroup(word) {
    const normalized = normalizeWord(word);
    for (const [groupName, words] of Object.entries(CONFLICT_GROUPS)) {
        if (words.includes(normalized)) {
            return groupName;
        }
    }
    return null;
}

function getWordMeta(word) {
    return allWords.find(item => normalizeWord(item.word) === normalizeWord(word)) || null;
}

function getAllowedWordSet() {
    return new Set(allWords.map(item => normalizeWord(item.word)));
}

function getAnswerRecord(questionNumber) {
    return answers[questionNumber - 1] || null;
}

function getReviewedQuestionLimit() {
    return Math.min(answers.length + 1, getCurrentRoundQuestionCount());
}

function getCurrentRoundQuestionCount() {
    return isReviewMode ? Math.max(reviewWords.length, 0) : QUESTIONS_PER_LEVEL;
}

function getCurrentRoundWordData(questionNumber) {
    if (isReviewMode) {
        const reviewWord = reviewWords[questionNumber - 1];
        return reviewWord ? getWordMeta(reviewWord) || { word: reviewWord, category: 'unknown' } : null;
    }

    const wordIndex = (currentLevel - 1) * QUESTIONS_PER_LEVEL + (questionNumber - 1);
    if (wordIndex >= allWords.length) {
        prepareWords();
    }
    return allWords[wordIndex % allWords.length] || null;
}

function getRoundSummary(answerList = answers) {
    const validAnswers = answerList.filter(Boolean);
    const correctAnswers = validAnswers.filter(answer => answer.correct);
    const wrongAnswers = validAnswers.filter(answer => !answer.correct);
    const masteredWords = [...new Set(correctAnswers.map(answer => answer.word).filter(word =>
        !wrongAnswers.some(wrong => wrong.word === word)
    ))];
    const reviewList = [...new Set(wrongAnswers.map(answer => answer.word))];

    let streak = 0;
    let bestStreak = 0;
    validAnswers.forEach(answer => {
        if (answer.correct) {
            streak += 1;
            bestStreak = Math.max(bestStreak, streak);
        } else {
            streak = 0;
        }
    });

    return {
        total: validAnswers.length,
        correct: correctAnswers.length,
        wrong: wrongAnswers.length,
        accuracy: validAnswers.length ? Math.round((correctAnswers.length / validAnswers.length) * 100) : 0,
        masteredWords,
        reviewWords: reviewList,
        bestStreak
    };
}

function generateLearningHint(word, selected, isCorrect) {
    const meta = getWordMeta(word);
    const category = meta?.category || 'unknown';

    if (isCorrect) {
        if (['color', 'animal', 'food', 'place', 'body', 'clothes'].includes(category)) {
            return `你已经抓住这题的主要识别点，${word} 这类词可以继续保持。`;
        }
        return `这题已经掌握，继续保持对 ${word} 这类词的辨认速度。`;
    }

    if (category === 'color') {
        return '这类题先看画面里最突出的颜色，再排除物体名称。';
    }
    if (['animal', 'food', 'body', 'clothes', 'place'].includes(category)) {
        return '这类题先看图片里的主体物体，再判断动作、颜色或场景。';
    }
    return `这题先记入待复习，下一轮优先复习 ${word}。`;
}

function updateQuestionFeedback(answerRecord = null) {
    if (!elements.answerResultBadge || !elements.reviewStateText || !elements.correctAnswerText || !elements.selectedAnswerText || !elements.feedbackHintText) {
        return;
    }

    if (!answerRecord) {
        elements.answerResultBadge.textContent = '待作答';
        elements.answerResultBadge.className = 'feedback-result-badge pending';
        elements.reviewStateText.textContent = '本题还没加入复习列表';
        elements.correctAnswerText.textContent = '-';
        elements.selectedAnswerText.textContent = '-';
        elements.feedbackHintText.textContent = '先观察图片里最明显的主体，再从选项里选最合适的单词。';
        return;
    }

    elements.answerResultBadge.textContent = answerRecord.correct ? '答对了' : '待复习';
    elements.answerResultBadge.className = `feedback-result-badge ${answerRecord.correct ? 'correct' : 'wrong'}`;
    elements.reviewStateText.textContent = answerRecord.correct ? '这题暂时记为已掌握' : '这题已加入待复习列表';
    elements.correctAnswerText.textContent = answerRecord.word;
    elements.selectedAnswerText.textContent = answerRecord.selected;
    elements.feedbackHintText.textContent = answerRecord.learningHint || generateLearningHint(answerRecord.word, answerRecord.selected, answerRecord.correct);
}

function isAnsweredQuestion(questionNumber) {
    return Boolean(getAnswerRecord(questionNumber));
}

function syncQuestionNav() {
    if (!elements.prevQuestionBtn || !elements.nextQuestionBtn) {
        return;
    }

    elements.prevQuestionBtn.disabled = currentQuestion <= 1;
    elements.nextQuestionBtn.disabled = currentQuestion >= getReviewedQuestionLimit();
}

function setQuestionMode(answerRecord) {
    if (!elements.questionModeLabel) {
        return;
    }

    if (!answerRecord) {
        elements.questionModeLabel.textContent = '答题中';
        if (elements.answerStatusText) {
            elements.answerStatusText.textContent = '本题还没作答，选一个最合适的答案吧。';
        }
        updateQuestionFeedback(null);
        return;
    }

    elements.questionModeLabel.textContent = answerRecord.correct ? '回看：答对了' : '回看：答错了';
    if (elements.answerStatusText) {
        elements.answerStatusText.textContent = answerRecord.correct
            ? `这题答对了，正确答案是 ${answerRecord.word}。`
            : `这题答错了，你选的是 ${answerRecord.selected}，正确答案是 ${answerRecord.word}。`;
    }
    updateQuestionFeedback(answerRecord);
}

function updateAnswerStatusPanel(answerRecord) {
    if (!elements.answeredCount || !elements.liveCorrectCount || !elements.liveWrongCount || !elements.liveAccuracyRate) {
        return;
    }

    const answeredList = answers.filter(Boolean);
    const correctTotal = answeredList.filter(answer => answer.correct).length;
    const wrongTotal = answeredList.length - correctTotal;

    elements.answeredCount.textContent = answeredList.length;
    elements.liveCorrectCount.textContent = correctTotal;
    elements.liveWrongCount.textContent = wrongTotal;
    elements.liveAccuracyRate.textContent = answeredList.length === 0
        ? '0%'
        : `${Math.round((correctTotal / answeredList.length) * 100)}%`;

    if (!elements.answerStatusText || answerRecord) {
        return;
    }

    if (answeredList.length === 0) {
        elements.answerStatusText.textContent = '本题还没作答，选一个最合适的答案吧。';
        return;
    }

    elements.answerStatusText.textContent = `目前已完成 ${answeredList.length} / ${getCurrentRoundQuestionCount()} 题。`;
}

function goToPreviousQuestion() {
    if (currentQuestion <= 1) {
        return;
    }
    currentQuestion--;
    loadQuestion();
}

function goToNextQuestion() {
    if (currentQuestion >= getReviewedQuestionLimit()) {
        return;
    }
    currentQuestion++;
    loadQuestion();
}

// ============================================
// 游戏逻辑
// ============================================
function prepareWords() {
    const filteredWords = getWordsUpToGrade(currentGrade).filter(wordData =>
        !isImageWordExcluded(wordData.word) &&
        hasPlayableImageAsset(wordData.word)
    );
    const lookup = new Map(filteredWords.map(wordData => [wordData.word, wordData]));

    if (questionSequence.length > 0) {
        const restored = questionSequence
            .map(word => lookup.get(word))
            .filter(Boolean);
        if (restored.length >= QUESTIONS_PER_LEVEL) {
            allWords = restored;
            questionSequence = restored.map(wordData => wordData.word);
            return;
        }
    }

    allWords = shuffleArray([...filteredWords]);
    questionSequence = allWords.map(wordData => wordData.word);
}

function initGameRound() {
    preloadCurrentRoundImages();

    // 更新界面
    elements.gameUserName.textContent = currentUser.name;
    updateProgressUI();

    // 获取当前题目
    loadQuestion();
}

function loadQuestion() {
    // 检查是否需要进入下一关
    if (currentQuestion > getCurrentRoundQuestionCount()) {
        showResult();
        return;
    }

    // 更新题目序号显示
    updateProgressUI();

    const answerRecord = getAnswerRecord(currentQuestion);
    const cachedState = questionCache[currentQuestion];

    if (answerRecord) {
        currentWord = getWordMeta(answerRecord.word) || { word: answerRecord.word, category: 'unknown' };
        currentOptions = [...answerRecord.options];
    } else if (cachedState) {
        currentWord = cachedState.wordData;
        currentOptions = [...cachedState.options];
    } else {
        currentWord = getCurrentRoundWordData(currentQuestion);
        if (!currentWord) {
            showResult();
            return;
        }
        currentOptions = generateOptions();
        questionCache[currentQuestion] = {
            wordData: currentWord,
            options: [...currentOptions]
        };
    }

    // 绘制图片
    drawWordImage(currentWord);
    applyWordAnimation(currentWord.word);

    // 渲染选项
    renderOptions(answerRecord);
    setQuestionMode(answerRecord);

    // 更新进度条
    updateAnswerStatusPanel(answerRecord);
    updateProgressBar();
    syncQuestionNav();

    // 预加载下一题的答题图片
    preloadNextQuestionImages();
}

// 颜色黑名单：特定单词的候选词需要排除的颜色词
const COLOR_BLACKLIST = {
    // 颜色类单词
    'red': ['red', 'orange', 'yellow', 'pink', 'purple'],
    'blue': ['blue', 'sky', 'cyan'],
    'green': ['green', 'grass', 'leaf'],
    'yellow': ['yellow', 'sun', 'orange', 'gold'],
    'pink': ['pink', 'red', 'purple'],
    'purple': ['purple', 'red', 'pink', 'blue'],
    'white': ['white', 'snow', 'milk', 'paper'],
    'black': ['black', 'dark', 'night', 'cat', 'dog'],
    
    // 时间/天气类单词
    'evening': ['red', 'orange', 'yellow', 'purple', 'sunset'],
    'morning': ['yellow', 'orange', 'sun', 'bright', 'morning'],
    'night': ['dark', 'black', 'moon', 'star', 'night'],
    'sunny': ['yellow', 'sun', 'bright', 'orange', 'gold'],
    'cloudy': ['white', 'gray', 'sky', 'grey', 'cloud'],
    'rainy': ['blue', 'cloud', 'gray', 'grey', 'wet'],
    'snowy': ['white', 'snow', 'cold', 'ice', 'winter'],
    'windy': ['wind', 'blow', 'cloud', 'cold'],
    'starry': ['star', 'night', 'dark', 'moon', 'black'],
    'moonlit': ['moon', 'night', 'light', 'silver', 'white'],
    
    // 自然相关
    'sky': ['blue', 'sky', 'cyan', 'white', 'cloud', 'sun'],
    'grass': ['green', 'grass', 'leaf'],
    'leaf': ['green', 'leaf', 'tree', 'nature', 'spring'],
    'nature': ['green', 'leaf', 'tree', 'nature', 'spring'],
    'tree': ['green', 'tree', 'leaf', 'wood', 'brown'],
    'flower': ['flower', 'red', 'pink', 'yellow', 'purple', 'colorful'],
    'sun': ['sun', 'yellow', 'bright', 'hot', 'sunny', 'gold'],
    'moon': ['moon', 'night', 'dark', 'star', 'silver', 'white'],
    'star': ['star', 'night', 'dark', 'moon', 'bright', 'yellow'],
    'cloud': ['cloud', 'white', 'sky', 'gray', 'grey', 'cloudy'],
    'rain': ['rain', 'blue', 'cloud', 'wet', 'rainy', 'gray'],
    'snow': ['snow', 'white', 'cold', 'ice', 'winter', 'snowy'],
    
    // 其他容易混淆的词
    'water': ['water', 'blue', 'wet', 'sea', 'lake', 'river'],
    'sea': ['sea', 'blue', 'water', 'wave', 'ocean'],
    'fire': ['fire', 'red', 'hot', 'orange', 'flame'],
    'ice': ['ice', 'cold', 'white', 'freeze', 'winter'],
    'earth': ['earth', 'world', 'ground', 'soil', 'brown'],
    'rock': ['rock', 'stone', 'gray', 'grey', 'hard'],
    'stone': ['stone', 'rock', 'gray', 'grey', 'hard'],
    'sand': ['sand', 'yellow', 'beach', 'desert', 'brown'],
    'one': ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    'two': ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    'three': ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    'four': ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    'five': ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    'wood': ['wood', 'brown', 'tree', 'forest', 'natural'],
    'paper': ['paper', 'white', 'read', 'write', 'book'],
    'blood': ['blood', 'red', 'warm', 'life'],
};

// 检查单词是否为颜色词
function isColorWord(word) {
    const colorWords = [
        'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'black', 'white',
        'gray', 'grey', 'brown', 'cyan', 'gold', 'silver', 'navy', 'beige', 'violet',
        'indigo', 'magenta', 'tan', 'olive', 'maroon', 'aqua', 'teal', 'lavender', 'peach',
        'lilac', 'cream', 'ivory', 'chestnut', 'aquamarine', 'coral', 'crimson', 'scarlet',
        'turquoise', 'charcoal', 'khaki', 'plum', 'sienna', 'wheat', 'salmon', 'mauve'
    ];
    return colorWords.includes(word.toLowerCase());
}

// 获取需要过滤的颜色黑名单
function getColorBlacklist(word) {
    const lowerWord = word.toLowerCase();
    return COLOR_BLACKLIST[lowerWord] || [];
}

// 检查候选词是否在黑名单中
function isInBlacklist(candidate, blacklist) {
    const lowerCandidate = candidate.toLowerCase();
    return blacklist.some(blocked => 
        lowerCandidate === blocked || lowerCandidate.includes(blocked)
    );
}

function getCandidateEntry(word) {
    const originalWord = word;
    const lowerWord = normalizeWord(word);
    const titleWord = originalWord.charAt(0).toUpperCase() + originalWord.slice(1).toLowerCase();

    for (const key of [originalWord, lowerWord, titleWord]) {
        if (candidateWords[key] && Array.isArray(candidateWords[key].options) && candidateWords[key].options.length >= 4) {
            return candidateWords[key];
        }
    }

    return null;
}

function isOptionAllowedForCurrentGrade(option, allowedWordSet) {
    return allowedWordSet.has(normalizeWord(option));
}

function shouldAvoidCandidate(correctAnswer, candidateWord) {
    const lowerWord = normalizeWord(candidateWord);
    const lowerCorrect = normalizeWord(correctAnswer);
    const correctMeta = getWordMeta(correctAnswer);
    const candidateMeta = getWordMeta(candidateWord);
    const correctGroup = getConflictGroup(lowerCorrect);
    const candidateGroup = getConflictGroup(lowerWord);

    if (lowerWord === lowerCorrect) {
        return true;
    }

    if (correctGroup && candidateGroup && correctGroup === candidateGroup) {
        return true;
    }

    if (lowerCorrect.includes(' ')) {
        for (const part of lowerCorrect.split(' ')) {
            if (lowerWord === part || lowerWord.includes(part)) {
                return true;
            }
        }
    }

    if (lowerWord.includes(' ')) {
        for (const part of lowerWord.split(' ')) {
            if (part === lowerCorrect || lowerCorrect.includes(part)) {
                return true;
            }
        }
    }

    const colorBlacklist = getColorBlacklist(correctAnswer);
    if (colorBlacklist.length > 0 && isInBlacklist(lowerWord, colorBlacklist)) {
        return true;
    }

    if (isColorWord(lowerCorrect) && isColorWord(lowerWord) && lowerWord !== lowerCorrect) {
        return true;
    }

    if (
        candidateMeta?.category === 'family' &&
        correctMeta &&
        !['family', 'person'].includes(correctMeta.category)
    ) {
        return true;
    }

    return false;
}

function isWeakDistractor(candidateWord) {
    const meta = getWordMeta(candidateWord);
    return !meta || !CONCRETE_CATEGORIES.has(meta.category);
}

function chooseDistractor(correctAnswer, usedWords, preferredWords = []) {
    const correctMeta = getWordMeta(correctAnswer);
    const correctGroup = getConflictGroup(correctAnswer);
    const normalizedUsed = new Set([...usedWords].map(normalizeWord));

    const isValidCandidate = wordData => {
        if (!wordData || normalizedUsed.has(normalizeWord(wordData.word))) {
            return false;
        }

        return !shouldAvoidCandidate(correctAnswer, wordData.word);
    };

    for (const preferred of preferredWords) {
        if (isValidCandidate(preferred)) {
            return preferred.word;
        }
    }

    const shuffledPool = shuffleArray([...allWords]);
    const passes = [
        wordData => isValidCandidate(wordData) &&
            correctMeta &&
            wordData.category !== correctMeta.category &&
            CONCRETE_CATEGORIES.has(wordData.category) &&
            (!correctGroup || getConflictGroup(wordData.word) !== correctGroup),
        wordData => isValidCandidate(wordData) &&
            correctMeta &&
            wordData.category !== correctMeta.category &&
            (!correctGroup || getConflictGroup(wordData.word) !== correctGroup),
        wordData => isValidCandidate(wordData) &&
            (!correctGroup || getConflictGroup(wordData.word) !== correctGroup),
        wordData => isValidCandidate(wordData)
    ];

    for (const allow of passes) {
        const found = shuffledPool.find(allow);
        if (found) {
            return found.word;
        }
    }

    return null;
}

function repairPredefinedOptions(correctAnswer, predefinedOptions) {
    const allowedWordSet = getAllowedWordSet();
    const repaired = [correctAnswer];
    const usedWords = new Set([correctAnswer]);
    const preferredPool = allWords.filter(wordData =>
        wordData.category !== currentWord.category && CONCRETE_CATEGORIES.has(wordData.category)
    );

    for (const option of predefinedOptions) {
        if (normalizeWord(option) === normalizeWord(correctAnswer)) {
            continue;
        }

        const validOption = isOptionAllowedForCurrentGrade(option, allowedWordSet) &&
            !shouldAvoidCandidate(correctAnswer, option) &&
            !usedWords.has(option) &&
            !isWeakDistractor(option);

        if (validOption) {
            repaired.push(option);
            usedWords.add(option);
            continue;
        }

        const replacement = chooseDistractor(correctAnswer, usedWords, preferredPool);
        if (replacement) {
            repaired.push(replacement);
            usedWords.add(replacement);
            continue;
        }

        if (
            isOptionAllowedForCurrentGrade(option, allowedWordSet) &&
            !shouldAvoidCandidate(correctAnswer, option) &&
            !usedWords.has(option)
        ) {
            repaired.push(option);
            usedWords.add(option);
        }
    }

    while (repaired.length < 4) {
        const replacement = chooseDistractor(correctAnswer, usedWords, preferredPool);
        if (!replacement) {
            break;
        }
        repaired.push(replacement);
        usedWords.add(replacement);
    }

    return repaired.slice(0, 4);
}

function generateOptions() {
    const correctAnswer = currentWord.word;
    const predefinedData = getCandidateEntry(correctAnswer);

    if (predefinedData) {
        return shuffleArray(repairPredefinedOptions(correctAnswer, predefinedData.options));
    }

    console.warn('单词没有预定义候选词:', correctAnswer, '，将使用运行时安全逻辑');

    const options = [correctAnswer];
    while (options.length < 4) {
        const replacement = chooseDistractor(correctAnswer, new Set(options));
        if (!replacement) {
            break;
        }
        options.push(replacement);
    }

    return shuffleArray(options);
}

function renderOptions(answerRecord = null) {
    elements.optionsContainer.innerHTML = '';

    currentOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;

        if (answerRecord) {
            btn.disabled = true;
            if (option === answerRecord.word) {
                btn.classList.add('correct', 'correct-answer');
            }
            if (option === answerRecord.selected && !answerRecord.correct) {
                btn.classList.add('wrong', 'wrong-answer');
            }
        } else {
            btn.addEventListener('click', () => {
                playSound('click');
                handleAnswer(option, btn);
            });
        }

        elements.optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selected, btn) {
    if (isAnsweredQuestion(currentQuestion)) {
        return;
    }

    // 禁用所有按钮
    const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selected === currentWord.word;

    // 记录答案
    answers[currentQuestion - 1] = {
        question: currentQuestion,
        word: currentWord.word,
        options: [...currentOptions],
        selected: selected,
        correct: isCorrect,
        reviewNeeded: !isCorrect,
        learningHint: generateLearningHint(currentWord.word, selected, isCorrect)
    };

    // 上传答题数据到后端服务器
    if (currentUser) {
        submitAnswerToServer({
            userId: currentUser.id,
            userName: currentUser.name,
            grade: currentGrade,
            level: currentLevel,
            question: currentQuestion,
            word: currentWord.word,
            selected: selected,
            correct: isCorrect
        });
    }

    // 显示反馈
    if (isCorrect) {
        btn.classList.add('correct');
        btn.classList.add('correct-answer');
        showFeedback('correct');
        playSound('correct');
    } else {
        btn.classList.add('wrong');
        btn.classList.add('wrong-answer');
        // 显示正确答案
        buttons.forEach(b => {
            if (b.textContent === currentWord.word) {
                b.classList.add('correct');
                b.classList.add('correct-answer');
            }
        });
        showFeedback('wrong');
        playSound('wrong');
    }

    setQuestionMode(answers[currentQuestion - 1]);
    updateAnswerStatusPanel(answers[currentQuestion - 1]);
    updateProgressBar();

    // 保存进度
    saveProgress();

    // 1.5秒后进入下一题
    setTimeout(() => {
        hideFeedback();
        currentQuestion = Math.min(answers.length + 1, getCurrentRoundQuestionCount() + 1);
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
    let progressHTML = '';
    const roundCount = getCurrentRoundQuestionCount();
    for (let i = 0; i < roundCount; i++) {
        const answer = answers[i];
        if (answer && answer.correct) {
            progressHTML += '<span class="progress-chip progress-correct" aria-label="答对"></span>';
        } else if (answer) {
            progressHTML += '<span class="progress-chip progress-wrong" aria-label="答错"></span>';
        } else if (i === currentQuestion - 1) {
            progressHTML += '<span class="progress-chip progress-current" aria-label="当前题"></span>';
        } else {
            progressHTML += '<span class="progress-chip progress-empty" aria-label="未作答"></span>';
        }
    }
    
    if (answers.length === roundCount && roundCount > 0 && answers.every(answer => answer && answer.correct)) {
        progressHTML = new Array(roundCount)
            .fill('<span class="progress-chip progress-perfect" aria-label="全对"></span>')
            .join('');
    }
    
    elements.progressBar.innerHTML = progressHTML;
}

function updateProgressUI() {
    elements.levelNum.textContent = currentLevel;
    elements.questionNum.textContent = `${Math.min(currentQuestion, Math.max(getCurrentRoundQuestionCount(), 1))}/${Math.max(getCurrentRoundQuestionCount(), 1)}`;
}

// ============================================
// Minecraft风格图片绘制
// ============================================
async function drawWordImage(wordData) {
    try {
        const canvas = elements.wordCanvas;
        if (!canvas) return;
        const renderToken = ++activeImageRenderToken;
        
        // 先尝试加载外部图片，使用 await 确保图片加载完成后再返回
        const imageLoaded = await tryLoadWordImage(wordData.word, canvas, renderToken);
        if (imageLoaded) {
            return; // 图片加载成功并已绘制
        }
        if (renderToken !== activeImageRenderToken) return;
        
        // 图片加载失败，使用默认绘制
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
    const newlyUnlocked = updateLearningProfileFromAnswers() || [];
    const summary = getRoundSummary();
    const { correct, wrong, accuracy, masteredWords, reviewWords: roundReviewWords, bestStreak } = summary;
    const coverage = getCoverageStats();
    const achievementState = getAchievementState(summary);

    // 更新界面
    elements.correctCount.textContent = correct;
    elements.wrongCount.textContent = wrong;
    if (elements.bestStreakCount) {
        elements.bestStreakCount.textContent = bestStreak;
    }
    elements.accuracyValue.textContent = accuracy + '%';

    // 更新正确率圆环
    elements.accuracyCircle.style.background =
        `conic-gradient(var(--primary) ${accuracy * 3.6}deg, #E0E0E0 ${accuracy * 3.6}deg)`;

    // 显示消息
    let message = '';
    if (isReviewMode) {
        if (elements.resultTitle) {
            elements.resultTitle.textContent = '错题复习完成';
        }
        if (accuracy >= 90) {
            message = '这轮错题已经复习得比较稳，可以继续前进。';
        } else if (accuracy >= 60) {
            message = '这轮错题有进步，建议再复习一遍不稳的词。';
        } else {
            message = '这组错题还不稳，建议再看一遍图片和正确答案。';
        }
    } else if (accuracy >= 90) {
        if (elements.resultTitle) {
            elements.resultTitle.textContent = '关卡完成！';
        }
        message = '这关掌握得很稳，可以进入下一关。';
    } else if (accuracy >= 70) {
        if (elements.resultTitle) {
            elements.resultTitle.textContent = '关卡完成！';
        }
        message = '大部分词已经掌握，建议先复习错题。';
    } else if (accuracy >= 50) {
        if (elements.resultTitle) {
            elements.resultTitle.textContent = '关卡完成！';
        }
        message = '有一些词容易混淆，先再练一次更合适。';
    } else {
        if (elements.resultTitle) {
            elements.resultTitle.textContent = '关卡完成！';
        }
        message = '这关还不稳，先把待复习词看一遍。';
    }
    elements.resultMessage.textContent = message;

    if (elements.masteredWordCount) {
        elements.masteredWordCount.textContent = masteredWords.length;
    }
    if (elements.reviewWordCount) {
        elements.reviewWordCount.textContent = roundReviewWords.length;
    }
    if (elements.masteredWordsList) {
        elements.masteredWordsList.textContent = masteredWords.length ? masteredWords.join(' / ') : '本关还没有形成稳定掌握词。';
    }
    if (elements.reviewWordsList) {
        elements.reviewWordsList.textContent = roundReviewWords.length ? roundReviewWords.join(' / ') : '本关没有待复习词。';
    }
    if (elements.overallMasteredCount) {
        elements.overallMasteredCount.textContent = learningProfile?.totalMasteredWords || 0;
    }
    if (elements.gradeCoverageText) {
        elements.gradeCoverageText.textContent = coverage.current.total ? `${coverage.current.mastered}/${coverage.current.total} (${coverage.current.percent}%)` : '0/0 (0%)';
    }
    if (elements.overallCoverageText) {
        elements.overallCoverageText.textContent = coverage.cumulative.total ? `${coverage.cumulative.mastered}/${coverage.cumulative.total} (${coverage.cumulative.percent}%)` : '0/0 (0%)';
    }
    if (elements.fixedWrongCount) {
        elements.fixedWrongCount.textContent = learningProfile?.fixedWrongWords || 0;
    }
    if (elements.achievementBadgeList) {
        const unlocked = achievementState.unlocked;
        elements.achievementBadgeList.innerHTML = unlocked.length
            ? unlocked.map(item => `<span class="achievement-badge achievement-${item.theme}">${item.label}</span>`).join('')
            : '<span class="achievement-badge locked">本轮还没有新成就，继续练习会逐步解锁。</span>';
    }
    if (elements.nextGoalText) {
        elements.nextGoalText.textContent = achievementState.nextGoal;
    }
    if (elements.reviewWrongBtn) {
        elements.reviewWrongBtn.style.display = !isReviewMode && roundReviewWords.length > 0 ? 'block' : 'none';
    }
    if (elements.retryLevelBtn) {
        elements.retryLevelBtn.textContent = isReviewMode ? '再练错题' : '再练一次';
    }
    if (elements.nextLevelBtn) {
        elements.nextLevelBtn.textContent = '下一关';
    }

    if (elements.resultTitle) {
        elements.resultTitle.className = 'result-title';
        if (!isReviewMode && accuracy === 100) {
            elements.resultTitle.classList.add('banner-perfect');
        } else {
            elements.resultTitle.classList.add('banner-complete');
        }
    }

    if (newlyUnlocked.length > 0) {
        playSound('achievement');
    }

    // 播放结果音效
    playSound(accuracy >= 70 ? 'success' : 'encourage');

    // 显示结果页面
    showPage('result');
}

function nextLevel() {
    isReviewMode = false;
    reviewWords = [];
    currentLevel++;
    currentQuestion = 1;
    answers = [];
    questionCache = {};
    saveProgress();
    showPage('game');
    initGameRound();
}

function replayCurrentRound() {
    currentQuestion = 1;
    answers = [];
    questionCache = {};
    if (!isReviewMode) {
        prepareWords();
    }
    saveProgress();
    showPage('game');
    initGameRound();
}

function startReviewRound() {
    const summary = getRoundSummary();
    if (!summary.reviewWords.length) {
        return;
    }

    isReviewMode = true;
    reviewWords = [...summary.reviewWords];
    currentQuestion = 1;
    answers = [];
    questionCache = {};
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
    if (!elements.welcomePage || !elements.gamePage || !elements.resultPage) {
        return;
    }
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
        answers: answers,
        questionSequence: questionSequence,
        reviewWords: reviewWords,
        isReviewMode: isReviewMode
    };

    localStorage.setItem('minecraft_english_progress', JSON.stringify(progress));
}

// ============================================
// 后端数据提交
// ============================================
function submitAnswerToServer(answerData) {
    const serverUrl = `${API_BASE}/api/answers`;

    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(answerData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('答题数据已提交:', data);
    })
    .catch(err => {
        console.error('提交答题数据失败:', err);
    });
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

function playAudioAsset(type) {
    const baseAudio = soundEffectPool[type];
    if (!baseAudio) return false;

    try {
        const instance = new Audio(baseAudio.src);
        instance.preload = 'auto';
        instance.volume = type === 'success' ? 0.72 : 0.68;
        instance.play().catch(() => {});
        return true;
    } catch (error) {
        return false;
    }
}

function playSound(type) {
    try {
        if (playAudioAsset(type)) {
            return;
        }
        const ctx = initAudio();
        
        switch(type) {
            case 'correct':
                // 上升音阶 (C5-E5-G5) - 正确答题
                playNote(ctx, 523.25, 0, 0.1);    // C5
                playNote(ctx, 659.25, 0.1, 0.1);  // E5
                playNote(ctx, 783.99, 0.2, 0.15); // G5
                break;
            case 'wrong':
                // 下降音阶 (G4-E4-C4) - 错误答题
                playNote(ctx, 392.00, 0, 0.12);   // G4
                playNote(ctx, 329.63, 0.12, 0.12); // E4
                playNote(ctx, 261.63, 0.24, 0.15); // C4
                break;
            case 'click':
                // 短促的方块点击声
                playBlockClick(ctx);
                break;
            case 'success':
                // 胜利旋律 - 升级/通关
                playVictoryMelody(ctx);
                break;
            case 'encourage':
                // 鼓励音效
                playNote(ctx, 392, 0, 0.15);     // G4
                playNote(ctx, 440, 0.15, 0.15);  // A4
                playNote(ctx, 392, 0.3, 0.15);   // G4
                break;
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

// 播放单个音符
function playNote(ctx, frequency, startTime, duration) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    
    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
}

// 播放方块点击音效
function playBlockClick(ctx) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // 短促的方波模拟方块点击
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
}

// 播放胜利旋律
function playVictoryMelody(ctx) {
    const melody = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.1 },  // E5
        { freq: 783.99, time: 0.2 },  // G5
        { freq: 1046.50, time: 0.3 }, // C6 (高八度)
        { freq: 783.99, time: 0.45 }, // G5
        { freq: 1046.50, time: 0.55 }, // C6
    ];
    
    melody.forEach(note => {
        playNote(ctx, note.freq, note.time, 0.15);
    });
}

function toggleMusic() {
    const icon = elements.musicControl.querySelector('.music-icon');

    if (isPlaying) {
        isPlaying = false;
        icon.textContent = '🔇';
        elements.musicControl.classList.remove('playing');
        // 停止背景音乐
        if (bgMusic) {
            bgMusic.pause();
            bgMusic = null;
        }
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
    if (!isPlaying) return;

    // 如果已有音乐在播放，先停止
    if (bgMusic) {
        bgMusic.pause();
        bgMusic = null;
    }

    // 随机选择一首音乐
    currentMusicIndex = Math.floor(Math.random() * bgMusicFiles.length);
    
    bgMusic = new Audio(bgMusicFiles[currentMusicIndex]);
    bgMusic.volume = 0.5;
    bgMusic.loop = false; // 不单曲循环，播放完后随机切换

    bgMusic.addEventListener('ended', function() {
        if (isPlaying) {
            // 随机切换到另一首
            let nextIndex = currentMusicIndex;
            while (nextIndex === currentMusicIndex) {
                nextIndex = Math.floor(Math.random() * bgMusicFiles.length);
            }
            currentMusicIndex = nextIndex;
            bgMusic.src = bgMusicFiles[currentMusicIndex];
            bgMusic.play();
        }
    });

    bgMusic.play().catch(e => console.log('播放背景音乐失败:', e));
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
    } else if (e.key === 'ArrowLeft') {
        goToPreviousQuestion();
    } else if (e.key === 'ArrowRight') {
        goToNextQuestion();
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

// ============================================
// 图片加载辅助函数
// ============================================
function buildImagePaths(word) {
    return [
        'images/grade1/' + getImageFilename(word, 1),
        'images/grade2/' + getImageFilename(word, 2),
        'images/grade3/' + getImageFilename(word, 3)
    ];
}

function tryLoadWordImage(word, canvas, renderToken) {
    if (!canvas) return Promise.resolve(false);
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(false);
    if (renderToken !== activeImageRenderToken) return Promise.resolve(false);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const preloadedImage = getPreloadedImage(word);
    if (preloadedImage && preloadedImage.complete) {
        drawLoadedImageToCanvas(ctx, canvas, preloadedImage);
        return Promise.resolve(true);
    }

    const cached = imagePreloadCache.get(word);
    if (cached?.status === 'loading' && cached.promise) {
        return cached.promise.then(img => {
            if (!img || renderToken !== activeImageRenderToken) {
                return false;
            }
            drawLoadedImageToCanvas(ctx, canvas, img);
            return true;
        });
    }

    const paths = buildImagePaths(word);
    
    // Create new image for each path to properly track loading state
    // Use Promise to wait for image to actually load before returning
    return tryLoadImagePath(paths, 0, ctx, canvas.width, canvas.height, renderToken);
}

function tryLoadImagePath(paths, index, ctx, width, height, renderToken) {
    if (index >= paths.length) {
        return Promise.resolve(false); // All images failed
    }
    
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = function() {
            if (renderToken !== activeImageRenderToken) {
                resolve(false);
                return;
            }
            drawLoadedImageToCanvas(ctx, { width, height }, img);
            resolve(true); // Resolve with true when image is loaded
        };
        
        img.onerror = function() {
            // Try next path
            tryLoadImagePath(paths, index + 1, ctx, width, height, renderToken)
                .then(resolve)
                .catch(() => resolve(false));
        };
        
        img.src = paths[index];
    });
}

function drawLoadedImageToCanvas(ctx, canvas, img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

// ============================================
// 词汇动画效果
// ============================================
// 图片文件名映射
function getImageFilename(word, grade) {
    // 所有大写开头的文件映射
    const uppercaseMap = {
        "american": "American.png",
        "australian": "Australian.png",
        "chinese": "Chinese.png",
        "i": "I.png",
        "ok": "OK.png",
        "monday": "Monday.png",
        "wednesday": "Wednesday.png",
        "sunday": "Sunday.png"
    };
    
    let key = word.toLowerCase();
    if (uppercaseMap[key]) {
        return uppercaseMap[key];
    }

    const alias = IMAGE_WORD_ALIASES[key];
    const fileKey = alias || key;

    return fileKey
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + ".png";
}

const wordAnimations = {
    'jump': 'jump', 
    'walk': 'walk',
    'sit': 'sit',
    'stand': 'stand',
    // 天气 - 闪烁
    'sunny': 'sunny',
    'rainy': 'rain',
    'cloudy': 'cloudy',
    'windy': 'windy'
};

function applyWordAnimation(word) {
    const canvas = elements.wordCanvas;
    if (!canvas) return;
    
    const animClass = wordAnimations[word.toLowerCase()];
    if (animClass) {
        canvas.classList.add('anim-' + animClass);
    } else {
        canvas.className = ''; // 清除动画
    }
}

// 清除动画
function clearWordAnimation() {
    const canvas = elements.wordCanvas;
    if (canvas) canvas.className = '';
}

// ============================================
// 图片预加载机制
// ============================================
function preloadNextQuestionImages() {
    // 预加载后续题目的图片
    const startIndex = currentQuestion;
    const endIndex = Math.min(currentQuestion + PRELOAD_BATCH_SIZE, getCurrentRoundQuestionCount());
    
    for (let i = startIndex; i < endIndex; i++) {
        const nextWord = getCurrentRoundWordData(i + 1);
        if (nextWord?.word) {
            preloadImage(nextWord.word);
        }
    }
}

function preloadCurrentRoundImages() {
    const roundCount = getCurrentRoundQuestionCount();
    for (let i = 1; i <= roundCount; i++) {
        const wordData = getCurrentRoundWordData(i);
        if (wordData?.word) {
            preloadImage(wordData.word);
        }
    }
}

function preloadImage(word) {
    const cached = imagePreloadCache.get(word);
    if (cached?.status === 'loaded' || cached?.status === 'loading') {
        return cached.promise || Promise.resolve(cached.img || null);
    }

    const paths = buildImagePaths(word);
    const promise = loadImageByPaths(paths).then(img => {
        imagePreloadCache.set(word, {
            status: img ? 'loaded' : 'missing',
            img: img || null,
            promise: null
        });
        return img;
    });

    imagePreloadCache.set(word, {
        status: 'loading',
        img: null,
        promise
    });

    return promise;
}

function getPreloadedImage(word) {
    const cached = imagePreloadCache.get(word);
    return cached?.img || null;
}

function loadImageByPaths(paths, index = 0) {
    if (index >= paths.length) {
        return Promise.resolve(null);
    }

    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            loadImageByPaths(paths, index + 1).then(resolve);
        };
        img.src = paths[index];
    });
}

// ============================================
// 背景音乐预加载与淡入淡出
// ============================================
function initAudioPool() {
    // 预加载下一个音频
    const nextIndex = (currentMusicIndex + 1) % bgMusicFiles.length;
    audioPool.next = new Audio(bgMusicFiles[nextIndex]);
    audioPool.next.preload = 'auto';
    audioPool.next.volume = 0;
}

function playBackgroundMusicWithFade() {
    if (!isPlaying) return;

    // 如果已有音乐在播放，先停止
    if (audioPool.current) {
        audioPool.current.pause();
    }

    // 随机选择一首音乐
    currentMusicIndex = Math.floor(Math.random() * bgMusicFiles.length);
    
    audioPool.current = new Audio(bgMusicFiles[currentMusicIndex]);
    audioPool.current.volume = 0;
    audioPool.current.loop = false;

    // 预加载下一首
    const nextIndex = (currentMusicIndex + 1) % bgMusicFiles.length;
    audioPool.next = new Audio(bgMusicFiles[nextIndex]);
    audioPool.next.preload = 'auto';

    // 淡入效果
    audioPool.current.play().then(() => {
        fadeIn(audioPool.current);
    }).catch(e => console.log('播放背景音乐失败:', e));

    // 监听播放结束
    audioPool.current.addEventListener('ended', function() {
        if (isPlaying && !audioPool.isTransitioning) {
            switchToNextTrack();
        }
    });
}

function switchToNextTrack() {
    if (audioPool.isTransitioning) return;
    audioPool.isTransitioning = true;

    // 淡出当前音乐
    fadeOut(audioPool.current, () => {
        // 切换到下一首
        audioPool.current = audioPool.next;
        audioPool.current.volume = 0;
        
        // 预再加载下一首
        const nextIndex = (currentMusicIndex + 1) % bgMusicFiles.length;
        audioPool.next = new Audio(bgMusicFiles[nextIndex]);
        audioPool.next.preload = 'auto';
        
        // 播放并淡入
        audioPool.current.play().then(() => {
            fadeIn(audioPool.current);
            audioPool.isTransitioning = false;
        });
    });
}

function fadeIn(audio) {
    if (!audio) return;
    const steps = 20;
    const interval = audioPool.fadeDuration / steps;
    let currentStep = 0;
    const targetVolume = 0.5;
    
    const fadeTimer = setInterval(() => {
        currentStep++;
        audio.volume = Math.min((currentStep / steps) * targetVolume, targetVolume);
        if (currentStep >= steps) {
            clearInterval(fadeTimer);
        }
    }, interval);
}

function fadeOut(audio, callback) {
    if (!audio) {
        if (callback) callback();
        return;
    }
    const steps = 20;
    const interval = audioPool.fadeDuration / steps;
    let currentStep = 0;
    const startVolume = audio.volume;
    
    const fadeTimer = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume * (1 - currentStep / steps), 0);
        if (currentStep >= steps) {
            clearInterval(fadeTimer);
            audio.pause();
            if (callback) callback();
        }
    }, interval);
}

// 覆盖原有的背景音乐函数
function playBackgroundMusic() {
    playBackgroundMusicWithFade();
}
