// middlewares/optionalAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email?: string;
}

export const optionalAuthMiddleware = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    console.log("from middlware")
    return next(); // המשך בלי משתמש
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    console.log("Authenticated user:", req.user);
  } catch (error) {
      console.warn("Invalid token");
      return res.status(401).json({ error: "Invalid token" }); // אם הטוקן קיים אך לא תקין - החזר שגיאה
  }

  next();
};
