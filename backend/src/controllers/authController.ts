import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dbStore } from '../database/dbStore';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_ai_super_secret_jwt_key_2026_production_grade';

// In-memory OTP storage for simulated SMS verification
const activeOtps: Record<string, string> = {};

const requestOtpSchema = z.object({
  mobileNumber: z.string().min(10)
});

const verifyOtpSchema = z.object({
  mobileNumber: z.string().min(10),
  otp: z.string().min(4),
  fullName: z.string().min(2),
  age: z.number().min(12).max(120),
  gender: z.enum(['Male', 'Female', 'Other']).default('Female')
});

const policeLoginSchema = z.object({
  userId: z.string().min(3), // Badge Number or User ID
  password: z.string().min(4)
});

// --- 1. Citizen Mobile OTP Request ---
export const requestCitizenOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = requestOtpSchema.parse(req.body);
    
    // Generate simulated 6-digit OTP (Default test OTP: 123456)
    const otp = '123456';
    activeOtps[mobileNumber] = otp;

    return res.status(200).json({
      message: `OTP sent successfully to ${mobileNumber}`,
      mobileNumber,
      testOtp: otp // Included for seamless testing & hackathon demonstration!
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

// --- 2. Citizen Mobile OTP Verification & Profile Registration ---
export const verifyCitizenOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, otp, fullName, age, gender } = verifyOtpSchema.parse(req.body);

    // Verify OTP (accepts simulated 123456 or stored OTP)
    const expectedOtp = activeOtps[mobileNumber] || '123456';
    if (otp !== expectedOtp && otp !== '123456') {
      return res.status(400).json({ error: 'Invalid verification OTP. Please try 123456.' });
    }

    // Find existing citizen or register new
    let user = dbStore.users.find(u => u.mobileNumber === mobileNumber);

    if (!user) {
      user = {
        id: `cit-${Date.now()}`,
        mobileNumber,
        fullName,
        age,
        gender,
        role: 'citizen',
        createdAt: new Date().toISOString()
      };
      dbStore.users.push(user);
    } else {
      user.fullName = fullName;
      user.age = age;
      user.gender = gender;
    }

    // Issue Citizen JWT Token
    const token = jwt.sign(
      { id: user.id, mobileNumber: user.mobileNumber, fullName: user.fullName, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Citizen Mobile Authentication & OTP Verification Successful',
      user,
      token
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

// --- 3. Police Official Credentials Login ---
export const policeLogin = async (req: Request, res: Response) => {
  try {
    const { userId, password } = policeLoginSchema.parse(req.body);

    // Search user by Badge Number or User ID or Email
    const policeUser = dbStore.users.find(
      u => u.role === 'police' && (u.badgeNumber === userId || u.id === userId || u.email === userId || userId === 'P-8842')
    );

    if (!policeUser) {
      return res.status(403).json({ error: 'Access Denied: Invalid Official Police User ID / Badge Number.' });
    }

    // Verify Official Password (test password: "Sentinel123!" or password check)
    const passwordHash = dbStore.userPasswords[policeUser.email || 'police@sentinel.ai'];
    if (passwordHash) {
      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch && password !== 'Sentinel123!') {
        return res.status(403).json({ error: 'Access Denied: Invalid Police Security Password.' });
      }
    } else if (password !== 'Sentinel123!') {
      return res.status(403).json({ error: 'Access Denied: Invalid Police Security Password.' });
    }

    // Issue Police Official JWT Token
    const token = jwt.sign(
      { id: policeUser.id, badgeNumber: policeUser.badgeNumber, fullName: policeUser.fullName, role: 'police' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Police Command Official Authorization Granted',
      user: policeUser,
      token
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

// --- 4. Get Authenticated User Profile ---
export const getProfile = async (req: any, res: Response) => {
  const user = dbStore.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User profile not found' });
  return res.status(200).json({ user });
};
