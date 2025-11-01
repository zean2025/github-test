import React, { useState, useMemo } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Fab,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday,
  List,
  Dashboard,
  AccessTime
} from '@mui/icons-material';
import { TaskProvider, useTaskContext } from './contexts/TaskContext';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import TaskStatsComponent from './components/TaskStats';
import Calendar from './components/Calendar';
import TimeTracker from './components/TimeTracker';
import type { Task } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    setFilter,
    setSelectedTask,
    getFilteredTasks,
    getTaskStats
  } = useTaskContext();

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  // 提取所有可用的标签
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    state.tasks.forEach(task => {
      task.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [state.tasks]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskFormSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...taskData });
    } else {
      addTask(taskData);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 如果选择了日期，可以自动设置筛选器
    setFilter({
      ...state.filter,
      dateRange: {
        start: date,
        end: date
      }
    });
    setCurrentTab(1); // 切换到任务列表标签页
  };

  const calendarTasks = selectedDate
    ? state.tasks.filter(task =>
        task.dueDate &&
        task.dueDate.toDateString() === selectedDate.toDateString()
      )
    : state.tasks;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 应用栏 */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            个人任务管理器
          </Typography>
          <Typography variant="body2">
            总任务: {stats.total} | 今日完成: {stats.completedToday}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {/* 标签页 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab
              icon={<Dashboard />}
              label="仪表板"
              iconPosition="start"
            />
            <Tab
              icon={<List />}
              label="任务列表"
              iconPosition="start"
            />
            <Tab
              icon={<CalendarToday />}
              label="日历视图"
              iconPosition="start"
            />
            <Tab
              icon={<AccessTime />}
              label="时间跟踪"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* 仪表板 */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TaskStatsComponent stats={stats} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TaskList
                tasks={filteredTasks.slice(0, 5)} // 只显示前5个任务
                onEditTask={handleEditTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                selectedTask={state.selectedTask}
                onSelectTask={setSelectedTask}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimeTracker
                selectedTask={state.selectedTask}
                onUpdateTask={updateTask}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* 任务列表 */}
        <TabPanel value={currentTab} index={1}>
          <TaskFilter
            filter={state.filter}
            onFilterChange={setFilter}
            availableTags={availableTags}
          />
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            selectedTask={state.selectedTask}
            onSelectTask={setSelectedTask}
          />
        </TabPanel>

        {/* 日历视图 */}
        <TabPanel value={currentTab} index={2}>
          <Calendar
            tasks={calendarTasks}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
          {selectedDate && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedDate.toLocaleDateString('zh-CN')} 的任务
              </Typography>
              <TaskList
                tasks={calendarTasks.filter(task =>
                  task.dueDate &&
                  task.dueDate.toDateString() === selectedDate.toDateString()
                )}
                onEditTask={handleEditTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                selectedTask={state.selectedTask}
                onSelectTask={setSelectedTask}
              />
            </Box>
          )}
        </TabPanel>

        {/* 时间跟踪 */}
        <TabPanel value={currentTab} index={3}>
          <TimeTracker
            selectedTask={state.selectedTask}
            onUpdateTask={updateTask}
          />
          <Box sx={{ mt: 3 }}>
            <TaskFilter
              filter={state.filter}
              onFilterChange={setFilter}
              availableTags={availableTags}
            />
            <TaskList
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              selectedTask={state.selectedTask}
              onSelectTask={setSelectedTask}
            />
          </Box>
        </TabPanel>
      </Container>

      {/* 悬浮添加按钮 */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddTask}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: currentTab === 2 ? 'none' : 'flex' // 日历视图不显示添加按钮
        }}
      >
        <AddIcon />
      </Fab>

      {/* 任务表单对话框 */}
      <TaskForm
        open={taskFormOpen}
        task={editingTask}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={handleTaskFormSubmit}
      />
    </Box>
  );
};

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
