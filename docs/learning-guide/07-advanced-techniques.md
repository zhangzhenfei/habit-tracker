# 进阶技巧 (Advanced Techniques)

当你熟练掌握基础流程后，可以尝试以下高级玩法。

## 1. 自定义 Skills (Custom Skills)

你可以编写特定的脚本让 AI 调用。

**示例：自动生成数据库迁移**

**Step 1: 创建脚本 `scripts/generate_migration.sh`**
```bash
#!/bin/bash
# Usage: ./scripts/generate_migration.sh "message"
alembic revision --autogenerate -m "$1"
```

**Step 2: 创建 Command `.claude/commands/db/migrate.md`**
```markdown
# Command: Database Migration

## When to use
Use this when you have modified `models.py` and need to update the database schema.

## Steps
1. Run `scripts/generate_migration.sh "<summary of changes>"`
2. Run `alembic upgrade head`
3. Verify the schema changes using `sqlite3`
```

**Step 3: 使用它**
> "I added a new column. Please run the db migration command."

## 2. 动态 PRD 维护

PRD 不应该是一成不变的死文档。
- **技巧**：在 `.claude/PRD.md` 中添加一个 "Changelog" 或 "Pending Features" 章节。
- **工作流**：每当你有一个新想法，先让 AI 把想法记录到 PRD 的 "Pending" 区，而不是立即去写代码。这样可以防止功能蔓延 (Feature Creep)。

## 3. 多 Agent 模拟

你可以让 Claude 在同一个对话中扮演不同角色（虽然它本质上是同一个模型）。

**Prompt 示例**：
> "现在请你扮演**QA 工程师**。阅读刚才生成的代码，不要考虑实现难度，专门寻找安全漏洞和边缘情况。请列出潜在风险。"

> "现在切换回**开发工程师**。请针对 QA 提出的风险制定修复计划。"

## 4. 知识库蒸馏 (Knowledge Distillation)

定期（比如每周）做一次"知识蒸馏"。
1. 浏览过去一周的对话记录（如果有保存）。
2. 总结：AI 在哪里犯错了？哪些指令特别有效？
3. 更新 `.claude/reference/` 和 `.claude/commands/`。
4. **效果**：你的项目会随着时间推移，变得越来越"懂你"。

## 5. 跨项目复用

一旦你建立了一套完美的 `.claude/` 目录结构（包含完美的 Prompt 和规范），你可以把它做成一个模板（Git Template）。
- 下次开新项目时，直接 clone 这个模板，你立刻就拥有了一个训练有素的 AI 团队。

---

**Agentic Engineering 是一门通过"管理"而非"操作"来构建软件的艺术。祝你进化愉快！**
