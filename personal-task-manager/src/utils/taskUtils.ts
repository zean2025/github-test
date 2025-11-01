import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
    return false;
  }
  return task.dueDate < new Date();
};

export const getPriorityColor = (priority: TaskPriority): string => {
  const colors = {
    [TaskPriority.LOW]: '#4caf50',
    [TaskPriority.MEDIUM]: '#ff9800',
    [TaskPriority.HIGH]: '#f44336',
    [TaskPriority.URGENT]: '#9c27b0'
  };
  return colors[priority];
};

export const getStatusColor = (status: TaskStatus): string => {
  const colors = {
    [TaskStatus.TODO]: '#9e9e9e',
    [TaskStatus.IN_PROGRESS]: '#2196f3',
    [TaskStatus.COMPLETED]: '#4caf50',
    [TaskStatus.CANCELLED]: '#f44336'
  };
  return colors[status];
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
};

export const sortTasks = (tasks: Task[], sortBy: 'dueDate' | 'priority' | 'createdAt'): Task[] => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'priority':
        const priorityOrder = [TaskPriority.URGENT, TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });
};