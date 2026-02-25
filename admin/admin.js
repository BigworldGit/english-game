/**
 * 英语游戏管理后台 - JavaScript
 * 用户名: bigworld
 * 密码: Angele921
 */

// 管理员账号配置
const ADMIN_CONFIG = {
    username: 'bigworld',
    password: 'Angele921'
};

// 数据存储键名
const DATA_KEYS = {
    users: 'minecraft_english_user',       // 用户列表 (使用单数，与游戏兼容)
    currentUser: 'minecraft_english_user', // 当前登录用户
    progress: 'minecraft_english_progress'  // 用户进度
};

// DOM 元素
const elements = {
    loginBox: document.getElementById('loginBox'),
    adminPanel: document.getElementById('adminPanel'),
    loginForm: document.getElementById('loginForm'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    errorMsg: document.getElementById('errorMsg'),
    logoutBtn: document.getElementById('logoutBtn'),
    totalUsers: document.getElementById('totalUsers'),
    totalAnswers: document.getElementById('totalAnswers'),
    avgAccuracy: document.getElementById('avgAccuracy'),
    userList: document.getElementById('userList'),
    userModal: document.getElementById('userModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    detailGrade: document.getElementById('detailGrade'),
    detailLevel: document.getElementById('detailLevel'),
    detailTotal: document.getElementById('detailTotal'),
    detailCorrect: document.getElementById('detailCorrect'),
    detailWrong: document.getElementById('detailWrong'),
    detailAccuracy: document.getElementById('detailAccuracy'),
    questionsTable: document.getElementById('questionsTable')
};

// 用户数据存储
let allUsers = [];
let currentUserId = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // 检查是否已登录
    checkLoginStatus();
    
    // 绑定事件
    bindEvents();
    
    // 加载用户数据
    loadUsersFromGame();
}

// 绑定事件
function bindEvents() {
    // 登录表单提交
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // 退出登录
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // 关闭模态框
    elements.closeModal.addEventListener('click', closeModal);
    elements.userModal.addEventListener('click', (e) => {
        if (e.target === elements.userModal) {
            closeModal();
        }
    });
    
    // ESC 关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
        showAdminPanel();
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = elements.username.value.trim();
    const password = elements.password.value;
    
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
        // 登录成功
        sessionStorage.setItem('admin_logged_in', 'true');
        elements.errorMsg.style.display = 'none';
        showAdminPanel();
    } else {
        // 登录失败
        elements.errorMsg.style.display = 'block';
    }
}

// 处理退出
function handleLogout() {
    sessionStorage.removeItem('admin_logged_in');
    showLoginPanel();
}

// 显示登录面板
function showLoginPanel() {
    elements.loginBox.style.display = 'block';
    elements.adminPanel.style.display = 'none';
    elements.username.value = '';
    elements.password.value = '';
}

// 显示管理面板
function showAdminPanel() {
    elements.loginBox.style.display = 'none';
    elements.adminPanel.style.display = 'block';
    renderStats();
    renderUserList();
}

// 从游戏中加载用户数据
function loadUsersFromGame() {
    // 从 localStorage 获取所有用户的进度数据
    // 游戏会在每次进度更新时保存数据，我们需要收集所有不同的用户
    
    allUsers = [];
    
    // 方法1: 检查 localStorage 中的用户数据
    // 由于游戏使用单一用户模式，我们需要通过其他方式获取历史用户
    // 这里我们创建一个模拟的数据结构，实际使用时可以从服务器获取
    
    // 检查是否有保存的用户列表
    const savedUsers = localStorage.getItem(DATA_KEYS.users);
    if (savedUsers) {
        allUsers = JSON.parse(savedUsers);
    } else {
        // 从当前用户和进度重建用户列表
        const currentUser = localStorage.getItem(DATA_KEYS.currentUser);
        const progress = localStorage.getItem(DATA_KEYS.progress);
        
        if (currentUser && progress) {
            const userData = JSON.parse(currentUser);
            const progressData = JSON.parse(progress);
            
            // 如果当前用户不在列表中，添加进去
            const existingUser = allUsers.find(u => u.id === userData.id);
            if (!existingUser) {
                allUsers.push({
                    id: userData.id,
                    name: userData.name,
                    grade: userData.grade,
                    level: progressData.level || 1,
                    question: progressData.question || 1,
                    answers: progressData.answers || [],
                    lastActive: Date.now()
                });
            }
        }
    }
    
    // 如果没有用户数据，显示空状态
    if (allUsers.length === 0) {
        // 创建一些模拟数据用于演示
        createDemoData();
    }
    
    // 保存用户列表
    localStorage.setItem(DATA_KEYS.users, JSON.stringify(allUsers));
}

