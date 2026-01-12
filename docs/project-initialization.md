# 项目初始化指南

本指南说明如何将 Habit Tracker 项目的 Claude Code 配置复用到新项目中。

## 概述

Habit Tracker 项目包含完整的 Claude Code 工作流配置，包括：
- **工作流命令系统** (`.claude/commands/`) - PIV 循环、Bug 修复、验证流程
- **最佳实践文档** (`.claude/reference/`) - 技术栈相关的开发规范
- **项目配置模板** - 用于生成项目特定的 `CLAUDE.md`

通过复用这些配置，你可以在新项目中快速获得相同的"vibe coding"管理能力。

## 前置条件

- 已安装 Claude Code CLI
- 有一个需要配置的新项目（或现有项目）
- 可以访问 Habit Tracker 项目作为模板

## 初始化流程

### 步骤 1: 准备新项目

确保你的新项目已经初始化：

```bash
# 如果是全新项目
mkdir my-new-project
cd my-new-project
git init

# 如果是现有项目
cd /path/to/your/project
```

### 步骤 2: 拷贝工作流命令系统

从 Habit Tracker 项目拷贝 commands 目录到新项目：

```bash
# 拷贝整个 commands 目录
cp -r /path/to/habit-tracker/.claude/commands /path/to/your/project/.claude/
```

这个目录包含所有工作流命令：

- 基础命令：`commit.md`, `create-prd.md`, `init-project.md`, `bootstrap-project.md`
- PIV 循环：`core_piv_loop/` (plan-feature, prime, execute)
- Bug 修复：`github_bug_fix/` (rca, implement-fix)
- 验证流程：`validation/` (validate, code-review, etc.)

**注意**: reference 文档不需要拷贝，会在下一步通过 `/bootstrap-project` 命令交互式生成。

### 步骤 3: 运行 `/bootstrap-project` 命令

在新项目目录中，使用 Claude Code 运行 bootstrap 命令：

```bash
cd /path/to/your/project
claude
```

在 Claude Code 中执行：

```
/bootstrap-project
```

这个命令会：

1. 分析你的项目结构和技术栈
2. 通过交互式问答收集项目信息（至少 20 轮问答）
3. **生成 reference 文档**（通用文档 + 技术栈相关文档）
4. 生成项目特定的 `CLAUDE.md` 文件
5. 创建 `.agents/plans/` 目录结构

### 步骤 4: 验证配置

检查生成的文件和目录结构：

```bash
# 查看目录结构
tree .claude .agents

# 应该看到类似的结构：
# .claude/
# ├── commands/
# │   ├── commit.md
# │   ├── create-prd.md
# │   ├── core_piv_loop/
# │   ├── github_bug_fix/
# │   └── validation/
# ├── reference/
# │   ├── claude-commands-guide.md
# │   ├── testing-and-logging.md
# │   └── ...
# └── PRD.md (可选)
# .agents/
# └── plans/
# CLAUDE.md
```

验证可用的命令：

```bash
# 在 Claude Code 中，输入 / 查看所有可用命令
# 应该能看到：
# /commit
# /create-prd
# /plan-feature
# /prime
# /execute
# 等等...
```

## 常见问题

### Q: 是否需要拷贝 `.agents/plans/` 目录？

不需要。`.agents/plans/` 目录包含的是 Habit Tracker 项目的具体计划文件，这些是项目特定的。新项目会在运行 `/plan-feature` 时自动生成自己的计划文件。

### Q: 如果我的项目使用的技术栈不在 reference 文档中怎么办？

你可以：
1. 参考现有的最佳实践文档格式，自己编写
2. 或者暂时跳过，直接使用通用文档
3. 后续可以从其他项目补充

### Q: 拷贝后需要修改 commands 文件吗？

通常不需要。commands 文件是通用的工作流命令，可以直接使用。如果有特殊需求，可以根据项目调整。

## 快速开始工作流

配置完成后，你可以立即使用以下工作流：

### 规划新功能

```
/plan-feature
```

这会引导你完成功能规划，生成详细的实施计划。

### 加载项目上下文

```
/prime
```

让 Claude 深入理解你的项目结构和代码。

### 执行实施

```
/execute
```

根据计划执行功能实施。

### 提交代码

```
/commit
```

创建规范的 Git 提交。

## 总结

通过以上步骤，你已经成功将 Habit Tracker 的 Claude Code 配置复用到新项目中：

✅ 拷贝了完整的工作流命令系统
✅ 拷贝了通用和技术栈相关的最佳实践文档
✅ 生成了项目特定的 `CLAUDE.md` 配置
✅ 创建了计划存储目录结构

现在你可以使用完整的 PIV 循环工作流来开发新项目了！

## 相关文档

- [`.claude/commands/bootstrap-project.md`](../.claude/commands/bootstrap-project.md) - Bootstrap 命令详细说明
- [`.claude/reference/claude-commands-guide.md`](../.claude/reference/claude-commands-guide.md) - Commands 系统使用指南
