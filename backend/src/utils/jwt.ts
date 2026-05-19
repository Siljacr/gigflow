import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload, UserRole } from '../types';

export const generateToken = (id: string, email: string, role: UserRole): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = { id, email, role };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};
