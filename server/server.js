/**
 * English Game Backend Server
 * 收集用户答题数据
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(__dirname, 'data');

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 服务前端游戏页面
app.use(express.static(path.join(__dirname, '..')));

// 静态文件服务 - 服务管理后台
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// 数据文件路径
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANSWERS_FILE = path.join(DATA_DIR, 'answers.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(ANSWERS_FILE)) {
    fs.writeFileSync(ANSWERS_FILE, JSON.stringify([], null, 2));
}

// 读取数据
function readUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function readAnswers() {
    try {
        const data = fs.readFileSync(ANSWERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// 保存数据
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveAnswers(answers) {
    fs.writeFileSync(ANSWERS_FILE, JSON.stringify(answers, null, 2));
}

// ============================================
// API 端点
// ============================================

// 1. 提交用户答题数据
app.post('/api/answers', (req, res) => {
    try {
        const { userId, userName, grade, level, question, word, selected, correct, timeSpent } = req.body;

        if (!userId || !word || selected === undefined || correct === undefined) {
            return res.status(400).json({ error: '缺少必要字段' });
        }

        // 读取现有数据
        const answers = readAnswers();
        const users = readUsers();

        // 添加答题记录
        const answerRecord = {
            id: Date.now().toString(),
            userId,
            userName: userName || '未知用户',
            grade: grade || 1,
            level: level || 1,
            question,
            word,
            selected,
            correct,
            timeSpent: timeSpent || 0,
            timestamp: new Date().toISOString()
        };

        answers.push(answerRecord);

        // 更新或添加用户
        let user = users.find(u => u.id === userId);
        if (!user) {
            user = {
                id: userId,
                name: userName || '未知用户',
                grade: grade || 1,
                level: level || 1,
                question: question || 1,
                lastActive: new Date().toISOString()
            };
            users.push(user);
        } else {
            // 更新用户信息
            user.name = userName || user.name;
            user.grade = grade || user.grade;
            user.level = level || user.level;
            user.question = question || user.question;
            user.lastActive = new Date().toISOString();
        }

        // 保存数据
        saveAnswers(answers);
        saveUsers(users);

        res.json({ success: true, message: '答题数据已保存' });
    } catch (err) {
        console.error('保存答题数据失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 2. 获取所有用户列表
app.get('/api/users', (req, res) => {
    try {
        const users = readUsers();
        const answers = readAnswers();

        // 为每个用户添加统计数据
        const usersWithStats = users.map(user => {
            const userAnswers = answers.filter(a => a.userId === user.id);
            const totalAnswers = userAnswers.length;
            const correctAnswers = userAnswers.filter(a => a.correct).length;
            const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

            return {
                ...user,
                totalAnswers,
                correctAnswers,
                accuracy,
                lastActive: user.lastActive
            };
        });

        res.json(usersWithStats);
    } catch (err) {
        console.error('获取用户列表失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 3. 获取所有答题记录
app.get('/api/answers', (req, res) => {
    try {
        const answers = readAnswers();
        res.json(answers);
    } catch (err) {
        console.error('获取答题记录失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 4. 获取特定用户的答题记录
app.get('/api/users/:userId/answers', (req, res) => {
    try {
        const { userId } = req.params;
        const answers = readAnswers();
        const userAnswers = answers.filter(a => a.userId === userId);
        res.json(userAnswers);
    } catch (err) {
        console.error('获取用户答题记录失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 5. 获取统计数据
app.get('/api/stats', (req, res) => {
    try {
        const users = readUsers();
        const answers = readAnswers();

        const totalUsers = users.length;
        const totalAnswers = answers.length;
        const correctAnswers = answers.filter(a => a.correct).length;
        const avgAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

        res.json({
            totalUsers,
            totalAnswers,
            correctAnswers,
            avgAccuracy
        });
    } catch (err) {
        console.error('获取统计数据失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 5.5 健康检查
app.get('/healthz', (_req, res) => {
    res.json({
        ok: true,
        dataDir: DATA_DIR
    });
});

// 6. 清除所有数据（管理用）
app.delete('/api/clear', (req, res) => {
    try {
        saveUsers([]);
        saveAnswers([]);
        res.json({ success: true, message: '所有数据已清除' });
    } catch (err) {
        console.error('清除数据失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`English Game Server 运行在 http://localhost:${PORT}`);
    console.log(`管理后台地址: http://localhost:${PORT}/admin.html`);
    console.log(`数据目录: ${DATA_DIR}`);
});
