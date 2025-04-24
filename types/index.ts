export interface User {
    id: string;
    email: string;
    name: string;
    country: string;
  }
  
  export interface Project {
    id: string;
    title: string;
    description: string;
    userId: string;
    createdAt: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    projectId: string;
    createdAt: string;
    completedAt?: string;
  }