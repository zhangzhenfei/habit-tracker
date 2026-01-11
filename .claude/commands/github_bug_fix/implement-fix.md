---
description: 根据 RCA 文档实现 GitHub issue 修复
argument-hint: [github-issue-id]
---

# 实现修复: GitHub Issue #$ARGUMENTS

## 前提条件

- 本地 Git 仓库有 GitHub origin
- RCA 文档存在于 `docs/rca/issue-$ARGUMENTS.md`

## 参考 RCA 文档

读取：`docs/rca/issue-$ARGUMENTS.md`

## 实现指令

### 1. 阅读理解 RCA

- 完整阅读 RCA 文档
- 理解根因和修复策略
- 记录要修改的文件
- 了解测试要求

### 2. 验证当前状态

- 确认问题仍存在
- 检查受影响文件的当前状态

### 3. 实现修复

按 RCA 的"修复方案"章节：

**对每个要修改的文件**：
- 读取现有文件，理解实现
- 按 RCA 描述实现修改
- 保持代码风格一致
- 必要时添加注释

### 4. 添加/更新测试

按 RCA 的"测试要求"：
1. 验证修复解决了问题
2. 测试相关边界情况
3. 确保无回归

```python
def test_issue_$ARGUMENTS_fix():
    """测试 issue #$ARGUMENTS 已修复"""
    # Arrange - 设置导致 bug 的场景
    # Act - 执行之前失败的代码
    # Assert - 验证现在正常工作
```

### 5. 运行验证

执行 RCA 中的验证命令。失败则修复后重试。

### 6. 验证修复

- 按 RCA 复现步骤验证问题已解决
- 测试边界情况
- 检查无副作用

## 输出报告

### 修复摘要
- **Issue**: #$ARGUMENTS
- **根因**: [一句话总结]

### 修改的文件
1. **[文件路径]** - 改动：[内容]

### 添加的测试
- ✅ 修复验证测试
- ✅ 边界情况测试
- ✅ 回归防护测试

### 验证结果
```bash
# 测试输出
```

### 准备提交

```bash
/commit
```

**建议提交消息**：
```
fix(scope): 解决 GitHub issue #$ARGUMENTS

Fixes #$ARGUMENTS
```

**注意**：提交消息中的 `Fixes #$ARGUMENTS` 会在合并时自动关闭 issue。
