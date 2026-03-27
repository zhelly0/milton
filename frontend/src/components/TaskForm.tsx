import React, { useState } from 'react';

interface TaskFormProps {
  onAddTask: (title: string, description: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    onAddTask(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <textarea
          placeholder="Task description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          rows={3}
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        + Add Task
      </button>
    </form>
  );
};

export default TaskForm;
