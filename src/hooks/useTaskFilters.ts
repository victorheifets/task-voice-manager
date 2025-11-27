'use client';

import { useState, useCallback } from 'react';

export function useTaskFilters() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const handleTaskAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchFilter(value);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleSelectedTasksChange = useCallback((tasks: Set<string>) => {
    setSelectedTasks(tasks);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    try {
      const { deleteTask } = await import('@/lib/supabase/client');
      const deletePromises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
      await Promise.all(deletePromises);
      setSelectedTasks(new Set());
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  }, [selectedTasks]);

  const clearSelectedTasks = useCallback(() => {
    setSelectedTasks(new Set());
  }, []);

  return {
    // State
    refreshTrigger,
    searchFilter,
    statusFilter,
    selectedTasks,
    
    // Handlers
    handleTaskAdded,
    handleSearchChange,
    handleStatusFilterChange,
    handleSelectedTasksChange,
    handleBulkDelete,
    clearSelectedTasks,
  };
}
