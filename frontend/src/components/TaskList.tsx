import React from 'react';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleCompletion: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onToggleCompletion }) => {
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
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TaskList;
