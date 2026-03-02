# English Game 后端服务

## 启动后端服务

```bash
cd server
npm install
npm start
```

服务启动后：
- API 地址: http://localhost:3001
- 游戏前端: http://localhost:3001
- 管理后台: http://localhost:3001/admin.html

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/answers | 提交答题数据 |
| GET | /api/users | 获取所有用户列表 |
| GET | /api/answers | 获取所有答题记录 |
| GET | /api/stats | 获取统计数据 |
| GET | /api/users/:userId/answers | 获取指定用户的答题记录 |
| DELETE | /api/clear | 清除所有数据（管理用） |

## 管理后台

- 用户名: bigworld
- 密码: Angele921

## 数据存储

数据保存在 `server/data/` 目录下的 JSON 文件中：
- `users.json` - 用户列表
- `answers.json` - 答题记录