// 创建演示数据
function createDemoData() {
    const demoUsers = [
        {
            id: 'user_demo_1',
            name: '小明',
            grade: 1,
            level: 3,
            question: 5,
            answers: generateDemoAnswers(25, 0.8),
            lastActive: Date.now() - 3600000
        },
        {
            id: 'user_demo_2',
            name: '小红',
            grade: 2,
            level: 5,
            question: 8,
            answers: generateDemoAnswers(45, 0.75),
            lastActive: Date.now() - 7200000
        },
        {
            id: 'user_demo_3',
            name: '小刚',
            grade: 1,
            level: 2,
            question: 10,
            answers: generateDemoAnswers(15, 0.6),
            lastActive: Date.now() - 86400000
        }
    ];
    
    allUsers = demoUsers;
    localStorage.setItem(DATA_KEYS.users, JSON.stringify(allUsers));
}

// 生成演示答案数据
function generateDemoAnswers(count, correctRate) {
    const words = ['apple', 'banana', 'cat', 'dog', 'book', 'chair', 'table', 'water', 'milk', 'sun'];
    const answers = [];
    
    for (let i = 0; i < count; i++) {
        const isCorrect = Math.random() < correctRate;
        const word = words[Math.floor(Math.random() * words.length)];
        
        answers.push({
            question: i + 1,
            word: word,
            selected: isCorrect ? word : words[Math.floor(Math.random() * words.length)],
            correct: isCorrect,
            timestamp: Date.now() - (count - i) * 60000,
            timeSpent: Math.floor(Math.random() * 30) + 5 // 5-35秒
        });
        
        // 确保选中的答案和正确答案不同
        if (!isCorrect) {
            while (answers[i].selected === answers[i].word) {
                answers[i].selected = words[Math.floor(Math.random() * words.length)];
            }
        }
    }
    
    return answers;
}

// 渲染统计信息
function renderStats() {
    const totalUsers = allUsers.length;
    let totalAnswers = 0;
    let totalCorrect = 0;
    
    allUsers.forEach(user => {
        if (user.answers) {
            totalAnswers += user.answers.length;
            totalCorrect += user.answers.filter(a => a.correct).length;
        }
    });
    
    const avgAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    
    elements.totalUsers.textContent = totalUsers;
    elements.totalAnswers.textContent = totalAnswers;
    elements.avgAccuracy.textContent = avgAccuracy + '%';
}

// 渲染用户列表
function renderUserList() {
    if (allUsers.length === 0) {
        elements.userList.innerHTML = '<div class="empty-state"><p>暂无用户数据</p></div>';
        return;
    }
    
    // 按最后活跃时间排序
    const sortedUsers = [...allUsers].sort((a, b) => b.lastActive - a.lastActive);
    
    elements.userList.innerHTML = sortedUsers.map(user => {
        const stats = calculateUserStats(user);
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        
        return `
            <div class="user-item" data-user-id="${user.id}">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>年级${user.grade} · 最后活跃: ${formatTimeAgo(user.lastActive)}</p>
                </div>
                <div class="user-progress">
                    <div class="level">第${user.level}关</div>
                    <div class="accuracy">正确率: ${accuracy}%</div>
                </div>
            </div>
        `;
    }).join('');
    
    // 绑定点击事件
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.userId;
            showUserDetail(userId);
        });
    });
}

// 计算用户统计数据
function calculateUserStats(user) {
    if (!user.answers || user.answers.length === 0) {
        return { total: 0, correct: 0, wrong: 0, accuracy: 0 };
    }
    
    const total = user.answers.length;
    const correct = user.answers.filter(a => a.correct).length;
    const wrong = total - correct;
    const accuracy = Math.round((correct / total) * 100);
    
    return { total, correct, wrong, accuracy };
}

// 显示用户详情
function showUserDetail(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const stats = calculateUserStats(user);
    
    // 更新模态框内容
    elements.modalTitle.textContent = `${user.name} 的学习详情`;
    elements.detailGrade.textContent = `年级${user.grade}`;
    elements.detailLevel.textContent = `第${user.level}关 · 第${user.question}题`;
    elements.detailTotal.textContent = stats.total;
    elements.detailCorrect.textContent = stats.correct;
    elements.detailWrong.textContent = stats.wrong;
    elements.detailAccuracy.textContent = stats.accuracy + '%';
    
    // 渲染答题历史
    if (user.answers && user.answers.length > 0) {
        elements.questionsTable.innerHTML = user.answers.slice(-20).reverse().map(answer => `
            <tr>
                <td>${answer.question}</td>
                <td><strong>${answer.word}</strong></td>
                <td>${answer.selected}</td>
                <td class="${answer.correct ? 'status-correct' : 'status-wrong'}">
                    ${answer.correct ? '✓ 正确' : '✗ 错误'}
                </td>
                <td>${answer.timeSpent || '-'}</td>
            </tr>
        `).join('');
    } else {
        elements.questionsTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">暂无答题记录</td></tr>';
    }
    
    // 显示模态框
    elements.userModal.classList.add('show');
}

// 关闭模态框
function closeModal() {
    elements.userModal.classList.remove('show');
}

// 格式化时间显示
function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return new Date(timestamp).toLocaleDateString('zh-CN');
}

// 导出函数供调试
window.AdminPanel = {
    getUsers: () => allUsers,
    refreshData: () => {
        loadUsersFromGame();
        renderStats();
        renderUserList();
    }
};
