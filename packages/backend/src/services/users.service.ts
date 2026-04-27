//users.service.ts
import { User,UserRole } from '@eventix/shared';
import { Response } from 'express';
import { columnMappings, mapKeys } from './column.mapper';
import { supabase } from './database.service';
// Import the Google authentication library
import { OAuth2Client } from 'google-auth-library';
//A library that enables the creation and validation of JSON Web Tokens in JavaScript.
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { sendMail } from './email.Service';
//JWT_SECRET is the secret key used to sign and verify JWT tokens.
const JWT_SECRET = process.env.JWT_SECRET;
// ACCESS_TOKEN_EXPIRES_IN defines the expiration time of an access token.
const ACCESS_TOKEN_EXPIRES_IN = '15m';
// REFRESH_TOKEN_EXPIRES_IN defines the expiration time of a refresh token.
const REFRESH_TOKEN_EXPIRES_IN = '7d';
// Set the Google App ID that you received from Google Cloud
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!CLIENT_ID) {
   console.error(':x: SERVER ERROR: GOOGLE_CLIENT_ID is not defined in .env file!');
   throw new Error('Google Client ID is missing! Cannot initialize OAuth2Client.');
}
// This client will be used to verify the ID Token received from the Frontend.
const client = new OAuth2Client(CLIENT_ID);
const tableName = 'users';
const { toCamel, toSnake } = columnMappings.users;
export async function getAllUsers(): Promise<User[]> {
   const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });
   if (error) {
      throw new Error(error.message);
   }
   if (!data) return [];
   return data.map(row => mapKeys<User>(row, toCamel));
}
export async function findUserByGoogleId(googleId: string): Promise<User | null> {
   const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('google_id', googleId)
      .single();
   if (error?.code === 'PGRST116') return null;
   if (error) throw new Error(error.message);
   return data ? mapKeys<User>(data, toCamel) : null;
}
// Get basic authenticated user info (id, name, email) by token payload
// @param id - The ID of the user extracted from the token
// @returns Basic user info object or null if not found
//
export async function createUser(user: Omit<User, 'id'>): Promise<User> {
   const snakeUser = mapKeys(user, toSnake);
   const { data, error } = await supabase
      .from(tableName)
      .insert([snakeUser])
      .select()
      .single();
   if (error) throw new Error(error.message);
   if (!data) throw new Error('Failed to create user');
   return mapKeys<User>(data, toCamel);
}
export async function getUserById(id: string): Promise<User | null> {
   try {
      const { data, error } = await supabase
         .from(tableName)
         .select('*')
         .eq('id', id)
         .single();
      if (error) {
         if (error.code === 'PGRST116') {
            console.warn(`[getUserById] :warning: No user found with ID: ${id}`);
            return null;
         }
         console.error(`[getUserById] :x: DB error:`, error);
         throw new Error('Failed to fetch user by ID');
      }
      return data ? mapKeys<User>(data, toCamel) : null;
   } catch (error: any) {
      console.error('[getUserById] :x: Unexpected error:', error.message || error);
      throw error;
   }
}
//Function to create tokens and save them in a cookie
export function setAuthCookies(res: Response, user: { id: string, email: string , role?: UserRole}) {
   // Create an Access Token: Sign an access token (JWT)
   //containing the user ID and email, with a short validity.
   const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
   );
   // Create Refresh Token: Signs a refresh token (JWT)
   // containing only the user ID, with a longer validity.
   const refreshToken = jwt.sign(
      { userId: user.id , role: user.role},
      process.env.JWT_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
   );
   // Sets the Access Token as a client-side cookie with appropriate security settings
   res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
   });
   //Defines the Refresh Token as a client-side cookie with security settings and a longer validity.
   res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
   });
   //Saving last activity time:
   res.cookie('lastActivity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
   });
}
/**
 * Retrieve a user by their unique ID
 * @param id - the ID of the user to search
 * @returns a user object in camelCase format or null if not found
 */
/**
 * Get basic authenticated user info (id, name, email) by token payload
 * @param id - The ID of the user extracted from the token
 * @returns Basic user info object or null if not found
 */
