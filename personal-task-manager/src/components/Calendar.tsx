import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Task } from '../types';
import { getPriorityColor, isOverdue } from '../utils/taskUtils';

interface CalendarProps {
  tasks: Task[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date | null;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = 'd';
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const renderDays = () => {
    return days.map(day => (
      <Box key={day} sx={{ textAlign: 'center', py: 1, fontWeight: 'bold' }}>
        {day}
      </Box>
    ));
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clonedDay = day;
        const dayTasks = tasks.filter(task =>
          task.dueDate && isSameDay(task.dueDate, clonedDay)
        );

        days.push(
          <Box
            key={day.toString()}
            sx={{
              minHeight: 120,
              border: '1px solid #e0e0e0',
              p: 1,
              backgroundColor: isSameMonth(day, monthStart) ? 'white' : '#f5f5f5',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              },
              position: 'relative',
              ...(selectedDate && isSameDay(day, selectedDate) && {
                border: '2px solid #2196f3',
                backgroundColor: '#e3f2fd'
              })
            }}
            onClick={() => onDateClick && onDateClick(clonedDay)}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                color: isSameDay(day, new Date()) ? '#2196f3' : 'inherit'
              }}
            >
              {format(day, dateFormat)}
            </Typography>

            <Box sx={{ mt: 1 }}>
              {dayTasks.slice(0, 3).map(task => (
                <Tooltip
                  key={task.id}
                  title={task.title}
                  arrow
                >
                  <Box
                    sx={{
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      borderRadius: 1,
                      px: 0.5,
                      py: 0.25,
                      mb: 0.5,
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      opacity: task.status === 'completed' ? 0.6 : 1,
                      ...(isOverdue(task) && task.status !== 'completed' && {
                        backgroundColor: '#f44336'
                      })
                    }}
                  >
                    {task.title}
                  </Box>
                </Tooltip>
              ))}

              {dayTasks.length > 3 && (
                <Typography variant="caption" sx={{ color: '#666' }}>
                  +{dayTasks.length - 3} 更多
                </Typography>
              )}
            </Box>
          </Box>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <Box key={day.toString()} sx={{ display: 'flex' }}>
          {days}
        </Box>
      );
      days = [];
    }
    return rows;
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
        </Typography>
        <Box>
          <IconButton onClick={prevMonth}>
            <ChevronLeft />
          </IconButton>
          <Button onClick={goToToday} startIcon={<TodayIcon />} sx={{ mx: 1 }}>
            今天
          </Button>
          <IconButton onClick={nextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={0}>
        <Grid item xs={12}>
          {renderDays()}
        </Grid>
        <Grid item xs={12}>
          {renderCells()}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Calendar;