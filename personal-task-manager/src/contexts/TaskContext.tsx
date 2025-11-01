import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Task, TaskFilter, TaskStats } from '../types';
import { TaskStatus, TaskPriority } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/taskUtils';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  selectedTask: Task | null;
}

type TaskAction =
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_SELECTED_TASK'; payload: Task | null };

const initialState: TaskState = {
  tasks: [],
  filter: {},
  selectedTask: null
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      storageService.addTask(newTask);
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK': {
      const updatedTask = { ...action.payload, updatedAt: new Date() };
      storageService.updateTask(updatedTask);
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        ),
        selectedTask: state.selectedTask?.id === updatedTask.id ? updatedTask : state.selectedTask
      };
    }

    case 'DELETE_TASK':
      storageService.deleteTask(action.payload);
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload ? null : state.selectedTask
      };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };

    default:
      return state;
  }
};

interface TaskContextType {
  state: TaskState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setFilter: (filter: TaskFilter) => void;
  setSelectedTask: (task: Task | null) => void;
  getFilteredTasks: () => Task[];
  getTaskStats: () => TaskStats;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // 初始化时加载任务
  React.useEffect(() => {
    const tasks = storageService.getTasks();
    dispatch({ type: 'LOAD_TASKS', payload: tasks });
  }, []);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const setFilter = (filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSelectedTask = (task: Task | null) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
  };

  const getFilteredTasks = (): Task[] => {
    return state.tasks.filter(task => {
      // 状态过滤
      if (state.filter.status && task.status !== state.filter.status) {
        return false;
      }

      // 优先级过滤
      if (state.filter.priority && task.priority !== state.filter.priority) {
        return false;
      }

      // 搜索过滤
      if (state.filter.search) {
        const searchLower = state.filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // 日期范围过滤
      if (state.filter.dateRange) {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= state.filter.dateRange.start && taskDate <= state.filter.dateRange.end;
      }

      // 标签过滤
      if (state.filter.tags && state.filter.tags.length > 0) {
        return state.filter.tags.some(tag => task.tags.includes(tag));
      }

      return true;
    });
  };

  const getTaskStats = (): TaskStats => {
    const tasks = state.tasks;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      total: tasks.length,
      byStatus: {
        [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
        [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        [TaskStatus.COMPLETED]: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        [TaskStatus.CANCELLED]: tasks.filter(t => t.status === TaskStatus.CANCELLED).length
      },
      byPriority: {
        [TaskPriority.LOW]: tasks.filter(t => t.priority === TaskPriority.LOW).length,
        [TaskPriority.MEDIUM]: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
        [TaskPriority.HIGH]: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
        [TaskPriority.URGENT]: tasks.filter(t => t.priority === TaskPriority.URGENT).length
      },
      completedToday: tasks.filter(t =>
        t.status === TaskStatus.COMPLETED &&
        t.updatedAt >= today &&
        t.updatedAt < tomorrow
      ).length,
      overdueCount: tasks.filter(t =>
        t.dueDate &&
        t.dueDate < new Date() &&
        t.status !== TaskStatus.COMPLETED
      ).length
    };
  };

  return (
    <TaskContext.Provider value={{
      state,
      addTask,
      updateTask,
      deleteTask,
      setFilter,
      setSelectedTask,
      getFilteredTasks,
      getTaskStats
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};