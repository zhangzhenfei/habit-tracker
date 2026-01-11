# 习惯追踪器

个人习惯追踪应用，支持连续打卡统计和完成率指标。

## 技术栈

- **后端**: Python 3.11+, FastAPI, SQLAlchemy, SQLite, structlog
- **前端**: React 18, Vite, Tailwind CSS, TanStack Query
- **测试**: pytest, Vitest, Playwright
- **无需认证** - 本地单用户应用

## 项目结构

```
habit-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI 入口
│   │   ├── database.py       # SQLite 连接
│   │   ├── models.py         # SQLAlchemy 模型
│   │   ├── schemas.py        # Pydantic 模式
│   │   ├── logging_config.py # 日志配置
│   │   └── routers/          # API 路由
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── features/         # 功能模块
│   │   ├── api/              # API 客户端
│   │   └── App.jsx
│   └── package.json
├── tests/
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── e2e/                  # E2E 测试
└── .claude/
    ├── PRD.md                # 产品需求文档
    ├── reference/            # 最佳实践文档
    └── commands/             # 自定义命令
```

## 常用命令

```bash
# 后端
cd backend && uv sync
uv run uvicorn app.main:app --reload --port 8000

# 前端
cd frontend && npm install && npm run dev

# 测试
uv run pytest tests/ -v       # 全部测试
npx playwright test           # E2E 测试
```

## MCP 服务

**Playwright MCP** 用于浏览器自动化和 E2E 测试：
```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## 参考文档

| 文档 | 用途 |
|------|------|
| `.claude/PRD.md` | 需求、功能、API 规范 |
| `fastapi-best-practices.md` | API 开发 |
| `sqlite-best-practices.md` | 数据库设计 |
| `react-frontend-best-practices.md` | 前端开发 |
| `testing-and-logging.md` | 测试与日志 |

## 代码规范

### 后端 (Python)
- 所有请求/响应使用 Pydantic 模式
- 分离模式：`HabitCreate`, `HabitUpdate`, `HabitResponse`
- 使用 `Depends()` 注入数据库会话
- 日期存储为 ISO-8601 格式 (`YYYY-MM-DD`)

### 前端 (React)
- 功能模块化目录结构 `src/features/`
- 使用 TanStack Query 获取数据
- Tailwind CSS 样式
- react-hook-form + Zod 表单验证

### API 设计
- RESTful 端点位于 `/api/`
- POST 返回 201，DELETE 返回 204

## 日志

使用 **structlog** 记录日志：

```python
import structlog
logger = structlog.get_logger()
logger.info("Habit completed", habit_id=1, streak=5)
```

## 数据库

SQLite WAL 模式，两张表：`habits` 和 `completions`。

连接时执行：
```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
```

## 测试策略

- **70% 单元测试**: 业务逻辑、验证器
- **20% 集成测试**: API 端点
- **10% E2E 测试**: 关键用户流程

### 测试目录
```
tests/
├── conftest.py              # 共享 fixtures
├── unit/                    # 单元测试
├── integration/             # 集成测试
└── e2e/                     # E2E 测试
```
