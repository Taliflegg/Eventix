import { User } from "@eventix/shared";
import { postRequest,getRequest  } from "./apiServices";
// import  jwtDecode  from "jwt-decode";
import {jwtDecode}  from 'jwt-decode';
 //import * as jwtDecode from 'jwt-decode';
interface GoogleTokenPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}
interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  language: 'he' | 'en';
  dietaryRestrictions?: string[];
}
export const registerUser = async (payload: RegisterPayload) => {
  return postRequest("/auth/register", payload);
};
export const registerWithGoogle = async (token: string) => {
const decoded = jwtDecode(token) as GoogleTokenPayload;
  if (!decoded.picture) {
    throw new Error("No profile picture found in token");
  }
  return postRequest<{ isNewUser: boolean }>("auth/google/register", {
    token,
    profile_image: decoded.picture,
  });
};
export const getAuthenticatedUser = async (): Promise<User> => {
  const response = await getRequest<{ success: boolean; user: User }>("auth/user");
  if (response.success && response.user) return response.user;
  throw new Error("Failed to fetch user");
};
export const uploadProfileImage = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/api/users/${userId}/image`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.imageUrl;
  throw new Error(data.message || 'Failed to upload image');
};