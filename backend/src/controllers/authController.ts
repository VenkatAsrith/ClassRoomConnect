import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { AuthenticatedRequest } from '../middlewares/auth';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'classroomconnectrefreshsecretkey67890!';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required.' });
    }

    if (role !== 'teacher' && role !== 'student') {
      return res.status(400).json({ message: "Role must be 'teacher' or 'student'." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive: true
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    newUser.refreshTokens = [refreshToken];
    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
      activeWorkspaceId: newUser.activeWorkspaceId
    };

    return res.status(201).json({
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error registering user.', error: err.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshTokens = user.refreshTokens ? [...user.refreshTokens, refreshToken] : [refreshToken];
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      activeWorkspaceId: user.activeWorkspaceId
    };

    return res.status(200).json({
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error logging in.', error: err.message });
  }
};

export const refresh = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      // Invalidate all tokens if reuse detected (token rotation security)
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      return res.status(401).json({ message: 'Refresh token reuse detected or invalid user.' });
    }

    // Filter out old refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error refreshing token.', error: err.message });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }
    return res.status(200).json({ message: 'Successfully logged out.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error during logout.', error: err.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatarUrl: req.user.avatarUrl,
    activeWorkspaceId: req.user.activeWorkspaceId
  };
  return res.status(200).json({ user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const { name, avatarUrl, activeWorkspaceId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (activeWorkspaceId) user.activeWorkspaceId = activeWorkspaceId;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      activeWorkspaceId: user.activeWorkspaceId
    };

    return res.status(200).json({ user: userResponse });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating profile.', error: err.message });
  }
};