export async function getAuthenticatedUserInfo(id: string):
   Promise<Pick<User, 'id' | 'name' | 'email' | 'passwordHash' | 'googleId' | 'role' | 'imageUrl' | 'language' | 'dietaryRestrictions'> | null> {
   const user = await getUserById(id);
   if (!user) return null;
   const { id: userId, name, email, passwordHash, googleId, role, profile_image, language, dietaryRestrictions } = user;
   return {
      id: userId,
      name,
      email,
      passwordHash,
      googleId,
      role,
      language: language || 'he', // Default to 'en' if not set
      imageUrl: profile_image || '',
      dietaryRestrictions: dietaryRestrictions || [],
      // אם רוצים אפשר להוסיף default
   };
}
/**
* Retrieve a user by email address
* @param email - the email address to search
* @returns a user object in camelCase format or null if not found
*/
export async function getUserByEmail(email: string): Promise<User | null> {
   try {
      // Send a request to Supabase for the "users" table with filtering by email
      const { data, error } = await supabase
         .from(tableName)
         .select('*')
         .ilike('email', email)
         .single();
      //If there is an error in the query
      if (error) {
         // Known error – user does not exist
         if (error.code === 'PGRST116') {
            console.warn(`[getUserByEmail] :warning: No user found with email: ${email}`);
            return null;
         }
         // Other error – database error
         console.error('[getUserByEmail] :x: Database error:', error.message || error);
         throw new Error('Failed to fetch user from database by email');
      }
      // If a valid answer with data was returned
      if (data) {
         console.log(`[getUserByEmail] :white_check_mark: User found: ${email}`);
         // Convert from snake_case to camelCase
         return mapKeys<User>(data, toCamel);
      } else {
         // Rare edge cases – data=null without error
         console.warn(`[getUserByEmail] :warning: Empty data returned for email: ${email}`);
         return null;
      }
   } catch (error: any) {
      console.error('[getUserByEmail] :x: Unexpected error:', error.message || error);
      // "Check if this is a "Not Found" error
      //Prevents returning a server error (500) on a case that is not really considered a "fault".
      if (error instanceof Error && error.message.includes('not found')) {
         return null;
      }
      // Internal server error – forwarding
      throw error;
   }
}
export function clearAuthCookies(res: Response) {
   res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
   res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
   res.clearCookie('lastActivity', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
}
/**
 * Verifies a Google ID token,
 * and sets authentication tokens (JWT) as HttpOnly cookies.
 *
 * @param idToken - Google ID token received from the frontend
 * @param res - Express response object used to set cookies
 * @returns true if verification and cookie setting succeeded, false if user not found or token invalid
 * @throws Error if token verification or DB operation fails unexpectedly
 */
export async function verifyGoogleToken(idToken: string, res: Response): Promise<boolean> {
   try {
      console.log('[verifyGoogleToken]  Verifying Google ID token...');
      // Verifying the ID Token against Google servers.Including checking for
      // signature, validity,and that the token was indeed created for our application
      const ticket = await client.verifyIdToken({
         idToken: idToken,
         audience: CLIENT_ID,
      });
      // The payload contains the user information
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
         console.error('[verifyGoogleToken]  Failed to extract payload from token');
         return false;
      }
      const email = payload['email'];  // User's email
      console.log('[verifyGoogleToken]  Token verified successfully.');
      console.log('[verifyGoogleToken]  Extracted user:', { email });
      let user;
      try {
         user = await getUserByEmail(email);
         if (!user) {
            const err: any = new Error('User not found');
            err.status = 404;
            throw err;
         }
         if (user.googleId == null) {
            const err: any = new Error('User exists but has no linked Google account');
            err.status = 403;
            throw err;
         }
         console.log(`[verifyGoogleToken] :bust_in_silhouette: User found in DB: ${user.name} (${user.id})`);
         // Creates access & refresh tokens and stores them in cookies
         setAuthCookies(res, { id: user.id, email: user.email,role:user.role });
         return true;
      } catch (dbError) {
         console.error('[verifyGoogleToken]  DB error during user lookup:', dbError);
         throw dbError;
      }
   }
   catch (error: any) {
      console.error('[verifyGoogleToken]  Unexpected error:', error.message || error);
      throw error;
   }
}
/**
* Updates a user by ID in the database.
* @param id User ID
* @param updates Object with the fields to update (no id, createdAt, updatedAt)
* @returns Updated user object in camelCase format
* @throws if an error occurred during the update or if no result was returned from the DB
*/
export async function updateUser(id: string,
   updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User> {
   try {
      // Convert keys to snake_case before sending to DB
      const snakeCaseUpdates = mapKeys(updates, toSnake);
      // Send update to DB by ID
      const { data, error } = await supabase
         .from(tableName)
         .update(snakeCaseUpdates)
         .eq('id', id)
         .select()
         .single();
      // Handling database errors
      if (error) {
         console.error(`[updateUser] :x: Error updating user with ID ${id}:`, error);
         throw new Error('Database error: failed to update user');
      }
      if (data) {
         // Return the result conversion back to camelCase
         console.log(`[updateUser] :white_check_mark: User with ID ${id} successfully updated`);
         return mapKeys<User>(data, toCamel);
      } else {
         // Rare situation – the update went through but no result was returned
         console.warn(`[updateUser] :warning: No data returned after updating user with ID ${id}`);
         throw new Error('No data returned from database after update');
      }
   } catch (error) {
      console.error('[updateUser] :x: Unexpected error:', error);
      throw error;
   }
}
export function isStrongPassword(password: string): boolean {
   return /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password);
}

