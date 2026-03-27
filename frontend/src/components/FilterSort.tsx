import React from 'react';

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';
type SortBy = 'newest' | 'oldest' | 'priority' | 'dueDate' | 'title';
type FilterPriority = 'all' | Priority;
type FilterStatus = 'all' | Status;

interface FilterSortProps {
    sortBy: SortBy;
    onSortChange: (value: SortBy) => void;
    filterPriority: FilterPriority;
    onFilterPriorityChange: (value: FilterPriority) => void;
    filterStatus: FilterStatus;
    onFilterStatusChange: (value: FilterStatus) => void;
}

const FilterSort: React.FC<FilterSortProps> = ({
    sortBy,
    onSortChange,
    filterPriority,
    onFilterPriorityChange,
    filterStatus,
    onFilterStatusChange,
}) => {
    return (
        <div className="filter-sort-bar">
            <div className="filter-group">
                <label className="filter-label">Sort</label>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortBy)}
                    className="form-input form-select filter-select"
                >
                    <option value="newest">🕐 Newest first</option>
                    <option value="oldest">🕐 Oldest first</option>
                    <option value="priority">🔥 Priority</option>
                    <option value="dueDate">📅 Due date</option>
                    <option value="title">🔤 Title A–Z</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Priority</label>
                <select
                    value={filterPriority}
                    onChange={(e) => onFilterPriorityChange(e.target.value as FilterPriority)}
                    className="form-input form-select filter-select"
                >
                    <option value="all">All</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                    value={filterStatus}
                    onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
                    className="form-input form-select filter-select"
                >
                    <option value="all">All</option>
                    <option value="todo">📋 To Do</option>
                    <option value="in-progress">🔧 In Progress</option>
                    <option value="done">✅ Done</option>
                </select>
            </div>
        </div>
    );
};

export default FilterSort;
