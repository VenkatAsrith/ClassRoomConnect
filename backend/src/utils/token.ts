import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'classroomconnectsecretkey12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'classroomconnectrefreshsecretkey67890!';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