export async function sendPasswordChangeEmail(email: string) {
   const subject = `Password Changed`;
   const text = `Your password was successfully changed.
   If you did not perform this action, please contact support immediately.`;
   const result = await sendMail(email, subject, text);
   if (result) {
      console.log(`Password change confirmation sent to ${email}`);
   } else {
      console.error(`Failed to send password change confirmation to ${email}`);
   }
};
export async function updateUserPasswordHashById(userId: string
   , newHash: string) {
   try {
      const { data, error } = await supabase
         .from('users')
         .update({
            password_hash: newHash,
            updated_at: new Date().toISOString() // עדכון תאריך העדכון
         })
         .eq('id', userId)
         .single();
      if (error) {
         console.log('Error updating password hash:', error);
         console.error('Error code:', error.code);
         return false; // החזר false במקרה של שגיאה
      }
      return true; // החזר true אם העדכון הצליח
   } catch (err) {
      console.log('Unexpected error during password update:', err);
      console.error('Error updating password hash:', err);
      return false; // החזר false במקרה של שגיאה בלתי צפויה
   }
}

/**
 * Updates the user's profile image (stored as bytea) in the database
 * @param userId - ID of the user
 * @param imageBuffer - Buffer containing the binary image data
 * @returns true if update succeeded
 */
export async function updateUserProfileImage(
   userId: string,
   imageBuffer: Buffer
): Promise<boolean> {
   try {
      const { error } = await supabase
         .from(tableName)
         .update({ profile_image: imageBuffer })
         .eq('id', userId);
      if (error) {
         console.error(`[updateUserProfileImage] :x: DB Error:`, error);
         throw new Error('Failed to update profile image');
      }
      console.log(`[updateUserProfileImage] :white_check_mark: Profile image updated for user ${userId}`);
      return true;
   } catch (err: any) {
      console.error('[updateUserProfileImage] :x: Unexpected error:', err.message || err);
      throw err;
   }
}
/**
 * Retrieves the user's profile image as a base64 string (for frontend display)
 * @param userId - ID of the user
 * @returns base64 string or null
 */
export async function getUserProfileImage(userId: string): Promise<string | null> {
   const { data, error } = await supabase
      .from('users')
      .select('profile_image')
      .eq('id', userId)
      .single();
   if (error) {
      console.error('[getUserProfileImage] :x: DB error:', error.message || error);
      return null;
   }
   const imageData = data?.profile_image;
   if (!imageData) return null;
   // :large_yellow_circle: אם זה כבר string עם base64, אל תקודד שוב!
   if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      return imageData;
   }
   // :large_green_circle: אחרת, נניח שזה Buffer
   const base64Image = Buffer.from(imageData).toString('base64');
   return `data:image/jpeg;base64,${base64Image}`;
}
/**
 * Links a Google account to an existing user by verifying the Google ID token
 * and updating the user record with the Google ID.
 *
 * @param userId - The ID of the user in the database
 * @param idToken - The Google ID token received from the client
 * @returns An object containing the linked Google ID and email
 * @throws Error if token is invalid, email is not verified, or DB errors occur
 */
