运行 Habit Tracker 项目的全面验证。

按顺序执行以下命令并报告结果：

## 1. 后端 Lint

```bash
cd backend && uv run ruff check .
```

**预期**：无输出（通过）

## 2. 后端测试

```bash
cd backend && uv run pytest -v
```

**预期**：所有测试通过，执行时间 < 5 秒

## 3. 后端测试覆盖率

```bash
cd backend && uv run pytest --cov=app --cov-report=term-missing
```

**预期**：覆盖率 >= 80%

## 4. 前端构建

```bash
cd frontend && npm run build
```

**预期**：构建成功，输出到 `dist/`

## 5. 本地服务验证（可选）

```bash
cd backend && uv run uvicorn app.main:app --port 8000 &
sleep 2
curl -s http://localhost:8000/api/habits | head -c 200
curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://localhost:8000/docs
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
```

**预期**：habits 端点返回 JSON，docs 返回 HTTP 200

## 6. 总结报告

验证完成后提供：
- Lint 状态
- 测试通过/失败
- 覆盖率百分比
- 前端构建状态
- 错误或警告
- 整体健康评估（通过/失败）
