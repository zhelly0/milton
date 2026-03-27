import React from 'react';
import TaskItem from './TaskItem';

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

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  selectedTasks: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onToggleCompletion, onEditTask, selectedTasks, onToggleSelect, onSelectAll }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet! Add one to get started. 🚀</p>
      </div>
    );
  }

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <button type="button" className="btn btn-small select-all-btn" onClick={onSelectAll}>
          {selectedTasks.size === tasks.length && tasks.length > 0 ? '☑️ Deselect All' : '☐ Select All'}
        </button>
        <span className="task-count-label">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {incompleteTasks.length > 0 && (
        <section className="task-section">
          <h2>Active Tasks</h2>
          <div className="task-list">
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onToggleCompletion={onToggleCompletion}
                onEdit={onEditTask}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section className="task-section completed">
          <h2>Completed Tasks</h2>
          <div className="task-list">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onToggleCompletion={onToggleCompletion}
                onEdit={onEditTask}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TaskList;
