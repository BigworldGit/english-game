# English Game 后端服务

## 启动后端服务

```bash
npm install --prefix server
node server/server.js
```

服务启动后：
- API 地址: http://localhost:3001
- 游戏前端: http://localhost:3001
- 管理后台: http://localhost:3001/admin.html

## Render 部署

项目根目录的 [render.yaml](/Users/roy/Documents/ChatGPTWorkspace/english-game/render.yaml) 已配置为 `Web Service`：

- `buildCommand`: `npm install --prefix server`
- `startCommand`: `node server/server.js`
- `healthCheckPath`: `/healthz`
- `DATA_DIR`: `/var/data/english-game`

说明：
- 前端和后台现在默认通过同源 `/api/...` 访问接口，所以本地和线上都能复用同一套代码。
- 如果要在 Render 上保留答题记录，需要启用持久化磁盘。Render 官方文档说明，持久化磁盘只对付费 Web Service 可用。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/answers | 提交答题数据 |
| GET | /api/users | 获取所有用户列表 |
| GET | /api/answers | 获取所有答题记录 |
| GET | /api/stats | 获取统计数据 |
| GET | /api/users/:userId/answers | 获取指定用户的答题记录 |
| GET | /healthz | 健康检查 |
| DELETE | /api/clear | 清除所有数据（管理用） |

## 管理后台

- 用户名: bigworld
- 密码: Angele921

## 数据存储

默认数据保存在 `server/data/` 目录下；如果设置了 `DATA_DIR` 环境变量，则保存到该目录。

文件包括：
- `users.json` - 用户列表
- `answers.json` - 答题记录
