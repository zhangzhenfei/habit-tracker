# 10 个 PIV 循环刻意练习 (10 PIV Loop Drills)

这份文档旨在通过 10 个难度递增的练习，帮助你将 Agentic Engineering 的思维固化为肌肉记忆。

**⚠️ 核心规则**：
1. 每个练习使用 Skills 自动化流程
2. 每个练习结束后，建议使用 `/clear` 清理上下文
3. 遇到 AI 抢跑（直接写代码），必须打断并要求它先做计划

---

## 🟢 Level 1: 热身与文档 (Warm-up)

### 练习 1: 修改 PRD
**场景**：决定给习惯增加一个"优先级"属性。
**目标**：仅更新文档，不写代码。

```bash
# 1. 加载上下文
/core_piv_loop:prime

# 2. 告诉 AI 你的需求，让它更新 PRD
我想给习惯添加优先级字段，请更新 PRD 的数据模型部分

# 3. 验证
Read .claude/PRD.md 确认更改
```

### 练习 2: 增加 Reference 规则
**场景**：为了统一代码风格，禁止在前端使用 console.log。
**目标**：更新前端最佳实践文档。

```bash
# 1. 读取现有规则
Read .claude/reference/react-frontend-best-practices.md

# 2. 添加新规则
请添加一条规则：禁止使用 console.log，应使用专门的日志工具

# 3. 验证
Read .claude/reference/react-frontend-best-practices.md 确认规则已添加
```

### 练习 3: 创建 Bug 报告
**场景**：模拟发现一个 Bug（例如：日期显示错误）。
**目标**：使用 RCA Skill 创建分析报告。

```bash
# 使用 RCA skill（假设有 GitHub Issue #99）
/github_bug_fix:rca 99

# 或者手动描述问题
我发现一个 bug：日期显示差一天。请创建 RCA 分析报告到 docs/rca/
```

---

## 🟡 Level 2: 单侧代码修改 (Frontend/Backend)

### 练习 4: 修改前端文案 (Frontend)
**场景**：将首页的 "Add Habit" 按钮改为 "New Goal"。
**目标**：安全地修改 UI。

```bash
# 简单修改，直接告诉 AI
找到 "Add Habit" 按钮的文件，把文案改成 "New Goal"

# 验证
/validation:validate
/commit
```

### 练习 5: 添加后端日志 (Backend)
**场景**：在习惯创建成功后，打印一条 Info 日志。
**目标**：修改后端逻辑。

```bash
# 1. 加载规范
Read .claude/reference/testing-and-logging.md

# 2. 描述需求
在习惯创建成功后添加一条结构化日志，记录 habit_id 和 habit_name

# 3. 验证
/validation:validate
/commit
```

### 练习 6: 前端组件拆分 (Refactoring)
**场景**：`HabitList.jsx` 太长了，拆分成更小的组件。
**目标**：重构而不改变功能。

```bash
# 使用完整 PIV 流程
/core_piv_loop:prime
/core_piv_loop:plan-feature 将 HabitList 拆分为 HabitItem 组件

# 审查计划后执行
/core_piv_loop:execute .agents/plans/refactor-habit-list.md
/validation:validate
/commit
```

---

## 🔴 Level 3: 全栈开发 (Full Stack)

### 练习 7: 给习惯添加"描述"字段 (Full Stack CRUD)
**场景**：用户创建习惯时可以输入描述。
**目标**：数据库 -> API -> 前端表单 -> 前端展示。

```bash
# 完整 PIV 流程
/core_piv_loop:prime
/core_piv_loop:plan-feature 给习惯添加描述字段，支持创建和编辑

# 审查计划后执行
/core_piv_loop:execute .agents/plans/add-description.md

# 验证
/validation:validate
/commit
```

### 练习 8: 软删除功能 (Soft Delete)
**场景**：删除习惯时，不要真删，而是标记为 `archived`。
**目标**：修改业务逻辑。

```bash
/core_piv_loop:prime
/core_piv_loop:plan-feature 实现软删除，添加 is_archived 字段

# 审查计划后执行
/core_piv_loop:execute .agents/plans/soft-delete.md
/validation:validate
/commit
```

### 练习 9: 每日格言 (External API)
**场景**：在首页顶部显示一条随机格言。
**目标**：集成第三方 API。

```bash
/core_piv_loop:prime
/core_piv_loop:plan-feature 在首页显示每日格言，从公共 API 获取

# 审查计划后执行
/core_piv_loop:execute .agents/plans/quote-of-day.md
/validation:validate
/commit
```

---

## ⚫️ Level 4: 终极挑战 (System)

### 练习 10: 毕业设计 - 数据导出 (Export Data)
**场景**：用户想把所有打卡记录导出为 CSV。
**目标**：完整的端到端功能，包含新路由、数据处理、文件下载。

```bash
# 1. Prime - 加载完整上下文
/core_piv_loop:prime

# 2. Plan - 创建详细计划
/core_piv_loop:plan-feature CSV 数据导出功能，包含后端 API 和前端下载按钮

# 3. 审查计划
# 确保计划包含：
# - 后端：csv 模块生成数据
# - 后端：GET /api/export 端点
# - 前端：导出按钮和下载处理

# 4. Execute - 执行计划
/core_piv_loop:execute .agents/plans/export-feature.md

# 5. Code Review - 代码审查
/validation:code-review

# 6. Validate - 完整验证
/validation:validate

# 7. Commit - 提交
/commit
```

---

**完成这 10 个练习后，你将成为 Top 1% 的 Agentic Engineer。加油！**
