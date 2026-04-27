const { validationResult } = require('express-validator');
import { UserResponse, UserRole, UsersResponse } from '@eventix/shared';
import { JwtPayload } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { log } from 'console';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../services/database.service';
import { UserEventService } from '../services/event_user.service';
import crypto from "crypto";
import {  checkUserIdExists, insertUserToEmailV, updateUserEmail } from "../services/users.service";
import { sendMail } from "../services/email.Service";
import {
  getUserIdByEmail,
  deleteVerificationToken,
  insertVerificationToken,
  isValidVerificationToken,
} from "../services/users.service";


function generateToken() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
import { getAccount, getAllUsers, getAuthenticatedUserInfo, getUserByEmail, getUserById, getUserDietaryRestrictions, isStrongPassword, linkGoogleAccount, removeProfileImage, saveImageUrl, sendPasswordChangeEmail, setAuthCookies, unlinkGoogle, updateUserPasswordHashById, verifyGoogleToken,calculateEventDistribution,getNewUsersCount, updateAccountIdForUser } from '../services/users.service';
import { getAccountIdByUserId,updateRoleForUser } from '../services/users.service';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}


const userEventService = new UserEventService();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is not defined in environment variables');
  throw new Error('Missing Google Client ID');
}
const client = new OAuth2Client(CLIENT_ID);
export const usersController = {
  // Authenticated user info (GET /auth/user)
  getAuthenticatedUser: async (req: Request & { user?: { userId: string, name?: string, email?: string, role?: UserRole } }, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const user = await getAuthenticatedUserInfo(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      console.log("from getAuthenticatedUser", user.id)
      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.error('[GET /auth/user] ❌ Error fetching authenticated user:', error.message || error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Verify Google ID token (POST /users/verifyGoogleToken)
  // Input: ID token sent from the Frontend
  // Output: Sets accessToken and refreshToken as cookies 
  verifyGoogleToken: async (req: Request, res: Response) => {
    const token = req.body.token;
    if (!token) {
      console.warn('[POST/users/verifyGoogleToken] :warning: Backend received request without ID Token.');
      return res.status(400).json({ success: false, message: 'ID token missing in request body.' });
    }
    try {
      console.log('[POST /users/verifyGoogleToken] 🔄 Verifying Google token...');
      await verifyGoogleToken(token, res);
      console.log('[POST /users/verifyGoogleToken] ✅ Google token verified, cookies set');
      return res.status(200).json({ success: true });
    }
    catch (error: any) {
      console.error('[POST /users/verifyGoogleToken] :x: Server error during verification:', error.message);
      if (error.status === 404) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      if (error.status === 403) {
        return res.status(403).json({ success: false, error: 'Google account not linked' });
      }
      return res.status(500).json({ success: false, error: 'Failed to verify Google token' });
    }
  },

  // Retrieve user by email (GET /users/:email)
  getUserByEmail: async (req: Request, res: Response) => {
    const email = req.params.email;
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        console.warn(`[GET/users/${email}] ⚠️ User not found`);
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      console.log(`[GET /users/${email}] ✅ User found`);
      return res.status(200).json({ success: true, user });

    } catch (error: any) {
      console.error(`[GET /users/${email}] ❌ Server error:`, error.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  login: async (req: Request, res: Response) => {
    console.log('Login request:', req.body);
    const { email, password } = req.body;
    try {
      const user = await getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      console.log('User found:', { email: user.email, passwordHash: user.passwordHash });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        console.log('Password mismatch:', { password, passwordHash: user.passwordHash });
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
      setAuthCookies(res, { id: user.id, email: user.email,role: user.role });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    log("Updating user with ID:", req.params.id);
    console.log("Request body:", req.body);
    // בדוק אם יש שגיאות אימות
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId: string = req.params.id;
    const { name, email, language, dietary_restrictions_ids }: { name: string; email: string; language: string; dietary_restrictions_ids: string[] } = req.body;

    // קבל את הפרטים של המשתמש מהמאגר
    const { data, error } = await
      supabase.from('users')
        .select('*')
        .eq('id', userId)
        .single();
    console.log("error select:", error);

    if (error) {
      console.log("Error fetching user:", error);
      return res.status(404).json({ message: 'User not found in the database' });
    }

    // עדכון פרטי המשתמש
    const updatedUser = { id: userId, name, email, language, updated_at: new Date() };

    // עדכון הנתונים בטבלה ב-Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update(updatedUser)
      .eq('id', userId);

    if (updateError) {
      console.log("Error updating user:", updateError);
     return res.status(500).json({ message: updateError.message || 'Error updating user', details: updateError });
}

    // עדכון טבלת user_dietary_restriction
    const { data: currentRestrictions, error: fetchError } = await supabase
      .from('user_dietary_restriction')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.log("Error fetching dietary restrictions:", fetchError);
      return res.status(500).json({ message: 'Error fetching dietary restrictions' });
    }

    // הפוך את ה-IDs הנוכחיים למערך
    const currentIds: string[] = currentRestrictions.map(restriction => restriction.dietary_restrictionId.toString());

    // חישוב אילו הזנות נוספו ונמחקו
    const idsToAdd = dietary_restrictions_ids.filter((id: string) => !currentIds.includes(id));
    const idsToRemove = currentIds.filter((id: string) => !dietary_restrictions_ids.includes(id));

    // הוספת הגבלות חדשות
    if (idsToAdd.length > 0) {
      const insertPromises = idsToAdd.map((id: string) =>
        supabase
          .from('user_dietary_restriction')
          .insert([{ user_id: userId, dietary_restrictionId: id }])
      );

      await Promise.all(insertPromises);
    }

    // מחיקת הגבלות שאינן נדרשות
    if (idsToRemove.length > 0) {
      const deletePromises = idsToRemove.map((id: string) =>
        supabase
          .from('user_dietary_restriction')
          .delete()
          .eq('user_id', userId)
          .eq('dietary_restrictionId', id)
      );

      await Promise.all(deletePromises);
    }

    res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
    console.log(`User with ID ${userId} updated successfully:`, updatedUser);
  },

  // Link Google account to an existing authenticated user
  linkGoogleAccount: async (req: Request & { user?: JwtPayload }, res: Response) => {
    console.log('[POST /users/linkGoogle] 🔗 Incoming request to link Google account');
    console.log('🔑 Request body:', req.body);
    console.log('👤 Authenticated user:', req.user);

    const { idToken } = req.body;
    if (!idToken) {
      console.warn('[POST /users/linkGoogle] ⚠️ Missing idToken in request');
      return res.status(400).json({ success: false, message: 'Missing idToken in request body' });
    }

    try {
      // Verify the ID token with Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        console.warn('[POST /users/linkGoogle] ⚠️ Invalid ID token payload');
        return res.status(400).json({ success: false, message: 'Invalid ID token' });
      }

      const googleId = payload.sub;
      const email = payload.email;
      const emailVerified = payload.email_verified;

      if (!googleId || !email || !emailVerified) {
        console.warn('[POST /users/linkGoogle] ⚠️ Missing or unverified email in payload');
        return res.status(400).json({ success: false, message: 'Invalid or unverified email from Google' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        console.warn('[POST /users/linkGoogle] ⚠️ User not authenticated');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Link the account in the DB
      //  await linkGoogleAccount(userId, idToken);
      await linkGoogleAccount(userId, idToken);
      console.log('[POST /users/linkGoogle] ✅ Google account linked successfully');
      //  return res.status(200).json({ success: true, message: 'Google account linked successfully' });
      return res.status(200).json({
        success: true,
        message: 'Google account linked successfully',
        googleId,
        email,
      });
    } catch (error: any) {
      console.error('[POST /users/linkGoogle] ❌ Error linking Google account:', error.message || error);
      return res.status(500).json({ success: false, message: 'Failed to link Google account' });
    }
  },

  unlinkGoogle: async (req: Request, res: Response) => {
    const { user } = req as Request & { user: { userId: string } };
    const userId = user.userId; // נניח ש־requireAuth שם את ה־user ב־req.user

    try {
      await unlinkGoogle(userId);
      res.status(200).json({ message: 'Google account unlinked successfully' });
    }
    catch (error) {
      console.error('Failed to unlink Google account:', error);
      res.status(500).json({ error: 'Failed to unlink Google account' });
    }
  },

  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      const response: UsersResponse = { success: true, data: users };
      res.json(response);
    } catch (error: any) {
      res.json({ success: false, error: error.message, data: [] } as UsersResponse);
    }
  },


  uploadImage: async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const userId = req.params.userId;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // יצירת שם לקובץ
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExt}`;
    const filePath = `users/${fileName}`; // נשמור תחת images/users/...
    console.log('Uploading file:', filePath);

    // העלאה ל-Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images') // ← זה שם הבקט
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ success: false, message: 'Failed to upload to storage' });
    }

    // קבלת URL ציבורי
    const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
    const imageUrl = publicData?.publicUrl;
    console.log('Image uploaded successfully:', imageUrl);
    
    // שמירת URL במסד הנתונים
    await saveImageUrl(userId, imageUrl);

    return res.status(200).json({ success: true, imageUrl });
  } catch (err: any) {
    console.error('uploadImage error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
},

  deleteAccount: async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
      // בדיקה אם למשתמש יש אירועים משויכים
      const userEvents = await userEventService.getUserEventByUserId(userId);
      if (userEvents && userEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'The user is in the events table.'
        });
      }

      // מחיקת טוקן אימות דוא"ל
      await deleteVerificationToken(userId);

      // מחיקת המשתמש
      const { data, error } = await supabase
        .from('users')
        .delete()
        .match({ id: userId });

      if (error) {
        console.log("Error deleting user:", error);
        return res.status(500).json({ message: 'Error deleting user from database' });
      }

      res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  },


  changePassword: async (req: Request & { user?: { userId: string; name?: string; email?: string; role?: UserRole } }, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    console.log('Change password request:', req.body);
    try {
      // בדוק אם userId קיים
      if (!userId) {
        console.warn('Change password request without userId', { userId });
        return res.status(401).json({ success: false, error: 'User ID is required' });
      }

      // קבל את המשתמש על פי ה-userId
      const user = await getUserById(userId);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      console.log('Current password:', oldPassword);
      console.log('Stored password hash:', user.passwordHash);

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
          success: false, error: 'Password too weak. Must be at least 8 chars\n' +
            'include uppercase, lowercase, number and special char.'
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      console.log('New password hash:', newHash);
      const updated = await updateUserPasswordHashById(userId, newHash);
      console.log('Password update result:', { updated });
      if (!updated) {
        return res.status(500).json({ success: false, error: 'Failed to update password' });
      }
      //כאן צריך לשלוח מייל למשתמש שהסיסמא שלו שונתה - עדיין לא עובד
      // שליחת מייל אישור
      await sendPasswordChangeEmail(user.email);

      res.json({ success: true });
    } catch (error) {
      console.error('Error during password change:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },
  sendToken: async (req: Request, res: Response) => {
    const {userId, email, subject, text, from } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const token = generateToken();
    await deleteVerificationToken(userId); // מחיקת טוקן קיים אם יש
    await insertUserToEmailV(userId, from)
    await insertVerificationToken(userId, token, 5 * 60 * 1000,from); // 5 דקות
    const subject1 = `${subject}`;
    const text1 = `${text}\n ${token}`;
    const result = await sendMail(email, subject1, text1);
    if (result.success) {
      console.log("usersemail 📫📫✉✉📧", result.success);
      res.json({ success: true, message: "Verification code sent to email" });
    } else {
      res.status(500).json({ error: "Failed to send email" });
    }
  },

  insertUserToEmailVerify: async (req: Request, res: Response) => {
    const { userId, from } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
      const exists = await checkUserIdExists(userId);
      console.log("User exists:", exists);
      if (!exists) {
        await deleteVerificationToken(userId); // מחיקת טוקן קיים אם יש
        await insertUserToEmailV(userId, from);
      }
      res.json({ success: true, message: "User added to email verification" });
    } catch (error) {
      res.status(500).json({ error: "Failed to insert user for email verification" });
    }
  },


  verifyToken: async (req: Request, res: Response) => {
    const { userId ,email , token } = req.body;
    if (!email || !token) return res.status(400).json({ error: "Email and token are required" });

    const isValid = await isValidVerificationToken(userId, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    await deleteVerificationToken(userId);

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  },


  checkUser: async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {

      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      console.log("Checking user existence for ID:", userId);

      const result = await checkUserIdExists(userId);
      console.log("User exists:", result);
      if (result) {
        console.log("User exists:", result);
        return res.status(200).json({ success: true, from: result });
      } else {
        return res.status(200).json({ success: true, from: 'notExist' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database query failed' });
    }
  },




  updateEmail: async (req: Request, res: Response) => {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ message: 'UserId and email are required' });
    }

    const success = await updateUserEmail(userId, email);

    if (success) {
      return res.status(200).json({ success: true, message: 'Email updated successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update email' });
    }
  },
  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      const response: UserResponse = { success: true, data: user };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // uploadImage: async (req: Request, res: Response) => {
  //   try {
  //     const file = req.file;
  //     const userId = req.params.userId;

  //     console.log('uploadImage called with userId:', userId);
  //     console.log('File received:', file);

  //     if (!file) {
  //       console.log('No file uploaded');
  //        res.status(400).json({ success: false, message: 'No file uploaded' });
  //     }

  //     const imageUrl = `/uploads/${file.filename}`;
  //     console.log('Saving imageUrl:', imageUrl);

  //           res.json({ success: true });
  //       } catch (error) {
  //           console.error('Error during password change:', error);
  //         res.status(500).json({ success: false, error: 'Server error' });
  //       }
  //   },






  getUserDietaryRestrictions: async (req: Request, res: Response) => {
    console.log(req.params);
    const userId = req.params.id;
    console.log("userId:", userId); // האם הוא undefined?

    const dietary_restriction = await getUserDietaryRestrictions(userId);
    console.log("diatary_restriction:", dietary_restriction);

    if (!dietary_restriction) {
      return res.status(404).json({ success: false, error: 'User dietary restrictions not found' });
    }
    const response = { success: true, data: dietary_restriction };
    res.json(response);

  },

 removeImage: async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // שלב א – שליפת הנתיב מה-DB (אם את שומרת אותו)
    const { data, error } = await supabase
      .from('users')
      .select('profile_image')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching image:', error.message);
    }

    const imageUrl = data?.profile_image;
    const pathMatch = imageUrl?.match(/images\/(.+)$/);
    const storagePath = pathMatch?.[1]; // הנתיב בתוך ה-bucket

    if (storagePath) {
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([`users/${storagePath}`]);

      if (deleteError) {
        console.warn('[removeImage] Storage remove error:', deleteError.message);
      }
    }

    // שלב ב – הסרת URL מה־DB
    await removeProfileImage(userId);

    return res.status(200).json({ success: true, message: 'Image removed successfully' });
  } catch (err: any) {
    console.error('[removeImage] ❌ Error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to remove image' });
  }
}
,

  getNewUsersCount: async (req: Request, res: Response) => {
    try {
      const count = await getNewUsersCount();
      console.log(`Number of new users this month: ${count}`);
      return res.status(200).json({ success: true, count });
    } catch (error) {
      console.error('Error retrieving user count:', error);
        return res.status(500).json({ success: false, error: 'Error retrieving user count' });
    }
  },
getEventDistribution: async (req: Request, res: Response): Promise<void> => {
  console.log("Fetching event distribution data...");
    try {
        const distribution = await calculateEventDistribution();
        res.json(distribution);
    } catch (error) {
        // נניח שהשגיאה היא מסוג Error
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
},
  getUserAccountNumber:async(req: Request, res: Response)=>{
    try {
      const userId = req.params.id;
      const accountIds = await getAccount(userId);
      res.status(200).json(accountIds);
    }
    catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }, getAccountIdForAuthenticatedUser: async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.userId) {
        return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
      }

      const accountId = await getAccountIdByUserId(user.userId);
      if (!accountId) {
        return res.status(404).json({ message: 'Account ID not found for user' });
      }

      return res.status(200).json({ accountId });
    } catch (error: any) {
      console.error('[getAccountIdForAuthenticatedUser] Error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

 updateAccountIdForUser :async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { accountId } = req.body;
    console.log("from controller :", accountId)
    if (!userId || !accountId) {
      return res.status(400).json({ message: 'Missing userId (from auth) or accountId (from body)' });
    }

    await  updateAccountIdForUser(userId, accountId);

    res.status(200).json({ message: 'Account ID updated successfully' });
  } catch (error: any) {
    console.error('Error updating account ID:', error.message);
    res.status(500).json({ message: 'Failed to update account ID' });
  }
},
 updateUserRoleController :async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    await updateRoleForUser(userId, role);
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: (error as Error).message });
  }
}
};



