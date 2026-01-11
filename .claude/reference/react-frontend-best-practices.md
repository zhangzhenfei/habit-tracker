# React 前端最佳实践

## 目录

1. [项目结构](#1-项目结构)
2. [组件设计](#2-组件设计)
3. [状态管理](#3-状态管理)
4. [数据获取](#4-数据获取)
5. [表单与验证](#5-表单与验证)
6. [Tailwind 样式](#6-tailwind-样式)
7. [性能优化](#7-性能优化)
8. [Hooks 模式](#8-hooks-模式)
9. [路由](#9-路由)
10. [错误处理](#10-错误处理)
11. [测试](#11-测试)
12. [反模式](#12-反模式)

---

## 1. 项目结构

### 按功能划分（推荐）

```
src/
├── features/
│   ├── habits/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.js
│   └── calendar/
├── components/          # 共享组件
│   ├── ui/
│   └── layout/
├── hooks/               # 共享 hooks
├── lib/                 # 工具函数
├── pages/               # 路由页面
├── App.jsx
└── main.jsx
```

### 命名约定

| 类型 | 约定 | 示例 |
|-----|-----|-----|
| 组件 | PascalCase | `HabitCard.jsx` |
| Hooks | camelCase + use | `useHabits.js` |
| 工具 | camelCase | `formatDate.js` |

---

## 2. 组件设计

### 函数组件

```jsx
function HabitCard({ habit, onComplete }) {
  return (
    <div className="p-4 border rounded">
      <h3>{habit.name}</h3>
      <button onClick={() => onComplete(habit.id)}>完成</button>
    </div>
  );
}

// 带默认值
function HabitCard({ habit, showStreak = true }) {
  // ...
}
```

### 组件组合

```jsx
function Card({ children, className }) {
  return <div className={`border rounded ${className}`}>{children}</div>;
}

Card.Header = ({ children }) => <div className="p-4 border-b">{children}</div>;
Card.Body = ({ children }) => <div className="p-4">{children}</div>;

// 使用
<Card>
  <Card.Header>标题</Card.Header>
  <Card.Body>内容</Card.Body>
</Card>
```

### Props 设计

```jsx
// 好：明确的 props
function Button({ onClick, disabled, children, variant = 'primary' }) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}

// 避免：过度展开
function Button(props) {
  return <button {...props} />;  // 不清楚接受哪些 props
}
```

---

## 3. 状态管理

### 何时用什么

| 状态类型 | 方案 |
|---------|-----|
| 服务器数据 | TanStack Query |
| 表单状态 | react-hook-form 或 useState |
| 本地 UI 状态 | useState |
| 共享 UI 状态 | Context 或 Zustand |
| URL 状态 | React Router |

### useState 最佳实践

```jsx
// 分组相关状态
const [habit, setHabit] = useState({ name: '', description: '' });

// 基于前值更新
setCount(prev => prev + 1);

// 惰性初始化
const [data, setData] = useState(() => expensiveComputation());
```

### Context API

```jsx
const HabitContext = createContext(null);

function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const value = {
    habits,
    addHabit: (habit) => setHabits(prev => [...prev, habit]),
  };
  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

function useHabitContext() {
  const context = useContext(HabitContext);
  if (!context) throw new Error('必须在 HabitProvider 内使用');
  return context;
}
```

---

## 4. 数据获取

### TanStack Query 设置

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
```

### 基本查询

```javascript
export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
  });
}

// 组件中使用
function HabitList() {
  const { data: habits, isLoading, error } = useHabits();
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <ul>{habits.map(h => <HabitCard key={h.id} habit={h} />)}</ul>;
}
```

### 变更操作

```javascript
export function useCompleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, date }) => completeHabit(habitId, date),
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

// 使用
function HabitCard({ habit }) {
  const { mutate: complete, isPending } = useCompleteHabit();
  return (
    <button onClick={() => complete({ habitId: habit.id })} disabled={isPending}>
      {isPending ? '保存中...' : '完成'}
    </button>
  );
}
```

### API 客户端

```javascript
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || '发生错误');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const fetchHabits = () => request('/habits');
export const createHabit = (data) => request('/habits', { method: 'POST', body: JSON.stringify(data) });
```

---

## 5. 表单与验证

### React Hook Form + Zod

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const habitSchema = z.object({
  name: z.string().min(1, '名称必填').max(100),
  description: z.string().max(500).optional(),
});

function HabitForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(habitSchema),
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <input {...register('name')} className={errors.name ? 'border-red-500' : ''} />
      {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
```

---

## 6. Tailwind 样式

### 组件样式模式

```jsx
import clsx from 'clsx';

function Button({ children, variant = 'primary' }) {
  const base = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  return <button className={`${base} ${variants[variant]}`}>{children}</button>;
}

function HabitCard({ habit, isCompleted }) {
  return (
    <div className={clsx(
      'p-4 border rounded',
      isCompleted && 'bg-green-50 border-green-200',
      !isCompleted && 'bg-white border-gray-200'
    )}>
      {habit.name}
    </div>
  );
}
```

### 响应式设计

```jsx
<div className="p-2 md:p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>
// 断点：sm(640px) md(768px) lg(1024px) xl(1280px)
```

### 常用模式

```jsx
// 卡片
<div className="bg-white rounded-lg shadow-md p-4">

// Flex 居中
<div className="flex items-center justify-center">

// 焦点环
<button className="focus:outline-none focus:ring-2 focus:ring-primary">

// 禁用状态
<button className="disabled:opacity-50 disabled:cursor-not-allowed" disabled={isPending}>
```

---

## 7. 性能优化

### React.memo

```jsx
const HabitCard = memo(function HabitCard({ habit, onComplete }) {
  return (
    <div>
      <h3>{habit.name}</h3>
      <button onClick={() => onComplete(habit.id)}>完成</button>
    </div>
  );
});
```

### useCallback 和 useMemo

```jsx
// useCallback - 记忆传给子组件的函数
function HabitList({ habits }) {
  const handleComplete = useCallback((id) => {
    // ...
  }, []);
  return habits.map(h => <HabitCard key={h.id} habit={h} onComplete={handleComplete} />);
}

// useMemo - 记忆昂贵计算
function Stats({ completions }) {
  const stats = useMemo(() => calculateExpensiveStats(completions), [completions]);
  return <div>{stats.average}</div>;
}
```

**何时使用**：
- `useCallback`：传给 memo 子组件的函数
- `useMemo`：昂贵计算、引用相等性

**何时不用**：简单计算、原始值、不传给子组件的函数

### 代码分割

```jsx
import { lazy, Suspense } from 'react';

const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 8. Hooks 模式

### 自定义 Hooks

```javascript
// useLocalStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// useToggle
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}
```

### useEffect 模式

```jsx
// 清理函数
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal }).then(res => res.json()).then(setData);
  return () => controller.abort();
}, []);

// 事件监听
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 9. 路由

### React Router v6

```jsx
import { BrowserRouter, Routes, Route, Outlet, Link, useParams, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="habits/:habitId" element={<HabitDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Layout() {
  return (
    <div>
      <nav><Link to="/">首页</Link></nav>
      <main><Outlet /></main>
    </div>
  );
}

function HabitDetail() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  return <button onClick={() => navigate('/')}>返回</button>;
}
```

---

## 10. 错误处理

### 错误边界

```jsx
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>出错了</h2>
          <button onClick={() => this.setState({ hasError: false })}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary><App /></ErrorBoundary>
```

### 异步错误处理

```jsx
function HabitList() {
  const { data, error, isError, refetch } = useHabits();
  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <p>加载失败：{error.message}</p>
        <button onClick={() => refetch()}>重试</button>
      </div>
    );
  }
  return <ul>{/* ... */}</ul>;
}
```

---

## 11. 测试

### Vitest 设置

```javascript
// vite.config.js
export default defineConfig({
  test: { globals: true, environment: 'jsdom', setupFiles: './src/test/setup.js' },
});

// src/test/setup.js
import '@testing-library/jest-dom';
```

### 组件测试

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('HabitCard', () => {
  it('渲染习惯名称', () => {
    render(<HabitCard habit={{ id: 1, name: '运动' }} />);
    expect(screen.getByText('运动')).toBeInTheDocument();
  });

  it('点击按钮调用 onComplete', async () => {
    const onComplete = vi.fn();
    render(<HabitCard habit={{ id: 1, name: '运动' }} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /完成/i }));
    expect(onComplete).toHaveBeenCalledWith(1);
  });
});
```

### 查询优先级

1. `getByRole` - 无障碍名称（最佳）
2. `getByLabelText` - 表单标签
3. `getByText` - 文本内容
4. `getByTestId` - 最后手段

---

## 12. 反模式

### 常见错误

| 反模式 | 问题 | 解决方案 |
|-------|-----|---------|
| Props 钻取 | 难维护 | Context 或组合 |
| 巨型组件 | 难测试 | 拆分小组件 |
| useEffect 派生状态 | 不必要复杂 | 渲染时计算 |
| index 作 key | 重排序 bug | 用稳定唯一 ID |

### 代码示例

```jsx
// 坏：useEffect 派生状态
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// 好：渲染时计算
const fullName = `${firstName} ${lastName}`;

// 坏：index 作 key
{items.map((item, index) => <Item key={index} item={item} />)}

// 好：稳定唯一 ID
{items.map(item => <Item key={item.id} item={item} />)}

// 坏：useEffect 获取数据无清理
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData);
}, []);

// 好：用 TanStack Query 或加清理
useEffect(() => {
  let cancelled = false;
  fetch('/api/data').then(res => res.json()).then(data => { if (!cancelled) setData(data); });
  return () => { cancelled = true; };
}, []);
```

---

## 快速参考

### 常用导入

```jsx
import { useState, useEffect, useCallback, useMemo, useRef, memo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

---

## 资源

- [React 文档](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
