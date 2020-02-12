export interface ITask {
  id: string;
  version: number;
  title: string;
  description: string;
  status: TaskStatus;
};

export enum TaskStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  COMPLETE = 'COMPLETE'
};

export interface AllTasks {
  allTasks: Task[];
  task: Task;
  taskAdded: Task;
  taskDeleted: Task;
  taskUpdated: Task;
};

export enum MutationType {
  CREATED = 'CREATED',
  MUTATED = 'MUTATED',
  DELETED = 'DELETED',
};

export interface TaskListProps {
  tasks: [Task],
  // taskService: TaskService
}