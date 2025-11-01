import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

interface TaskFormProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null as Date | null,
    estimatedTime: '',
    tags: [] as string[],
    newTag: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || null,
        estimatedTime: task.estimatedTime ? task.estimatedTime.toString() : '',
        tags: task.tags,
        newTag: ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        estimatedTime: '',
        tags: [],
        newTag: ''
      });
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, formData.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('请输入任务标题');
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      tags: formData.tags
    };

    onSubmit(taskData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? '编辑任务' : '新建任务'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="任务标题"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="任务描述"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="状态"
              >
                <MenuItem value={TaskStatus.TODO}>待办</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>进行中</MenuItem>
                <MenuItem value={TaskStatus.COMPLETED}>已完成</MenuItem>
                <MenuItem value={TaskStatus.CANCELLED}>已取消</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>优先级</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="优先级"
              >
                <MenuItem value={TaskPriority.LOW}>低</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>中</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>高</MenuItem>
                <MenuItem value={TaskPriority.URGENT}>紧急</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <DatePicker
              label="截止日期"
              value={formData.dueDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, dueDate: newValue }))}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>

          <TextField
            label="预计时间（分钟）"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleChange}
            type="number"
            fullWidth
            helperText="例如：60表示1小时"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>标签</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  deleteIcon={<DeleteIcon />}
                  size="small"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="添加标签"
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <IconButton onClick={handleAddTag} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained">
          {task ? '更新' : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;