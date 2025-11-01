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
  // 多人协作字段
  createdBy: string;
  assignedTo?: string[]; // 分配给的用户ID数组
  teamId?: string;
  visibility: TaskVisibility;
  watchers: string[]; // 关注此任务的用户ID数组
  attachments: TaskAttachment[];
  comments: TaskComment[];
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

export interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // 支持回复
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  completedToday: number;
  overdueCount: number;
  // 多人协作统计
  byAssignee: Record<string, number>; // 按分配用户统计
  myTasks: number;
  assignedToMe: number;
  watching: number;
}