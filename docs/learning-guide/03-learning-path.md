# 实战学习路线 (Learning Path)

这条路线图旨在帮助你从零开始，在 4 周内精通 Claude Code 和 Agentic Engineering。

## 第一周：基础适应期 (The Basics)

**目标**：习惯使用命令行交互，理解项目基本结构。

- **Day 1: 环境搭建与探索**
    - [ ] 安装 Claude Code 和必要的依赖 (Node.js, Python)。
    - [ ] 克隆本项目，运行 `ls` 和 `cat` 命令查看文件。
    - [ ] 成功运行 `npm run dev` 和后端服务器。
    - **💻 指令参考**:
      > "List all files in the backend directory."
      > "Read README.md and tell me how to start the server."

- **Day 2: 简单修改 (Read-only -> Small Edit)**
    - [ ] 任务：修改前端首页的一个标题文字。
    - [ ] 流程：让 AI 找到文件 -> 确认内容 -> 使用 `replace` 修改。
    - **💻 指令参考**:
      > "Find the file that contains the text 'Habit Tracker'. Then replace it with 'My Awesome Habits'."

- **Day 3: 理解 PIV 循环 (Prime)**
    - [ ] 学习使用 `read_file` 主动加载 `CLAUDE.md` 和 `PRD.md`。
    - [ ] 尝试询问 AI 关于产品功能的问题，看它是否能基于 PRD 回答。
    - **💻 指令参考**:
      > "Read .claude/PRD.md. According to the product requirements, what is the logic for calculating streaks?"

## 第二周：文档驱动开发 (PRD-Driven)

**目标**：学会"不写代码，只写文档"。

- **Day 1: 编写需求**
    - [ ] 任务：构思一个小功能（例如：给习惯添加"图标"字段）。
    - [ ] 动作：不直接让 AI 改代码，而是先让它帮你草拟 PRD 的变更。
    - **💻 指令参考**:
      > "Read .claude/PRD.md. I want to add an 'icon' field to the Habit model. Please draft an update for the PRD, showing the schema changes."

- **Day 2: 制定计划 (Plan)**
    - [ ] 任务：为上面的功能生成实施计划。
    - [ ] 动作：生成 `.agents/plans/add-icon-field.md`。
    - [ ] 重点：**人工审查**计划，找出漏洞（比如：数据库迁移怎么做？）。
    - **💻 指令参考**:
      > "Based on the updated PRD, create a detailed implementation plan at .agents/plans/add-icon-field.md."

- **Day 3: 执行与验证 (Execute & Verify)**
    - [ ] 任务：执行计划。
    - [ ] 动作：看着 AI 修改后端模型、API 和前端组件。
    - [ ] 验证：运行测试，确保没把系统搞崩。
    - **💻 指令参考**:
      > "Execute the plan in .agents/plans/add-icon-field.md. Start with step 1."

## 第三周：掌握命令系统 (Command Mastery)

**目标**：使用和创建自定义命令。

- **Day 1: 使用内置命令**
    - [ ] 任务：模拟一个 Bug。
    - [ ] 动作：使用 `.claude/commands/github_bug_fix/rca.md` 流程来分析问题。
    - **💻 指令参考**:
      > "I found a bug: the streak count is wrong. Please run the RCA process defined in .claude/commands/github_bug_fix/rca.md."

- **Day 2: 创建自定义命令**
    - [ ] 任务：创建一个"代码风格检查"命令。
    - [ ] 动作：编写 `.claude/commands/maintenance/check-style.md`，定义检查 Python 和 JS 代码规范的步骤。
    - **💻 指令参考**:
      > "Create a new command file at .claude/commands/maintenance/check-style.md. It should run 'ruff check .' for backend and 'npm run lint' for frontend."

- **Day 3: 优化 Reference**
    - [ ] 任务：发现 AI 的一个坏习惯（比如不写注释）。
    - [ ] 动作：更新 `.claude/reference/` 下的文档，立下新规矩，并验证 AI 是否遵守。
    - **💻 指令参考**:
      > "Update reference/fastapi-best-practices.md to require that all new endpoints must have a docstring describing their return values."

## 第四周：高级系统优化 (System Architect)

**目标**：管理复杂性，处理大型重构。

- **Day 1: 上下文管理**
    - [ ] 练习在 Plan 阶段结束后，**重置会话**，在干净的上下文中进行 Execute。
    - **💻 指令参考**:
      > (Old Chat) "Plan created." -> `/clear` -> (New Chat) "Read the plan file..."

- **Day 2: 编写测试驱动 (TDD)**
    - [ ] 尝试让 AI 先写测试代码（红），再写实现代码（绿）。
    - **💻 指令参考**:
      > "Read `reference/testing-and-logging.md`. I want to add a new utility function. **Do not implement it yet.** First, create a file `tests/test_new_util.py` with failing test cases."

- **Day 3: 毕业设计**
    - [ ] 独立完成一个中等复杂度的功能（例如：数据导出为 CSV 功能）。
    - [ ] 要求：完整的 PRD 更新 -> 计划书 -> 跨文件修改 -> 完整测试 -> 文档更新。
    - **💻 指令参考 (Step 1)**:
      > "Read `.claude/PRD.md`. I want to add CSV Export. **Only propose changes to the PRD file** for now."
    - **💻 指令参考 (Step 2)**:
      > "PRD updated. Now **create a comprehensive implementation plan** at `.agents/plans/csv-export.md` covering backend and frontend."

---

## 进度追踪

你可以把这个文件复制一份，每完成一项就在 `[ ]` 里打个 `x`。
