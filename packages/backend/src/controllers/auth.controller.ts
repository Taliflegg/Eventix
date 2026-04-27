import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { supabase } from '../services/database.service';
import { sendMail } from '../services/email.Service';
//זה פונקציות שלי בouth לא ברור אם צריך...
// import { getUserByEmail, sendPasswordChangeEmail, isStrongPassword, updateUserPasswordHashByEmail ,getAuthenticatedUserInfo} from '../services/auth.service';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

// export const authController = {
//   //the login function is used to authenticate a user with email and password
//   //it checks if the user exists, compares the password with the stored hash, and generates a JWT token if successful
//   login: async (req: Request, res: Response) => {
//     console.log('Login request:', req.body);
//     const { email, password } = req.body;
//     try {
//       const user = await getUserByEmail(email);
//       if (!user || !user.passwordHash) {
//         return res.status(401).json({ success: false, error: 'User not found' });
//       }
// console.log('User found:', { email: user.email, passwordHash: user.passwordHash });
//       const isMatch = await bcrypt.compare(password, user.passwordHash);
//       if (!isMatch) {
//         console.log('Password mismatch:', { password, passwordHash: user.passwordHash });
//         return res.status(401).json({ success: false, error: 'Invalid password' });
//       }

//       const token = jwt.sign(
//         { userId: user.id, email: user.email },
//         process.env.JWT_SECRET || 'devsecret',
//         { expiresIn: '2h' }
//       );

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax'
//       });

//       res.json({ success: true });
//     } catch (error) {
//       res.status(500).json({ success: false, error: 'Server error' });
//     }
//   },
// // the changePassword function is used to change the user's password
// //it checks if the user exists, compares the old password with the stored hash, validates the new password strength, and updates the password hash in the database
//   //it also sends a confirmation email after successful password change
//  changePassword: async (req: Request, res: Response) => {
//     const { email, oldPassword, newPassword } = req.body;
//     console.log('Change password request:', req.body);
//     try {
//       const user = await getUserByEmail(email);
//       if (!user || !user.passwordHash) {
//         return res.status(401).json({ success: false, error: 'User not found' });
//       }
//       console.log('Current password:', oldPassword);
//       console.log('Stored password hash:', user.passwordHash);

//       const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
//       if (!isMatch) {
//         return res.status(401).json({ success: false, error: 'Current password is incorrect' });
//       }

//       if (!isStrongPassword(newPassword)) {
//         return res.status(400).json({ success: false, error: 'Password too weak. Must be at least 8 chars, include uppercase, lowercase, number and special char.' });
//       }

//       const newHash = await bcrypt.hash(newPassword, 10);
//       console.log('New password hash:', newHash);
//       const updated = await updateUserPasswordHashByEmail(user.email, newHash);
//       console.log('Password update result:', { updated });
//       if (!updated) {
//         return res.status(500).json({ success: false, error: 'Failed to update password' });
//       }

//       // שליחת מייל אישור
//       await sendPasswordChangeEmail(email);

//       res.json({ success: true });
//     } catch (error) {
//       console.error('Error during password change:', error);
//       res.status(500).json({ success: false, error: 'Server error' });
//     }
//   },
//Function of Ayla Levi and Abigail

import authService from '../services/auth.service';
import { getAuthenticatedUserInfo } from '../services/users.service'; // פונקציה לקבלת מידע על המשתמש המחובר
import { getUserByEmail, getUserById } from '../services/users.service';
import jwt from "jsonwebtoken";

export const AuthController = {
  /* ---------- Google OAuth ---------- */
  googleRegister: async (req: Request, res: Response) => {
    try {
      console.log('🔵 googleRegister called with body:', req.body);
      const { token, profile_image } = req.body;
      if (!token) return res.status(400).json({ message: 'Missing Google token' });

      const result = await authService.registerGoogleUser(token, res, profile_image);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Google register error:', error);
      res.status(500).json({ message: error.message || 'Something went wrong' });
    }
  },

  /* ---------- Classic register ---------- */
  /**
   * Handles user registration (classic signup)
   * Receives username, email, password, language, and dietary restrictions from the request body.
   * Validates required fields, calls the authService to register the user, and returns the result.
   * On error, returns a 500 status with the error message.
   */
  register: async (req: Request, res: Response) => {
    try {
      const {
        username,
        email,
        password,
        language,
        dietaryRestrictions, // ✅ NEW: Optional array of selected dietary restriction names
        profileImage,        // ✅ NEW: תמונת פרופיל base64 מהטופס
      } = req.body;

      // Ensure required fields are present
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await authService.registerUser(
        { username, email, password, language, dietaryRestrictions, profileImage }, // ✅ כולל תמונה
        res
      );

      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Something went wrong' });
    }
  },

  /* ---------- Check if user exists by email ---------- */
  checkIfUserExists: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });

      const user = await getUserByEmail(email);
      return res.status(200).json({ exists: !!user });
    } catch (error: any) {
      console.error('User existence check error:', error);
      return res.status(500).json({ message: error.message || 'Something went wrong' });
    }
  },

  /* ---------- 🆕  GET /auth/user ---------- */
  getAuthenticatedUser: async (req: Request & { user?: { userId: string, email?: string } }, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const user = await getAuthenticatedUserInfo(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.error('[GET /auth/user] :x: Error fetching authenticated user:', error.message || error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  , resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Missing token or new password' });
      }
      // אימות הטוקן (JWT) והוצאת האימייל ממנו
      let email;
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        if (typeof payload === 'object' && 'email' in payload) {
          email = (payload as jwt.JwtPayload).email;
        } else {
          return res.status(400).json({ message: 'Invalid token payload' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      // מציאת המשתמש לפי אימייל
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // הצפנת הסיסמה החדשה
      const passwordHash = await bcrypt.hash(newPassword, 10);
      // עדכון הסיסמה במסד הנתונים
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', user.id);
      if (error) {
        return res.status(500).json({ message: 'Failed to update password' });
      }
      return res.json({ success: true, message: 'Password reset successful' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });
      const user = await getUserByEmail(email);
      // לא לחשוף אם המשתמש קיים או לא
      if (!user) return res.json({ success: true });
      // יצירת טוקן JWT עם תוקף קצר (30 דקות)
      const token = jwt.sign(
        { email },
        process.env.JWT_SECRET || 'devsecret',
        { expiresIn: '30m' }
      );
      // יצירת קישור אמיתי לאיפוס סיסמה (להחליף לכתובת שלך)
      const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
      const resetLink = `${frontendUrl}/reset-password?token=${token}`      // שליחת המייל בפועל
      await sendMail(
        email,
        "איפוס סיסמה - Eventix",
        `שלום ${user.name},\n\nלחץ על הקישור הבא כדי לאפס את הסיסמה שלך:\n${resetLink}\n\nאם לא ביקשת איפוס, התעלם מהמייל.`
      );
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'משהו השתבש' });
    }
  },
};
