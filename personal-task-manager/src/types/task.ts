export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes
  tags: string[];
}

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  completedToday: number;
  overdueCount: number;
}