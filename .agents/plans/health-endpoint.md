# 健康检查端点增强计划

## 概述

当前 `backend/app/main.py:72-75` 已有一个基础的健康检查端点，仅返回 `{"status": "healthy"}`。本计划旨在增强该端点，添加更全面的健康检查功能。

## 目标

- 提供数据库连接状态检查
- 返回应用版本和运行时信息
- 遵循 FastAPI 最佳实践
- 编写完整的测试覆盖

---

## 实施步骤

### 步骤 1: 创建健康检查 Schema

**文件**: `backend/app/schemas.py`

添加 Pydantic 响应模型：
- `HealthResponse`: 包含 status、version、database 状态等字段

### 步骤 2: 创建健康检查路由器

**文件**: `backend/app/routers/health.py` (新建)

- 创建 `APIRouter` 实例
- 实现 `/health` 端点（基础健康检查）
- 实现 `/health/ready` 端点（就绪检查，包含数据库连接验证）
- 使用 `structlog` 记录健康检查日志

### 步骤 3: 更新主应用

**文件**: `backend/app/main.py`

- 移除现有的 `/health` 端点（第72-75行）
- 导入并注册新的 health router
- 健康检查路由不需要 `/api` 前缀（保持在根路径）

### 步骤 4: 编写集成测试

**文件**: `backend/tests/test_api_health.py` (新建)

测试用例：
1. `test_health_check_returns_200` - 基础健康检查返回 200
2. `test_health_check_response_format` - 验证响应格式正确
3. `test_health_ready_with_database` - 就绪检查包含数据库状态
4. `test_health_ready_database_failure` - 模拟数据库故障时的响应

### 步骤 5: 运行测试验证

```bash
cd backend
uv run pytest tests/test_api_health.py -v
uv run pytest tests/ -v  # 运行全部测试确保无回归
```

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `backend/app/schemas.py` | 修改 | 添加 HealthResponse 模型 |
| `backend/app/routers/health.py` | 新建 | 健康检查路由器 |
| `backend/app/routers/__init__.py` | 修改 | 导出 health 模块 |
| `backend/app/main.py` | 修改 | 移除旧端点，注册新路由器 |
| `backend/tests/test_api_health.py` | 新建 | 集成测试 |

---

## API 设计

### GET /health

基础健康检查，始终返回 200（除非服务崩溃）

**响应**:
```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

### GET /health/ready

就绪检查，验证所有依赖项（如数据库）是否可用

**成功响应** (200):
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected"
}
```

**失败响应** (503):
```json
{
  "status": "unhealthy",
  "version": "0.1.0",
  "database": "disconnected"
}
```

---

## 注意事项

1. 健康检查端点不应放在 `/api` 前缀下，以便负载均衡器和 Kubernetes 探针直接访问
2. 基础 `/health` 端点应该非常快速，不做数据库查询
3. `/health/ready` 用于更详细的就绪检查
4. 使用 `structlog` 记录健康检查失败情况，但不记录成功情况（避免日志过多）
