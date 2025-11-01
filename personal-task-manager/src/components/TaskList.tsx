import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Grid,
  Fade
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  PlayArrow,
  Check,
  Close,
  Schedule,
  AccessTime
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { getPriorityColor, getStatusColor, isOverdue, formatTime, sortTasks } from '../utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  selectedTask?: Task | null;
  onSelectTask?: (task: Task | null) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  selectedTask,
  onSelectTask
}) => {
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuTask, setSelectedMenuTask] = useState<Task | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedMenuTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuTask(null);
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updatedTask = { ...task, status: newStatus };
    onUpdateTask(updatedTask);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMenuTask) {
      onDeleteTask(selectedMenuTask.id);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedMenuTask) {
      onEditTask(selectedMenuTask);
    }
    handleMenuClose();
  };

  const sortedTasks = sortTasks(tasks, sortBy);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <Schedule fontSize="small" />;
      case TaskStatus.IN_PROGRESS:
        return <PlayArrow fontSize="small" />;
      case TaskStatus.COMPLETED:
        return <Check fontSize="small" />;
      case TaskStatus.CANCELLED:
        return <Close fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* 排序控制 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">任务列表</Typography>
        <Button
          size="small"
          onClick={() => {
            const options: Array<'dueDate' | 'priority' | 'createdAt'> = ['dueDate', 'priority', 'createdAt'];
            const currentIndex = options.indexOf(sortBy);
            setSortBy(options[(currentIndex + 1) % options.length]);
          }}
        >
          排序方式: {sortBy === 'dueDate' ? '截止日期' : sortBy === 'priority' ? '优先级' : '创建时间'}
        </Button>
      </Box>

      {/* 任务卡片列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sortedTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#999' }}>
            <Typography>暂无任务</Typography>
          </Box>
        ) : (
          sortedTasks.map((task) => (
            <Card
              key={task.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedTask?.id === task.id ? '2px solid #2196f3' : '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)'
                },
                opacity: task.status === TaskStatus.COMPLETED ? 0.8 : 1
              }}
              onClick={() => onSelectTask && onSelectTask(task)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    {/* 任务标题和状态 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: getStatusColor(task.status) }}>
                        {getStatusIcon(task.status)}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                          fontWeight: task.status === TaskStatus.TODO ? 'normal' : 'bold'
                        }}
                      >
                        {task.title}
                      </Typography>
                    </Box>

                    {/* 任务描述 */}
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                    )}

                    {/* 标签和优先级 */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white'
                        }}
                      />
                      {task.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>

                    {/* 时间信息 */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {task.dueDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption" sx={{
                            color: isOverdue(task) ? 'error' : 'text.secondary'
                          }}>
                            {format(task.dueDate, 'yyyy-MM-dd', { locale: zhCN })}
                            {isOverdue(task) && ' (已逾期)'}
                          </Typography>
                        </Box>
                      )}

                      {task.estimatedTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            预计 {formatTime(task.estimatedTime)}
                          </Typography>
                        </Box>
                      )}

                      {task.actualTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            实际 {formatTime(task.actualTime)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* 操作按钮 */}
                  <IconButton
                    onClick={(e) => handleMenuClick(e, task)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* 右键菜单 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => selectedMenuTask && handleStatusChange(selectedMenuTask, TaskStatus.TODO)}>
          <Schedule sx={{ mr: 1 }} /> 设为待办
        </MenuItem>
        <MenuItem onClick={() => selectedMenuTask && handleStatusChange(selectedMenuTask, TaskStatus.IN_PROGRESS)}>
          <PlayArrow sx={{ mr: 1 }} /> 开始执行
        </MenuItem>
        <MenuItem onClick={() => selectedMenuTask && handleStatusChange(selectedMenuTask, TaskStatus.COMPLETED)}>
          <Check sx={{ mr: 1 }} /> 标记完成
        </MenuItem>
        <MenuItem onClick={() => selectedMenuTask && handleStatusChange(selectedMenuTask, TaskStatus.CANCELLED)}>
          <Close sx={{ mr: 1 }} /> 取消任务
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> 编辑
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error' }}>
          <Delete sx={{ mr: 1 }} /> 删除
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;