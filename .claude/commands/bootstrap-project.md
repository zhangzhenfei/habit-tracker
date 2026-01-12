# Bootstrap Project

智能分析项目结构，使用 AskUserQuestion Tool 生成完整的 Claude Code 项目配置。尽量多提问用户，根据项目复杂度，获取更多信息，至少 20 轮问答以上

## 目标

为已拷贝 `.claude/commands/` 和 `.claude/reference/` 的项目生成项目特定的配置：

1. **`CLAUDE.md`** - 项目级别指令文件
2. **`.agents/`** - 计划存储目录结构

**前置条件**: 已从模板项目拷贝 `.claude/commands/` 和通用 reference 文档。

## 执行流程

### 阶段 1: 项目分析

自动检测和分析项目：

1. **技术栈检测**
   - 扫描配置文件识别技术栈：
     - `package.json` → Node.js/前端框架
     - `pyproject.toml`/`requirements.txt` → Python 框架
     - `go.mod` → Go
     - `Cargo.toml` → Rust
     - `pom.xml`/`build.gradle` → Java
   - 识别框架和库：
     - 前端：React, Vue, Angular, Svelte
     - 后端：FastAPI, Django, Express, NestJS
     - 数据库：PostgreSQL, MySQL, SQLite, MongoDB
     - 测试：pytest, Jest, Vitest, Playwright

2. **项目结构分析**
   - 识别目录组织模式
   - 检测是否为 monorepo
   - 识别前后端分离结构
   - 检测测试目录位置

3. **现有配置检查**
   - 检查是否已有 `CLAUDE.md`
   - 检查 `.claude/` 目录状态
   - 识别已有的最佳实践文档

### 阶段 2: 交互式问答

基于分析结果，向用户确认和补充信息：

**问题 1: 项目基本信息**
- 项目名称（从配置文件推断）
- 项目简短描述（一句话说明项目用途）
- 项目类型：Web应用 / API服务 / CLI工具 / 库/框架 / 其他

**问题 2: 技术栈确认**
- 展示检测到的技术栈，让用户确认或补充
- 是否有未检测到的关键技术？
- 是否使用特定的架构模式？

**问题 3: 开发规范**
- 代码风格：严格 / 标准 / 宽松
- 注释要求：最小化 / 适度 / 详尽
- 错误处理：简单 / 标准 / 防御性

**问题 4: 测试策略**
- 测试覆盖率目标：基础 / 标准(70%) / 高(90%+)
- 测试类型分布：单元/集成/E2E 比例

**问题 5: 部署方式**
- 部署环境：本地 / Docker / 云平台
- 是否需要 CI/CD 配置？


### 阶段 3: 生成内容

基于分析和问答结果，生成以下文件：

#### 3.1 生成 CLAUDE.md

包含以下章节：

1. **项目概述** - 名称、描述、用途
2. **技术栈** - 检测到的所有技术和框架
3. **项目结构** - 目录组织说明
4. **常用命令** - 启动、测试、构建命令
5. **MCP 服务** - 推荐的 MCP 服务（如 Playwright）
6. **参考文档** - 指向 `.claude/reference/` 中的文档
7. **代码规范** - 基于用户选择的开发规范
8. **日志和监控** - 日志配置说明
9. **数据库** - 数据库配置和连接信息
10. **测试策略** - 测试目录和覆盖率要求

#### 3.2 拷贝技术栈相关的 reference 文档（可选）

如果检测到项目使用了特定技术栈，但对应的 reference 文档不存在，提示用户从模板项目拷贝：

- FastAPI → `fastapi-best-practices.md`
- React → `react-frontend-best-practices.md`
- SQLite → `sqlite-best-practices.md`
- 等等...

#### 3.3 创建 .agents/ 目录结构

创建空的目录结构用于存储计划：

```text
.agents/
└── plans/
```

注意：不生成具体的计划文件，这些会在使用 `/plan-feature` 时自动创建。

## 实施步骤

### 步骤 1: 扫描项目

使用 Glob 和 Read 工具扫描项目：
- 查找配置文件（package.json, pyproject.toml 等）
- 分析目录结构
- 识别技术栈

### 步骤 2: 展示分析结果

向用户展示检测到的信息：

- 项目名称和类型
- 技术栈列表
- 目录结构概览

### 步骤 3: 交互式问答

使用 AskUserQuestion 工具逐步询问：

- 每次询问 1-2 个相关问题
- 根据用户回答调整后续问题
- 确认所有关键信息

### 步骤 4: 生成文件

按顺序生成文件：

1. 创建 `.claude/reference/` 目录（如果不存在）
2. 生成技术栈相关的最佳实践文档
3. 生成 `CLAUDE.md` 文件
4. 展示生成的文件列表

### 步骤 5: 验证和确认

生成完成后：

- 展示生成的文件路径
- 提供快速预览（每个文件的前几行）
- 询问用户是否需要调整

## 注意事项

1. **保护现有文件** - 如果 `CLAUDE.md` 已存在，先备份为 `CLAUDE.md.backup`
2. **增量生成** - 如果 `.claude/reference/` 已有文档，只生成缺失的
3. **技术栈优先级** - 优先生成主要技术栈的文档
4. **用户确认** - 重要决策前都要征求用户意见

## 示例输出

执行 `/bootstrap-project` 后的典型输出：

```text
✓ 项目分析完成

检测到的技术栈：
- 后端: FastAPI (Python 3.11)
- 前端: React 18 + Vite
- 数据库: SQLite
- 测试: pytest, Vitest, Playwright

项目结构：
- 前后端分离
- Monorepo 结构
- 测试目录独立

[交互式问答...]

✓ 生成完成

已创建以下文件：
- CLAUDE.md
- .claude/reference/fastapi-best-practices.md
- .claude/reference/react-frontend-best-practices.md
- .claude/reference/sqlite-best-practices.md
- .claude/reference/testing-and-logging.md
- .claude/reference/deployment-best-practices.md
```

