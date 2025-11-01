import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Timer,
  AccessTime
} from '@mui/icons-material';
import type { Task } from '../types';
import { formatTime } from '../utils/taskUtils';

interface TimeTrackerProps {
  selectedTask: Task | null;
  onUpdateTask: (task: Task) => void;
}

// interface TimeEntry {
//   id: string;
//   taskId: string;
//   startTime: Date;
//   endTime?: Date;
//   duration?: number; // minutes
//   description?: string;
// }

const TimeTracker: React.FC<TimeTrackerProps> = ({ selectedTask, onUpdateTask }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    elapsedTime: number;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualTime, setManualTime] = useState('');

  // 计时器效果
  useEffect(() => {
    let interval: number;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000 / 60);
        setElapsedTime(elapsed);
        setCurrentSession(prev => prev ? { ...prev, elapsedTime: elapsed } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const startTracking = () => {
    if (!selectedTask) {
      alert('请先选择一个任务');
      return;
    }
    const startTime = new Date();
    setCurrentSession({ startTime, elapsedTime: 0 });
    setIsTracking(true);
    setElapsedTime(0);
  };

  const pauseTracking = () => {
    if (currentSession && selectedTask) {
      const endTime = new Date();
      const sessionDuration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60);

      const updatedTask = {
        ...selectedTask,
        actualTime: (selectedTask.actualTime || 0) + sessionDuration
      };

      onUpdateTask(updatedTask);
    }

    setIsTracking(false);
    setCurrentSession(null);
    setElapsedTime(0);
  };

  const stopTracking = () => {
    pauseTracking();
  };

  const handleManualTimeAdd = () => {
    if (!selectedTask || !manualTime) return;

    const timeInMinutes = parseInt(manualTime);
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
      alert('请输入有效的时间（分钟）');
      return;
    }

    const updatedTask = {
      ...selectedTask,
      actualTime: (selectedTask.actualTime || 0) + timeInMinutes
    };

    onUpdateTask(updatedTask);
    setManualTime('');
    setShowManualDialog(false);
  };

  const getTotalTimeTracked = () => {
    if (!selectedTask) return 0;
    return selectedTask.actualTime || 0;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timer />
          时间跟踪
        </Typography>

        {selectedTask ? (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="primary">
                当前任务：{selectedTask.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                状态：{selectedTask.status === 'todo' ? '待办' :
                       selectedTask.status === 'in_progress' ? '进行中' :
                       selectedTask.status === 'completed' ? '已完成' : '已取消'}
              </Typography>
            </Box>

            {/* 当前计时显示 */}
            {isTracking && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h4" color="primary" sx={{ textAlign: 'center' }}>
                  {formatTime(elapsedTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  正在计时...
                </Typography>
              </Box>
            )}

            {/* 控制按钮 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {!isTracking ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  onClick={startTracking}
                  disabled={selectedTask.status === 'completed'}
                >
                  开始计时
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<Pause />}
                    onClick={pauseTracking}
                  >
                    暂停
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Stop />}
                    onClick={stopTracking}
                  >
                    停止
                  </Button>
                </>
              )}

              <Button
                variant="outlined"
                startIcon={<AccessTime />}
                onClick={() => setShowManualDialog(true)}
              >
                手动添加时间
              </Button>
            </Box>

            {/* 总计时间 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`总计时：${formatTime(getTotalTimeTracked())}`}
                color="info"
                variant="outlined"
              />
              {selectedTask.estimatedTime && (
                <Chip
                  label={`预计：${formatTime(selectedTask.estimatedTime)}`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3, color: '#999' }}>
            <Typography>请先选择一个任务进行时间跟踪</Typography>
          </Box>
        )}

        {/* 手动添加时间对话框 */}
        <Dialog open={showManualDialog} onClose={() => setShowManualDialog(false)}>
          <DialogTitle>手动添加时间</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="时间（分钟）"
              type="number"
              fullWidth
              variant="outlined"
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
              helperText="请输入要添加的时间（例如：60表示1小时）"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowManualDialog(false)}>取消</Button>
            <Button onClick={handleManualTimeAdd} variant="contained">添加</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;