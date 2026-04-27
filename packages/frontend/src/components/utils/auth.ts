// packages/frontend/src/utils/auth.ts
        // פונקציות עזר לניהול טוקנים ב-localStorage
        export const setAccessToken = (token: string) => {
            localStorage.setItem('accessToken', token);
          };
          export const getAccessToken = (): string | null => {
            return localStorage.getItem('accessToken');
          };
          export const clearAccessToken = () => {
            localStorage.removeItem('accessToken');
          };