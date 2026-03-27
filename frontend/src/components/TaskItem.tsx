import React from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onToggleCompletion }) => {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleCompletion(task.id)}
          className="task-checkbox"
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>
      
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="btn btn-danger btn-small"
        aria-label={`Delete "${task.title}"`}
      >
        🗑️ Delete
      </button>
    </div>
  );
};

export default TaskItem;
