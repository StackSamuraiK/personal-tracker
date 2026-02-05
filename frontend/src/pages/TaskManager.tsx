import { useState, useEffect } from 'react';
import { tasksAPI, analyticsAPI } from '../services/api';
import type { Task } from '../types';
import { format } from 'date-fns';
import '../styles/TaskManager.css';

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        planned_hours: 1,
        actual_hours: 0,
        status: 'pending' as Task['status']
    });

    useEffect(() => {
        loadTasks();
    }, [selectedDate]);

    const loadTasks = async () => {
        try {
            const response = await tasksAPI.getTasks(selectedDate);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await tasksAPI.updateTask(editingTask.id, formData);
            } else {
                await tasksAPI.createTask({
                    ...formData,
                    task_date: selectedDate
                });
            }

            // Update streak if task is completed
            if (formData.status === 'completed' && formData.actual_hours > 0) {
                const dailyTasks = await tasksAPI.getTasks(selectedDate);
                const completedToday = dailyTasks.data.filter((t: Task) => t.status === 'completed');
                const totalHours = completedToday.reduce((sum: number, t: Task) => sum + t.actual_hours, 0);

                await analyticsAPI.updateStreak({
                    date: selectedDate,
                    hours: totalHours,
                    taskCount: completedToday.length
                });
            }

            resetForm();
            loadTasks();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            category: task.category,
            planned_hours: task.planned_hours,
            actual_hours: task.actual_hours,
            status: task.status
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await tasksAPI.deleteTask(id);
            loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: '',
            planned_hours: 1,
            actual_hours: 0,
            status: 'pending'
        });
        setEditingTask(null);
        setShowAddForm(false);
    };

    const categories = ['DSA', 'Development', 'DevOps', 'System Design', 'Aptitude', 'Other'];

    return (
        <div className="task-manager">
            <header className="task-header">
                <h1>📝 Task Manager</h1>
                <div className="header-actions">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-picker"
                    />
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn-add-task"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Task'}
                    </button>
                </div>
            </header>

            {showAddForm && (
                <div className="task-form-card">
                    <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                    <form onSubmit={handleSubmit} className="task-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Task Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g., Learn React Hooks"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Planned Hours *</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    max="24"
                                    step="0.5"
                                    value={formData.planned_hours}
                                    onChange={(e) => setFormData({ ...formData, planned_hours: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>

                            {editingTask && (
                                <>
                                    <div className="form-group">
                                        <label>Actual Hours</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={formData.actual_hours}
                                            onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="partial">Partial</option>
                                            <option value="skipped">Skipped</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="btn-cancel">
                                Cancel
                            </button>
                            <button type="submit" className="btn-save">
                                {editingTask ? 'Update Task' : 'Add Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="tasks-container">
                <h2>Tasks for {format(new Date(selectedDate), 'MMMM d, yyyy')}</h2>

                {tasks.length === 0 ? (
                    <div className="empty-tasks">
                        <p>No tasks for this date</p>
                        <button onClick={() => setShowAddForm(true)} className="btn-add-first">
                            Add Your First Task
                        </button>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <div key={task.id} className={`task-card ${task.status}`}>
                                <div className="task-card-header">
                                    <h4>{task.title}</h4>
                                    <span className={`status-badge ${task.status}`}>
                                        {task.status}
                                    </span>
                                </div>

                                <div className="task-card-body">
                                    <div className="task-detail">
                                        <span className="detail-label">Category:</span>
                                        <span className="detail-value">{task.category}</span>
                                    </div>

                                    <div className="task-detail">
                                        <span className="detail-label">Planned:</span>
                                        <span className="detail-value">{task.planned_hours}h</span>
                                    </div>

                                    <div className="task-detail">
                                        <span className="detail-label">Actual:</span>
                                        <span className="detail-value">{task.actual_hours}h</span>
                                    </div>

                                    {task.actual_hours > 0 && (
                                        <div className="task-progress-bar">
                                            <div
                                                className="task-progress-fill"
                                                style={{ width: `${Math.min((task.actual_hours / task.planned_hours) * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="task-card-actions">
                                    <button onClick={() => handleEdit(task)} className="btn-edit">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="btn-delete">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
