import { DietaryRestriction,User } from '@eventix/shared';
import { getRequest, postRequest, putRequest, deleteRequest } from './apiServices';

interface UserResponse {
  success: boolean;
  user: User;
  error?: string;
  message?: string;
}
interface VerifyGoogleTokenResponse {
  success: boolean;
  error?: string;
  message?: string;
}
export const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<boolean> => {
  try {
    const response = await postRequest<{ message: string; error?: string }>(
      '/email/',
      { to, subject, text }
    );
    return !response.error;
  } catch (error) {
    console.error("Failed to send account deleted email:", error);
    return false;
  }
};
export interface UserProfile {
  fullName: string;
  email: string;
  language: string;
  dietaryRestrictions: string[];
  // שדות נוספים לפי השרת
}
interface DietaryRestrictionsResponse {
  success: boolean;
  data: DietaryRestriction[];
  error?: string;
  message?: string;
}
interface ChangePasswordResponse {
  success: boolean;
  error?: string;
  message?: string;
}
interface CardResponse {
  success: boolean;
  error?: string;
  message?: string;
  count?: number;
}

interface EventDistributionResponse {
  '1-10': number;
  '11-20': number;
  '21-50': number;
  '50+': number;
}
// טיפוס למשתמש


// שליפת כל המשתמשים
export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await getRequest<{ success: boolean; data: User[] }>('/users');
    return response.data; // ✅ קח את המערך מתוך `data`
  } catch (error) {
    console.error('שגיאה בשליפת המשתמשים:', error);
    throw new Error('שגיאה בשליפת המשתמשים');
  }
};

// עדכון תפקיד של משתמש
export const updateUserRole = async (userId: string, newRole: 'user' | 'administrator'): Promise<{ success: boolean }> => {
  try {
    const response = await putRequest<{ success: boolean }>(`/users/update-role/${userId}`, {
      role: newRole,
    });
    return response;
  } catch (error) {
    console.error('שגיאה בעדכון תפקיד:', error);
    throw new Error('שגיאה בעדכון תפקיד');
  }
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
  return await postRequest<ChangePasswordResponse>('users/changePassword', { userId, oldPassword, newPassword });
};
export const NumCard = async (): Promise<CardResponse> => {
  const response = await getRequest<CardResponse>('users/bla/bla/getNewUsersCount');
  return response;
};

export const userevent = async (): Promise<EventDistributionResponse> => {
  const response = await getRequest<EventDistributionResponse>('users/bla/bla/getUserDietaryRestrictions');
  return response; 
};

