'use client';

import React from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import TaskInput from '@/features/tasks/TaskInput';
import EnhancedTaskList from '@/features/tasks/EnhancedTaskList';
import TaskFilters from '@/features/tasks/TaskFilters';
import { SPACING, LAYOUT } from '@/constants';

interface TasksTabProps {
  refreshTrigger: number;
  onTaskAdded: () => void;
  currentTranscript: string;
  searchFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
  selectedTasks: Set<string>;
  onSelectedTasksChange: (tasks: Set<string>) => void;
  onBulkDelete: () => Promise<void>;
}

export default function TasksTab({
  refreshTrigger,
  onTaskAdded,
  currentTranscript,
  searchFilter,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  selectedTasks,
  onSelectedTasksChange,
  onBulkDelete,
}: TasksTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1.5, sm: SPACING.GAP_LG }, // Symmetric gap on mobile
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
      width: '100%',
      pt: { xs: 1.5, sm: SPACING.TAB_PANEL_PADDING.sm }, // Symmetric top padding on mobile
      px: { xs: 1, sm: SPACING.TAB_PANEL_PADDING.sm },
      pb: { xs: 0, sm: SPACING.TAB_PANEL_PADDING.sm },
      transition: 'all 0.3s ease'
    }}>
      {!isMobile && (
        <TaskInput
          onTaskAdded={onTaskAdded}
          transcript={currentTranscript}
        />
      )}
      <TaskFilters
        searchFilter={searchFilter}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        selectedTasksCount={selectedTasks.size}
        onBulkDelete={onBulkDelete}
      />
      {!isMobile ? (
        <Paper sx={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            transition: 'all 0.3s ease'
          }
        }}>
          <EnhancedTaskList
            refreshTrigger={refreshTrigger}
            searchFilter={searchFilter}
            statusFilter={statusFilter}
            selectedTasks={selectedTasks}
            onSelectedTasksChange={onSelectedTasksChange}
            onBulkDelete={onBulkDelete}
          />
        </Paper>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          mt: 0.5, // Symmetric spacing from filter to content
          borderTop: `1px solid ${theme.palette.divider}`,
          pb: `${LAYOUT.MOBILE_BOTTOM_PADDING}px`,
        }}>
          <EnhancedTaskList
            refreshTrigger={refreshTrigger}
            searchFilter={searchFilter}
            statusFilter={statusFilter}
            selectedTasks={selectedTasks}
            onSelectedTasksChange={onSelectedTasksChange}
            onBulkDelete={onBulkDelete}
          />
        </Box>
      )}
    </Box>
  );
}
