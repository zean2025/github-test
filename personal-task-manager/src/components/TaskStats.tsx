import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import { TaskStats } from '../types';
import { formatTime } from '../utils/taskUtils';

interface TaskStatsProps {
  stats: TaskStats;
}

const TaskStatsComponent: React.FC<TaskStatsProps> = ({ stats }) => {
  const completionRate = stats.total > 0 ? (stats.byStatus.completed / stats.total) * 100 : 0;

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#ff9800';
    return '#f44336';
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = '#2196f3', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>任务统计</Typography>

      <Grid container spacing={2}>
        {/* 总任务数 */}
        <Grid item xs={6} md={2}>
          <StatCard
            title="总任务"
            value={stats.total}
            icon={<Assignment />}
          />
        </Grid>

        {/* 今日完成 */}
        <Grid item xs={6} md={2}>
          <StatCard
            title="今日完成"
            value={stats.completedToday}
            icon={<CheckCircle />}
            color="#4caf50"
          />
        </Grid>

        {/* 逾期任务 */}
        <Grid item xs={6} md={2}>
          <StatCard
            title="逾期任务"
            value={stats.overdueCount}
            icon={<Warning />}
            color="#f44336"
          />
        </Grid>

        {/* 完成率 */}
        <Grid item xs={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: getCompletionColor(completionRate) }} />
                <Typography variant="h6">完成率</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: getCompletionColor(completionRate), fontWeight: 'bold' }}>
                {completionRate.toFixed(1)}%
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getCompletionColor(completionRate)
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.byStatus.completed} / {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 状态分布 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>状态分布</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label="待办" size="small" sx={{ backgroundColor: '#9e9e9e', color: 'white' }} />
                  <Typography variant="body2">{stats.byStatus.todo}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label="进行中" size="small" sx={{ backgroundColor: '#2196f3', color: 'white' }} />
                  <Typography variant="body2">{stats.byStatus.in_progress}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label="已完成" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
                  <Typography variant="body2">{stats.byStatus.completed}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label="已取消" size="small" sx={{ backgroundColor: '#f44336', color: 'white' }} />
                  <Typography variant="body2">{stats.byStatus.cancelled}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 优先级分布 */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>优先级分布</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="紧急" size="small" sx={{ backgroundColor: '#9c27b0', color: 'white' }} />
                  <Typography variant="body2">{stats.byPriority.urgent} 个</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="高" size="small" sx={{ backgroundColor: '#f44336', color: 'white' }} />
                  <Typography variant="body2">{stats.byPriority.high} 个</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="中" size="small" sx={{ backgroundColor: '#ff9800', color: 'white' }} />
                  <Typography variant="body2">{stats.byPriority.medium} 个</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="低" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
                  <Typography variant="body2">{stats.byPriority.low} 个</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskStatsComponent;