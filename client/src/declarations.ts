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
  allTasks: ITask[];
  task: ITask;
  taskAdded: ITask;
  taskDeleted: ITask;
  taskUpdated: ITask;
};

export enum MutationType {
  CREATED = 'CREATED',
  MUTATED = 'MUTATED',
  DELETED = 'DELETED',
};

export interface TaskListProps {
  tasks: [ITask],
  // taskService: TaskService
}