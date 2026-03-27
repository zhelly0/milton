import React, { useState } from 'react';

type Priority = 'low' | 'medium' | 'high';

interface TaskFormProps {
  onAddTask: (title: string, description: string, priority: Priority, dueDate: string | null, tags: string[]) => void;
}

const SUGGESTED_TAGS = ['bug', 'feature', 'design', 'research', 'urgent', 'meeting', 'docs', 'testing'];

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    onAddTask(title, description, priority, dueDate || null, tags);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setTagInput('');
  };

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    t => !tags.includes(t) && t.includes(tagInput.toLowerCase())
  );

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

      <div className="form-row">
        <div className="form-group form-group-half">
          <label className="form-label">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="form-input form-select"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <div className="form-group form-group-half">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags</label>
        <div className="tag-input-container">
          {tags.map(tag => (
            <span key={tag} className="tag-chip">
              {tag}
              <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>✕</button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
            onKeyDown={handleTagKeyDown}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
            className="tag-text-input"
          />
        </div>
        {showTagSuggestions && filteredSuggestions.length > 0 && (
          <div className="tag-suggestions">
            {filteredSuggestions.map(t => (
              <button key={t} type="button" className="tag-suggestion" onClick={() => addTag(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        + Add Task
      </button>
    </form>
  );
};

export default TaskForm;
