# FastAPI 最佳实践

## 目录

1. [项目结构](#1-项目结构)
2. [路由与端点](#2-路由与端点)
3. [Pydantic 模型与验证](#3-pydantic-模型与验证)
4. [依赖注入](#4-依赖注入)
5. [错误处理](#5-错误处理)
6. [数据库集成](#6-数据库集成)
7. [性能与异步](#7-性能与异步)
8. [测试](#8-测试)
9. [安全](#9-安全)
10. [配置](#10-配置)
11. [反模式](#11-反模式)

---

## 1. 项目结构

### 小型项目（按文件类型）

```
app/
├── main.py           # FastAPI 应用入口
├── routers/          # API 路由
├── models.py         # SQLAlchemy 模型
├── schemas.py        # Pydantic 模式
├── database.py       # 数据库配置
├── dependencies.py   # 共享依赖
└── config.py         # 设置
```

### 大型项目（按领域划分）

```
src/
├── habits/
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   ├── service.py
│   └── dependencies.py
├── completions/
│   └── (同上)
├── shared/
│   ├── config.py
│   └── database.py
└── main.py
```

### 核心原则

- **关注点分离**：路由、模型、模式、服务分开
- **一个领域一个路由**：相关端点放一起
- **显式导入**：跨包导入用完整路径

---

## 2. 路由与端点

### 使用 APIRouter

```python
from fastapi import APIRouter, status

router = APIRouter(
    prefix="/habits",
    tags=["habits"],
)

@router.get("/", response_model=list[HabitResponse])
async def list_habits():
    pass

@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(habit: HabitCreate):
    pass
```

### 注册到主应用

```python
app = FastAPI()
app.include_router(habits.router, prefix="/api")
```

### 路径参数 vs 查询参数

```python
@router.get("/habits/{habit_id}")
async def get_habit(
    habit_id: Annotated[int, Path(ge=1)],  # 路径参数：资源标识
    include_stats: bool = False,            # 查询参数：过滤选项
):
    pass
```

**原则**：
- 路径参数用于资源标识：`/habits/{id}`
- 查询参数用于过滤、排序、分页：`/habits?status=active`

### 响应模型与状态码

```python
@router.post("/", response_model=HabitResponse, status_code=201)
async def create_habit(habit: HabitCreate):
    return created_habit

@router.delete("/{habit_id}", status_code=204)
async def delete_habit(habit_id: int):
    return None  # 204 无响应体
```

---

## 3. Pydantic 模型与验证

### 请求/响应模式模式

```python
from pydantic import BaseModel, Field, ConfigDict

# 共享属性
class HabitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

# 创建模式 - 客户端发送
class HabitCreate(HabitBase):
    color: str = Field(default="#10B981", pattern=r"^#[0-9A-Fa-f]{6}$")

# 更新模式 - 所有字段可选
class HabitUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None

# 响应模式 - 包含数据库字段
class HabitResponse(HabitBase):
    id: int
    created_at: datetime
    current_streak: int

    model_config = ConfigDict(from_attributes=True)
```

### 字段验证

```python
from pydantic import field_validator, model_validator

class HabitCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("名称不能为空")
        return v.strip()

    @model_validator(mode="after")
    def check_consistency(self):
        # 跨字段验证
        return self
```

---

## 4. 依赖注入

### 基础依赖

```python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/habits")
def list_habits(db: Session = Depends(get_db)):
    return db.query(Habit).all()
```

### 验证依赖

```python
async def valid_habit_id(habit_id: int, db: Session = Depends(get_db)) -> Habit:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")
    return habit

@router.get("/habits/{habit_id}")
async def get_habit(habit: Habit = Depends(valid_habit_id)):
    return habit  # 已验证并获取
```

### 类依赖

```python
class Pagination:
    def __init__(self, skip: int = 0, limit: int = Query(default=100, le=100)):
        self.skip = skip
        self.limit = limit

@router.get("/habits")
async def list_habits(pagination: Pagination = Depends()):
    return habits[pagination.skip : pagination.skip + pagination.limit]
```

**要点**：
- 依赖在请求内默认缓存
- 用 `Depends(dep, use_cache=False)` 禁用缓存
- 依赖可以链式调用

---

## 5. 错误处理

### HTTPException

```python
from fastapi import HTTPException, status

@router.get("/habits/{habit_id}")
async def get_habit(habit_id: int):
    habit = get_habit_by_id(habit_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="习惯不存在",
        )
    return habit
```

### 自定义异常类

```python
class AppException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code

class HabitNotFoundError(AppException):
    def __init__(self, habit_id: int):
        super().__init__(404, f"习惯 {habit_id} 不存在", "HABIT_NOT_FOUND")
```

### 全局异常处理器

```python
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.error_code, "detail": exc.detail},
    )
```

---

## 6. 数据库集成

### SQLAlchemy 设置

```python
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("sqlite:///./habits.db", connect_args={"check_same_thread": False})

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
```

### 模型定义

```python
class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    completions = relationship("Completion", back_populates="habit", cascade="all, delete-orphan")

class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), index=True)
    completed_date = Column(String(10), nullable=False)  # YYYY-MM-DD

    __table_args__ = (UniqueConstraint("habit_id", "completed_date"),)
```

### 预加载

```python
from sqlalchemy.orm import joinedload, selectinload

# 多对一关系
habit = db.query(Habit).options(joinedload(Habit.category)).first()

# 一对多集合
habits = db.query(Habit).options(selectinload(Habit.completions)).all()
```

---

## 7. 性能与异步

### 异步 vs 同步函数

| 工作类型 | 函数定义 | 原因 |
|---------|---------|------|
| 异步 I/O | `async def` | 非阻塞 |
| 同步阻塞 I/O | `def` | 在线程池运行 |
| CPU 密集型 | 外部 worker | 避免阻塞 |

```python
# 好：异步用于 I/O
@router.get("/habits")
async def list_habits(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Habit))
    return result.scalars().all()

# 坏：异步函数中阻塞调用
@router.get("/bad")
async def bad_endpoint():
    time.sleep(5)  # 阻塞整个事件循环！
```

### 后台任务

```python
from fastapi import BackgroundTasks

@router.post("/habits")
async def create_habit(habit: HabitCreate, background_tasks: BackgroundTasks):
    created_habit = create_habit_in_db(habit)
    background_tasks.add_task(send_notification, "user@example.com")
    return created_habit
```

---

## 8. 测试

### 测试设置

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool

@pytest.fixture(name="client")
def client_fixture(session):
    def get_session_override():
        return session

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
```

### 编写测试

```python
def test_create_habit(client):
    response = client.post("/api/habits", json={"name": "运动"})
    assert response.status_code == 201
    assert response.json()["name"] == "运动"

def test_get_habit_not_found(client):
    response = client.get("/api/habits/999")
    assert response.status_code == 404
```

---

## 9. 安全

### CORS 配置

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 指定来源，不用 "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### SQL 注入防护

```python
# 好：使用 ORM
habit = db.query(Habit).filter(Habit.id == habit_id).first()

# 好：参数化查询
result = db.execute(text("SELECT * FROM habits WHERE id = :id"), {"id": habit_id})

# 坏：字符串格式化（有漏洞！）
db.execute(f"SELECT * FROM habits WHERE id = {habit_id}")  # 绝不要这样做
```

---

## 10. 配置

### 使用 Pydantic Settings

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Habit Tracker"
    database_url: str = "sqlite:///./habits.db"
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

---

## 11. 反模式

### 关键反模式

| 反模式 | 问题 | 解决方案 |
|-------|------|---------|
| `async def` 中阻塞 I/O | 阻塞事件循环 | 用异步库或普通 `def` |
| 端点间调用 | 紧耦合 | 用服务层 |
| 全局可变状态 | 竞态条件 | 用 Redis/数据库 |
| 返回 ORM 对象 | 暴露内部 | 用响应模式 |
| 字符串格式化 SQL | SQL 注入 | 用 ORM 或参数化查询 |

### 常见错误

```python
# 坏：异步中阻塞
async def bad():
    time.sleep(5)  # 阻塞事件循环

# 坏：不关闭连接
def bad_db():
    return SessionLocal()  # 永不关闭！

# 坏：请求间共享会话
db = SessionLocal()  # 全局会话 - 竞态条件！
```

---

## 生命周期事件

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动
    print("启动中...")
    yield
    # 关闭
    print("关闭中...")

app = FastAPI(lifespan=lifespan)
```

---

## 快速参考

### HTTP 状态码

| 码 | 常量 | 用途 |
|---|------|-----|
| 200 | `HTTP_200_OK` | GET/PUT 成功 |
| 201 | `HTTP_201_CREATED` | POST 成功 |
| 204 | `HTTP_204_NO_CONTENT` | DELETE 成功 |
| 404 | `HTTP_404_NOT_FOUND` | 资源不存在 |
| 422 | `HTTP_422_UNPROCESSABLE_ENTITY` | 验证错误 |

### 常用导入

```python
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ConfigDict
from sqlalchemy.orm import Session
```

---

## 资源

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/en/20/)
