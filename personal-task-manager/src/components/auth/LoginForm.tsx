import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials, RegisterData } from '../../types';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const { state, login, register, clearError } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    clearError();
    setFormData({
      username: '',
      email: '',
      password: '',
      displayName: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      return;
    }

    const credentials: LoginCredentials = {
      username: formData.username,
      password: formData.password
    };

    await login(credentials);
    if (onClose) onClose();
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.displayName) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    const registerData: RegisterData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName
    };

    await register(registerData);
    if (onClose) onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          任务管理系统
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          请登录或注册以管理您的任务
        </Typography>

        <Tabs value={currentTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="登录" />
          <Tab label="注册" />
        </Tabs>

        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {state.error}
          </Alert>
        )}

        {currentTab === 0 ? (
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="用户名"
              value={formData.username}
              onChange={handleInputChange('username')}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
              helperText="提示：使用任意用户名，密码为 password"
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={state.isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {state.isLoading ? '登录中...' : '登录'}
            </Button>

            <Typography variant="caption" display="block" align="center" color="text.secondary">
              演示账号：admin / password
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="用户名"
              value={formData.username}
              onChange={handleInputChange('username')}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="显示名称"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText="至少6个字符"
            />

            <TextField
              fullWidth
              label="确认密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              required
              error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
              helperText={
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                  ? '密码不匹配'
                  : ''
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={state.isLoading || formData.password !== formData.confirmPassword}
              sx={{ mt: 3, mb: 2 }}
            >
              {state.isLoading ? '注册中...' : '注册'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginForm;