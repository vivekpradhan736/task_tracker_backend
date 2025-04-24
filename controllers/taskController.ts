import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import Project from '../models/Project';
import { Task as TaskType } from '../types';

interface AuthRequest extends Request {
  user?: { id: string };
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, status, projectId } = req.body;
  const userId = req.user?.id;

  if (!title || !projectId || !userId) {
    res.status(400);
    throw new Error('Please provide title, projectId, and ensure you are authenticated');
  }

  // Verify project exists and belongs to user
  const project = await Project.findById(projectId);
  if (!project || project.userId !== userId) {
    res.status(403);
    throw new Error('Not authorized to add tasks to this project');
  }

  const task = await Task.create({
    title,
    description: description || '',
    status: status || 'todo',
    projectId,
  });

  const taskResponse: TaskType = {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    projectId: task.projectId,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };

  res.status(201).json(taskResponse);
});

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user?.id;

  // Verify project exists and belongs to user
  const project = await Project.findById(projectId);
  if (!project || project.userId !== userId) {
    res.status(403);
    throw new Error('Not authorized to view tasks for this project');
  }

  const tasks = await Task.find({ projectId });
  const taskresponses: TaskType[] = tasks.map(task => ({
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    projectId: task.projectId,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  }));

  res.json(taskresponses);
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify project belongs to user
  const project = await Project.findById(task.projectId);
  if (!project || project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to view this task');
  }

  const taskResponse: TaskType = {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    projectId: task.projectId,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };

  res.json(taskResponse);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify project belongs to user
  const project = await Project.findById(task.projectId);
  if (!project || project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to update this task');
  }

  // Handle completedAt field
  let completedAt = task.completedAt;
  if (req.body.status === 'completed' && task.status !== 'completed') {
    completedAt = new Date();
  } else if (req.body.status && req.body.status !== 'completed') {
    completedAt = undefined;
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { ...req.body, completedAt },
    { new: true }
  );

  if (updatedTask) {
    const taskResponse: TaskType = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      projectId: updatedTask.projectId,
      createdAt: updatedTask.createdAt.toISOString(),
      completedAt: updatedTask.completedAt?.toISOString(),
    };
    res.json(taskResponse);
  } else {
    res.status(400);
    throw new Error('Failed to update task');
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify project belongs to user
  const project = await Project.findById(task.projectId);
  if (!project || project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});

export { createTask, getTasks, getTask, updateTask, deleteTask };