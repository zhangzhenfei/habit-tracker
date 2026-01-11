# 10 个 PIV 循环刻意练习 (10 PIV Loop Drills)

这份文档旨在通过 10 个难度递增的练习，帮助你将 Agentic Engineering 的思维固化为肌肉记忆。

**⚠️ 核心规则**：
1. 每个练习必须严格遵守 **Prime -> Plan -> Execute -> Verify** 流程。
2. 每个练习结束后，建议使用 `/clear` 或重启 Claude，以清理上下文。
3. 遇到 AI 抢跑（直接写代码），必须打断并要求它先做计划。

---

## 🟢 Level 1: 热身与文档 (Warm-up)

### 练习 1: 修改 PRD
**场景**：决定给习惯增加一个"优先级"属性。
**目标**：仅更新文档，不写代码。
- **Prime**: "Read `.claude/PRD.md`. I want to add a 'Priority' field to Habits."
- **Plan**: "Do not update the file yet. **Draft a plan** to update the 'Data Model' section of the PRD."
- **Execute**: "Plan approved. Update the PRD file."
- **Verify**: "Read `.claude/PRD.md` again and show me the changes."

### 练习 2: 增加 Reference 规则
**场景**：为了统一代码风格，禁止在前端使用 console.log。
**目标**：更新前端最佳实践文档。
- **Prime**: "Read `.claude/reference/react-frontend-best-practices.md`."
- **Plan**: "I want to add a rule forbidding `console.log`. **Propose the text change** first."
- **Execute**: "Looks good. Update the reference file."
- **Verify**: "Read the file and confirm the rule is added."

### 练习 3: 创建 Bug 报告
**场景**：模拟发现一个 Bug（例如：日期显示错误）。
**目标**：使用 Command 创建一个 Issue 或 Plan。
- **Prime**: "I found a bug: dates are off by one day."
- **Plan**: "Use the `.claude/commands/github_bug_fix/rca.md` process. **Do not fix it**, just create an analysis report in `.agents/plans/bug-date-fix.md`."
- **Execute**: "Go ahead and create the report."
- **Verify**: "Read the report you just created."

---

## 🟡 Level 2: 单侧代码修改 (Frontend/Backend)

### 练习 4: 修改前端文案 (Frontend)
**场景**：将首页的 "Add Habit" 按钮改为 "New Goal"。
**目标**：安全地修改 UI。
- **Prime**: "Read `frontend/src/features/habits/components/HabitForm.jsx` (or locate the correct file)."
- **Plan**: "I want to rename the button. **Create a mini-plan** to find and replace the text."
- **Execute**: "Execute the replacement."
- **Verify**: "Show me the diff." (然后自己在浏览器确认)

### 练习 5: 添加后端日志 (Backend)
**场景**：在习惯创建成功后，打印一条 Info 日志。
**目标**：修改后端逻辑。
- **Prime**: "Read `backend/app/routers/habits.py` and `reference/testing-and-logging.md`."
- **Plan**: "I want to add a structured log when a habit is created. **Show me the code snippet** you intend to insert first."
- **Execute**: "Insert the code."
- **Verify**: "Running the server, create a habit, and check the terminal output."

### 练习 6: 前端组件拆分 (Refactoring)
**场景**：`HabitList.jsx` 太长了，把单个习惯的渲染拆成 `HabitItem.jsx`。
**目标**：重构而不改变功能。
- **Prime**: "Read `frontend/src/features/habits/components/HabitList.jsx`."
- **Plan**: "Create a refactoring plan to extract the list item into a new component named `HabitItem.jsx`. **Save plan to .agents/plans/refactor-list.md**."
- **Execute**: "Execute the refactoring plan."
- **Verify**: "Run `npm run dev` and ensure the list still looks exactly the same."

---

## 🔴 Level 3: 全栈开发 (Full Stack)

### 练习 7: 给习惯添加"描述"字段 (Full Stack CRUD)
**场景**：用户创建习惯时可以输入描述。
**目标**：数据库 -> API -> 前端表单 -> 前端展示。
- **Prime**: "Read `.claude/PRD.md`, `reference/fastapi-best-practices.md`, `reference/react-frontend-best-practices.md`."
- **Plan**: "Create a comprehensive plan at `.agents/plans/add-description.md` covering DB migration, Pydantic models, and React forms."
- **Execute**: "Execute Step 1: Backend changes." -> "Execute Step 2: Frontend changes."
- **Verify**: "Create a habit with a description and ensure it displays correctly."

### 练习 8: 软删除功能 (Soft Delete)
**场景**：删除习惯时，不要真删，而是标记为 `archived`。
**目标**：修改业务逻辑。
- **Prime**: "Read `backend/app/models.py` and `backend/app/routers/habits.py`."
- **Plan**: "Plan to add an `is_archived` column and update the DELETE endpoint to perform a soft delete instead."
- **Execute**: "Execute the plan."
- **Verify**: "Delete a habit, then query the database directly to confirm it's still there but marked archived."

### 练习 9: 每日格言 (External API)
**场景**：在首页顶部显示一条随机格言。
**目标**：集成第三方 API（或模拟）。
- **Prime**: "I want to show a 'Quote of the Day' on the dashboard."
- **Plan**: "Draft a plan to create a `QuoteService` in frontend that fetches from a public API."
- **Execute**: "Implement the service and component."
- **Verify**: "Refresh page and see a new quote."

---

## ⚫️ Level 4: 终极挑战 (System)

### 练习 10: 毕业设计 - 数据导出 (Export Data)
**场景**：用户想把所有打卡记录导出为 CSV。
**目标**：完整的端到端功能，包含新路由、数据处理、文件下载。
- **Step 1 (Prime)**: 读取所有相关 Reference 和 PRD。
- **Step 2 (Plan)**: 创建 `.agents/plans/export-feature.md`。必须包含：
    - 后端：`pandas` 或 `csv` 模块生成数据。
    - 后端：新的 GET `/api/export` 端点，返回 StreamingResponse。
    - 前端：添加"导出"按钮，处理文件下载流。
- **Step 3 (Execute)**: 分步执行。
- **Step 4 (Verify)**: 下载文件并用 Excel 打开验证。

---

**完成这 10 个练习后，你将成为 Top 1% 的 Agentic Engineer。加油！**