export async function linkGoogleAccount(userId: string, idToken: string): Promise<{ googleId: string, email: string }> {
   try {
      console.log('[linkGoogleAccount] :mag: Verifying Google ID token...');
      const ticket = await client.verifyIdToken({
         idToken,
         audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid ID token');
      const { sub: googleId, email, email_verified } = payload;
      if (!email_verified) throw new Error('Email not verified by Google');
      // Check if the Google ID is already linked to another user
      const { data: existingUser, error: findError } = await supabase
         .from(tableName)
         .select('*')
         .eq('google_id', googleId)
         .single();
      if (findError && findError.code !== 'PGRST116') {
         console.error('[linkGoogleAccount] :x: Error checking for existing Google ID:', findError);
         throw new Error('Failed to check existing Google ID');
      }
      if (existingUser && existingUser.id !== userId) {
         console.warn('[linkGoogleAccount] :warning: Google account already linked to another user');
         throw new Error('This Google account is already linked to another user');
      }
      // Update the current user with the Google ID
      await updateUser(userId, { googleId });
      console.log('[linkGoogleAccount] :white_check_mark: Google account successfully linked');
      if (!email_verified) throw new Error('Email not verified by Google');
      if (!email) throw new Error('Email is missing in token payload');
      return { googleId, email };
   }
   catch (error: any) {
      console.error('[linkGoogleAccount] :x: Error linking Google account:', error.message || error);
      throw error;
   }
}
export const unlinkGoogle = async (userId: string) => {
   // await supabase
   const { data, error } = await supabase
      .from(tableName)
      .update({ google_id: null })
      .eq('id', userId)
      .select()
      .single();
   if (error) {
      console.error('Error unlinking Google ID:', error);
      throw error;
   }
   return data;
}
export const saveImageUrl = async (userId: string, imageUrl: string) => {
   const { data, error } = await supabase
      .from("users")
      .update({ profile_image: imageUrl }) // <-- שימי כאן את שם העמודה הנכון
      .eq("id", userId);
   if (error) {
      throw error;
   }
   return data;
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
   const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
   if (error || !data) return null;
   return data.id;
}

// מחיקת טוקן קודם
export async function deleteVerificationToken(userId: string) {
   console.log("I am in deleteVerificationToken function");
   
   await supabase.from("email_verification").delete().eq("user_id", userId);
}

// יצירת טוקן חדש
export async function insertVerificationToken(userId: string, token: string, expiresInMs: number,from:string) {
   await supabase.from("email_verification").update({
      token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expiresInMs).toISOString(),
      from:from
   }).eq('user_id', userId);
}

// NEW: Insert user to email verification table with empty token fields
export async function insertUserToEmailV(userId: string,from:string) {
   console.log("I am in insertUserToEmailVerify function:",from);
   
    const{ error}=await supabase.from("email_verification").upsert({
      user_id: userId,
      token: null,
      created_at: null,
      expires_at: null,
      from:from
   });

   if (error) {
      console.error("Error inserting user to email verification:", error);
      throw error;
   }
}


// בדיקת טוקן
export async function isValidVerificationToken(userId: string, token: string): Promise<boolean> {
   console.log("I am in isValidVerificationToken function",userId);
   const { data } = await supabase
      .from("email_verification")
      .select("*")
      .eq("user_id", userId)
      .eq("token", token)
      .gt("expires_at", new Date().toISOString());
      console.log("data in token",data)
   return !!(data && data.length > 0);
}
export const checkUserIdExists = async (userId: string): Promise<string | undefined> => {
  console.log("checkUserIdExists called with userId:", userId);
  
  const { data, error } = await supabase
    .from('email_verification')
    .select('from')
    .eq('user_id', userId)
    .single(); // עדיין נשאיר את .single() כאן כדי להחזיר שורה אחת

  // אם יש שגיאה, נבדוק אם היא נובעת ממחסור בשורות
  if (error && error.code !== 'PGRST116') {
    console.error('Error executing query', error);
    throw new Error('Database query failed');
  }

  
  return data ? data.from : undefined;
};


export const getUserDietaryRestrictions = async (userId: string) => {
   console.log("userId:", userId); // האם הוא undefined?

   const { data, error } = await supabase
      .from("user_dietary_restriction")
      .select(`
      dietary_restriction (
        id,
        name,
        description
      )
    `)
      .eq("user_id", userId);

   if (error) {
      throw new Error("Failed to fetch user's dietary restrictions: " + error.message);
   }

   // החזרת רק את המגבלות עצמן (מתוך אובייקט עטוף)
   return data.map((item) => item.dietary_restriction);
};
export const removeProfileImage = async (userId: string): Promise<boolean> => {
   const { error } = await supabase
      .from("users")
      .update({ profile_image: null }) // או '' אם את מעדיפה מחרוזת ריקה
      .eq("id", userId);

   if (error) {
      console.error(`[removeProfileImage] ❌ Error:`, error.message);
      throw new Error("Failed to remove profile image");
   }

   console.log(`[removeProfileImage] ✅ Image removed for user ${userId}`);
   return true;
};
export async function getNewUsersCount() {
   console.log('[getNewUsersCount] :mag: Fetching new users count for the current month');
   const startOfMonth = new Date();
   startOfMonth.setDate(1); // מתחיל מהיום הראשון של החודש

   const { data, error } = await supabase
      .from('users') // החלף בשם הטבלה שלך
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString());
   console.log('[getNewUsersCount] :mag: Query executed:', { startOfMonth: startOfMonth.toISOString() });
   if (error) {
      throw error;
   }

   return data.length;
};

