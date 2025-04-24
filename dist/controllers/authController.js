"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.signup = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Generate JWT
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password, name, country } = req.body;
    if (!email || !password || !name || !country) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }
    const userExists = await User_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User_1.default.create({
        email,
        password,
        name,
        country,
    });
    if (user) {
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            country: user.country,
        };
        res.status(201).json({
            user: userResponse,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
exports.signup = signup;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }
    const user = await User_1.default.findOne({ email });
    if (user && (await user.comparePassword(password))) {
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            country: user.country,
        };
        res.json({
            user: userResponse,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
exports.login = login;
// @desc    Logout user (client-side handled)
// @route   POST /api/auth/logout
// @access  Private
const logout = (0, express_async_handler_1.default)(async (req, res) => {
    // Since JWT is stateless, logout is handled client-side by removing token
    res.json({ message: 'Logged out successfully' });
});
exports.logout = logout;
