import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  DateRange
} from '@mui/icons-material';
import type { TaskFilter } from '../types';
import { TaskStatus, TaskPriority } from '../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';

interface TaskFilterProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  availableTags: string[];
}

const TaskFilter: React.FC<TaskFilterProps> = ({ filter, onFilterChange, availableTags }) => {
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      search: event.target.value || undefined
    });
  };

  const handleStatusChange = (status: TaskStatus | undefined) => {
    onFilterChange({
      ...filter,
      status
    });
  };

  const handlePriorityChange = (priority: TaskPriority | undefined) => {
    onFilterChange({
      ...filter,
      priority
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFilterChange({
      ...filter,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    const currentStart = filter.dateRange?.start || null;
    const currentEnd = filter.dateRange?.end || null;

    const newDateRange = {
      start: field === 'start' ? date : currentStart,
      end: field === 'end' ? date : currentEnd
    };

    // 只有当开始和结束日期都存在时才设置日期范围
    const dateRange = newDateRange.start && newDateRange.end ? newDateRange : undefined;

    onFilterChange({
      ...filter,
      dateRange
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = !!(filter.search || filter.status || filter.priority || filter.tags?.length || filter.dateRange);

  const statusOptions = [
    { value: TaskStatus.TODO, label: '待办' },
    { value: TaskStatus.IN_PROGRESS, label: '进行中' },
    { value: TaskStatus.COMPLETED, label: '已完成' },
    { value: TaskStatus.CANCELLED, label: '已取消' }
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: '低' },
    { value: TaskPriority.MEDIUM, label: '中' },
    { value: TaskPriority.HIGH, label: '高' },
    { value: TaskPriority.URGENT, label: '紧急' }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="h6">任务筛选</Typography>
            </Box>

            {hasActiveFilters && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="primary">
                  {[
                    filter.search && '搜索',
                    filter.status && '状态',
                    filter.priority && '优先级',
                    filter.tags?.length && '标签',
                    filter.dateRange && '日期'
                  ].filter(Boolean).join(', ')}
                </Typography>
                <Tooltip title="清除所有筛选">
                  <IconButton size="small" onClick={clearFilters}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            {/* 搜索框 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="搜索任务"
                value={filter.search || ''}
                onChange={handleSearchChange}
                placeholder="搜索标题、描述或标签..."
                size="small"
              />
            </Grid>

            {/* 状态筛选 */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>状态</InputLabel>
                <Select
                  value={filter.status || ''}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus | undefined)}
                  label="状态"
                >
                  <MenuItem value="">全部状态</MenuItem>
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 优先级筛选 */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>优先级</InputLabel>
                <Select
                  value={filter.priority || ''}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | undefined)}
                  label="优先级"
                >
                  <MenuItem value="">全部优先级</MenuItem>
                  {priorityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 日期范围筛选 */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateRange fontSize="small" />
                截止日期范围
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
                  <DatePicker
                    label="开始日期"
                    value={filter.dateRange?.start || null}
                    onChange={(date) => handleDateRangeChange('start', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <Typography>至</Typography>
                  <DatePicker
                    label="结束日期"
                    value={filter.dateRange?.end || null}
                    onChange={(date) => handleDateRangeChange('end', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>

            {/* 标签筛选 */}
            {availableTags.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>标签筛选</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagToggle(tag)}
                      color={filter.tags?.includes(tag) ? 'primary' : 'default'}
                      variant={filter.tags?.includes(tag) ? 'filled' : 'outlined'}
                      size="small"
                      clickable
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TaskFilter;