export const loginUser = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await postRequest<UserResponse>('users/login', { email, password });
    if (response.success) {
      return true;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Something went wrong');
  }
};
export const updateUser = async (id: string, name: string, email: string,
  language: string, dietary_restrictions_ids: string[]): Promise<boolean> => {

  try {
    const response = await putRequest<UserResponse>(`/users/update/${id}`, { name, email, language, dietary_restrictions_ids });

    if (response.success) {
      return true;
    } else {
      throw new Error(response.message || 'Update failed');
    }
  } catch (error: any) {
    console.error("Update error:", error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Something went wrong');
  }
};

export const updateUserEmail = async (id: string, email: string): Promise<boolean> => {
  try {
    console.log("Updating user email:", id, email);
    const response = await putRequest<UserResponse>('/users/update-email', { userId: id, email });
    console.log("response", response);
    
    if (response.success) {
      return true; // מחזירים true במקרה של הצלחה
    } else {
      throw new Error(response.error || 'Email update failed');
    }
  } catch (error: any) {
    console.error("Update error:", error);
    throw new Error('Something went wrong');
  }
};







// export const getMyProfile = async (): Promise<UserProfile> => {
//   const response = await getRequest<UserResponse>('users/me');
//   console.log('Response from /users/me:', response);
//   if (response.success && response.user) {
//     // return response.user;
//   } else {
//     throw new Error(response.error || response.message || 'Failed to fetch user profile');
//   }
// };
export const fetchAuthenticatedUser = async (): Promise<User> => {
  debugger
  const response = await getRequest<UserResponse>('users/auth/user');
  console.log('Response from /users/auth/user:', response);
  //console.log('Response from /users/auth/user:', response);

  if (response.success && response.user) {
    console.log('userid=====', response.user);
    return response.user;
  } else {
    throw new Error(response.error || response.message || 'Failed to fetch authenticated user');
  }
};
export const verifyGoogleToken = async (token: string): Promise<VerifyGoogleTokenResponse> => {
  return await postRequest<VerifyGoogleTokenResponse>('users/verifyGoogleToken', { token });
};
// פונקציה לשחזור סיסמה
export const linkGoogleAccount = async (token: string): Promise<{ googleId: string; email: string }> => {
  return await postRequest<{ googleId: string; email: string }>('users/link-google', { idToken: token });
};
export const unlinkGoogleAccount = async (): Promise<{ success: boolean; message: string }> => {
  return await postRequest<{ success: boolean; message: string }>('users/unlink-google', {});
};
export const getUserDietaryRestrictions = async (userId: string): Promise<DietaryRestriction[]> => {
  const response = await getRequest<DietaryRestrictionsResponse>(`users/getUserDietaryRestrictions/${userId}`);
  console.log('Response from /users/getUserDietaryRestrictions:', response);

  if (response.success && response.data) {
    return response.data;
  } else {
    throw new Error(response.error || response.message || 'Failed to fetch user dietary restrictions');
  }
}
export const removeProfileImage = async (userId: string): Promise<{ success: boolean; message: string }> => {
  return await deleteRequest<{ success: boolean; message: string }>(`users/${userId}/removeImage`);
};///api/users/:userId/removeImage

export const deleteAccount = async (id: string): Promise<boolean> => {
  try {
    const response = await deleteRequest<UserResponse>(`users/account/${id}`);
    if (response.success) {
      return true;
    } else {
      // נעדיף להציג את message אם קיים, אחרת error, אחרת הודעה כללית
      throw new Error(response.message || response.error || 'Delete failed');
    }
  } catch (error: any) {
    console.error("Delete account error:", error);
    // אם יש הודעת שגיאה מהשרת, נציג אותה
    if (
      error.response &&
      error.response.data &&
      (error.response.data.message || error.response.data.error)
    ) {
      throw new Error(error.response.data.message || error.response.data.error);
    }
    // אחרת, נציג את הודעת השגיאה הכללית
    throw new Error(error.message || 'Something went wrong');
  }

};



export async function sendVerificationCode(
  userId: string,
  email: string,
  subject: string ,
  text: string ,
  from:string,
): Promise<boolean> {
  console.log("servise email:", email);
  const data = await postRequest<{ success: boolean; message?: string; error?: string }>(
    "users/send-token",
    {userId, email, subject, text,from } // הוספת subject ו-text ל-body של הבקשה
  );
  console.log("sent token data:", data);
  
  if (data.success) {
    return true;
  } else {
    throw new Error(data.error || data.message || "שליחת קוד נכשלה");
  }
};

export async function verifyCode( userId:string,email: string, code: string): Promise<boolean> {
  const data = await postRequest<{ success: boolean; message?: string; error?: string }>(
    "users/verify-token",
    {userId, email, token: code }
  );
  if (data.success) return true;
  
   throw new Error(data.error || data.message || "אימות נכשל");
 
};
export const existUserInEmailVerify = async (userId: string): Promise<string> => {
  const response = await postRequest<{ success: boolean; from: string }>('users/check-newUser', { userId });
  
  if (response.success) {
    return response.from; // מחזירים את הערך של 'from'
  } else {
    throw new Error('Failed to check user existence');
  }
};


export const userAccount = async (id: string): Promise<{ accountId: string }> => {
  return await getRequest<{ accountId: string }>(`/users/accountNum/${id}`);
};
export async function insertUserToEmailVerify(userId: string,from:string): Promise<boolean> {
  try {
    const data = await postRequest<{ success: boolean; message?: string; error?: string }>(
      "users/insertEmailVerify", 
      { userId ,from}
    );
    
    if (data.success) return true;
    
    throw new Error(data.error || data.message || "הוספת משתמש לאימות דוא״ל נכשלה");
  } catch (error) {
    console.error("Error inserting user to email verification:", error);
    throw error;
  }
};
export const getCurrentUserAccountId = async (): Promise<{ data: { accountId: string } }> => {
  const accountId = await getRequest<{ accountId: string }>('users/auth/account-id');
  return { data: accountId };
};
  
