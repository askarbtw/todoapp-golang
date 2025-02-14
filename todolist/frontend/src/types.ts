export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high"; // Matches backend's Priority
  dueDate?: string;
  createdAt: string;
}

export type Priority = Todo['priority'];