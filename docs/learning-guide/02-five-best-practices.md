# 五大核心最佳实践 (The 5 Core Principles)

在 Agentic Engineering (代理工程) 中，我们不再把 AI 当作简单的"代码补全工具"，而是把它视为一个"不知疲倦但需要明确指令的初级工程师"。

为了高效管理这个"工程师"，你需要遵循以下五大原则：

## 1. PRD 优先开发 (PRD-First Development)

> **原则**：在写任何一行代码之前，必须先更新文档。

**为什么？**
AI 的记忆是短暂的，但文档是永恒的。如果你只在聊天中告诉 AI "把按钮改成红色"，下一次对话它就忘了。但如果你把"按钮必须是红色"写进 `PRD.md`，它永远都会遵守。

**如何做？**
- **新项目 (Greenfield)**：先写完整的 PRD，把功能分阶段拆解。
- **既有项目 (Brownfield)**：在开发新功能前，**先为现有代码补充文档**。如果 AI 不理解现有代码，它就会开始瞎猜（Assumptions），导致上下文漂移。
- **一键完成需求到计划**：使用 `/core_piv_loop:plan-feature` 命令，AI 会自动：
    1. 与你交互澄清需求
    2. 更新 PRD 文档
    3. 生成详细的实施计划

### 👀 场景演示 (Try it out)

**场景1：添加新功能**

**❌ 弱指令**：
```
我想添加一个登录功能
```
(AI 可能直接开始写代码，跳过需求文档)

**✅ 强指令**：
```
/core_piv_loop:plan-feature 添加用户登录功能
```
AI 会自动完成：
1. 询问你登录的具体需求（邮箱/密码？记住登录？）
2. 起草用户故事并等待你确认
3. 更新 `.claude/PRD.md`
4. 分析代码库，生成详细实施计划到 `.agents/plans/`

**场景2：小改动也要更新文档**

**任务**：把主题色从绿色改成蓝色。

**正确做法**：
```
Read .claude/PRD.md
请先更新 PRD 的设计部分，把主题色改成蓝色，然后再修改代码
```

---

## 2. 模块化规则架构 (Modular Rule Architecture)

> **原则**：不要把所有规则都塞给 AI，按需加载。

**为什么？**
AI 的上下文窗口（Context Window）是有限且昂贵的。如果你每次都把几万字的整个项目文档扔给它，它会"消化不良"，抓不住重点。


**如何做？**
- 将规则拆分为小文件存放在 `.claude/reference/`。
- 做前端任务时，只加载 `react-frontend-best-practices.md`。
- 做数据库任务时，只加载 `sqlite-best-practices.md`。
- **让上下文保持轻量和聚焦。**

### 👀 场景演示 (Try it out)
**任务**：你需要修改数据库表结构。

**指令**：
```
Read .claude/reference/sqlite-best-practices.md
我需要给 users 表添加 created_at 字段，请按规范写 SQL
```
*(AI 会根据参考文档，自动加上 `DEFAULT CURRENT_TIMESTAMP`)*

---

## 3. Skills 化一切 (Skill-ify Everything)

> **原则**：把重复的复杂流程固化为 Skills（斜杠命令）。

**为什么？**
"修复一个 Bug"通常涉及：查日志 -> 复现 -> 定位 -> 修复 -> 测试。每次都手把手教 AI 做这5步很累。

**如何做？**
- 在 `.claude/commands/` 下创建 Markdown 文件定义流程
- 使用 `/skill-name` 语法直接调用
- 本项目已内置多个 Skills

### 👀 场景演示 (Try it out)
**任务**：你要提交代码。

**指令**：
```
/commit
```
AI 会自动：git status → git diff → 生成规范的 commit message → 提交

**更多内置 Skills**：
```bash
/validation:validate      # 运行完整验证
/core_piv_loop:prime      # 加载项目上下文
/github_bug_fix:rca 123   # 分析 Bug 根因
```

---

## 4. 上下文重置 (Context Resetting)

> **原则**：频繁重置对话，保持"大脑"清醒。

**为什么？**
随着对话变长，AI 会积累大量"垃圾记忆"（比如你尝试过的错误代码）。这会导致它越来越笨，甚至产生幻觉。

**如何做？**
- 采用 **Plan -> Reset -> Execute** 模式。
- **阶段 1 (Plan)**：在一个对话中讨论并生成计划书 (`.agents/plans/xxx.md`)。
- **阶段 2 (Reset)**：**开启一个新的对话**。
- **阶段 3 (Execute)**：在新对话中让 AI 读取计划书并执行。
- **关键点**：**计划书 (Plan Doc)** 是连接两个上下文的唯一桥梁。因为对话内存被清空了，AI 只能依靠这个文件知道该干什么。所以计划书必须写得足够详细。

### 👀 场景演示 (Try it out)
**场景**：你刚和 AI 讨论完一个复杂功能的计划，对话已经进行了 30 轮。

**动作**：
```bash
# 会话 1: 规划
/core_piv_loop:plan-feature 复杂功能
# 计划创建后

# 使用 /clear 清理上下文

# 会话 2: 执行（干净的上下文）
/core_piv_loop:execute .agents/plans/xxx.md
```

---

## 5. 系统演进思维 (System Evolution Mindset)

> **原则**：每个 Bug 都是改进系统的机会。

**为什么？**
如果你发现 AI 总是写出引入 SQL 注入的代码，不要只是帮它改代码。

**如何做？**
- **❌ 错误做法**：默默修好 Bug。
- **✅ 正确做法**：
    1. 修好 Bug。
    2. **更新系统提示词或参考文档**（例如在 `fastapi-best-practices.md` 中加入"必须使用参数化查询"的强规则）。
    3. 这样，AI 以后**永远**不会再犯同样的错误。

---

掌握这五点，你就从"使用 AI"进化到了"管理 AI"。
