"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTask = exports.getTasks = exports.createTask = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Task_1 = __importDefault(require("../models/Task"));
const Project_1 = __importDefault(require("../models/Project"));
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b;
    const { title, description, status, projectId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!title || !projectId || !userId) {
        res.status(400);
        throw new Error('Please provide title, projectId, and ensure you are authenticated');
    }
    // Verify project exists and belongs to user
    const project = await Project_1.default.findById(projectId);
    if (!project || project.userId !== userId) {
        res.status(403);
        throw new Error('Not authorized to add tasks to this project');
    }
    const task = await Task_1.default.create({
        title,
        description: description || '',
        status: status || 'todo',
        projectId,
    });
    const taskResponse = {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        createdAt: task.createdAt.toISOString(),
        completedAt: (_b = task.completedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
    };
    res.status(201).json(taskResponse);
});
exports.createTask = createTask;
// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasks = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const projectId = req.params.projectId;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    // Verify project exists and belongs to user
    const project = await Project_1.default.findById(projectId);
    if (!project || project.userId !== userId) {
        res.status(403);
        throw new Error('Not authorized to view tasks for this project');
    }
    const tasks = await Task_1.default.find({ projectId });
    const taskresponses = tasks.map(task => {
        var _a;
        return ({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            projectId: task.projectId,
            createdAt: task.createdAt.toISOString(),
            completedAt: (_a = task.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
        });
    });
    res.json(taskresponses);
});
exports.getTasks = getTasks;
// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b;
    const task = await Task_1.default.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    // Verify project belongs to user
    const project = await Project_1.default.findById(task.projectId);
    if (!project || project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to view this task');
    }
    const taskResponse = {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        createdAt: task.createdAt.toISOString(),
        completedAt: (_b = task.completedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
    };
    res.json(taskResponse);
});
exports.getTask = getTask;
// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b;
    const task = await Task_1.default.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    // Verify project belongs to user
    const project = await Project_1.default.findById(task.projectId);
    if (!project || project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to update this task');
    }
    // Handle completedAt field
    let completedAt = task.completedAt;
    if (req.body.status === 'completed' && task.status !== 'completed') {
        completedAt = new Date();
    }
    else if (req.body.status && req.body.status !== 'completed') {
        completedAt = undefined;
    }
    const updatedTask = await Task_1.default.findByIdAndUpdate(req.params.id, { ...req.body, completedAt }, { new: true });
    if (updatedTask) {
        const taskResponse = {
            id: updatedTask._id,
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            projectId: updatedTask.projectId,
            createdAt: updatedTask.createdAt.toISOString(),
            completedAt: (_b = updatedTask.completedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
        };
        res.json(taskResponse);
    }
    else {
        res.status(400);
        throw new Error('Failed to update task');
    }
});
exports.updateTask = updateTask;
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const task = await Task_1.default.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    // Verify project belongs to user
    const project = await Project_1.default.findById(task.projectId);
    if (!project || project.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(403);
        throw new Error('Not authorized to delete this task');
    }
    await Task_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
});
exports.deleteTask = deleteTask;
