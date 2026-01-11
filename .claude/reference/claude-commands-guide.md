# Claude Code Commands 指南

## 概述

`.claude/commands/` 目录用于定义可复用的 Claude Code 自定义命令（也称为 Skills）。这些命令可以通过 `/command-name` 的方式在 Claude Code 中调用，实现工作流自动化和标准化。

## 目录结构

```
.claude/commands/
├── commit.md                    # 简单命令（单文件）
├── create-prd.md
├── init-project.md
├── core_piv_loop/               # 命令组（目录形式）
│   ├── plan-feature.md
│   ├── prime.md
│   └── execute.md
├── github_bug_fix/
│   ├── rca.md
│   └── implement-fix.md
└── validation/
    ├── validate.md
    ├── code-review.md
    ├── code-review-fix.md
    ├── execution-report.md
    └── system-review.md
```

## 命令类型

### 1. 简单命令（单文件）

直接放在 `commands/` 目录下的 `.md` 文件。

**调用方式**: `/command-name`

**示例**: `/commit`

### 2. 命令组（目录形式）

放在子目录中的命令，用于组织相关的命令集合。

**调用方式**: `/directory-name:command-name`

**示例**: `/validation:code-review`

---

## 命令文件格式

### 基础格式

```markdown
命令的描述和指令内容...

可以包含：
- 执行步骤
- bash 命令
- 期望的输出格式
- 验证标准
```

### 带元数据的格式（可选）

```markdown
---
description: "命令的简短描述"
---

# 命令标题

## 命令内容...
```

### 使用参数

命令可以接收用户传入的参数，使用 `$ARGUMENTS` 占位符：

```markdown
# 功能规划

## Feature: $ARGUMENTS

根据用户提供的功能描述进行规划...
```

**调用示例**: `/plan-feature 添加用户认证功能`

---

## 实践示例

### 示例 1: 简单的提交命令

**文件**: `.claude/commands/commit.md`

```markdown
Create a new commit for all of our uncommitted changes
run git status && git diff HEAD && git status --porcelain to see what files are uncommitted
add the untracked and changed files

Add an atomic commit message with an appropriate message

add a tag such as "feat", "fix", "docs", etc. that reflects our work
```

**使用**: `/commit`

---

### 示例 2: 验证命令

**文件**: `.claude/commands/validation/validate.md`

```markdown
Run comprehensive validation of the Habit Tracker project.

Execute the following commands in sequence and report results:

## 1. Backend Linting

```bash
cd backend && uv run ruff check .
```

**Expected:** "All checks passed!" or no output (clean)

## 2. Backend Tests

```bash
cd backend && uv run pytest -v
```

**Expected:** All tests pass, execution time < 5 seconds

## 3. Summary Report

After all validations complete, provide a summary report with:

- Linting status
- Tests passed/failed
- Coverage percentage
- Overall health assessment (PASS/FAIL)
```

**使用**: `/validation:validate`

---

### 示例 3: 带参数的功能规划命令

**文件**: `.claude/commands/core_piv_loop/plan-feature.md`

```markdown
---
description: "Create comprehensive feature plan with deep codebase analysis"
---

# Plan a new task

## Feature: $ARGUMENTS

## Mission

Transform a feature request into a **comprehensive implementation plan**
through systematic codebase analysis, external research, and strategic planning.

## Planning Process

### Phase 1: Feature Understanding
- Extract the core problem being solved
- Identify user value and business impact
- Determine feature type: New Capability/Enhancement/Refactor/Bug Fix

### Phase 2: Codebase Intelligence Gathering
- Detect primary language(s), frameworks, and runtime versions
- Map directory structure and architectural patterns
- Search for similar implementations in codebase

### Phase 3: Plan Generation
- Create step-by-step implementation tasks
- Define validation commands
- Set acceptance criteria

## Output Format

**Filename**: `.agents/plans/{kebab-case-descriptive-name}.md`
```

**使用**: `/core_piv_loop:plan-feature 添加深色模式支持`

---

### 示例 4: Bug 修复工作流

**文件**: `.claude/commands/github_bug_fix/rca.md`

```markdown
# Root Cause Analysis

Analyze the GitHub issue and document the root cause.

## Steps

1. Read the issue description and reproduction steps
2. Search codebase for related code
3. Identify the root cause
4. Document findings in `.agents/rca/{issue-number}.md`

## Output Format

```markdown
# RCA: Issue #{number}

## Problem Summary
...

## Root Cause
...

## Affected Files
...

## Proposed Fix
...
```
```

**使用**: `/github_bug_fix:rca #123`

---

## 命令设计最佳实践

### 1. 明确的目标

每个命令应该有单一、明确的目标：

```markdown
# Good: 单一目标
Run backend tests and report coverage

# Bad: 目标模糊
Do some testing stuff
```

### 2. 可执行的步骤

提供具体的 bash 命令和验证标准：

```markdown
## Step 1: Run Linting

```bash
cd backend && uv run ruff check .
```

**Expected:** No errors or warnings
```

### 3. 清晰的输出格式

定义期望的输出结构：

```markdown
## Summary Report

Provide a report with:
- Status: PASS/FAIL
- Tests: X passed, Y failed
- Coverage: XX%
- Errors: List any errors encountered
```

### 4. 错误处理指导

说明如何处理常见错误：

```markdown
## Error Handling

If tests fail:
1. List the failing tests
2. Show the error messages
3. Suggest potential fixes
```

### 5. 使用命令组组织相关命令

将相关命令放在同一目录下：

```
validation/
├── code-review.md      # 代码审查
├── code-review-fix.md  # 修复审查问题
├── validate.md         # 完整验证
└── system-review.md    # 系统级审查
```

---

## 本项目的命令清单

| 命令 | 用途 |
|------|------|
| `/commit` | 创建规范的 git commit |
| `/create-prd` | 从对话创建产品需求文档 |
| `/init-project` | 初始化项目结构 |
| `/core_piv_loop:plan-feature` | 创建功能实现计划 |
| `/core_piv_loop:prime` | 让 agent 理解代码库 |
| `/core_piv_loop:execute` | 执行实现计划 |
| `/github_bug_fix:rca` | 分析 GitHub issue 的根本原因 |
| `/github_bug_fix:implement-fix` | 根据 RCA 文档实现修复 |
| `/validation:validate` | 运行完整的项目验证 |
| `/validation:code-review` | 提交前的代码审查 |
| `/validation:code-review-fix` | 修复代码审查发现的问题 |
| `/validation:execution-report` | 生成实现报告 |
| `/validation:system-review` | 系统级实现审查 |

---

## 创建新命令的步骤

1. **确定命令类型**：简单命令还是命令组
2. **创建文件**：在 `.claude/commands/` 下创建 `.md` 文件
3. **编写内容**：
   - 描述命令目标
   - 列出执行步骤
   - 定义验证标准
   - 指定输出格式
4. **测试命令**：在 Claude Code 中调用测试
5. **迭代优化**：根据使用反馈改进命令

---

## 参考资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- 项目 CLAUDE.md 中的命令约定
