# 项目结构详解 (Project Structure Deep Dive)

Habit Tracker 的文件结构是为了配合 AI Agent 工作而专门设计的。这不仅仅是代码的容器，更是 AI 的"操作界面"。

## 目录树概览

```
habit-tracker/
├── .agents/          # [决策层] AI 的短期记忆与工作区
│   └── plans/        # 存放具体的实施计划书
├── .claude/          # [知识层] AI 的长期记忆与规则库
│   ├── commands/     # 可执行的标准操作流程 (SOP)
│   ├── reference/    # 技术规范与最佳实践
│   ├── CLAUDE.md     # 根指令与常用入口
│   └── PRD.md        # 产品需求文档 (SSOT - Single Source of Truth)
├── backend/          # [实现层] Python FastAPI 后端
├── frontend/         # [实现层] React 前端
└── docs/             # [文档层] 人类阅读的文档
```

## 1. `.claude/` - 核心大脑

这个目录是整个 Agentic Engineering 的灵魂。

### `CLAUDE.md`
- **作用**：这是 AI 的"开机启动项"。每次对话开始，我们通常会让 AI 先读取它。
- **内容**：
    - 项目简介
    - 常用命令速查 (Run tests, Start server)
    - 核心技术栈摘要
    - 文档索引

### `PRD.md` (Product Requirements Document)
- **作用**：真理的唯一来源 (Single Source of Truth)。
- **规则**：如果代码和 PRD 冲突，**以 PRD 为准**（或者更新 PRD）。永远不要在没有更新 PRD 的情况下修改核心功能。

### `commands/` - Skills 定义

- **作用**：存放结构化的 Prompt 模板，可通过 `/skill-name` 直接调用
- **调用方式**：使用斜杠命令语法

**本项目内置 Skills**：

| Skill 命令 | 文件位置 | 用途 |
|-----------|---------|------|
| `/commit` | `commands/commit.md` | 自动生成规范提交 |
| `/init-project` | `commands/init-project.md` | 初始化项目环境 |
| `/core_piv_loop:prime` | `commands/core_piv_loop/prime.md` | 加载项目上下文 |
| `/core_piv_loop:plan-feature` | `commands/core_piv_loop/plan-feature.md` | 创建实现计划 |
| `/core_piv_loop:execute` | `commands/core_piv_loop/execute.md` | 执行计划 |
| `/github_bug_fix:rca` | `commands/github_bug_fix/rca.md` | Bug 根因分析 |
| `/validation:validate` | `commands/validation/validate.md` | 完整验证 |
| `/validation:code-review` | `commands/validation/code-review.md` | 代码审查 |

### `reference/` - 技术规范库 (按需加载)

这是 AI 的"参考书架"。**最重要的规则是：AI 不会自动读取这里的文件，你必须显式告诉它去读。**

#### 1. 现有文件使用指南 (何时加载？)

以下是本项目现有的参考文件及其适用场景。请在 Prompt 开头包含 `Read .claude/reference/xxx.md`。

| 文件名 | 适用场景 | 典型指令示例 (安全版) |
|--------|----------|-----------------------|
| **`fastapi-best-practices.md`** | **后端开发**<br>• 修改 API 接口<br>• 修改 Pydantic 模型 | "Read `reference/fastapi-best-practices.md`. I want to add a new POST endpoint. **Please create a plan** in `.agents/plans/new-endpoint.md` first." |
| **`react-frontend-best-practices.md`** | **前端开发**<br>• 新建 React 组件<br>• 调用后端 API | "Read `reference/react-frontend-best-practices.md`. I need a 'HabitCard' component. **Draft a plan** outlining the component structure and props." |
| **`sqlite-best-practices.md`** | **数据库操作**<br>• 修改表结构 (Migration)<br>• 编写复杂 SQL 查询 | "Read `reference/sqlite-best-practices.md`. I need to add a column. **Do not execute yet**, just show me the SQL command you intend to run." |
| **`testing-and-logging.md`** | **质量保证**<br>• 编写测试用例<br>• 调试报错 | "Read `reference/testing-and-logging.md`. **Propose a test strategy** for the `calculate_streak` function before writing the test file." |
| **`deployment-best-practices.md`** | **运维部署**<br>• 配置 Docker<br>• 准备生产环境构建 | "Read `reference/deployment-best-practices.md`. **Generate a draft** of the Dockerfile for review." |

#### 2. 何时创建新的 Reference 文档？

