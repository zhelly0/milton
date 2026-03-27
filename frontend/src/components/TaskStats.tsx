import React from 'react';

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

interface TaskStatsProps {
    tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
    }).length;
    const dueSoon = tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const diff = new Date(t.dueDate).getTime() - new Date().getTime();
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
    }).length;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;

    if (total === 0) return null;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="task-stats">
            <span className="stat">
                <span className="stat-count">{total}</span> Total
            </span>
            <span className="stat stat-active">
                <span className="stat-count">{active}</span> Active
            </span>
            <span className="stat stat-completed">
                <span className="stat-count">{completed}</span> Done
            </span>
            {highPriority > 0 && (
                <span className="stat stat-high">
                    <span className="stat-count">{highPriority}</span> 🔴 High
                </span>
            )}
            {dueSoon > 0 && (
                <span className="stat stat-due-soon">
                    <span className="stat-count">{dueSoon}</span> ⏰ Due Soon
                </span>
            )}
            {overdue > 0 && (
                <span className="stat stat-overdue">
                    <span className="stat-count">{overdue}</span> Overdue
                </span>
            )}
            <span className="stat stat-progress">
                <span className="stat-count">{completionRate}%</span> Complete
                <div className="stat-progress-bar">
                    <div className="stat-progress-fill" style={{ width: `${completionRate}%` }} />
                </div>
            </span>
        </div>
    );
};

export default TaskStats;
