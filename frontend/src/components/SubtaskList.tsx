import React, { useState } from 'react';

interface Subtask {
    id: string;
    text: string;
    done: boolean;
}

interface SubtaskListProps {
    subtasks: Subtask[];
    onUpdate: (subtasks: Subtask[]) => void;
    readOnly?: boolean;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onUpdate, readOnly = false }) => {
    const [newText, setNewText] = useState('');

    const doneCount = subtasks.filter(s => s.done).length;
    const total = subtasks.length;
    const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const handleAdd = () => {
        if (!newText.trim()) return;
        const updated = [...subtasks, { id: Date.now().toString(), text: newText.trim(), done: false }];
        onUpdate(updated);
        setNewText('');
    };

    const handleToggle = (id: string) => {
        const updated = subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s);
        onUpdate(updated);
    };

    const handleDelete = (id: string) => {
        const updated = subtasks.filter(s => s.id !== id);
        onUpdate(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    if (readOnly && total === 0) return null;

    return (
        <div className="subtask-list">
            {total > 0 && (
                <div className="subtask-progress">
                    <div className="subtask-progress-bar">
                        <div className="subtask-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="subtask-progress-text">{doneCount}/{total}</span>
                </div>
            )}

            {subtasks.map(sub => (
                <div key={sub.id} className={`subtask-item ${sub.done ? 'subtask-done' : ''}`}>
                    <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={() => handleToggle(sub.id)}
                        className="subtask-checkbox"
                        disabled={readOnly}
                    />
                    <span className="subtask-text">{sub.text}</span>
                    {!readOnly && (
                        <button
                            type="button"
                            className="subtask-delete"
                            onClick={() => handleDelete(sub.id)}
                            aria-label="Remove subtask"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            {!readOnly && (
                <div className="subtask-add">
                    <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a subtask..."
                        className="subtask-add-input"
                    />
                    <button
                        type="button"
                        className="subtask-add-btn"
                        onClick={handleAdd}
                        disabled={!newText.trim()}
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubtaskList;
