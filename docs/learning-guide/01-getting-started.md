# 01 - Claude Code 入门指南

## 什么是 Claude Code?

**Claude Code** 是 Anthropic 官方推出的 AI 编程助手命令行工具。它允许你通过自然语言与 Claude AI 对话来完成各种编程任务,从编写代码、调试问题到重构项目,都可以通过对话的方式实现。

### 核心特点

- **🤖 智能代码助手**: 理解你的代码库,提供上下文相关的建议
- **⚡ 命令行集成**: 直接在终端中使用,无需切换窗口
- **🔧 工具集成**: 可以读写文件、运行命令、搜索代码等
- **📝 对话式编程**: 用自然语言描述需求,AI 帮你实现
- **🎯 项目感知**: 理解项目结构和技术栈

## 环境准备

### 前置要求

在开始之前,确保你的系统已安装:

1. **Node.js 18+** - [下载地址](https://nodejs.org/)
2. **Git** - [下载地址](https://git-scm.com/)
3. **Anthropic API Key** - 需要有 Claude API 访问权限

### 安装 Claude Code

```bash
# 使用 npm 全局安装
npm install -g @anthropic-ai/claude-code

# 或使用 npx 直接运行(无需安装)
npx @anthropic-ai/claude-code
```

### 配置 API Key

```bash
# 设置环境变量
export ANTHROPIC_API_KEY="your-api-key-here"

# 或在 ~/.bashrc 或 ~/.zshrc 中永久配置
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.zshrc
```

## 快速上手体验

### 1. 启动 Claude Code

在任意项目目录中运行:

```bash
claude
```

首次运行会进入交互式对话界面。

### 2. 第一个对话

试试这些简单的命令:

```
👤 你好!请介绍一下当前项目的结构

🤖 Claude 会分析项目文件,给出结构说明

👤 帮我创建一个 README.md 文件

🤖 Claude 会生成并写入 README.md

👤 运行 git status 看看有什么变化

🤖 Claude 会执行命令并显示结果
```

### 3. 理解工作流程

Claude Code 的基本工作流程:

```
你的需求 → Claude 理解 → 使用工具执行 → 返回结果 → 你确认/修改
```

## 基本命令和概念

### 内置工具

Claude Code 可以使用多种工具:

| 工具 | 功能 | 示例 |
|------|------|------|
| `Read` | 读取文件内容 | 阅读配置文件、源代码 |
| `Write` | 创建或覆写文件 | 生成新文件 |
| `Edit` | 精确修改文件 | 修改代码片段 |
| `Bash` | 运行终端命令 | git, npm, pytest 等 |
| `Glob` | 文件模式匹配 | 查找所有 `.py` 文件 |
| `Grep` | 搜索代码内容 | 查找函数定义 |

### Slash Commands (斜杠命令)

本项目定义了多个自定义命令(Skills):

```bash
/commit              # 创建规范的 git commit
/init-project        # 初始化项目(安装依赖、启动服务)
/validation:validate # 运行完整验证(测试、代码检查等)
```

使用方式:
```
👤 /commit
🤖 Claude 会分析变更,生成 commit message 并创建提交
```

## 实战演示:第一个任务

让我们完成一个简单任务:为项目添加一个贡献者指南

### 步骤1: 启动 Claude

```bash
cd habit-tracker
claude
```

### 步骤2: 描述需求

```
👤 帮我创建一个 CONTRIBUTING.md 文件,内容包括:
1. 如何设置开发环境
2. 代码规范
3. 如何提交 PR
```

### 步骤3: 观察 Claude 的工作

Claude 会:
1. 读取现有的 README.md 了解项目
2. 读取 .claude/PRD.md 了解项目规范
3. 创建 CONTRIBUTING.md 文件
4. 写入符合项目风格的内容

### 步骤4: 审查和调整

```
👤 在"代码规范"部分添加 Python 的 Black 格式化要求

🤖 Claude 会用 Edit 工具精确修改文件
```

### 步骤5: 提交变更

```
👤 /commit

🤖 Claude 会:
   - 运行 git status
   - 分析变更
   - 生成 commit message
   - 创建提交
```

## 理解对话上下文

### 上下文窗口

Claude Code 会记住整个对话历史,但有限制:

- **上下文窗口**: 约 200,000 tokens (非常大!)
- **上下文退化**: 对话越长,早期内容影响力越小
- **何时重置**: 开始新任务时,使用 `/clear` 清空历史

### 最佳实践

✅ **一个对话一个任务**: 完成一个功能后重新开始
✅ **提供清晰上下文**: 明确告诉 Claude 你在做什么
✅ **分步骤进行**: 复杂任务拆分成小步骤
❌ **避免跨任务对话**: 不要在同一对话中做完全不相关的事

## 常见使用场景

### 场景1: 理解现有代码

```
👤 解释 backend/app/routers/habits.py 中的 streak 计算逻辑
```

### 场景2: 添加新功能

```
👤 我想添加一个导出习惯数据为 CSV 的功能,请帮我规划实现步骤
```

### 场景3: 修复 Bug

```
👤 运行 pytest 后有3个测试失败,帮我分析并修复
```

### 场景4: 重构代码

```
👤 把 frontend/src/features/habits/HabitList.jsx 拆分成更小的组件
```

### 场景5: 文档编写

```
👤 为 API 端点生成 OpenAPI 文档
```

## 提示词技巧

### 好的提示词特征

1. **具体明确**
   - ❌ "优化代码"
   - ✅ "优化 calculateStreak 函数,减少数据库查询次数"

2. **提供上下文**
   - ❌ "添加按钮"
   - ✅ "在 HabitCard 组件中添加一个删除按钮,点击后弹出确认对话框"

3. **分步骤**
   - ❌ "实现完整的用户认证系统"
   - ✅ "第一步:添加 User 模型和数据库迁移"

4. **说明约束**
   - ✅ "使用 FastAPI 的依赖注入,不要修改现有的 database.py"

### 提问技巧

```
# 探索性问题
👤 这个项目使用了什么测试框架?测试覆盖率如何?

# 方案咨询
👤 我想添加用户登录功能,有几种实现方案?各有什么优缺点?

# 代码审查
👤 检查 habits.py 中是否有潜在的安全问题或性能瓶颈

# 学习请求
👤 解释一下 TanStack Query 在这个项目中是如何使用的
```

## 下一步学习

现在你已经掌握了基础,接下来学习:

1. 📖 [五大核心最佳实践](./02-five-best-practices.md) - 理解顶级工程师的工作方式
2. 🗺️ [实战学习路线](./03-learning-path.md) - 系统化的学习计划
3. 🏗️ [项目结构详解](./04-project-structure.md) - 深入理解 `.claude/` 目录

## 小测验

在继续之前,确保你能回答:

1. Claude Code 主要用于什么?
2. 列举3个 Claude Code 可以使用的工具
3. 什么时候应该重置对话上下文?
4. 如何使用项目中的自定义命令?
5. 好的提示词应该具备哪些特征?

---

**准备好了?** 继续学习 [五大核心最佳实践](./02-five-best-practices.md) 📚
