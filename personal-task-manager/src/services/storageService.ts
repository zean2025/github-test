import type { Task } from '../types';

const STORAGE_KEY = 'personal-task-manager-tasks';

export const storageService = {
  // 获取所有任务
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const tasks = JSON.parse(data);
      // 将日期字符串转换回Date对象
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // 保存所有任务
  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // 添加单个任务
  addTask: (task: Task): void => {
    const tasks = storageService.getTasks();
    tasks.push(task);
    storageService.saveTasks(tasks);
  },

  // 更新任务
  updateTask: (updatedTask: Task): void => {
    const tasks = storageService.getTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      storageService.saveTasks(tasks);
    }
  },

  // 删除任务
  deleteTask: (taskId: string): void => {
    const tasks = storageService.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    storageService.saveTasks(filteredTasks);
  },

  // 清空所有任务
  clearTasks: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};