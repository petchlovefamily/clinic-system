import jwt from 'jsonwebtoken';
import { prisma } from '../index.js'; // Import prisma จาก index.js

/**
 * ด่านที่ 1: ตรวจสอบว่าล็อกอินหรือยัง (มี Token ถูกต้องหรือไม่)
 */
export const isAuthenticated = (req, res, next) => {
  try {
    // 1. ดึง Token ออกมาจาก Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. ถ้าถูกต้อง ให้แนบข้อมูลผู้ใช้ (userId, role) ไปกับ request
    //    เพื่อให้ API ด่านต่อไปใช้งานได้
    req.user = decoded; 
    
    // 4. ไปยังด่านต่อไป
    next(); 

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ด่านที่ 2: ตรวจสอบสิทธิ์ (Role)
 * (ใช้หลังจาก isAuthenticated)
 */
export const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    // 1. ตรวจสอบว่า req.user (จากด่าน isAuthenticated) มีอยู่หรือไม่
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: No role specified' });
    }

    // 2. ตรวจสอบว่า role ของผู้ใช้ อยู่ในกลุ่มที่อนุญาตหรือไม่
    const isAllowed = allowedRoles.includes(req.user.role);

    if (!isAllowed) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }

    // 3. ถ้าสิทธิ์ถูกต้อง ให้ผ่าน
    next();
  };
};