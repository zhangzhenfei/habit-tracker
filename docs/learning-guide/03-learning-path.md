# 实战学习路线 (Learning Path)

这条路线图旨在帮助你从零开始，在 4 周内精通 Claude Code 和 Agentic Engineering。

## 第一周：基础适应期 (The Basics)

**目标**：习惯使用命令行交互，理解项目基本结构。

- **Day 1: 环境搭建与探索**
    - [ ] 安装 Claude Code 和必要的依赖 (Node.js, Python)
    - [ ] 克隆本项目
    - [ ] 使用 `/init-project` 初始化项目
    - **💻 指令**:
      ```
      /init-project
      ```

- **Day 2: 简单修改**
    - [ ] 任务：修改前端首页的一个标题文字
    - [ ] 流程：让 AI 找到文件 -> 确认内容 -> 修改
    - **💻 指令**:
      ```
      找到包含 'Habit Tracker' 的文件，把它改成 'My Awesome Habits'
      ```

- **Day 3: 理解项目上下文 (Prime)**
    - [ ] 使用 `/core_piv_loop:prime` 加载项目上下文
    - [ ] 询问 AI 关于产品功能的问题
    - **💻 指令**:
      ```
      /core_piv_loop:prime
      ```
      然后问：
      ```
      根据 PRD，连击 (streak) 的计算逻辑是什么？
      ```

## 第二周：文档驱动开发 (PRD-Driven)

**目标**：学会"不写代码，只写文档"，掌握 PIV 循环。

- **Day 1-2: 需求到计划（一键完成）**
    - [ ] 任务：构思一个小功能（例如：给习惯添加"图标"字段）
    - [ ] 动作：使用 `/core_piv_loop:plan-feature` 一键完成需求澄清、PRD更新、计划生成
    - [ ] 重点：**人工审查**计划，找出漏洞
    - **💻 指令**:
      ```
      /core_piv_loop:plan-feature 给习惯添加图标字段
      ```
    - AI 会自动：
      1. 与你交互澄清需求细节
      2. 更新 `.claude/PRD.md`
      3. 生成详细实施计划到 `.agents/plans/`

- **Day 3: 执行与验证 (Execute & Verify)**
    - [ ] 任务：执行计划并验证
    - **💻 指令**:
      ```
      /core_piv_loop:execute .agents/plans/add-icon-field.md
      /validation:validate
      /commit
      ```

## 第三周：掌握 Skills 系统 (Skills Mastery)

**目标**：熟练使用内置 Skills，学会创建自定义 Skills。

- **Day 1: 使用 Bug 修复 Skills**
    - [ ] 任务：模拟一个 Bug 并使用 RCA 流程
    - **💻 指令**:
      ```
      /github_bug_fix:rca 123
      ```
      审查 RCA 文档后：
      ```
      /github_bug_fix:implement-fix 123
      ```

- **Day 2: 创建自定义 Skill**
    - [ ] 任务：创建一个"代码风格检查"命令
    - [ ] 动作：在 `.claude/commands/maintenance/` 下创建新文件
    - **💻 指令**:
      ```
      帮我创建一个新的 skill 文件 .claude/commands/maintenance/check-style.md
      它应该运行 ruff check 和 npm run lint
      ```

- **Day 3: 优化 Reference 文档**
    - [ ] 任务：发现 AI 的一个坏习惯并修正
    - [ ] 动作：更新 Reference 文档，立下新规矩
    - **💻 指令**:
      ```
      更新 .claude/reference/fastapi-best-practices.md
      添加规则：所有新端点必须有 docstring 描述返回值
      ```

## 第四周：高级系统优化 (System Architect)

**目标**：管理复杂性，处理大型重构。

- **Day 1: 上下文管理**
    - [ ] 练习在 Plan 阶段结束后，**重置会话**，在干净的上下文中执行
    - **💻 流程**:
      ```
      # 会话 1: 规划
      /core_piv_loop:plan-feature 复杂功能
      # 计划创建后，使用 /clear 或开新会话

      # 会话 2: 执行
      /core_piv_loop:execute .agents/plans/xxx.md
      ```

- **Day 2: 测试驱动开发 (TDD)**
    - [ ] 让 AI 先写测试（红），再写实现（绿）
    - **💻 指令**:
      ```
      Read .claude/reference/testing-and-logging.md
      我要添加一个新的工具函数，请先写失败的测试用例，不要实现
      ```

- **Day 3: 毕业设计**
    - [ ] 独立完成一个中等复杂度的功能（如：数据导出 CSV）
    - [ ] 要求：完整 PIV 循环 + 测试 + 文档
    - **💻 完整流程**:
      ```
      /core_piv_loop:prime
      /core_piv_loop:plan-feature 数据导出为 CSV 功能
      # 审查计划
      /core_piv_loop:execute .agents/plans/csv-export.md
      /validation:validate
      /commit
      ```

---

## 进度追踪

你可以把这个文件复制一份，每完成一项就在 `[ ]` 里打个 `x`。