export async function calculateEventDistribution() {
    // קבלת כל הנתונים מהטבלה user_events
    const { data: userEvents, error: userEventsError } = await supabase
        .from('user_events')
        .select('event_id');

    if (userEventsError) {
        throw new Error(userEventsError.message);
    }

    // חישוב מספר המשתתפים לכל אירוע
    const eventCountMap = new Map<string, number>();
    userEvents.forEach(({ event_id }) => {
        eventCountMap.set(event_id, (eventCountMap.get(event_id) || 0) + 1);
    });

    // קבלת האירועים
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*');

    if (eventsError) {
        throw new Error(eventsError.message);
    }

    const distribution = {
        '1-10': 0,
        '11-20': 0,
        '21-50': 0,
        '50+': 0
    };

    // עדכון התפלגות האירועים
    events.forEach(event => {
        const count = eventCountMap.get(event.id) || 0;
        if (count >= 0 && count <= 10) {
            distribution['1-10']++;
        } else if (count >= 11 && count <= 20) {
            distribution['11-20']++;
        } else if (count >= 21 && count <= 50) {
            distribution['21-50']++;
        } else if (count > 50) {
            distribution['50+']++;
        }
    });

    return distribution;
}

export const getAccount = async (userId: string | null) => {

   const { data, error } = await supabase
      .from(tableName)
      .select('account_id')
      .eq('id', userId);

   if (error) {
      throw new Error(`Error fetching account IDs: ${error.message}`);
   }
   return { accountId: data[0]?.account_id };
};
export const updateUserEmail = async (userId: string, email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users') // הנח שהשם של הטבלה הוא 'users'
    .update({ email: email })
    .eq('id', userId);

  if (error) {
    console.error('Error updating email', error);
    return false; // מחזירים false במקרה של שגיאה
  }

  return true; // מחזירים true אם העדכון הצליח
};
//פונקציה להחזרת מזהה חשבון לפי מזהה משתמש
export const getAccountIdByUserId = async (userId: string): Promise<string | ''> => {
    const { data, error } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', userId)
      .single();
    if (error || !data) {
      throw new Error('account not found for this user');
    }
    return data.account_id;
};

//       if (error) {
//          // אם השגיאה היא "לא נמצא", נחזיר null במקום לזרוק שגיאה
//          if (error.code === 'PGRST116') { // PGRST116 הוא קוד שגיאה של Supabase ל"לא נמצא"
//             console.warn(`[getAccountIdByUserId] No user found with ID: ${userId}`);
//             return null;
//          }
//          console.error(`[getAccountIdByUserId] Error fetching account_id for user ${userId}:`, error.message);
//          throw new Error(`Failed to retrieve account ID for user ${userId}: ${error.message}`);
//       }

//         // וודא ש-data קיים וש-account_id אינו null או undefined
//         if (data && data.account_id) {
//             return data.account_id;
//         } else {
//             console.warn(`[getAccountIdByUserId] User ${userId} found but has no account_id.`);
//             return null; // או לזרוק שגיאה אם account_id הוא חובה
//         }
//     } catch (error: any) {
//         console.error('[getAccountIdByUserId] Unexpected error:', error.message || error);
//         throw error;
//     }
// }
    

export async function updateAccountIdForUser (userId: string, accountId: string): Promise<void>  {
   const { error } = await supabase
     .from('users')
     .update({ account_id: accountId })
     .eq('id', userId);
 
   if (error) {
     throw new Error(error.message);
   }
 }
 export async function updateRoleForUser(userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
