import type {
  User,
  Team,
  Task,
  TaskComment,
  LoginCredentials,
  RegisterData,
  AuthState
} from '../types';
import { generateId } from '../utils/taskUtils';

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    displayName: '管理员',
    role: 'admin' as any,
    status: 'active' as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'user-2',
    username: 'alice',
    email: 'alice@example.com',
    displayName: 'Alice Wang',
    role: 'member' as any,
    status: 'active' as any,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date()
  },
  {
    id: 'user-3',
    username: 'bob',
    email: 'bob@example.com',
    displayName: 'Bob Chen',
    role: 'member' as any,
    status: 'active' as any,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date()
  }
];

// 模拟团队数据
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: '开发团队',
    description: '项目开发小组',
    createdBy: 'user-1',
    members: [
      {
        userId: 'user-1',
        user: mockUsers[0],
        role: 'owner' as any,
        joinedAt: new Date('2024-01-01'),
        permissions: ['view_tasks', 'create_tasks', 'edit_own_tasks', 'edit_all_tasks', 'delete_own_tasks', 'delete_all_tasks', 'assign_tasks', 'manage_members', 'manage_settings']
      },
      {
        userId: 'user-2',
        user: mockUsers[1],
        role: 'member' as any,
        joinedAt: new Date('2024-01-02'),
        permissions: ['view_tasks', 'create_tasks', 'edit_own_tasks', 'delete_own_tasks']
      },
      {
        userId: 'user-3',
        user: mockUsers[2],
        role: 'member' as any,
        joinedAt: new Date('2024-01-03'),
        permissions: ['view_tasks', 'create_tasks', 'edit_own_tasks', 'delete_own_tasks']
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    settings: {
      allowMemberInvite: false,
      allowMemberCreateTasks: true,
      allowMemberEditAllTasks: false,
      taskVisibility: 'public' as any
    }
  }
];

// 模拟认证服务
class MockAuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthState> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u =>
      u.username === credentials.username &&
      // 简化的密码验证（实际应用中应该使用加密）
      credentials.password === 'password'
    );

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    this.currentUser = user;
    this.token = `mock-token-${user.id}-${Date.now()}`;

    return {
      user: this.currentUser,
      token: this.token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    };
  }

  async register(data: RegisterData): Promise<AuthState> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === data.username)) {
      throw new Error('用户名已存在');
    }

    if (mockUsers.some(u => u.email === data.email)) {
      throw new Error('邮箱已被注册');
    }

    const newUser: User = {
      id: generateId(),
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      role: 'member' as any,
      status: 'active' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    this.currentUser = newUser;
    this.token = `mock-token-${newUser.id}-${Date.now()}`;

    return {
      user: this.currentUser,
      token: this.token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    };
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }
}

// 模拟团队服务
class MockTeamService {
  async getUserTeams(userId: string): Promise<Team[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeams.filter(team =>
      team.members.some(member => member.userId === userId)
    );
  }

  async getTeamById(teamId: string): Promise<Team | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeams.find(team => team.id === teamId) || null;
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!this.authService.isAuthenticated()) {
      throw new Error('用户未登录');
    }

    const currentUser = this.authService.getCurrentUser()!;
    const newTeam: Team = {
      id: generateId(),
      name: data.name || '新团队',
      description: data.description,
      createdBy: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          user: currentUser,
          role: 'owner' as any,
          joinedAt: new Date(),
          permissions: ['view_tasks', 'create_tasks', 'edit_own_tasks', 'edit_all_tasks', 'delete_own_tasks', 'delete_all_tasks', 'assign_tasks', 'manage_members', 'manage_settings']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowMemberInvite: false,
        allowMemberCreateTasks: true,
        allowMemberEditAllTasks: false,
        taskVisibility: 'public' as any
      }
    };

    mockTeams.push(newTeam);
    return newTeam;
  }

  private authService: MockAuthService;

  constructor(authService: MockAuthService) {
    this.authService = authService;
  }
}

// 模拟任务服务
class MockTaskService {
  private tasks: Task[] = [];

  constructor() {
    // 初始化一些示例任务
    this.tasks = [
      {
        id: 'task-1',
        title: '设计用户界面',
        description: '为新功能设计用户界面',
        status: 'in_progress' as any,
        priority: 'high' as any,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        estimatedTime: 480, // 8小时
        actualTime: 240,   // 4小时
        tags: ['设计', 'UI'],
        createdBy: 'user-1',
        assignedTo: ['user-2'],
        teamId: 'team-1',
        visibility: 'public' as any,
        watchers: ['user-1', 'user-2'],
        attachments: [],
        comments: []
      },
      {
        id: 'task-2',
        title: '实现后端API',
        description: '开发RESTful API接口',
        status: 'todo' as any,
        priority: 'medium' as any,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
        estimatedTime: 960, // 16小时
        tags: ['后端', 'API'],
        createdBy: 'user-1',
        assignedTo: ['user-3'],
        teamId: 'team-1',
        visibility: 'public' as any,
        watchers: ['user-1', 'user-3'],
        attachments: [],
        comments: []
      }
    ];
  }

  async getTasks(userId?: string, teamId?: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredTasks = this.tasks;

    if (teamId) {
      filteredTasks = filteredTasks.filter(task => task.teamId === teamId);
    }

    if (userId) {
      // 获取用户可见的任务：自己创建的、分配给自己的、团队公开的
      filteredTasks = filteredTasks.filter(task =>
        task.createdBy === userId ||
        task.assignedTo?.includes(userId) ||
        task.watchers.includes(userId) ||
        task.visibility === 'public'
      );
    }

    return filteredTasks;
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.tasks.find(task => task.id === taskId) || null;
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTask: Task = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      comments: []
    };

    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('任务不存在');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('任务不存在');
    }

    this.tasks.splice(taskIndex, 1);
  }

  async addComment(taskId: string, content: string, userId: string): Promise<TaskComment> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    const comment: TaskComment = {
      id: generateId(),
      taskId,
      userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    task.comments.push(comment);
    task.updatedAt = new Date();

    return comment;
  }

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    return task.comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

// 导出服务实例
export const authService = new MockAuthService();
export const teamService = new MockTeamService(authService);
export const taskService = new MockTaskService();

// 导出所有用户数据供UI使用
export { mockUsers };