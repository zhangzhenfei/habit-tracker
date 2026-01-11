# 实践练习 (Hands-on Exercises)

最好的学习方式是动手。以下练习设计为循序渐进，请按顺序完成。

## 练习 1: 热身 - 简单的文本修改

**目标**：熟悉 `replace` 工具和基本对话。

**任务**：
将前端页面顶部的 "Habit Tracker" 标题修改为 "My Daily Habits"。

**指令提示**：
> "找到前端显示应用标题的文件（可能是 App.jsx 或某个 Header 组件），然后把标题文字从 'Habit Tracker' 改为 'My Daily Habits'。"

**检查点**：
- 浏览器中标题更新了吗？
- 终端没有报错吧？

## 练习 2: 规范 - 使用 Git 提交

**目标**：体验 AI 辅助的 Git 工作流。

**任务**：
为你刚才的修改提交代码。

**指令提示**：
> "请运行 git status 查看更改，然后根据 CLAUDE.md 中的提交规范，帮我生成一个 commit message 并提交。"

**检查点**：
- AI 是否先运行了 `git diff` 来确认改了什么？
- 提交信息是否清晰？(例如: `feat(ui): update application header title`)

## 练习 2.5: 核心 - 理解 Reference (按需加载)

**目标**：亲身体验"加载 Reference"与"不加载 Reference"的区别。这是理解 Agentic Engineering 的关键。

**任务**：
询问 AI 如何在前端发起一个 API 请求。

**第一轮：不加载规则 (错误示范)**
> "我想在前端获取用户列表，请写一段代码示例。"

*观察结果*：AI 可能会使用 `axios` 或者普通的 `useEffect` + `fetch`。虽然代码是对的，但**不符合本项目规范**（本项目要求用 TanStack Query）。

**第二轮：加载规则 (正确示范)**
> "Read `.claude/reference/react-frontend-best-practices.md`. 我想在前端获取用户列表，请写一段代码示例。"

*观察结果*：AI 应该会给出使用 `useQuery` 的代码示例，并且不使用 `useEffect`。

**结论**：
这就是 **On-demand Context (按需上下文)** 的力量。你不告诉它规则，它就会按通用标准发挥；告诉它规则，它就是你的专属专家。

## 练习 3: 核心 - PIV 循环 (完整流程)

**目标**：体验完整的 Plan-Implement-Verify 循环。这是重头戏。

**任务**：
给后端 API 添加一个"健康检查"端点 `/api/health`，返回 `{"status": "ok"}`。

**步骤 1: Prime & Plan (准备与规划)**
> "读取 CLAUDE.md 和 reference/fastapi-best-practices.md。我想添加一个健康检查端点。**请不要直接编写实现代码**。
> 请先在 `.agents/plans/` 下创建一个名为 `health-endpoint.md` 的计划文件，列出需要的步骤（如修改路由、编写测试）。"

**步骤 3: Verify Plan (人工验证)**
> (你去查看那个文件，如果没问题，继续下一步)

**步骤 4: Implement (实施)**
> "计划已批准。请执行 health-endpoint.md。"

**步骤 5: Verify Code (验证)**
> "运行后端测试，并使用 curl 命令手动测试一下这个新接口。"

## 练习 4: 进阶 - 修复 Bug

**目标**：使用 `commands/` 目录下的预定义流程。

**场景**：
假设我们发现一个 Bug（或者你可以假装有一个）：习惯名称太长会导致 UI 错位。

**任务**：
使用 RCA (根本原因分析) 流程。

**指令提示**：
> "我怀疑长文本会导致 UI 问题。请按照 .claude/commands/github_bug_fix/rca.md 的指导，先进行分析，创建一个复现这个问题的测试用例或描述。"

**检查点**：
- AI 应该拒绝直接改代码，而是先分析。

---

## 完成了吗？

恭喜！如果你完成了以上 4 个练习，你已经比 99% 的开发者更懂得如何与 AI 协作了。
