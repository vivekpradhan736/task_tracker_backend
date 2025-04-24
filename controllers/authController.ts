import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { User as UserType } from '../types';

// Generate JWT
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, country } = req.body;

  if (!email || !password || !name || !country) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    email,
    password,
    name,
    country,
  });

  if (user) {
    const userResponse: UserType = {
      id: user._id,
      email: user.email,
      name: user.name,
      country: user.country,
    };

    res.status(201).json({
      user: userResponse,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (user && (await user.comparePassword(password))) {
    const userResponse: UserType = {
      id: user._id,
      email: user.email,
      name: user.name,
      country: user.country,
    };

    res.json({
      user: userResponse,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user (client-side handled)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req: Request, res: Response) => {
  // Since JWT is stateless, logout is handled client-side by removing token
  res.json({ message: 'Logged out successfully' });
});

export { signup, login, logout };