import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Avatar,
  OutlinedInput
} from '@mui/material';
import { mockUsers } from '../services/mockApi';
import type { User } from '../types';

interface UserSelectorProps {
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onSelectionChange,
  label = '选择用户',
  multiple = true,
  disabled = false,
  placeholder = '请选择用户'
}) => {
  const handleChange = (event: any) => {
    const value = event.target.value;
    onSelectionChange(multiple ? value : [value]);
  };

  const renderUser = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return null;

    return (
      <Box key={userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          src={user.avatar}
          sx={{ width: 24, height: 24 }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2">
          {user.displayName}
        </Typography>
      </Box>
    );
  };

  const renderMenuItem = (user: User) => (
    <MenuItem key={user.id} value={user.id}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <Avatar
          src={user.avatar}
          sx={{ width: 32, height: 32 }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body2">
            {user.displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>
      </Box>
    </MenuItem>
  );

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={multiple}
        value={selectedUsers}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={multiple ? (selected: string[]) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((userId) => {
              const user = mockUsers.find(u => u.id === userId);
              return user ? (
                <Chip
                  key={userId}
                  label={user.displayName}
                  size="small"
                  avatar={
                    <Avatar
                      src={user.avatar}
                      sx={{ width: 20, height: 20 }}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                />
              ) : null;
            })}
          </Box>
        ) : undefined}
        placeholder={placeholder}
      >
        {mockUsers.map(renderMenuItem)}
      </Select>
    </FormControl>
  );
};

export default UserSelector;