不要滥建文档。只有满足以下条件时，才创建新的 `.md` 文件：

**条件 A: 引入了全新的技术栈**
- *例子*：你决定引入 **Redis** 做缓存。
- *动作*：创建 `redis-best-practices.md`。
- *内容*：如何连接 Redis，Key 的命名规范，序列化方式。

**条件 B: 某个逻辑特别复杂且独立**
- *例子*：你需要写一个非常复杂的**"连击计算算法"**，涉及跨时区、补签卡等逻辑。
- *动作*：创建 `streak-calculation-logic.md`。
- *内容*：详细的算法描述、边缘情况（Edge Cases）、数学公式。

**条件 C: 纠正 AI 的反复错误 (最常见)**
- *现象*：你发现 AI 总是喜欢用 `print()` 而不是 `logger.info()`，尽管你纠正了很多次。
- *动作*：不要只是纠正代码。去更新 `testing-and-logging.md`（或者如果规则太特殊，建一个新文件），明确写入：`❌ 禁止使用 print()，必须使用 structlog`。

#### 3. 如何编写 Reference 文件 (模板)

一个好的 Reference 文件应该像一张"作弊条" (Cheat Sheet)。

```markdown
# [技术名称] Best Practices

## 🚨 核心原则 (Critical Rules)
- 规则 1: (例如：必须使用异步函数)
- 规则 2: (例如：所有文件名必须小写)

## 📝 代码模式 (Patterns)

### 场景 1: 定义数据模型
(这里放一段**完美**的代码示例，让 AI 模仿)
```python
class User(Base):
    __tablename__ = "users"
    # ...
```

### 场景 2: 错误处理
(演示如何正确捕获异常)
```

#### 4. 混合使用技巧

你可以一次加载多个文件，但不要超过 3 个，否则 AI 容易糊涂。

> **示例**：你要写一个"获取并展示习惯列表"的功能。
> "Read `reference/fastapi-best-practices.md` and `reference/react-frontend-best-practices.md`. implementation the 'Get Habits' feature from backend to frontend."


## 2. `.agents/` - 决策工作台

### `plans/`
- **作用**：物理隔离"思考"和"行动"。
- **工作流**：
    1. AI 在这里创建一个 `.md` 文件（如 `feature-xyz.md`），列出它打算做的所有步骤。
    2. 人类审查这个文件。
    3. AI 读取这个文件，逐项打勾执行。

#### 📄 计划书模板示例 (Plan Template)
一个好的计划书应该像这样：

```markdown
# Plan: Add Dark Mode

## User Story
As a user, I want to toggle dark mode so that my eyes don't hurt at night.

## Proposed Changes

### Frontend
- [ ] Add `ThemeContext` in `src/context/ThemeContext.jsx`
- [ ] Add toggle button in `Header.jsx`
- [ ] Update Tailwind config for dark mode class

### Backend
- [ ] (No changes needed)

## Verification Plan
- [ ] Click toggle button -> check `html` class changes to `dark`
- [ ] Refresh page -> check preference is persisted
```

## 3. `commands/` - Skills 系统详解

Skills 是可复用的自动化流程，通过 `/skill-name` 语法调用。

### 如何使用 Skills

```bash
# 简单 skill
/commit

# 带参数的 skill
/core_piv_loop:plan-feature 添加用户认证功能

# 带路径参数的 skill
/core_piv_loop:execute .agents/plans/auth-feature.md
```

### 如何创建自定义 Skill

在 `.claude/commands/` 下创建 Markdown 文件：

```markdown
---
description: 简短描述
argument-hint: [参数提示]
---

# Skill 名称

## 目标
描述这个 skill 要完成什么

## 步骤
1. 第一步
2. 第二步
3. ...
```

**示例**：创建代码风格检查 skill

文件：`.claude/commands/maintenance/check-style.md`
调用：`/maintenance:check-style`

## 4. `backend/` & `frontend/` - 代码实现

这是标准的软件工程目录，但有两个特点：
- **扁平化**：为了让 AI 容易查找，尽量减少过深的嵌套。
- **模块化**：文件职责单一（例如 `api/` 目录专门放 API 调用），方便 AI 准确定位修改点。

## 总结

- **人类** 修改 `.claude/` (制定规则)。
- **AI** 在 `.agents/` 中生成计划 (提出方案)。
- **人类** 批准计划。
- **AI** 修改 `backend/` 和 `frontend/` (执行代码)。
