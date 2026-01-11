# 初始化项目

本地设置并启动 Habit Tracker 应用。

## 1. 安装后端依赖

```bash
cd backend && uv sync
```

安装所有 Python 包，包括开发依赖（pytest, ruff, httpx）。

## 2. 安装前端依赖

```bash
cd frontend && npm install
```

安装 React、Vite、TanStack Query、Tailwind CSS 等前端包。

## 3. 启动后端服务

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
```

在端口 8000 启动 FastAPI 服务（热重载）。首次运行自动创建 SQLite 数据库。

## 4. 启动前端服务（新终端）

```bash
cd frontend && npm run dev
```

在端口 5173 启动 Vite 开发服务器。

## 5. 验证设置

```bash
curl -s http://localhost:8000/api/habits
curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://localhost:8000/docs
```

## 访问地址

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 备注

- 无需 .env 文件，使用 SQLite 默认配置
- 数据库文件：`backend/habits.db`
- 后端前端可任意顺序启动
