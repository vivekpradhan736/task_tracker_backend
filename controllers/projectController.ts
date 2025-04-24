import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Project, { IProject } from '../models/Project';
import { Project as ProjectType } from '../types';

interface AuthRequest extends Request {
  user?: { id: string };
}

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  const userId = req.user?.id;

  if (!title || !userId) {
    res.status(400);
    throw new Error('Please provide title and ensure you are authenticated');
  }

  // Check project limit
  const projectCount = await Project.countDocuments({ userId });
  if (projectCount >= 14) {
    res.status(400);
    throw new Error('Project limit reached (14 projects maximum)');
  }

  const project = await Project.create({
    title,
    description: description || '',
    userId,
  });

  const projectResponse: ProjectType = {
    id: project._id,
    title: project.title,
    description: project.description,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
  };

  res.status(201).json(projectResponse);
});

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(400);
    throw new Error('User ID not provided');
  }

  const projects = await Project.find({ userId });
  const projectResponses: ProjectType[] = projects.map(project => ({
    id: project._id,
    title: project.title,
    description: project.description,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
  }));

  res.json(projectResponses);
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  const projectResponse: ProjectType = {
    id: project._id,
    title: project.title,
    description: project.description,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
  };

  res.json(projectResponse);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to update this project');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    { ...req.body, userId: project.userId },
    { new: true }
  );

  if (updatedProject) {
    const projectResponse: ProjectType = {
      id: updatedProject._id,
      title: updatedProject.title,
      description: updatedProject.description,
      userId: updatedProject.userId,
      createdAt: updatedProject.createdAt.toISOString(),
    };
    res.json(projectResponse);
  } else {
    res.status(400);
    throw new Error('Failed to update project');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized to delete this project');
  }

  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted successfully' });
});

export { createProject, getProjects, getProject, updateProject, deleteProject };