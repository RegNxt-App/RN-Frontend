import {useMemo} from 'react';

import {GroupedTask, Task, TaskSubType} from '@/types/databaseTypes';

export const useTaskCategories = (tasks: Task[], taskSubTypes: TaskSubType[], searchQuery: string) => {
  const taskCategories = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];

    const groupedByType = tasks.reduce((acc: Record<string, GroupedTask>, task: Task) => {
      const typeKey = task.task_type_label;
      if (!typeKey) return acc;

      const subtypeKey = task.task_subtype_id;

      if (!acc[typeKey]) {
        acc[typeKey] = {
          type_id: task.task_type_id,
          type_code: task.task_type_code,
          label: task.task_type_label || '',
          subtypes: {},
        };
      }

      const subtypeInfo = taskSubTypes.find(
        (st) => st.task_subtype_id === task.task_subtype_id && st.task_type_id === task.task_type_id
      );

      if (!acc[typeKey].subtypes[subtypeKey]) {
        acc[typeKey].subtypes[subtypeKey] = {
          subtype_id: subtypeKey,
          label: subtypeInfo?.label || 'Unknown Subtype',
          tasks: [],
        };
      }

      acc[typeKey].subtypes[subtypeKey].tasks.push({
        ...task,
        isPredefined: task.is_predefined || false,
      });

      return acc;
    }, {});

    return Object.entries(groupedByType).map(([name, typeData]: [string, GroupedTask]) => ({
      name,
      type_id: typeData.type_id,
      type_code: typeData.type_code,
      subtypes: Object.values(typeData.subtypes).map((subtype) => ({
        subtype_id: subtype.subtype_id,
        label: subtype.label,
        tasks: subtype.tasks,
        count: subtype.tasks.length,
      })),
      count: Object.values(typeData.subtypes).reduce((acc: number, subtype) => acc + subtype.tasks.length, 0),
    }));
  }, [tasks, taskSubTypes]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return taskCategories;

    return taskCategories
      .map((category) => ({
        ...category,
        subtypes: category.subtypes
          .map((subtype) => ({
            ...subtype,
            tasks: subtype.tasks.filter(
              (task) =>
                task.label?.toLowerCase().includes(query) ||
                task.code?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.task_type_label?.toLowerCase().includes(query)
            ),
          }))
          .filter((subtype) => subtype.tasks.length > 0),
        count: category.subtypes.reduce((acc, subtype) => acc + subtype.tasks.length, 0),
      }))
      .filter((category) => category.subtypes.length > 0);
  }, [taskCategories, searchQuery]);

  return {
    taskCategories,
    filteredCategories,
  };
};
