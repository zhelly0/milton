import React, { useState, DragEvent } from 'react';

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

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const columns: { key: Status; label: string; emoji: string }[] = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'in-progress', label: 'In Progress', emoji: '🔧' },
  { key: 'done', label: 'Done', emoji: '✅' },
];

const priorityLabels: Record<Priority, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, column: Status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onEditTask(taskId, { status: newStatus, completed: newStatus === 'done' });
    }
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  const getTasksByStatus = (status: Status) => {
    return tasks
      .filter(t => (t.status || 'todo') === status)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  return (
    <div className="kanban-board">
      {columns.map(col => {
        const columnTasks = getTasksByStatus(col.key);
        return (
          <div
            key={col.key}
            className={`kanban-column ${dragOverColumn === col.key ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">
                {col.emoji} {col.label}
              </span>
              <span className="kanban-column-count">{columnTasks.length}</span>
            </div>

            <div className="kanban-column-body">
              {columnTasks.map(task => {
                const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className={`kanban-card priority-${task.priority} ${isOverdue ? 'overdue' : ''} ${draggedTaskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="kanban-card-header">
                      <span className="kanban-card-priority">{priorityLabels[task.priority]}</span>
                      {task.dueDate && (
                        <span className={`kanban-card-due ${isOverdue ? 'overdue' : ''}`}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="kanban-card-title">{task.title}</h4>
                    {task.description && (
                      <p className="kanban-card-desc">{task.description}</p>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="kanban-card-tags">
                        {task.tags.map(tag => (
                          <span key={tag} className="task-tag task-tag-sm">{tag}</span>
                        ))}
                      </div>
                    )}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="kanban-card-subtasks">
                        <span className="kanban-subtask-indicator">
                          ☑ {task.subtasks.filter((s: any) => s.done).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="kanban-card-delete"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Delete "${task.title}"`}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="kanban-empty">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
