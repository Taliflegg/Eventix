
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Define an interface for the user object that will be saved in the context
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  language?: 'he' | 'en';
}
// Define an interface for the context state
interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (userData: CurrentUser) => void;
  logout: () => void;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const login = (userData: CurrentUser) => {
    setUser(userData);
    localStorage.setItem('currentUserData', JSON.stringify(userData));
  };
  const logout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      const logoutEndpoint = `${apiUrl}/users/logout`; 
      // Send a request to the backend to delete the HttpOnly cookies
      const response = await fetch(logoutEndpoint, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "שגיאה בניתוק מהשרת");
      }
      console.log('Logged out successfully from backend.');
    } catch (error) {
      console.error('Error during logout:', error);
    // We will continue to clear the state on the client side even if there was an error on the server
    } finally {
      setUser(null); // Clear the user state in the context
      localStorage.removeItem('currentUserData');// Clear localStorage
    }
  };
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('currentUserData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('currentUserData');
    } finally {
      setLoading(false);
    }
  }, []);
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
