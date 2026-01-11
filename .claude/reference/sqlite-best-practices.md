# SQLite 最佳实践

## 目录

1. [何时使用 SQLite](#1-何时使用-sqlite)
2. [模式设计](#2-模式设计)
3. [数据类型](#3-数据类型)
4. [索引](#4-索引)
5. [查询优化](#5-查询优化)
6. [SQLAlchemy 模式](#6-sqlalchemy-模式)
7. [数据完整性](#7-数据完整性)
8. [事务](#8-事务)
9. [Python 集成](#9-python-集成)
10. [性能调优](#10-性能调优)
11. [备份与恢复](#11-备份与恢复)
12. [反模式](#12-反模式)

---

## 1. 何时使用 SQLite

### 适用场景

- 嵌入式/IoT 设备、桌面应用、本地工具
- 应用文件格式（单文件数据库）
- 中低流量网站（<10万请求/天）
- 开发和测试环境
- 单用户应用

### 不适用场景

- 高写入并发（SQLite 一次只允许一个写入者）
- 网络文件系统（NFS、SMB 可能导致损坏）
- 多服务器部署
- 超大数据集（>1TB）

### 关键特性

| 特性 | 值 |
|-----|---|
| 库大小 | <600KB |
| 最大数据库 | 281 TB |
| 并发读取 | 无限制 |
| 并发写入 | 1 |
| ACID 兼容 | 是 |

---

## 2. 模式设计

### 主键

```sql
-- 推荐：INTEGER PRIMARY KEY（自动递增）
CREATE TABLE habits (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- 复合主键
CREATE TABLE completions (
    habit_id INTEGER NOT NULL,
    completed_date TEXT NOT NULL,
    PRIMARY KEY (habit_id, completed_date)
);
```

### 外键

```sql
-- 外键默认禁用，必须每次连接启用
PRAGMA foreign_keys = ON;

CREATE TABLE completions (
    id INTEGER PRIMARY KEY,
    habit_id INTEGER NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);
```

**级联操作**：

| 操作 | 行为 |
|-----|-----|
| `CASCADE` | 删除/更新子行 |
| `SET NULL` | 设为 NULL |
| `RESTRICT` | 有子行时拒绝 |

### 表约束

```sql
CREATE TABLE habits (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#10B981',
    CHECK (length(name) > 0)
);

CREATE TABLE completions (
    id INTEGER PRIMARY KEY,
    habit_id INTEGER NOT NULL,
    completed_date TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    UNIQUE (habit_id, completed_date),
    CHECK (status IN ('completed', 'skipped'))
);
```

---

## 3. 数据类型

### SQLite 存储类

| 类 | 描述 |
|---|-----|
| `NULL` | 空值 |
| `INTEGER` | 有符号整数 |
| `REAL` | 8字节浮点 |
| `TEXT` | UTF-8 字符串 |
| `BLOB` | 二进制数据 |

### 日期时间存储

**方案1：TEXT（ISO 8601）- 推荐**

```sql
CREATE TABLE completions (
    completed_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
    created_at TEXT DEFAULT (datetime('now'))
);

-- 查询
SELECT * FROM completions WHERE completed_date = '2025-01-15';
SELECT * FROM completions WHERE completed_date >= '2025-01-01';
```

**优点**：可读、可排序、支持日期函数

**方案2：INTEGER（Unix 时间戳）**

```sql
CREATE TABLE events (
    timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### 布尔处理

```sql
-- SQLite 无原生布尔，用 INTEGER 0/1
CREATE TABLE habits (
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- TRUE/FALSE 是 1/0 的别名
INSERT INTO habits (name, is_active) VALUES ('运动', TRUE);
```

---

## 4. 索引

### 何时创建索引

- `WHERE` 子句中的列
- `JOIN` 条件中的列
- `ORDER BY` 子句中的列
- 外键列（级联操作必需）

### 索引类型

```sql
-- 单列索引
CREATE INDEX idx_habits_name ON habits(name);

-- 复合索引（列顺序重要！）
CREATE INDEX idx_completions ON completions(habit_id, completed_date);

-- 唯一索引
CREATE UNIQUE INDEX idx_habits_name ON habits(name);

-- 部分索引
CREATE INDEX idx_active ON habits(name) WHERE archived_at IS NULL;
```

### 复合索引列顺序

```sql
CREATE INDEX idx ON completions(habit_id, completed_date);

-- 使用索引
SELECT * FROM completions WHERE habit_id = 1;
SELECT * FROM completions WHERE habit_id = 1 AND completed_date = '2025-01-15';

-- 不高效使用索引
SELECT * FROM completions WHERE completed_date = '2025-01-15';
```

### 索引权衡

| 优点 | 代价 |
|-----|-----|
| 读取更快 | 写入更慢 |
| JOIN 更快 | 更多磁盘空间 |

**经验**：每个二级索引约使 INSERT 慢 5 倍

---

## 5. 查询优化

### EXPLAIN QUERY PLAN

```sql
EXPLAIN QUERY PLAN
SELECT h.name, COUNT(*) FROM habits h
JOIN completions c ON h.id = c.habit_id
GROUP BY h.id;

-- 输出解读：
-- SCAN = 全表扫描（通常不好）
-- SEARCH = 使用索引（好）
-- USING COVERING INDEX = 无需访问表（最好）
```

### 查询技巧

```sql
-- 坏：SELECT *
SELECT * FROM habits;

-- 好：只选需要的列
SELECT id, name FROM habits;

-- 坏：LIKE 前缀通配符
SELECT * FROM habits WHERE name LIKE '%运动%';

-- 好：前缀 LIKE 可用索引
SELECT * FROM habits WHERE name LIKE '运动%';

-- 坏：索引列上用函数
SELECT * FROM habits WHERE lower(name) = 'exercise';

-- 好：创建表达式索引
CREATE INDEX idx_lower ON habits(lower(name));
```

### 高效日期查询

```sql
-- TEXT 日期
SELECT * FROM completions
WHERE completed_date >= '2025-01-01'
  AND completed_date < '2025-02-01';

-- 当月
SELECT * FROM completions
WHERE completed_date >= date('now', 'start of month')
  AND completed_date < date('now', 'start of month', '+1 month');
```

---

## 6. SQLAlchemy 模式

### 引擎设置

```python
from sqlalchemy import create_engine, event

engine = create_engine("sqlite:///habits.db", connect_args={"check_same_thread": False})

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA cache_size=-64000")  # 64MB
    cursor.close()
```

### 模型定义

```python
class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    completions = relationship("Completion", back_populates="habit", cascade="all, delete-orphan")

class Completion(Base):
    __tablename__ = "completions"
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), index=True)
    completed_date = Column(String(10), nullable=False)
    __table_args__ = (UniqueConstraint("habit_id", "completed_date"),)
```

### 关系加载策略

| 策略 | 用途 |
|-----|-----|
| `lazy="select"` | 默认，访问时 N+1 |
| `lazy="joined"` | 多对一关系 |
| `lazy="selectin"` | 一对多集合 |

```python
# 查询时预加载
habits = session.query(Habit).options(selectinload(Habit.completions)).all()
```

### 会话管理

```python
# 上下文管理器（推荐）
def get_habits():
    with Session(engine) as session:
        return session.query(Habit).all()

# FastAPI 依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 7. 数据完整性

### 约束汇总

```sql
CREATE TABLE example (
    id INTEGER PRIMARY KEY,           -- 主键
    name TEXT NOT NULL,               -- 必填
    email TEXT UNIQUE,                -- 唯一
    age INTEGER CHECK (age >= 0),     -- 值验证
    category_id INTEGER REFERENCES categories(id),  -- 外键
    status TEXT DEFAULT 'active'      -- 默认值
);
```

### 启用外键

```python
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

### 软删除

```sql
-- 不删除，设置 archived_at
UPDATE habits SET archived_at = datetime('now') WHERE id = 1;

-- 查询活跃记录
SELECT * FROM habits WHERE archived_at IS NULL;

-- 部分索引
CREATE INDEX idx_active ON habits(name) WHERE archived_at IS NULL;
```

---

## 8. 事务

### 基本事务

```sql
BEGIN TRANSACTION;
INSERT INTO habits (name) VALUES ('运动');
INSERT INTO completions (habit_id, completed_date) VALUES (last_insert_rowid(), '2025-01-15');
COMMIT;

-- 出错时
ROLLBACK;
```

### Python 事务

```python
# 显式事务
with engine.begin() as connection:
    connection.execute(text("INSERT INTO habits ..."))
    # 成功自动提交，异常自动回滚

# SQLAlchemy ORM
with Session(engine) as session, session.begin():
    habit = Habit(name="运动")
    session.add(habit)
    # 自动提交/回滚
```

---

## 9. Python 集成

### 参数化查询（防 SQL 注入）

```python
# 问号占位符
cursor.execute("INSERT INTO habits (name) VALUES (?)", (name,))

# 命名占位符
cursor.execute("INSERT INTO habits (name) VALUES (:name)", {"name": name})

# IN 子句
ids = [1, 2, 3]
placeholders = ",".join("?" * len(ids))
cursor.execute(f"SELECT * FROM habits WHERE id IN ({placeholders})", ids)

# 绝不要字符串格式化！
# 坏：cursor.execute(f"SELECT * FROM habits WHERE name = '{user_input}'")
```

### 行工厂

```python
conn.row_factory = sqlite3.Row
cursor.execute("SELECT * FROM habits")
row = cursor.fetchone()
print(row["name"])  # 按列名访问
print(dict(row))    # 转字典
```

---

## 10. 性能调优

### 必要 PRAGMA 设置

```sql
-- 每次连接运行
PRAGMA journal_mode = WAL;        -- 写前日志（更好并发）
PRAGMA synchronous = NORMAL;      -- WAL 下安全且更快
PRAGMA foreign_keys = ON;         -- 启用外键
PRAGMA cache_size = -64000;       -- 64MB 页缓存
PRAGMA temp_store = MEMORY;       -- 临时表存内存

-- 定期或关闭前运行
PRAGMA optimize;                   -- 优化查询计划统计
```

### WAL 模式

```sql
PRAGMA journal_mode = WAL;
```

**优点**：
- 读不阻塞写
- 写不阻塞读
- 更好的崩溃恢复

**限制**：
- 不支持网络文件系统
- 会创建 `-wal` 和 `-shm` 文件

### 数据库维护

```sql
VACUUM;              -- 碎片整理
ANALYZE;             -- 更新统计信息
REINDEX;             -- 重建索引
PRAGMA integrity_check;  -- 检查完整性
```

---

## 11. 备份与恢复

### 安全备份方法

```python
def backup_database(source_path: str, dest_path: str):
    source = sqlite3.connect(source_path)
    dest = sqlite3.connect(dest_path)
    with dest:
        source.backup(dest)
    dest.close()
    source.close()
```

```sql
-- VACUUM INTO 创建压缩副本
VACUUM INTO '/path/to/backup.db';
```

### 禁止操作

```bash
# 绝不要在活动数据库上用 cp！
cp database.db backup.db  # 坏！不是事务安全的
```

---

## 12. 反模式

### 配置错误

| 错误 | 解决方案 |
|-----|---------|
| 不启用外键 | 每次连接 `PRAGMA foreign_keys=ON` |
| 用默认日志模式 | 启用 WAL |
| SQLite 在网络文件系统 | 只用本地文件系统 |

### 模式错误

| 错误 | 解决方案 |
|-----|---------|
| 存逗号分隔列表 | 用关联表 |
| 不索引外键 | 总是索引 FK 列 |
| 错误日期格式 | 用 ISO 8601：`YYYY-MM-DD` |

### 查询错误

| 错误 | 解决方案 |
|-----|---------|
| `SELECT *` | 只选需要的列 |
| LIKE 查日期 | 用日期比较 |
| 索引列上用函数 | 创建表达式索引 |

### Python 错误

| 错误 | 解决方案 |
|-----|---------|
| 字符串格式化 SQL | 用参数化查询 |
| 不关闭连接 | 用上下文管理器 |
| 每请求创建引擎 | 创建一次，复用 |

---

## 快速参考

### 连接设置模板

```python
from sqlalchemy import create_engine, event

engine = create_engine("sqlite:///habits.db", connect_args={"check_same_thread": False})

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()
```

### SQLite 日期函数

```sql
SELECT date('now');                    -- 2025-01-15
SELECT datetime('now');                -- 2025-01-15 12:30:00
SELECT date('now', '-7 days');         -- 7天前
SELECT date('now', 'start of month');  -- 当月第一天
SELECT strftime('%Y', '2025-01-15');   -- 2025
```

---

## 资源

- [SQLite 文档](https://sqlite.org/docs.html)
- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/en/20/)
