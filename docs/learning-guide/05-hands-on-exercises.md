# 实践练习 (Hands-on Exercises)

最好的学习方式是动手。以下练习设计为循序渐进，请按顺序完成。

## Skills 速查表

在开始练习前，先了解本项目已配置的 Skills（斜杠命令）：

| Skill | 用途 |
|-------|------|
| `/commit` | 自动生成规范的 git commit |
| `/init-project` | 初始化项目（安装依赖、启动服务） |
| `/core_piv_loop:prime` | 加载项目上下文，理解代码库 |
| `/core_piv_loop:plan-feature <描述>` | 需求澄清→更新PRD→生成实施计划 |
| `/core_piv_loop:execute <计划路径>` | 执行实现计划 |
| `/github_bug_fix:rca <issue-id>` | 分析 GitHub issue 根本原因 |
| `/github_bug_fix:implement-fix <issue-id>` | 根据 RCA 实现修复 |
| `/validation:validate` | 运行完整验证（lint + 测试 + 构建） |
| `/validation:code-review` | 提交前代码审查 |

---

## 练习 1: 热身 - 简单的文本修改

**目标**：熟悉基本对话和 Edit 工具。

**任务**：
将前端页面顶部的 "Habit Tracker" 标题修改为 "My Daily Habits"。

**指令提示**：
```
找到前端显示应用标题的文件（可能是 App.jsx 或某个 Header 组件），
然后把标题文字从 'Habit Tracker' 改为 'My Daily Habits'。
```

**检查点**：
- [ ] AI 先搜索/读取了相关文件
- [ ] 使用 Edit 工具精确修改
- [ ] 浏览器中标题更新了
- [ ] 终端没有报错

## 练习 2: 规范 - 使用 /commit 提交

**目标**：体验 Skill 自动化的 Git 工作流。

**任务**：
为你刚才的修改提交代码。

**指令提示**：
```
/commit
```

就这么简单！AI 会自动：
1. 运行 `git status` 查看变更
2. 运行 `git diff` 分析改动内容
3. 生成符合规范的 commit message
4. 创建提交

**检查点**：
- [ ] AI 自动分析了变更内容
- [ ] 提交信息清晰（如 `feat(ui): update application header title`）
- [ ] 提交成功创建

## 练习 3: 核心 - 理解 Reference (按需加载)

**目标**：亲身体验"加载 Reference"与"不加载 Reference"的区别。

**任务**：
询问 AI 如何在前端发起一个 API 请求。

**第一轮：不加载规则 (观察默认行为)**
```
我想在前端获取用户列表，请写一段代码示例。
```

*观察结果*：AI 可能会使用 `axios` 或 `useEffect` + `fetch`。代码能用，但**不符合本项目规范**。

**第二轮：加载规则 (正确示范)**
```
Read .claude/reference/react-frontend-best-practices.md
我想在前端获取用户列表，请写一段代码示例。
```

*观察结果*：AI 会给出使用 `useQuery` 的代码，符合项目规范。

**结论**：
这就是 **按需上下文 (On-demand Context)** 的力量。规则决定输出质量。

## 练习 4: 核心 - PIV 循环 (完整流程)

**目标**：体验完整的 Prime-Plan-Execute-Verify 循环。这是重头戏！

**任务**：
给后端 API 添加一个"健康检查"端点 `/api/health`，返回 `{"status": "ok"}`。

### 步骤 1: Prime (加载项目上下文)

```
/core_piv_loop:prime
```

AI 会自动分析项目结构、技术栈、代码规范等。

### 步骤 2: Plan (创建实现计划)

```
/core_piv_loop:plan-feature 添加健康检查端点 /api/health
```

AI 会：
- 分析代码库找到类似实现
- 识别需要修改的文件
- 创建详细计划到 `.agents/plans/health-endpoint.md`

### 步骤 3: Review (人工审查计划)

打开 `.agents/plans/health-endpoint.md`，检查：
- [ ] 步骤是否合理
- [ ] 是否遗漏测试
- [ ] 是否符合项目规范

### 步骤 4: Execute (执行计划)

```
/core_piv_loop:execute .agents/plans/health-endpoint.md
```

AI 会按计划逐步实现，包括编写测试。

### 步骤 5: Validate (验证)

```
/validation:validate
```

运行完整验证确保没有破坏任何东西。

### 步骤 6: Commit (提交)

```
/commit
```

**检查点**：
- [ ] 计划文件创建成功
- [ ] 代码实现符合计划
- [ ] 所有测试通过
- [ ] `curl http://localhost:8000/api/health` 返回 `{"status": "ok"}`

## 练习 5: 进阶 - Bug 修复流程

**目标**：使用 `/github_bug_fix` 系列命令进行规范的 Bug 修复。

**场景**：
假设有一个 GitHub Issue #42：习惯名称太长会导致 UI 错位。

### 步骤 1: 根因分析 (RCA)

```
/github_bug_fix:rca 42
```

AI 会：
- 获取 Issue 详情
- 搜索相关代码
- 分析根本原因
- 生成 RCA 文档到 `docs/rca/issue-42.md`

### 步骤 2: 审查 RCA 文档

检查 `docs/rca/issue-42.md`：
- [ ] 问题描述准确
- [ ] 根因分析合理
- [ ] 修复方案可行

### 步骤 3: 实现修复

```
/github_bug_fix:implement-fix 42
```

### 步骤 4: 验证并提交

```
/validation:validate
/commit
```

**检查点**：
- [ ] AI 先分析后动手，没有直接改代码
- [ ] RCA 文档记录了问题和方案
- [ ] 修复后 UI 正常显示长文本

---

## 练习 6: 进阶 - 代码审查

**目标**：在提交前进行代码审查。

**任务**：
对当前未提交的代码进行审查。

**指令提示**：
```
/validation:code-review
```

AI 会检查：
- 代码风格和规范
- 潜在的 Bug
- 安全问题
- 测试覆盖

**检查点**：
- [ ] 审查报告生成
- [ ] 根据建议修复问题

---

## 练习 7: 综合 - 全栈功能开发

**目标**：综合运用所有 Skills 完成一个完整功能。

**任务**：
给习惯添加"备注"字段，支持创建和编辑时填写。

### 完整流程

```bash
# 1. 加载上下文
/core_piv_loop:prime

# 2. 创建计划
/core_piv_loop:plan-feature 给习惯添加备注字段

# 3. 审查计划后执行
/core_piv_loop:execute .agents/plans/add-notes-field.md

# 4. 代码审查
/validation:code-review

# 5. 完整验证
/validation:validate

# 6. 提交
/commit
```

**检查点**：
- [ ] 后端：数据库、模型、API 都已更新
- [ ] 前端：表单和展示都支持备注
- [ ] 测试：新增测试用例并通过
- [ ] 提交：commit message 清晰

---

## 完成了吗？

恭喜！如果你完成了以上 7 个练习，你已经掌握了：

1. **基础操作** - 文件修改、Git 提交
2. **按需上下文** - Reference 文件的作用
3. **PIV 循环** - Plan → Execute → Verify 的完整流程
4. **Bug 修复** - RCA 驱动的规范流程
5. **代码审查** - 提交前的质量把关
6. **全栈开发** - 综合运用所有 Skills

你已经比 99% 的开发者更懂得如何与 AI 协作了！

**下一步**：挑战 [08-ten-piv-drills.md](./08-ten-piv-drills.md) 中的 10 个进阶练习。
