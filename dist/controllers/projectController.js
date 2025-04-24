"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Project_1 = __importDefault(require("../models/Project"));
// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const { title, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!title || !userId) {
        res.status(400);
        throw new Error('Please provide title and ensure you are authenticated');
    }
    // Check project limit
    const projectCount = await Project_1.default.countDocuments({ userId });
    if (projectCount >= 14) {
        res.status(400);
        throw new Error('Project limit reached (14 projects maximum)');
    }
    const project = await Project_1.default.create({
        title,
        description: description || '',
        userId,
    });
    const projectResponse = {
        id: project._id,
        title: project.title,
        description: project.description,
        userId: project.userId,
        createdAt: project.createdAt.toISOString(),
    };
    res.status(201).json(projectResponse);
});
exports.createProject = createProject;
// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(400);
        throw new Error('User ID not provided');
    }
    const projects = await Project_1.default.find({ userId });
    const projectResponses = projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        userId: project.userId,
        createdAt: project.createdAt.toISOString(),
    }));
    res.json(projectResponses);
});
exports.getProjects = getProjects;
// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const project = await Project_1.default.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    if (project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to access this project');
    }
    const projectResponse = {
        id: project._id,
        title: project.title,
        description: project.description,
        userId: project.userId,
        createdAt: project.createdAt.toISOString(),
    };
    res.json(projectResponse);
});
exports.getProject = getProject;
// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const project = await Project_1.default.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    if (project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to update this project');
    }
    const updatedProject = await Project_1.default.findByIdAndUpdate(req.params.id, { ...req.body, userId: project.userId }, { new: true });
    if (updatedProject) {
        const projectResponse = {
            id: updatedProject._id,
            title: updatedProject.title,
            description: updatedProject.description,
            userId: updatedProject.userId,
            createdAt: updatedProject.createdAt.toISOString(),
        };
        res.json(projectResponse);
    }
    else {
        res.status(400);
        throw new Error('Failed to update project');
    }
});
exports.updateProject = updateProject;
// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const project = await Project_1.default.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    if (project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to delete this project');
    }
    await Project_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
});
exports.deleteProject = deleteProject;
