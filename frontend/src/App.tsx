import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import Whiteboard from './components/Whiteboard';
import SearchBar from './components/SearchBar';
import TaskStats from './components/TaskStats';
import FilterSort from './components/FilterSort';
import Toast from './components/Toast';
import ConfettiEffect from './components/ConfettiEffect';

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  status: Status;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
}

type SortBy = 'newest' | 'oldest' | 'priority' | 'dueDate' | 'title';
type FilterPriority = 'all' | Priority;
type FilterStatus = 'all' | Status;

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'tasks' | 'kanban' | 'whiteboard'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; action?: () => void; actionLabel?: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use relative API routing so local dev (CRA proxy) and Azure SWA both work.
  const API_URL = '/api/tasks';

  // Toggle dark mode on body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Fetch all tasks on component mount
  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, action?: () => void, actionLabel?: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, action, actionLabel });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      // Ensure backward compatibility with tasks missing new fields
      const normalized = response.data.map((t: any) => ({
        ...t,
        tags: t.tags || [],
        subtasks: t.subtasks || [],
      }));
      setTasks(normalized);
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, description: string, priority: Priority, dueDate: string | null, tags: string[]) => {
    try {
      const response = await axios.post(API_URL, { title, description, priority, dueDate, tags });
      setTasks([...tasks, { ...response.data, tags: response.data.tags || [], subtasks: response.data.subtasks || [] }]);
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      setSelectedTasks(prev => { const next = new Set(prev); next.delete(id); return next; });

      if (task) {
        showToast(
          `Deleted "${task.title}"`,
          async () => {
            try {
              const response = await axios.post(API_URL, task);
              setTasks(prev => [...prev, { ...response.data, tags: response.data.tags || [], subtasks: response.data.subtasks || [] }]);
            } catch (err) {
              setError('Failed to undo delete');
            }
          },
          'Undo'
        );
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        completed: newCompleted,
        status: newCompleted ? 'done' : 'todo',
      });
      setTasks(tasks.map(t => t.id === id ? { ...response.data, tags: response.data.tags || [], subtasks: response.data.subtasks || [] } : t));

      if (newCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updates);
      const updatedTask = { ...response.data, tags: response.data.tags || [], subtasks: response.data.subtasks || [] };
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));

      // Confetti when moving to done via kanban or any status update
      if (updates.status === 'done' || (updates.completed === true)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  // Bulk actions
  const toggleSelectTask = (id: string) => {
    setSelectedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllTasks = () => {
    const filtered = getProcessedTasks();
    if (selectedTasks.size === filtered.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filtered.map(t => t.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    const ids = Array.from(selectedTasks);
    const deletedTasks = tasks.filter(t => ids.includes(t.id));

    try {
      await axios.post(`${API_URL}/bulk-delete`, { ids });
      setTasks(tasks.filter(t => !ids.includes(t.id)));
      setSelectedTasks(new Set());
      showToast(
        `Deleted ${ids.length} task(s)`,
        async () => {
          try {
            for (const task of deletedTasks) {
              const response = await axios.post(API_URL, task);
              setTasks(prev => [...prev, { ...response.data, tags: response.data.tags || [], subtasks: response.data.subtasks || [] }]);
            }
          } catch (err) {
            setError('Failed to undo bulk delete');
          }
        },
        'Undo'
      );
    } catch (err) {
      setError('Failed to delete tasks');
    }
  };

  const bulkComplete = async () => {
    if (selectedTasks.size === 0) return;
    const ids = Array.from(selectedTasks);
    try {
      await axios.patch(`${API_URL}/bulk`, { ids, updates: { status: 'done', completed: true } });
      setTasks(tasks.map(t => ids.includes(t.id) ? { ...t, completed: true, status: 'done' as Status } : t));
      setSelectedTasks(new Set());
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      showToast(`Completed ${ids.length} task(s)`);
    } catch (err) {
      setError('Failed to complete tasks');
    }
  };

  const exportTasks = (format: 'json' | 'csv') => {
    window.open(`${API_URL}/export?format=${format}`, '_blank');
  };

  const getProcessedTasks = useCallback(() => {
    let result = tasks;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(t => (t.status || 'todo') === filterStatus);
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priority': {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
      case 'dueDate':
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return sorted;
  }, [tasks, searchQuery, filterPriority, filterStatus, sortBy]);

  return (
    <div className="App">
      {showConfetti && <ConfettiEffect />}
      <header className="app-header">
        <div className="header-top">
          <h1>📋 Task Manager + 🧠 Live Whiteboard</h1>
          <div className="header-actions">
            <div className="export-dropdown">
              <button type="button" className="header-btn" title="Export tasks">
                📥 Export
              </button>
              <div className="export-menu">
                <button type="button" onClick={() => exportTasks('json')}>📄 JSON</button>
                <button type="button" onClick={() => exportTasks('csv')}>📊 CSV</button>
              </div>
            </div>
            <button
              type="button"
              className="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <p>Stay organized and brainstorm together in real time</p>
      </header>

      <main className={`app-main ${activeView === 'kanban' ? 'app-main-wide' : ''}`}>
        <div className="view-switcher">
          <button
            type="button"
            className={`view-tab ${activeView === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveView('tasks')}
          >
            📋 List
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveView('kanban')}
          >
            📌 Kanban
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveView('whiteboard')}
          >
            🧠 Whiteboard
          </button>
        </div>

        {error && <div className="error-message">{error} <button className="error-dismiss" onClick={() => setError(null)}>✕</button></div>}

        {activeView === 'tasks' ? (
          <>
            <TaskForm onAddTask={addTask} />
            <TaskStats tasks={tasks} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <FilterSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterPriority={filterPriority}
              onFilterPriorityChange={setFilterPriority}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
            />
            {selectedTasks.size > 0 && (
              <div className="bulk-actions">
                <span className="bulk-count">{selectedTasks.size} selected</span>
                <button type="button" className="btn btn-success btn-small" onClick={bulkComplete}>✅ Complete All</button>
                <button type="button" className="btn btn-danger btn-small" onClick={bulkDelete}>🗑️ Delete All</button>
                <button type="button" className="btn btn-cancel btn-small" onClick={() => setSelectedTasks(new Set())}>Cancel</button>
              </div>
            )}
            {loading ? (
              <p className="loading">Loading tasks...</p>
            ) : (
              <TaskList
                tasks={getProcessedTasks()}
                onDeleteTask={deleteTask}
                onToggleCompletion={toggleTaskCompletion}
                onEditTask={editTask}
                selectedTasks={selectedTasks}
                onToggleSelect={toggleSelectTask}
                onSelectAll={selectAllTasks}
              />
            )}
          </>
        ) : activeView === 'kanban' ? (
          <>
            <TaskForm onAddTask={addTask} />
            <TaskStats tasks={tasks} />
            {loading ? (
              <p className="loading">Loading tasks...</p>
            ) : (
              <KanbanBoard
                tasks={getProcessedTasks()}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
              />
            )}
          </>
        ) : (
          <Whiteboard />
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          actionLabel={toast.actionLabel}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
};

export default App;
