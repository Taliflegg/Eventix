import { OAuth2Client } from 'google-auth-library';
import { createUser, findUserByGoogleId, getUserByEmail, setAuthCookies } from '../services/users.service';
import { saveUserDietaryRestrictions } from './dietaryRestriction.service';
import { UserRole } from '@eventix/shared';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { supabase } from './database.service';
import path from 'path';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {

  async registerGoogleUser(token: string, res: Response, profile_image?: string) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || !payload.name) {
      throw new Error('Invalid Google token');
    }

    const existingUser = await findUserByGoogleId(payload.sub);

    if (existingUser) {
      const jwtPayload = { id: existingUser.id, email: existingUser.email };
      setAuthCookies(res, jwtPayload);
      console.log("userData from API:", payload);
      return { isNewUser: false, user: existingUser };
    }

    const existingEmailUser = await getUserByEmail(payload.email);
    if (existingEmailUser) {
      throw new Error('Email is already registered with another account');
    }

    const newUser = await createUser({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      language: 'he',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user' as const, // Default role, can be changed later
      //אני פתחתי את הסילוש של השדה הזה
      // dietaryRestrictions: [],
      profile_image: payload.picture ?? undefined, // ✅ הוספת שמירת תמונת פרופיל מגוגל אם קיימת
    });

    const jwtPayload = { id: newUser.id, email: newUser.email };
    setAuthCookies(res, jwtPayload);

    console.log("userData from API:", payload);
    return { isNewUser: true, user: newUser };
  }

  /**
   * Registers a new user with email, password, language, and dietary restrictions.
   * Checks if the user already exists, hashes the password, saves the user, and links dietary restrictions if provided.
   * Sets authentication cookies and returns the access token.
   */
  async registerUser(
    payload: {
      username: string;
      email: string;
      password: string;
      language?: 'he' | 'en';
      dietaryRestrictions?: string[];
      profileImage?: string; // ✅ תמונה (Base64)
    },
    res: Response
  ) {
    // Check if user with email already exists
    const existingUser = await getUserByEmail(payload.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the user's password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    // Prepare user object to store in database
    let profileImageUrl = undefined;
    if (payload.profileImage && payload.profileImage.startsWith('data:image')) {
      // Handle base64 image upload to Supabase Storage
      const matches = payload.profileImage.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const ext = mimeType.split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `signup-${Date.now()}-${Math.floor(Math.random()*1e6)}.${ext}`;
        const filePath = `users/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });
        if (!uploadError) {
          const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
          profileImageUrl = publicData?.publicUrl;
        }
      }
    } else if (payload.profileImage) {
      profileImageUrl = payload.profileImage;
    }
    const userToSave = {
      name: payload.username,
      email: payload.email,
      password_hash: hashedPassword,
      language: payload.language ?? 'he',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user' as const,
      profile_image: profileImageUrl,
    };

    // Save the user to the database
    const createdUser = await createUser(userToSave);

    // ✅ Save dietary restrictions, if provided
    if (payload.dietaryRestrictions && payload.dietaryRestrictions.length > 0) {
      await saveUserDietaryRestrictions(createdUser.id, payload.dietaryRestrictions);
    }

    // Set auth cookies and return access token
    setAuthCookies(res, {
      id: createdUser.id,
      email: createdUser.email,
    });
    return { success: true };
  }

}

export default new AuthService();

