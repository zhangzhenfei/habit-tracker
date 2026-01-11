# 部署最佳实践

## 目录

1. [本地开发](#1-本地开发)
2. [生产构建](#2-生产构建)
3. [后端部署](#3-后端部署)
4. [前端部署](#4-前端部署)
5. [Docker](#5-docker)
6. [反向代理](#6-反向代理)
7. [环境配置](#7-环境配置)
8. [生产数据库](#8-生产数据库)
9. [监控日志](#9-监控日志)
10. [云平台](#10-云平台)
11. [安全](#11-安全)

---

## 1. 本地开发

### 双终端运行

```bash
# 终端1：后端
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 终端2：前端
cd frontend
npm install
npm run dev  # 端口 5173
```

### Vite 代理配置

```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
```

前端可用相对路径：`fetch('/api/habits')`

---

## 2. 生产构建

### 前端构建

```bash
cd frontend
npm run build  # 生成 dist/ 目录
```

### 构建优化

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

---

## 3. 后端部署

### Uvicorn（推荐）

```bash
# 开发
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产（多 worker）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Gunicorn + Uvicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Systemd 服务

```ini
# /etc/systemd/system/habittracker.service
[Unit]
Description=Habit Tracker API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/habit-tracker/backend
ExecStart=/var/www/habit-tracker/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable habittracker
sudo systemctl start habittracker
```

---

## 4. 前端部署

### 方案1：FastAPI 托管静态文件

```python
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

frontend_path = "frontend/dist"

@app.get("/")
async def serve_react_app():
    return FileResponse(f"{frontend_path}/index.html")

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    if not request.url.path.startswith("/api"):
        return FileResponse(f"{frontend_path}/index.html")
    raise exc

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
```

### 方案2：Nginx 托管

```nginx
server {
    listen 80;
    root /var/www/habit-tracker/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

### 方案3：CDN/静态托管

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## 5. Docker

### 后端 Dockerfile

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH
COPY . .
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./data:/app/data"]
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

### 常用命令

```bash
docker-compose up --build      # 构建并运行
docker-compose up -d           # 后台运行
docker-compose logs -f         # 查看日志
docker-compose down            # 停止
```

### 镜像优化

| 技巧 | 效果 |
|-----|-----|
| 用 slim 基础镜像 | 45MB vs 125MB |
| 多阶段构建 | 减小 70%+ |
| 用 .dockerignore | 加快构建 |

---

## 6. 反向代理

### Nginx 配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/habit-tracker/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~* \.(js|css|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 7. 环境配置

### Pydantic Settings

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "sqlite:///./habits.db"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

### 环境文件

```bash
# .env.development
DATABASE_URL=sqlite:///./habits.db
DEBUG=true

# .env.production
DATABASE_URL=sqlite:///./data/habits.db
DEBUG=false
```

---

## 8. 生产数据库

### SQLite 适用场景

- 单服务器部署
- 低写入并发
- 本地/个人应用

### 数据库位置

```python
# 不要存在应用目录
DATABASE_URL = "sqlite:////var/data/habit-tracker/habits.db"
```

### Docker 持久化

```yaml
services:
  backend:
    volumes: ["db-data:/app/data"]
volumes:
  db-data:
```

### 备份

```bash
sqlite3 /data/habits.db "VACUUM INTO '/backups/habits-$(date +%Y%m%d).db'"
```

---

## 9. 监控日志

### 健康检查端点

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "not ready"})
```

### 监控工具

| 工具 | 用途 |
|-----|-----|
| Prometheus | 指标收集 |
| Grafana | 可视化 |
| Sentry | 错误追踪 |

---

## 10. 云平台

### 平台对比

| 平台 | 价格 | SQLite 支持 |
|-----|-----|------------|
| Fly.io | $2+/月 | 是（volumes）|
| Railway | 按用量 | 有限 |
| DigitalOcean | $4+/月 | 是 |

### Fly.io 部署

```bash
fly auth login
fly launch
fly volumes create data --size 1
fly deploy
```

```toml
# fly.toml
app = "habit-tracker"
[http_service]
  internal_port = 8000
[mounts]
  source = "data"
  destination = "/data"
```

---

## 11. 安全

### CORS 配置

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # 不用 "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)
```

### 安全头（Nginx）

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000";
```

### Docker 安全

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 环境安全

```bash
echo ".env" >> .gitignore
chmod 600 .env
```

---

## 部署场景

### 场景1：本地使用

```bash
cd backend && uvicorn app.main:app --port 8000
# 访问 http://localhost:8000
```

### 场景2：VPS 自托管

```
Nginx (SSL) → FastAPI (systemd) → SQLite
```
成本：~$4-5/月

### 场景3：Docker Compose

```
docker-compose
├── frontend (nginx)
├── backend (uvicorn)
└── volume (sqlite)
```

### 场景4：云 PaaS (Fly.io)

```
Fly.io
├── Docker 容器
└── Volume (SQLite)
```
成本：~$2-5/月

---

## 快速参考

### 常用命令

```bash
# 开发
uvicorn app.main:app --reload
npm run dev

# 构建
npm run build

# Docker
docker-compose up --build

# 部署
fly deploy

# SSL
sudo certbot --nginx -d yourdomain.com

# 备份
sqlite3 db.db "VACUUM INTO 'backup.db'"
```

### 端口参考

| 服务 | 端口 |
|-----|-----|
| Vite 开发 | 5173 |
| FastAPI | 8000 |
| Nginx HTTP | 80 |
| Nginx HTTPS | 443 |

---

## 资源

- [FastAPI 部署](https://fastapi.tiangolo.com/deployment/)
- [Vite 静态部署](https://vitejs.dev/guide/static-deploy.html)
- [Docker 文档](https://docs.docker.com/)
- [Fly.io 文档](https://fly.io/docs/)
