import React, { useState } from 'react';
import SubtaskList from './SubtaskList';

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

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const priorityLabels: Record<Priority, string> = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🔴 High',
};

function getDueStatus(dueDate: string | null, completed: boolean): 'overdue' | 'due-soon' | 'ok' | null {
  if (!dueDate || completed) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 0) return 'overdue';
  if (diffHours < 24) return 'due-soon';
  return 'ok';
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onToggleCompletion, onEdit, isSelected, onToggleSelect }) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const dueStatus = getDueStatus(task.dueDate, task.completed);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, { title: editTitle, description: editDesc });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditing(false);
  };

  const handleSubtaskUpdate = (subtasks: Subtask[]) => {
    onEdit(task.id, { subtasks });
  };

  const subtasksDone = (task.subtasks || []).filter(s => s.done).length;
  const subtasksTotal = (task.subtasks || []).length;

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${dueStatus === 'overdue' ? 'overdue' : ''} ${dueStatus === 'due-soon' ? 'due-soon-highlight' : ''} priority-${task.priority}`}>
      <div className="task-checkbox-container">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={() => onToggleSelect(task.id)}
            className="task-select-checkbox"
            aria-label={`Select "${task.title}"`}
          />
        )}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleCompletion(task.id)}
          className="task-checkbox"
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div className="task-content">
        {editing ? (
          <div className="task-edit-form">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="form-input task-edit-input"
              autoFocus
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="form-textarea task-edit-textarea"
              rows={2}
            />
            <div className="task-edit-actions">
              <button type="button" className="btn btn-save btn-small" onClick={handleSave}>Save</button>
              <button type="button" className="btn btn-cancel btn-small" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="task-meta">
              <span className={`priority-badge priority-${task.priority}`}>
                {priorityLabels[task.priority]}
              </span>
              {task.dueDate && (
                <span className={`due-date ${dueStatus === 'overdue' ? 'overdue' : ''} ${dueStatus === 'due-soon' ? 'due-soon' : ''}`}>
                  {dueStatus === 'overdue' && '⚠️ '}
                  {dueStatus === 'due-soon' && '⏰ '}
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                  {dueStatus === 'due-soon' && <span className="due-soon-label"> Due soon!</span>}
                </span>
              )}
            </div>
            <h3 className="task-title">{task.title}</h3>
            {task.description && <p className="task-description">{task.description}</p>}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="task-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Subtasks toggle */}
            <div className="task-subtask-toggle">
              <button
                type="button"
                className="subtask-toggle-btn"
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                {showSubtasks ? '▾' : '▸'} Subtasks
                {subtasksTotal > 0 && <span className="subtask-badge">{subtasksDone}/{subtasksTotal}</span>}
              </button>
            </div>

            {showSubtasks && (
              <SubtaskList
                subtasks={task.subtasks || []}
                onUpdate={handleSubtaskUpdate}
              />
            )}
          </>
        )}
      </div>

      <div className="task-actions">
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn btn-edit btn-small"
            aria-label={`Edit "${task.title}"`}
          >
            ✏️ Edit
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="btn btn-danger btn-small"
          aria-label={`Delete "${task.title}"`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
